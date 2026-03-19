<# 
  PetroSim — Script de démarrage automatique (Windows PowerShell)
  Usage: .\start.ps1 [-Seed] [-Stop]
  
  Actions:
    (default)  Démarre Docker DB + API + Frontend
    -Seed      Force le re-seeding de la base de données
    -Stop      Arrête tous les services
#>

param(
    [switch]$Seed,
    [switch]$Stop
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$API_DIR = Join-Path $ROOT "apps\api"
$WEB_DIR = Join-Path $ROOT "apps\web"
$VENV_DIR = Join-Path $API_DIR ".venv"
$VENV_PYTHON = Join-Path $VENV_DIR "Scripts\python.exe"
$VENV_PIP = Join-Path $VENV_DIR "Scripts\pip.exe"

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "  OK: $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  WARN: $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "  ERROR: $msg" -ForegroundColor Red }

# ── Stop mode ──
if ($Stop) {
    Write-Step "Arrêt de tous les services / Stopping all services"
    
    # Kill API (uvicorn)
    Get-Process -Name "python" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -match "uvicorn" } | 
        Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Ok "API arrêtée / API stopped"
    
    # Kill frontend (vite/node on port 5173)
    $viteProc = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | 
        Select-Object -First 1 -ExpandProperty OwningProcess
    if ($viteProc) { Stop-Process -Id $viteProc -Force -ErrorAction SilentlyContinue }
    Write-Ok "Frontend arrêté / Frontend stopped"
    
    # Stop Docker DB
    docker-compose -f "$ROOT\docker-compose.yml" down 2>$null
    Write-Ok "Base de données arrêtée / Database stopped"
    
    Write-Host "`nTous les services sont arrêtés. / All services stopped." -ForegroundColor Green
    exit 0
}

# ── 1. Docker Desktop ──
Write-Step "1/6 — Vérification de Docker / Checking Docker"
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Warn "Docker n'est pas démarré. Tentative de lancement... / Docker not running. Starting..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    Write-Host "  Attente du démarrage de Docker (max 60s)..." -ForegroundColor Yellow
    $timeout = 60
    while ($timeout -gt 0) {
        Start-Sleep -Seconds 3
        $timeout -= 3
        $check = docker info 2>$null
        if ($check) { break }
        Write-Host "  ... $timeout s" -NoNewline
    }
    if ($timeout -le 0) {
        Write-Err "Docker n'a pas démarré. Lancez Docker Desktop manuellement."
        exit 1
    }
}
Write-Ok "Docker est opérationnel / Docker is running"

# ── 2. PostgreSQL ──
Write-Step "2/6 — Démarrage de PostgreSQL / Starting PostgreSQL"
docker-compose -f "$ROOT\docker-compose.yml" up -d db
Start-Sleep -Seconds 3

$dbReady = $false
for ($i = 0; $i -lt 10; $i++) {
    $check = docker exec petrosim-db pg_isready -U petrosim 2>$null
    if ($LASTEXITCODE -eq 0) { $dbReady = $true; break }
    Start-Sleep -Seconds 2
}
if (-not $dbReady) {
    Write-Err "PostgreSQL ne répond pas. Vérifiez Docker."
    exit 1
}
Write-Ok "PostgreSQL est prêt / PostgreSQL is ready"

# ── 3. Python venv + deps ──
Write-Step "3/6 — Environnement Python / Python environment"
if (-not (Test-Path $VENV_PYTHON)) {
    Write-Host "  Création du venv..." -ForegroundColor Yellow
    python -m venv $VENV_DIR
    Write-Ok "venv créé / venv created"
}

Write-Host "  Installation des dépendances..." -ForegroundColor Yellow
& $VENV_PIP install -q -r "$API_DIR\requirements.txt" 2>$null
Write-Ok "Dépendances Python installées / Python deps installed"

# ── 4. DB migrations + seed ──
Write-Step "4/6 — Migrations et seed / Migrations & seed"
Push-Location $API_DIR
& $VENV_PYTHON -m alembic upgrade head 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Alembic migration a échoué (peut-être déjà à jour)"
}

# Check if DB needs seeding (empty countries table = needs seed)
$countryCount = docker exec petrosim-db psql -U petrosim -t -c "SELECT COUNT(*) FROM countries;" 2>$null
$countryCount = ($countryCount -replace '\s','')

if ($Seed -or [int]$countryCount -eq 0) {
    Write-Host "  Seeding de la base de données..." -ForegroundColor Yellow
    & $VENV_PYTHON -m scripts.seed
    Write-Ok "Base de données seedée / Database seeded"
} else {
    Write-Ok "Base de données déjà seedée ($countryCount pays) / DB already seeded ($countryCount countries)"
}
Pop-Location

# ── 5. API Backend ──
Write-Step "5/6 — Démarrage de l'API / Starting API"
$apiRunning = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($apiRunning) {
    Write-Ok "API déjà en cours sur le port 8000 / API already running on port 8000"
} else {
    Start-Process -FilePath $VENV_PYTHON -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload" -WorkingDirectory $API_DIR -WindowStyle Minimized
    Start-Sleep -Seconds 3
    Write-Ok "API démarrée sur http://localhost:8000 / API started"
}

# ── 6. Frontend ──
Write-Step "6/6 — Démarrage du frontend / Starting frontend"
$frontRunning = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontRunning) {
    Write-Ok "Frontend déjà en cours sur le port 5173 / Frontend already running on port 5173"
} else {
    # Check pnpm deps
    if (-not (Test-Path "$WEB_DIR\node_modules")) {
        Write-Host "  Installation des dépendances frontend..." -ForegroundColor Yellow
        Push-Location $WEB_DIR
        pnpm install
        Pop-Location
    }
    Start-Process -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory $WEB_DIR -WindowStyle Minimized
    Start-Sleep -Seconds 3
    Write-Ok "Frontend démarré sur http://localhost:5173 / Frontend started"
}

# ── Done ──
Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Green
Write-Host "  PetroSim est prêt ! / PetroSim is ready!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  API docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  DB:       localhost:5432 (petrosim)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour arrêter: .\start.ps1 -Stop" -ForegroundColor Yellow
Write-Host "Pour re-seeder: .\start.ps1 -Seed" -ForegroundColor Yellow
