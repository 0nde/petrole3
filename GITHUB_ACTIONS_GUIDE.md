# 📚 PetroSim — Guide Complet GitHub Actions

> **Guide pédagogique**
>
> Ce document couvre chaque fonctionnalité GitHub Actions utilisée dans PetroSim,
> des concepts de base aux patterns avancés. Chaque section explique *quoi*,
> *pourquoi* et *comment*.

---

## 📋 Sommaire

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Types de déclencheurs](#2-types-de-déclencheurs)
3. [Épinglage SHA](#3-épinglage-sha)
4. [Permissions et Sécurité](#4-permissions-et-sécurité)
5. [Actions Composites](#5-actions-composites)
6. [Actions JavaScript](#6-actions-javascript)
7. [Workflows Réutilisables](#7-workflows-réutilisables)
8. [Workflows Planifiés](#8-workflows-planifiés)
9. [Déclenchement Externe (Repository Dispatch)](#9-déclenchement-externe)
10. [Carte des Fichiers](#10-carte-des-fichiers)
11. [Référence Rapide](#11-référence-rapide)

---

## 1. Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PetroSim GitHub Actions                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WORKFLOWS (.github/workflows/)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  ci.yml       │  │  cd.yml       │  │  cd-dev.yml          │  │
│  │  Lint+Test    │←─│  Déploi Prod  │  │  Déploi Dev          │  │
│  │  (réutilisable)│  │  needs: ci    │  │  needs: ci           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  smoke-test   │  │  scheduled-   │  │  repository-         │  │
│  │  .yml         │  │  health-check │  │  dispatch.yml        │  │
│  │  (réutilisable)│  │  .yml (cron)  │  │  (déclencheur ext.)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │  update-ip-whitelist.yml  │  │  update-data.yml             │ │
│  │  (workflow_dispatch)      │  │  (schedule + dispatch)       │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
│                                                                  │
│  ACTIONS PERSONNALISÉES (.github/actions/)                        │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────┐  │
│  │ setup-frontend  │ │ setup-backend   │ │ deployment-report   │  │
│  │ (composite)     │ │ (composite)     │ │ (JavaScript/Node24) │  │
│  └────────────────┘ └────────────────┘ └─────────────────────┘  │
│                                                                  │
│  INTERFACE ADMIN (apps/web/public/)                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ admin-dispatch.html — Déclencher des événements dispatch   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Types de déclencheurs

PetroSim démontre **6 types de déclencheurs différents** :

| Déclencheur | Fichier | Description |
|:-----------|:--------|:------------|
| `push` | ci.yml, cd.yml, cd-dev.yml | Au push de code |
| `pull_request` | ci.yml | À la création/mise à jour de PR |
| `workflow_call` | ci.yml, smoke-test.yml | Appelé par d'autres workflows |
| `workflow_dispatch` | cd.yml, cd-dev.yml, update-ip-whitelist.yml, scheduled-health-check.yml | Déclenchement manuel via l'UI GitHub |
| `schedule` | scheduled-health-check.yml, update-data.yml | Exécution automatique basée sur cron |
| `repository_dispatch` | repository-dispatch.yml | Déclenchement via API externe |

### Syntaxe Cron

```
┌───────────── minute (0–59)
│ ┌───────────── heure (0–23, UTC)
│ │ ┌───────────── jour du mois (1–31)
│ │ │ ┌───────────── mois (1–12)
│ │ │ │ ┌───────────── jour de la semaine (0–6, Dimanche=0)
│ │ │ │ │
* * * * *
```

**Exemples :**
- `30 */6 * * *` → Toutes les 6 heures à :30 (notre health check)
- `0 8 * * 1-5` → Jours ouvrables à 08:00 UTC
- `0 0 1 * *` → Premier de chaque mois à minuit

---

## 3. Épinglage SHA

### Pourquoi SHA plutôt que les tags

Les tags peuvent être **déplacés** (réassignés à un commit différent). Un acteur malveillant qui compromet le dépôt d'une action pourrait faire pointer `v6` vers du code malveillant. Les SHA sont **immuables** — ils pointent toujours vers exactement le même code.

### Avant → Après

```yaml
# ❌ AVANT : basé sur les tags (mutable, vulnérable)
- uses: actions/checkout@v6

# ✅ APRÈS : épinglé par SHA (immuable, sécurisé)
- uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd  # v6.0.2
```

### Carte SHA actuelle

| Action | Version | SHA |
|:-------|:--------|:----|
| `actions/checkout` | v6.0.2 | `de0fac2e4500dabe0009e67214ff5f5447ce83dd` |
| `actions/setup-node` | v6.3.0 | `53b83947a5a98c8d113130e565377fae1a50d02f` |
| `actions/setup-python` | v6.2.0 | `a309ff8b426b58ec0e2a45f0f869d46889d02405` |
| `pnpm/action-setup` | v5.0.0 | `fc06bc1257f339d1d5d8b3a19a8cae5388b55320` |
| `aws-actions/configure-aws-credentials` | v6.0.0 | `8df5847569e6427dd6c4fb1cf565c83acfa8afa7` |
| `aws-actions/setup-sam` | v2 | `d78e1a4a9656d3b223e59b80676a797f20093133` |

### Comment trouver le SHA

1. Aller sur la page **Releases** de l'action (ex : `github.com/actions/checkout/releases`)
2. Cliquer sur le SHA du commit à côté du tag de version
3. Copier le SHA complet de 40 caractères
4. Ajouter un commentaire avec le nom du tag pour la lisibilité : `# v6.0.2`

### Mises à jour automatiques Dependabot

Dependabot est configuré pour vérifier les GitHub Actions chaque semaine et
créera des PRs pour mettre à jour les SHA quand de nouvelles versions sortent :

```yaml
# .github/dependabot.yml
- package-ecosystem: "github-actions"
  directory: "/"
  schedule:
    interval: "weekly"
```

---

## 4. Permissions et Sécurité

### Principe du moindre privilège

Chaque workflow déclare des **permissions explicites** au niveau supérieur.
Cela restreint ce que le `GITHUB_TOKEN` peut faire, empêchant toute utilisation
accidentelle ou malveillante.

```yaml
# CI : Lecture seule (aucune écriture nécessaire)
permissions:
  contents: read

# CD : OIDC + lecture (déploiement AWS)
permissions:
  id-token: write   # Pour le token JWT OIDC
  contents: read     # Pour le checkout du code

# Repository Dispatch : Lecture + gestion du cache
permissions:
  contents: read
  actions: write     # Pour l'API de suppression du cache
```

### Liste de contrôle sécurité

| Vérification | Statut | Description |
|:------------|:-------|:------------|
| Actions épinglées par SHA | ✅ | Toutes les actions utilisent des références SHA immuables |
| Permissions explicites | ✅ | Tous les workflows déclarent des permissions minimales |
| Authentification OIDC | ✅ | Pas de credentials AWS à longue durée |
| Pas de secrets en dur | ✅ | Tous les secrets dans GitHub Secrets |
| Pas de noms de domaine dans le code | ✅ | Domaines stockés dans les secrets uniquement |
| Dependabot activé | ✅ | Vérifications hebdomadaires des mises à jour d'actions |
| Contrôles de concurrence | ✅ | Empêche les déploiements parallèles |

---

## 5. Actions Composites

### Définition

Les actions composites regroupent plusieurs étapes en une **unité réutilisable**
qui s'exécute **dans le job appelant** (même runner, état partagé).

### Fichiers

```
.github/actions/
├── setup-frontend/
│   └── action.yml    ← pnpm + Node.js + install
└── setup-backend/
    └── action.yml    ← Python + pip + install
```

### Exemple d'utilisation

```yaml
steps:
  - uses: actions/checkout@de0fac2...  # v6.0.2
  - uses: ./.github/actions/setup-frontend
    with:
      node-version: "22"
      pnpm-version: "9"
  - run: pnpm build  # Les dépendances sont déjà installées !
```

### Règles clés

1. Chaque étape `run:` **doit** spécifier `shell:` (ex : `shell: bash`)
2. Utiliser `${{ inputs.xxx }}` pour référencer les paramètres d'entrée
3. Le fichier doit s'appeler `action.yml` (pas `action.yaml`)
4. Situé dans `.github/actions/<nom>/action.yml`

---

## 6. Actions JavaScript

### Définition

Les actions JavaScript exécutent du **code Node.js** directement sur le runner
avec accès au toolkit GitHub Actions (`@actions/core`, `@actions/github`).

### Fichiers

```
.github/actions/deployment-report/
├── action.yml       ← Métadonnées de l'action
├── index.js         ← Logique principale (Node.js)
├── package.json     ← Dépendances
└── node_modules/    ← Paquets installés
```

### Trois types d'actions personnalisées

| Type | Langage | Exécution | Cas d'usage |
|:-----|:--------|:----------|:------------|
| **Composite** | YAML | Dans le job appelant | Regrouper des étapes de setup |
| **JavaScript** | Node.js | Dans le job appelant | Interaction riche avec l'API GitHub |
| **Docker** | Tout | Dans un conteneur | Tout langage, isolation complète |

### Méthodes clés du toolkit

```javascript
const core = require("@actions/core");
const github = require("@actions/github");

// Lire les entrées depuis action.yml
const env = core.getInput("environment", { required: true });

// Définir les sorties pour les étapes en aval
core.setOutput("report-md", markdownReport);

// Écrire un résumé de job riche (apparaît dans l'UI Actions)
await core.summary.addRaw(markdownContent).write();

// Niveaux de log
core.info("Message de log standard");
core.warning("Annotation d'avertissement jaune");
core.error("Annotation d'erreur rouge");
core.notice("Annotation de notification bleue");

// Accéder au contexte GitHub
const { owner, repo } = github.context.repo;
const sha = github.context.sha;
```

---

## 7. Workflows Réutilisables

### Définition

Les workflows réutilisables sont des **workflows complets** que d'autres workflows
peuvent appeler. Ils s'exécutent comme un **job séparé** avec leur propre runner
(contrairement aux actions composites).

### Comparaison

| Caractéristique | Workflow réutilisable | Action composite |
|:----------------|:---------------------|:-----------------|
| Exécution | Job/runner séparé | Dans le job appelant |
| Secrets | Via le mot-clé `secrets:` | Via l'env de l'appelant |
| Peut avoir des jobs | Oui (multiples) | Non (étapes uniquement) |
| Imbrication max | 4 niveaux | Illimitée |
| Emplacement | `.github/workflows/` | `.github/actions/<nom>/` |

### Utilisation

**Appelant (cd.yml) :**
```yaml
jobs:
  ci:
    uses: ./.github/workflows/ci.yml  # Appel de workflow réutilisable
  
  smoke-test:
    uses: ./.github/workflows/smoke-test.yml
    with:
      environment: production
      url: ${{ secrets.DOMAIN }}
    secrets: inherit  # Passer tous les secrets
```

**Appelé (smoke-test.yml) :**
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

### Workflows réutilisables de PetroSim

| Workflow | Appelé par | Objectif |
|:---------|:----------|:---------|
| `ci.yml` | cd.yml, cd-dev.yml | Porte de qualité CI avant déploiement |
| `smoke-test.yml` | Tout workflow nécessitant des health checks | Vérification de santé HTTP |

---

## 8. Workflows Planifiés

### Définition

Les workflows planifiés s'exécutent automatiquement à intervalles fixes
en utilisant la **syntaxe cron**. Ils s'exécutent toujours sur la **branche
par défaut** (main).

### Planification PetroSim

| Workflow | Fréquence | Objectif |
|:---------|:---------|:---------|
| `scheduled-health-check.yml` | Toutes les 6 heures à :30 | Surveiller la santé prod & dev |
| `update-data.yml` | Trimestriel (1er jan/avr/juil/oct à 06:00 UTC) | Rafraîchir les données OWID + EIA dans `annual_baselines` |

### Notes importantes

- ⏰ **Fuseau horaire** : Toujours UTC (pas l'heure locale)
- ⏱️ **Intervalle minimum** : 5 minutes (imposé par GitHub)
- 💤 **Désactivation auto** : Après 60 jours d'inactivité du dépôt
- ⚡ **Délai possible** : Timing exact non garanti en période de forte charge
- 🌿 **Branche** : S'exécute toujours sur la branche par défaut (main)

---

## 9. Déclenchement Externe (Repository Dispatch)

### Définition

`repository_dispatch` permet aux **systèmes externes** de déclencher des workflows
via l'API REST GitHub. PetroSim inclut une page admin pour un déclenchement facile.

### Types d'événements

| Type d'événement | Job | Description |
|:-----------------|:----|:------------|
| `ping` | Test simple | Confirme que le mécanisme dispatch fonctionne |
| `health-check` | Vérification santé | Vérifie les endpoints prod/dev |
| `cache-clear` | Purge du cache | Vide le cache GitHub Actions |

### Comment déclencher

**Option 1 : Page admin (recommandé)**
Naviguer vers : `https://votre-domaine/admin-dispatch.html`

**Option 2 : curl**
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token VOTRE_PAT_GITHUB" \
  https://api.github.com/repos/0nde/petrole3/dispatches \
  -d '{
    "event_type": "ping",
    "client_payload": {
      "message": "Bonjour depuis curl !"
    }
  }'
```

**Option 3 : GitHub CLI**
```bash
gh api repos/0nde/petrole3/dispatches \
  -f event_type=ping \
  -f client_payload='{"message":"Bonjour depuis gh !"}'
```

### Prérequis

- Un **Personal Access Token (PAT)** avec le scope `repo`
- Créer à : https://github.com/settings/tokens

### repository_dispatch vs workflow_dispatch

| | repository_dispatch | workflow_dispatch |
|:--|:--------------------|:------------------|
| **Déclencheur** | API uniquement | UI GitHub + API |
| **Payload** | JSON libre | Entrées typées |
| **Auth** | Nécessite un PAT | Fonctionne avec GITHUB_TOKEN |
| **Cas d'usage** | Systèmes externes, webhooks | Opérateurs humains |

---

## 10. Carte des fichiers

```
.github/
├── actions/
│   ├── setup-frontend/
│   │   └── action.yml              ← Composite : pnpm + Node.js + install
│   ├── setup-backend/
│   │   └── action.yml              ← Composite : Python + pip + install
│   └── deployment-report/
│       ├── action.yml              ← Métadonnées de l'action JavaScript
│       ├── index.js                ← Action JS : résumé de déploiement riche
│       ├── package.json            ← Dépendances (@actions/core, @actions/github)
│       └── node_modules/           ← Paquets installés
├── workflows/
│   ├── ci.yml                      ← CI : lint + typecheck + test (réutilisable)
│   ├── cd.yml                      ← CD : déploiement en production
│   ├── cd-dev.yml                  ← CD : déploiement en développement
│   ├── update-ip-whitelist.yml     ← Manuel : mise à jour des règles IP CloudFront
│   ├── scheduled-health-check.yml  ← Cron : surveillance santé toutes les 6h
│   ├── smoke-test.yml              ← Réutilisable : suite de health check HTTP
│   ├── repository-dispatch.yml     ← Externe : actions déclenchées via API
│   └── update-data.yml             ← Cron/Manuel : mise à jour données OWID+EIA
└── dependabot.yml                  ← Mise à jour auto des dépendances (npm, pip, actions)

apps/web/public/
└── admin-dispatch.html             ← Interface admin pour repository_dispatch
```

---

## 11. Référence Rapide

### Tous les workflows d'un coup d'œil

| Workflow | Déclencheurs | Permissions | Objectif |
|:---------|:------------|:------------|:---------|
| ci.yml | push, PR, workflow_call | contents: read | Lint, typecheck, test |
| cd.yml | push (main), workflow_dispatch | id-token: write, contents: read | Déployer en production |
| cd-dev.yml | push (!main), workflow_dispatch | id-token: write, contents: read | Déployer en développement |
| update-ip-whitelist.yml | workflow_dispatch | id-token: write, contents: read | Mettre à jour les règles IP CloudFront |
| scheduled-health-check.yml | schedule, workflow_dispatch | contents: read | Surveiller la santé des environnements |
| smoke-test.yml | workflow_call | contents: read | Health checks HTTP réutilisables |
| repository-dispatch.yml | repository_dispatch | contents: read, actions: write | Déclencheurs API externes |
| update-data.yml | schedule (trimestriel), workflow_dispatch | id-token: write, contents: write | Rafraîchir données pays depuis OWID + EIA |

### Tâches courantes

| Tâche | Comment |
|:------|:--------|
| Lancer le CI manuellement | Aller dans Actions → CI → Run workflow |
| Déployer en prod | Merger la PR dans `main` (auto) ou Actions → CD → Run workflow |
| Déployer en dev | Pousser sur n'importe quelle branche sauf `main` |
| Mettre à jour la whitelist IP | Actions → Update IP Whitelist → Run workflow |
| Vérifier la santé maintenant | Actions → Scheduled Health Check → Run workflow |
| Déclencher via API | Utiliser la page admin à `/admin-dispatch.html` |
| Vider le cache Actions | Dispatcher l'événement `cache-clear` via la page admin |
| Mettre à jour les SHA des actions | Dependabot crée des PRs chaque semaine, ou vérifier les pages de release manuellement |
| Mettre à jour les données pays | Actions → 🔄 Mise à jour des données pays → Run workflow |
| Dry run pipeline données | `python -m scripts.run_data_update --env dev --dry-run` |

---

*Dernière mise à jour : Mars 2026*
*PetroSim — Simulateur Géopolitique Pétrolier Pédagogique*
