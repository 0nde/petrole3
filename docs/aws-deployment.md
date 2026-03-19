# Déploiement AWS — PetroSim
# Architecture serverless ultra low-cost pour usage personnel

## Résumé de la stack choisie

| Composant | Service AWS | Coût mensuel estimé |
|-----------|-------------|-------------------|
| **Frontend** (React SPA) | S3 + CloudFront | ~0,50 $/mois |
| **Backend** (FastAPI) | Lambda + API Gateway HTTP | ~0 $ (free tier: 1M req/mois) |
| **Base de données** | RDS PostgreSQL `db.t4g.micro` | **0 $ (12 mois free tier)**, puis ~13 $/mois |
| **DNS + HTTPS** | Route 53 + ACM | 0,50 $/mois (zone) |
| **Total estimé** | | **~1 $/mois (year 1)**, ~14 $/mois après |

### Alternative encore moins chère (long terme)
Remplacer RDS par **Neon.tech** (PostgreSQL serverless gratuit, 0.5 GB) :
- **Total : ~1 $/mois permanent**, même après le free tier AWS

---

## Architecture détaillée

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  CloudFront  │────▶│   S3 Bucket      │     │  RDS PostgreSQL  │
│  (CDN+HTTPS) │     │  (React SPA)     │     │  db.t4g.micro    │
└──────────────┘     └──────────────────┘     └────────▲─────────┘
       │                                               │
       │  /api/*                                       │
       ▼                                               │
┌──────────────────┐     ┌──────────────────┐         │
│  API Gateway     │────▶│  Lambda          │─────────┘
│  (HTTP API)      │     │  (FastAPI+Mangum) │
└──────────────────┘     └──────────────────┘
```

### Pourquoi cette stack ?

1. **S3 + CloudFront** pour le frontend :
   - Le build React (`vite build`) produit des fichiers statiques
   - S3 les héberge (~0,023 $/GB/mois de stockage, ~5 MB de fichiers = ~0,001 $)
   - CloudFront sert en HTTPS avec cache global (1 TB/mois gratuit la 1ère année)
   - **Aucun serveur** à gérer

2. **Lambda + API Gateway HTTP** pour le backend :
   - Mangum = adaptateur qui traduit les events Lambda en requêtes ASGI/FastAPI
   - **0 $ en free tier** : 1 million de requêtes/mois gratuites (largement suffisant)
   - Cold start ~1-3s (acceptable pour usage perso, chaud ensuite pour 15 min)
   - API Gateway HTTP (v2) = 1 $/million de requêtes (10x moins cher que REST API v1)
   - Le Docker existant est réutilisé tel quel (Lambda supporte les images Docker)

3. **RDS PostgreSQL** :
   - Free tier 12 mois : `db.t4g.micro` (2 vCPU, 1 GB RAM, 20 GB stockage)
   - Après : ~13 $/mois — c'est le seul coût incompressible
   - Alternative : **Neon.tech** free tier (PostgreSQL serverless, gratuit permanent, 0.5 GB)

### Pourquoi PAS ECS/Fargate/EC2 ?
- **ECS Fargate** : minimum ~6 $/mois même au repos (0.25 vCPU + 0.5 GB RAM 24/7)
- **EC2 t3.micro** : ~8,50 $/mois en on-demand, ~3,50 $/mois en reserved 1 an
- **Lambda** : littéralement 0 $ si < 1M requêtes/mois

---

## Comment déployer

### Prérequis
```bash
# Installer AWS CLI + SAM CLI
pip install awscli aws-sam-cli
aws configure  # Access Key + Secret Key + Région (eu-west-3 = Paris)
```

### Étape 1 : Frontend (S3 + CloudFront)
```bash
# Build le frontend
cd apps/web
pnpm build

# Créer le bucket S3
aws s3 mb s3://petrosim-frontend --region eu-west-3
aws s3 sync dist/ s3://petrosim-frontend/ --delete

# Créer la distribution CloudFront (via console ou CLI)
# Pointer vers le bucket S3 comme origin
# Configurer : /api/* → vers l'API Gateway
```

### Étape 2 : Backend (Lambda via SAM)
```bash
cd apps/api
sam build
sam deploy --guided  # Première fois, crée la stack CloudFormation
```

### Étape 3 : Base de données (RDS)
```bash
# Via AWS Console ou CLI
aws rds create-db-instance \
  --db-instance-identifier petrosim-db \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --master-username petrosim \
  --master-user-password <MOT_DE_PASSE> \
  --allocated-storage 20 \
  --no-multi-az \
  --no-publicly-accessible \
  --vpc-security-group-ids <SG_ID>
```

### Étape 4 : Seed la base
```bash
# Depuis Lambda ou en local avec le endpoint RDS
DATABASE_URL=postgresql://petrosim:<MDP>@<RDS_ENDPOINT>:5432/petrosim
python -m scripts.seed
```

---

## Fichiers de déploiement créés

| Fichier | Rôle |
|---------|------|
| `infra/aws/template.yaml` | Template SAM (CloudFormation) pour Lambda + API Gateway |
| `infra/aws/Dockerfile.lambda` | Image Docker pour Lambda (FastAPI + Mangum) |
| `infra/aws/deploy-frontend.sh` | Script de déploiement du frontend sur S3 |
| `infra/aws/samconfig.toml` | Configuration SAM par défaut |

---

## Estimation détaillée des coûts (usage perso, ~100 req/jour)

| Service | Calcul | Coût/mois |
|---------|--------|-----------|
| S3 (stockage) | 5 MB × $0.023/GB | $0.001 |
| S3 (requêtes) | ~3000 GET/mois × $0.0004/1000 | $0.001 |
| CloudFront | ~1 GB transfert (free tier 1 TB) | $0.00 |
| Lambda | ~3000 invocations × 512 MB × 2s | $0.00 (free tier) |
| API Gateway | ~3000 req × $1/M | $0.003 |
| RDS PostgreSQL | db.t4g.micro (free tier Y1) | **$0.00** |
| Route 53 | 1 zone hébergée | $0.50 |
| **TOTAL Année 1** | | **~$0.50/mois** |
| **TOTAL Après Y1** | RDS ~$13 + reste | **~$13.50/mois** |

### Pour rester à ~$0/mois après le free tier
Remplacer RDS par **Neon.tech** (PostgreSQL serverless gratuit) :
- Changer `DATABASE_URL` dans les variables d'environnement Lambda
- Tout le reste reste identique
- **Coût total : ~$0.50/mois permanent**
