# 📚 PetroSim — GitHub Actions Complete Guide / Guide Complet GitHub Actions

> **Bilingual pedagogical guide / Guide pédagogique bilingue (EN/FR)**
>
> This document covers every GitHub Actions feature used in PetroSim, from basic
> concepts to advanced patterns. Each section explains *what*, *why*, and *how*.
>
> Ce document couvre chaque fonctionnalité GitHub Actions utilisée dans PetroSim,
> des concepts de base aux patterns avancés. Chaque section explique *quoi*,
> *pourquoi* et *comment*.

---

## 📋 Table of Contents / Sommaire

1. [Architecture Overview / Vue d'ensemble](#1-architecture-overview)
2. [Trigger Types / Types de déclencheurs](#2-trigger-types)
3. [SHA Pinning / Épinglage SHA](#3-sha-pinning)
4. [Permissions & Security / Permissions et Sécurité](#4-permissions--security)
5. [Composite Actions / Actions Composites](#5-composite-actions)
6. [JavaScript Actions / Actions JavaScript](#6-javascript-actions)
7. [Reusable Workflows / Workflows Réutilisables](#7-reusable-workflows)
8. [Scheduled Workflows / Workflows Planifiés](#8-scheduled-workflows)
9. [Repository Dispatch / Déclenchement Externe](#9-repository-dispatch)
10. [File Map / Carte des Fichiers](#10-file-map)
11. [Quick Reference / Référence Rapide](#11-quick-reference)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PetroSim GitHub Actions                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WORKFLOWS (.github/workflows/)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  ci.yml       │  │  cd.yml       │  │  cd-dev.yml          │  │
│  │  Lint+Test    │←─│  Deploy Prod  │  │  Deploy Dev          │  │
│  │  (reusable)   │  │  needs: ci    │  │  needs: ci           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  smoke-test   │  │  scheduled-   │  │  repository-         │  │
│  │  .yml         │  │  health-check │  │  dispatch.yml        │  │
│  │  (reusable)   │  │  .yml (cron)  │  │  (external trigger)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  update-ip-whitelist.yml (workflow_dispatch)              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  CUSTOM ACTIONS (.github/actions/)                               │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────┐  │
│  │ setup-frontend  │ │ setup-backend   │ │ deployment-report   │  │
│  │ (composite)     │ │ (composite)     │ │ (JavaScript/Node24) │  │
│  └────────────────┘ └────────────────┘ └─────────────────────┘  │
│                                                                  │
│  ADMIN UI (apps/web/public/)                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ admin-dispatch.html — Trigger repository_dispatch events  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Trigger Types

PetroSim demonstrates **6 different trigger types**:

| Trigger | File | Description (EN) | Description (FR) |
|:--------|:-----|:------------------|:------------------|
| `push` | ci.yml, cd.yml, cd-dev.yml | On code push | Au push de code |
| `pull_request` | ci.yml | On PR creation/update | À la création/mise à jour de PR |
| `workflow_call` | ci.yml, smoke-test.yml | Called by other workflows | Appelé par d'autres workflows |
| `workflow_dispatch` | cd.yml, cd-dev.yml, update-ip-whitelist.yml, scheduled-health-check.yml | Manual trigger via GitHub UI | Déclenchement manuel via l'UI GitHub |
| `schedule` | scheduled-health-check.yml | Cron-based automatic execution | Exécution automatique basée sur cron |
| `repository_dispatch` | repository-dispatch.yml | External API trigger | Déclenchement via API externe |

### Cron Syntax / Syntaxe Cron

```
┌───────────── minute (0–59)
│ ┌───────────── hour (0–23, UTC)
│ │ ┌───────────── day of month (1–31)
│ │ │ ┌───────────── month (1–12)
│ │ │ │ ┌───────────── day of week (0–6, Sunday=0)
│ │ │ │ │
* * * * *
```

**Examples / Exemples:**
- `30 */6 * * *` → Every 6 hours at :30 (our health check)
- `0 8 * * 1-5` → Weekdays at 08:00 UTC
- `0 0 1 * *` → First of each month at midnight

---

## 3. SHA Pinning

### Why SHA over tags / Pourquoi SHA plutôt que les tags

Tags can be **moved** (reassigned to a different commit). A malicious actor who compromises an action's repository could point `v6` to malicious code. SHA hashes are **immutable** — they always point to the exact same code.

Les tags peuvent être **déplacés** (réassignés à un commit différent). Un SHA est **immuable** — il pointe toujours vers le même code exact.

### Before → After / Avant → Après

```yaml
# ❌ BEFORE: Tag-based (mutable, vulnerable)
- uses: actions/checkout@v6

# ✅ AFTER: SHA-pinned (immutable, secure)
- uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd  # v6.0.2
```

### Current SHA Map / Carte SHA Actuelle

| Action | Version | SHA |
|:-------|:--------|:----|
| `actions/checkout` | v6.0.2 | `de0fac2e4500dabe0009e67214ff5f5447ce83dd` |
| `actions/setup-node` | v6.3.0 | `53b83947a5a98c8d113130e565377fae1a50d02f` |
| `actions/setup-python` | v6.2.0 | `a309ff8b426b58ec0e2a45f0f869d46889d02405` |
| `pnpm/action-setup` | v5.0.0 | `fc06bc1257f339d1d5d8b3a19a8cae5388b55320` |
| `aws-actions/configure-aws-credentials` | v6.0.0 | `8df5847569e6427dd6c4fb1cf565c83acfa8afa7` |
| `aws-actions/setup-sam` | v2 | `d78e1a4a9656d3b223e59b80676a797f20093133` |

### How to Find SHA / Comment Trouver le SHA

1. Go to the action's **Releases** page (e.g., `github.com/actions/checkout/releases`)
2. Click the commit SHA next to the version tag
3. Copy the full 40-character SHA
4. Add a comment with the tag name for readability: `# v6.0.2`

### Dependabot Auto-Updates

Dependabot is configured to check GitHub Actions weekly and will create PRs
to update SHA hashes when new versions are released:

```yaml
# .github/dependabot.yml
- package-ecosystem: "github-actions"
  directory: "/"
  schedule:
    interval: "weekly"
```

---

## 4. Permissions & Security

### Principle of Least Privilege / Principe du Moindre Privilège

Every workflow declares **explicit permissions** at the top level. This restricts
what the `GITHUB_TOKEN` can do, preventing accidental or malicious misuse.

Chaque workflow déclare des **permissions explicites** au niveau supérieur.

```yaml
# CI: Read-only (no writes needed)
permissions:
  contents: read

# CD: OIDC + read (deploy to AWS)
permissions:
  id-token: write   # For OIDC JWT token
  contents: read     # For code checkout

# Repository Dispatch: Read + cache management
permissions:
  contents: read
  actions: write     # For cache deletion API
```

### Security Checklist / Liste de Contrôle Sécurité

| Check | Status | Description |
|:------|:-------|:------------|
| SHA-pinned actions | ✅ | All actions use immutable SHA references |
| Explicit permissions | ✅ | All workflows declare minimal permissions |
| OIDC authentication | ✅ | No long-lived AWS credentials |
| No hardcoded secrets | ✅ | All secrets in GitHub Secrets |
| No domain names in code | ✅ | Domains stored in secrets only |
| Dependabot enabled | ✅ | Weekly checks for action updates |
| Concurrency controls | ✅ | Prevents parallel deployments |

---

## 5. Composite Actions

### What / Quoi

Composite actions bundle multiple steps into a **single reusable unit** that runs
**inside the caller's job** (same runner, shared state).

Les actions composites regroupent plusieurs étapes en une **unité réutilisable**
qui s'exécute **dans le job appelant** (même runner, état partagé).

### Files / Fichiers

```
.github/actions/
├── setup-frontend/
│   └── action.yml    ← pnpm + Node.js + install
└── setup-backend/
    └── action.yml    ← Python + pip + install
```

### Usage Example / Exemple d'Utilisation

```yaml
steps:
  - uses: actions/checkout@de0fac2...  # v6.0.2
  - uses: ./.github/actions/setup-frontend
    with:
      node-version: "22"
      pnpm-version: "9"
  - run: pnpm build  # Dependencies are already installed!
```

### Key Rules / Règles Clés

1. Each `run:` step **must** specify `shell:` (e.g., `shell: bash`)
2. Use `${{ inputs.xxx }}` to reference input parameters
3. File must be named `action.yml` (not `action.yaml`)
4. Located in `.github/actions/<name>/action.yml`

---

## 6. JavaScript Actions

### What / Quoi

JavaScript actions run **Node.js code** directly on the runner with access to
the GitHub Actions toolkit (`@actions/core`, `@actions/github`).

Les actions JavaScript exécutent du **code Node.js** directement sur le runner
avec accès au toolkit GitHub Actions.

### Files / Fichiers

```
.github/actions/deployment-report/
├── action.yml       ← Action metadata
├── index.js         ← Main logic (Node.js)
├── package.json     ← Dependencies
└── node_modules/    ← Installed packages
```

### Three Types of Custom Actions / Trois Types d'Actions Personnalisées

| Type | Language | Execution | Use Case |
|:-----|:---------|:----------|:---------|
| **Composite** | YAML | Inside caller's job | Bundle setup steps |
| **JavaScript** | Node.js | Inside caller's job | Rich GitHub API interaction |
| **Docker** | Any | In a container | Any language, full isolation |

### Key Toolkit Methods / Méthodes Clés du Toolkit

```javascript
const core = require("@actions/core");
const github = require("@actions/github");

// Read inputs from action.yml
const env = core.getInput("environment", { required: true });

// Set outputs for downstream steps
core.setOutput("report-md", markdownReport);

// Write rich Job Summary (appears in Actions UI)
await core.summary.addRaw(markdownContent).write();

// Logging levels
core.info("Standard log message");
core.warning("Yellow warning annotation");
core.error("Red error annotation");
core.notice("Blue notice annotation");

// Access GitHub context
const { owner, repo } = github.context.repo;
const sha = github.context.sha;
```

---

## 7. Reusable Workflows

### What / Quoi

Reusable workflows are **complete workflows** that other workflows can call.
They run as a **separate job** with their own runner (unlike composite actions).

Les workflows réutilisables sont des **workflows complets** que d'autres workflows
peuvent appeler. Ils s'exécutent comme un **job séparé** avec leur propre runner.

### Comparison / Comparaison

| Feature | Reusable Workflow | Composite Action |
|:--------|:------------------|:-----------------|
| Execution | Separate job/runner | Inside caller's job |
| Secrets | Via `secrets:` keyword | Via caller's env |
| Can have jobs | Yes (multiple) | No (steps only) |
| Max nesting | 4 levels deep | Unlimited |
| File location | `.github/workflows/` | `.github/actions/<name>/` |

### Usage / Utilisation

**Caller (cd.yml):**
```yaml
jobs:
  ci:
    uses: ./.github/workflows/ci.yml  # Reusable workflow call
  
  smoke-test:
    uses: ./.github/workflows/smoke-test.yml
    with:
      environment: production
      url: ${{ secrets.DOMAIN }}
    secrets: inherit  # Pass all secrets
```

**Callee (smoke-test.yml):**
```yaml
on:
  workflow_call:
    inputs:
      environment:
        type: string
        required: true
    outputs:
      healthy:
        value: ${{ jobs.smoke.outputs.healthy }}
```

### PetroSim Reusable Workflows

| Workflow | Called By | Purpose |
|:---------|:---------|:--------|
| `ci.yml` | cd.yml, cd-dev.yml | CI quality gate before deployment |
| `smoke-test.yml` | Any workflow needing health checks | HTTP health verification |

---

## 8. Scheduled Workflows

### What / Quoi

Scheduled workflows run automatically at fixed intervals using **cron syntax**.
They always run on the **default branch** (main).

Les workflows planifiés s'exécutent automatiquement à intervalles fixes.
Ils s'exécutent toujours sur la **branche par défaut** (main).

### PetroSim Schedule

| Workflow | Schedule | Purpose |
|:---------|:---------|:--------|
| `scheduled-health-check.yml` | Every 6 hours at :30 | Monitor prod & dev health |

### Important Notes / Notes Importantes

- ⏰ **Timezone**: Always UTC (not local time)
- ⏱️ **Minimum interval**: 5 minutes (GitHub-enforced)
- 💤 **Auto-disable**: After 60 days of repo inactivity
- ⚡ **Delay possible**: Not guaranteed exact timing during high load
- 🌿 **Branch**: Always runs on default branch (main)

---

## 9. Repository Dispatch

### What / Quoi

`repository_dispatch` allows **external systems** to trigger workflows via the
GitHub REST API. PetroSim includes an admin page for easy triggering.

`repository_dispatch` permet aux **systèmes externes** de déclencher des workflows
via l'API REST GitHub. PetroSim inclut une page admin pour un déclenchement facile.

### Event Types / Types d'Événements

| Event Type | Job | Description |
|:-----------|:----|:------------|
| `ping` | Simple test | Confirms dispatch mechanism works |
| `health-check` | Health verification | Checks prod/dev endpoints |
| `cache-clear` | Cache purge | Clears GitHub Actions cache |

### How to Trigger / Comment Déclencher

**Option 1: Admin Page (recommended / recommandé)**
Navigate to: `https://your-domain/admin-dispatch.html`

**Option 2: curl**
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_PAT" \
  https://api.github.com/repos/0nde/petrole3/dispatches \
  -d '{
    "event_type": "ping",
    "client_payload": {
      "message": "Hello from curl!"
    }
  }'
```

**Option 3: GitHub CLI**
```bash
gh api repos/0nde/petrole3/dispatches \
  -f event_type=ping \
  -f client_payload='{"message":"Hello from gh!"}'
```

### Requirements / Prérequis

- A **Personal Access Token (PAT)** with `repo` scope
- Create at: https://github.com/settings/tokens

### repository_dispatch vs workflow_dispatch

| | repository_dispatch | workflow_dispatch |
|:--|:--------------------|:------------------|
| **Trigger** | API only | GitHub UI + API |
| **Payload** | Free-form JSON | Typed inputs |
| **Auth** | Needs PAT | Works with GITHUB_TOKEN |
| **Use case** | External systems, webhooks | Human operators |

---

## 10. File Map

```
.github/
├── actions/
│   ├── setup-frontend/
│   │   └── action.yml              ← Composite: pnpm + Node.js + install
│   ├── setup-backend/
│   │   └── action.yml              ← Composite: Python + pip + install
│   └── deployment-report/
│       ├── action.yml              ← JavaScript action metadata
│       ├── index.js                ← JS action: rich deployment summary
│       ├── package.json            ← Dependencies (@actions/core, @actions/github)
│       └── node_modules/           ← Installed packages
├── workflows/
│   ├── ci.yml                      ← CI: lint + typecheck + test (reusable)
│   ├── cd.yml                      ← CD: deploy to production
│   ├── cd-dev.yml                  ← CD: deploy to development
│   ├── update-ip-whitelist.yml     ← Manual: update CloudFront IP rules
│   ├── scheduled-health-check.yml  ← Cron: every 6h health monitoring
│   ├── smoke-test.yml              ← Reusable: HTTP health check suite
│   └── repository-dispatch.yml     ← External: API-triggered actions
└── dependabot.yml                  ← Auto-update dependencies (npm, pip, actions)

apps/web/public/
└── admin-dispatch.html             ← Admin UI for repository_dispatch
```

---

## 11. Quick Reference

### All Workflows at a Glance / Tous les Workflows d'un Coup d'Œil

| Workflow | Triggers | Permissions | Purpose |
|:---------|:---------|:------------|:--------|
| ci.yml | push, PR, workflow_call | contents: read | Lint, typecheck, test |
| cd.yml | push (main), workflow_dispatch | id-token: write, contents: read | Deploy to production |
| cd-dev.yml | push (!main), workflow_dispatch | id-token: write, contents: read | Deploy to development |
| update-ip-whitelist.yml | workflow_dispatch | id-token: write, contents: read | Update CloudFront IP rules |
| scheduled-health-check.yml | schedule, workflow_dispatch | contents: read | Monitor environment health |
| smoke-test.yml | workflow_call | contents: read | Reusable HTTP health checks |
| repository-dispatch.yml | repository_dispatch | contents: read, actions: write | External API triggers |

### Common Tasks / Tâches Courantes

| Task | How |
|:-----|:----|
| Run CI manually | Go to Actions → CI → Run workflow |
| Deploy to prod | Merge PR to `main` (auto) or Actions → CD → Run workflow |
| Deploy to dev | Push to any branch except `main` |
| Update IP whitelist | Actions → Update IP Whitelist → Run workflow |
| Check health now | Actions → Scheduled Health Check → Run workflow |
| Trigger via API | Use admin page at `/admin-dispatch.html` |
| Clear Actions cache | Dispatch `cache-clear` event via admin page |
| Update action SHAs | Dependabot creates PRs weekly, or check release pages manually |

---

*Last updated: March 2026 / Dernière mise à jour : Mars 2026*
*PetroSim — Pedagogical Geopolitical Oil Simulator*
