# Déploiement AWS — PetroSim
# Architecture serverless ultra low-cost en production

## Stack actuelle en production (Mars 2026)

| Composant | Service | Coût mensuel réel |
|-----------|---------|------------------|
| **Frontend** (React SPA) | S3 + CloudFront | ~0,50 $/mois |
| **Backend** (FastAPI) | Lambda + API Gateway HTTP | ~0 $ (free tier: 1M req/mois) |
| **Base de données** | **Neon.tech PostgreSQL 16 serverless** | **0 $ (free tier permanent)** |
| **DNS + HTTPS** | Route 53 + ACM | 0,50 $/mois (zone) |
| **Total réel** | | **~0,50 $/mois** |

### Pourquoi Neon.tech ?
- PostgreSQL 16 serverless gratuit (0.5 GB storage, 0.25 compute units)
- Auto-suspend après inactivité (économie de ressources)
- Pas de coût caché après le free tier AWS
- **Production** : eu-west-3 (ep-withered-block-alwtryyg-pooler)
- **Dev** : eu-central-1 (ep-tiny-thunder-alx82aci-pooler)

---

## Sécurité

### IP Whitelist (CloudFront Functions)

```javascript
// Generated dynamically from ALLOWED_IPS secret
function handler(event) {
  var request = event.request;
  var clientIP = event.viewer.ip;
  var allowedCIDRs = ['1.2.3.4/32', '5.6.7.0/24'];
  
  if (!isIPAllowed(clientIP, allowedCIDRs)) {
    return {
      statusCode: 403,
      statusDescription: 'Forbidden'
    };
  }
  return request;
}
```

### OIDC Authentication

```yaml
# .github/workflows/cd.yml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v6
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: eu-west-3
    audience: sts.amazonaws.com
```

**IAM Trust Policy** :
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Federated": "arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com"},
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:0nde/petrole3:ref:refs/heads/main"
      }
    }
  }]
}
```

---

## Architecture détaillée

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  CloudFront      │────▶│   S3 Bucket      │     │  Neon.tech       │
│  (CDN+HTTPS)     │     │  (React SPA)     │     │  PostgreSQL 16   │
│  + IP Whitelist  │     │                  │     │  (serverless)    │
└──────────────────┘     └──────────────────┘     └────────▲─────────┘
       │                                                   │
       │  /api/*                                           │
       ▼                                                   │
┌──────────────────┐     ┌──────────────────┐             │
│  API Gateway     │────▶│  Lambda          │─────────────┘
│  (HTTP API)      │     │  (FastAPI+Mangum)│
│                  │     │  Python 3.12     │
└──────────────────┘     └──────────────────┘
       ▲
       │
┌──────────────────┐
│  GitHub Actions  │
│  (OIDC auth)     │
└──────────────────┘
```

### Pourquoi cette stack ?

1. **S3 + CloudFront** pour le frontend :
   - Le build React (`vite build`) produit des fichiers statiques
   - S3 les héberge (~0,023 $/GB/mois de stockage, ~5 MB de fichiers = ~0,001 $)
   - CloudFront sert en HTTPS avec cache global
   - **CloudFront Functions** pour IP whitelist (CIDR matching)
   - **Aucun serveur** à gérer

2. **Lambda + API Gateway HTTP** pour le backend :
   - Mangum = adaptateur qui traduit les events Lambda en requêtes ASGI/FastAPI
   - **0 $ en free tier** : 1 million de requêtes/mois gratuites
   - Cold start ~500ms avec provisioned concurrency
   - API Gateway HTTP (v2) = 1 $/million de requêtes (10x moins cher que REST API v1)
   - Déployé via **AWS SAM** (CloudFormation)

3. **Neon.tech PostgreSQL** :
   - Free tier permanent : 0.5 GB storage, 0.25 compute units
   - Auto-suspend après inactivité (économie)
   - Connexions poolées (pgbouncer intégré)
   - **Aucun coût caché** après le free tier AWS

4. **GitHub Actions + OIDC** :
   - Authentification AWS sans credentials long-lived
   - IAM role `petrosim-github-actions` avec trust policy
   - Matrix testing : Node 20/22 × Python 3.11/3.12
   - Déploiement automatique sur push à `main`

### Pourquoi PAS ECS/Fargate/EC2 ?
- **ECS Fargate** : minimum ~6 $/mois même au repos
- **EC2 t3.micro** : ~8,50 $/mois en on-demand
- **RDS** : ~13 $/mois après free tier
- **Lambda + Neon.tech** : ~0,50 $/mois permanent

---

## Déploiement automatique (CI/CD)

### GitHub Actions Workflows

**CI** (`ci.yml`) :
- Triggers : Push, PR, workflow_call
- Matrix : Node 20/22 × Python 3.11/3.12
- Frontend : TypeScript typecheck, Vitest unit tests
- Backend : Ruff linting, Pytest unit tests
- Duration : ~20-30 seconds

**CD Production** (`cd.yml`) :
- Triggers : Push to `main` (after CI passes)
- Backend : SAM build + deploy to Lambda (eu-west-3)
- Frontend : Vite build + S3 sync + CloudFront invalidation
- Smoke tests : Backend `/health` + Frontend HTTP 200/403
- Duration : ~3-4 minutes

**CD Dev** (`cd-dev.yml`) :
- Triggers : Push to any non-main branch
- Same as production but deploys to dev environment

**Update IP Whitelist** (`update-ip-whitelist.yml`) :
- Triggers : Manual workflow_dispatch only
- Generates CloudFront Function with CIDR matching
- Deploys to edge locations
- Duration : ~1 minute

### GitHub Secrets (15 total)

```
AWS_ROLE_ARN                    # IAM role for OIDC
DOMAIN                          # petrosim.joyon.org
DEV_DOMAIN                      # dev-petrosim.joyon.org
HOSTED_ZONE_ID                  # Route 53 zone
CERTIFICATE_ARN                 # ACM cert (us-east-1)
DATABASE_URL                    # Neon.tech prod (asyncpg)
SYNC_DATABASE_URL               # Neon.tech prod (sync)
S3_BUCKET                       # petrosim.joyon.org-frontend
CLOUDFRONT_DISTRIBUTION_ID      # E39MKQBJY7TQL3
DEV_DATABASE_URL                # Neon.tech dev (asyncpg)
DEV_SYNC_DATABASE_URL           # Neon.tech dev (sync)
DEV_CERTIFICATE_ARN             # ACM cert dev
DEV_S3_BUCKET                   # dev-petrosim.joyon.org-frontend
DEV_CLOUDFRONT_DISTRIBUTION_ID  # EC4H1MGV4R0MT
ALLOWED_IPS                     # CIDR list for IP whitelist
```

### Déploiement manuel (si nécessaire)

**Prérequis** :
```bash
# Installer AWS CLI + SAM CLI
pip install awscli aws-sam-cli
aws configure  # Access Key + Secret Key + Région (eu-west-3)
```

**Backend** :
```bash
cd apps/api
sam build
sam deploy --guided  # Première fois, crée la stack CloudFormation
```

**Frontend** :
```bash
cd apps/web
pnpm build
aws s3 sync dist/ s3://petrosim.joyon.org-frontend/ --delete
aws cloudfront create-invalidation --distribution-id E39MKQBJY7TQL3 --paths "/*"
```

**Database** :
- Créer un projet Neon.tech
- Copier l'endpoint dans GitHub Secrets
- Exécuter migrations : `alembic upgrade head`
- Seed data : `python -m scripts.seed`

---

## Fichiers de déploiement

| Fichier | Rôle |
|---------|------|
| `infra/template.yaml` | Template SAM production (CloudFormation) |
| `infra/template-dev.yaml` | Template SAM dev |
| `infra/samconfig.toml` | Configuration SAM par défaut |
| `.github/workflows/ci.yml` | CI pipeline (typecheck, lint, tests) |
| `.github/workflows/cd.yml` | CD production pipeline |
| `.github/workflows/cd-dev.yml` | CD dev pipeline |
| `.github/workflows/update-ip-whitelist.yml` | IP whitelist update |

---

## Coûts réels en production (Mars 2026)

| Service | Calcul | Coût/mois |
|---------|--------|-----------|  
| S3 (stockage) | 5 MB × $0.023/GB | $0.001 |
| S3 (requêtes) | ~3000 GET/mois × $0.0004/1000 | $0.001 |
| CloudFront | ~1 GB transfert | $0.00 (free tier) |
| CloudFront Functions | ~3000 invocations | $0.00 (free tier) |
| Lambda | ~3000 invocations × 512 MB × 500ms | $0.00 (free tier) |
| API Gateway | ~3000 req × $1/M | $0.003 |
| Neon.tech | PostgreSQL 16 serverless | **$0.00 (free tier)** |
| Route 53 | 1 zone hébergée | $0.50 |
| **TOTAL** | | **~$0.50/mois permanent** |

### Avantages de cette architecture

✅ **Coût ultra-faible** : ~0,50 $/mois permanent
✅ **Scalabilité** : Auto-scale avec la demande
✅ **Sécurité** : OIDC, IP whitelist, HTTPS only
✅ **Maintenance** : Aucun serveur à gérer
✅ **CI/CD** : Déploiement automatique sur push
✅ **Monitoring** : CloudWatch logs + metrics
✅ **Backup** : Neon.tech snapshots automatiques
