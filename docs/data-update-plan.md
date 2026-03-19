# Plan de mise à jour automatique des données / Auto-Update Data Plan

## Sources de données gratuites identifiées

### 1. Our World in Data (OWID) — ⭐ Recommandé, priorité 1
- **URL**: `https://owid-public.owid.io/data/energy/owid-energy-data.json`
- **Format**: JSON, CSV, XLSX
- **Coût**: Gratuit, sans clé API, licence Creative Commons BY
- **Fréquence**: Mise à jour annuelle (généralement juin-juillet)
- **Données disponibles**:
  - Production de pétrole par pays (barils/jour)
  - Consommation de pétrole par pays
  - Réserves prouvées
  - Historique depuis 1900+
- **Limites**: Pas de données de flux bilatéraux (imports/exports par pays d'origine)
- **Utilisation PetroSim**: Mise à jour automatique de `production_mbpd` et `consumption_mbpd` dans `countries.json`

### 2. EIA International Energy API — Priorité 2
- **URL**: `https://api.eia.gov/v2/international/data/`
- **Format**: JSON REST API
- **Coût**: Gratuit, **clé API requise** (inscription gratuite sur eia.gov/opendata)
- **Fréquence**: Mensuelle/trimestrielle selon les séries
- **Données disponibles**:
  - Production par pays (crude + NGL)
  - Consommation par pays
  - Importations/exportations par pays
  - Capacité de raffinage
  - Réserves prouvées
  - Prix du pétrole (WTI, Brent)
- **Limites**: Clé API nécessaire (mais gratuite), flux bilatéraux limités
- **Utilisation PetroSim**: Source la plus complète pour toutes les métriques pays

### 3. OPEC Annual Statistical Bulletin
- **URL**: `https://asb.opec.org/data/ASB_Data.php`
- **Format**: Téléchargement Excel/CSV
- **Coût**: Gratuit
- **Fréquence**: Annuelle
- **Données**: Production OPEP détaillée, exportations, prix
- **Limites**: Pas d'API, données uniquement pour les pays OPEP
- **Utilisation PetroSim**: Vérification croisée production OPEP

### 4. Flux d'actualités pétrole (RSS gratuits)
| Source | URL RSS | Langue | Fréquence |
|--------|---------|--------|-----------|
| EIA Today in Energy | `https://www.eia.gov/rss/todayinenergy.xml` | EN | Quotidien |
| OilPrice.com | `https://oilprice.com/rss/main` | EN | Multiple/jour |
| Oil & Gas Journal | `https://www.ogj.com/rss` | EN | Quotidien |
| Reuters Energy | `https://news.google.com/rss/search?q=oil+petroleum+energy&hl=fr` | FR/EN | Multiple/jour |

### 5. OilPriceAPI.com — Prix temps réel
- **URL**: `https://www.oilpriceapi.com/`
- **Coût**: Gratuit (7 jours d'essai, 10 000 requêtes)
- **Données**: Prix Brent, WTI en temps réel
- **Limites**: Après essai, payant

---

## Architecture proposée

### Phase 1 — Implémentation immédiate (cette branche)
1. **RSS News Panel**: Afficher les actualités pétrole via RSS (EIA + OilPrice.com)
   - Proxy backend pour éviter les problèmes CORS
   - Parsing RSS côté API (feedparser Python)
   - Affichage dans un nouveau panneau "Actualités"

### Phase 2 — Mise à jour semi-automatique (prochaine itération)
1. **Script `scripts/update_data.py`**:
   - Télécharge les données OWID JSON
   - Compare avec les données actuelles
   - Génère un diff et met à jour `countries.json`
   - Log les changements dans `docs/data-changelog.md`
2. **Commande**: `python -m scripts.update_data [--dry-run]`

### Phase 3 — API EIA intégrée (nécessite clé API)
1. L'utilisateur inscrit une clé EIA gratuite
2. Stockée dans `.env` (`EIA_API_KEY=xxx`)
3. Script enrichi pour :
   - Production/consommation par pays (mensuel)
   - Capacité de raffinage
   - Réserves stratégiques
4. Scheduler optionnel (cron/task scheduler)

### Phase 4 — Flux bilatéraux automatisés
- Source: UN Comtrade (gratuit, API, HS code 2709/2710)
- URL: `https://comtradeapi.un.org/`
- Clé API gratuite requise
- Données: Importations/exportations bilatérales par pays et produit
- Mise à jour: Annuelle (décalage ~6-12 mois)

---

## Résumé des actions
| Action | Source | Clé requise | Priorité |
|--------|--------|-------------|----------|
| Actualités pétrole (RSS) | EIA + OilPrice | Non | Immédiat |
| Production/Consommation auto | OWID JSON | Non | Phase 2 |
| Données complètes pays | EIA API | Oui (gratuite) | Phase 3 |
| Flux bilatéraux | UN Comtrade | Oui (gratuite) | Phase 4 |
