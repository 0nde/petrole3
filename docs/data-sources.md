# Data Sources & Methodology

## Reference Year: 2023 (latest complete year)

All production, consumption, trade flow, and reserve data have been verified against official
sources using 2023 as the reference year. Where 2024 partial-year data was available (e.g.,
French customs data from CPDP), it was used to cross-check trends but 2023 remains the
baseline for consistency.

## Primary Sources

### 1. EIA — U.S. Energy Information Administration
- **URL**: https://www.eia.gov/international/
- **Data used**: Crude oil production (crude + condensate) by country, petroleum consumption
  by country, bilateral trade flows, refining capacity, U.S. import/export details.
- **Why chosen**: Most comprehensive freely available international energy dataset. Updated
  annually with country-level detail. The EIA International Energy Statistics is the global
  reference used by governments, banks, and research institutions worldwide.
- **Confidence**: High for top-40 producers/consumers; medium for smaller countries.
- **Period**: 2023 annual averages.

### 2. Energy Institute — Statistical Review of World Energy 2024
- **URL**: https://www.energyinst.org/statistical-review
- **Data used**: Cross-reference for production, consumption, refining capacity, and trade
  movements. Formerly published by BP for 70+ years.
- **Why chosen**: Gold-standard annual compilation. Peer-reviewed methodology. Covers 80+
  countries with consistent time series.
- **Confidence**: High.
- **Period**: 2023 data (published June 2024).

### 3. IEA — International Energy Agency
- **URL**: https://www.iea.org/data-and-statistics
- **Data used**: OECD strategic petroleum reserves (IEA Emergency Response obligations),
  consumption data for member countries, Oil Market Report monthly data.
- **Why chosen**: The IEA is the official body coordinating OECD countries' strategic reserves
  and emergency response. Their reserve data is authoritative.
- **Confidence**: High for OECD countries.

### 4. OPEC — Annual Statistical Bulletin & Monthly Oil Market Report
- **URL**: https://asb.opec.org/ and https://momr.opec.org/
- **Data used**: OPEC member production (including voluntary cuts), export destinations,
  proven reserves.
- **Why chosen**: Primary source for OPEC member country data.
- **Confidence**: High for OPEC members.

### 5. National / Regional Official Sources
| Country | Source | URL |
|---------|--------|-----|
| France | SDES / INSEE / CPDP | https://www.insee.fr/fr/statistiques/2119697 |
| France | Connaissance des Energies | https://www.connaissancedesenergies.org/ |
| France | CPDP (Comité Professionnel du Pétrole) | https://www.cpdp.org/ |
| Germany | BAFA (Federal Office for Economic Affairs) | https://www.bafa.de/ |
| Germany | Clean Energy Wire | https://www.cleanenergywire.org/ |
| Japan | METI (Ministry of Economy, Trade & Industry) | https://www.meti.go.jp/ |
| India | PPAC (Petroleum Planning & Analysis Cell) | https://www.ppac.gov.in/ |
| China | General Administration of Customs | http://english.customs.gov.cn/ |
| South Korea | KNOC (Korea National Oil Corporation) | https://www.knoc.co.kr/ |

- **Why chosen**: National customs and energy agencies provide the most accurate bilateral
  trade data for their respective countries. These are primary sources — the EIA itself
  often derives its bilateral data from these agencies.
- **Confidence**: High.

### 6. UN Comtrade
- **URL**: https://comtradeplus.un.org/
- **Data used**: Cross-reference for bilateral crude oil trade (HS code 2709).
- **Confidence**: Medium (reporting lags, some country discrepancies).

## Methodology

### Production (Mb/d)
- **Definition**: Crude oil + condensate production, annual average.
- **Source priority**: EIA > Energy Institute > OPEC ASB.
- **Notes**: Saudi Arabia figure (9.6 Mb/d in 2023) reflects OPEC+ voluntary cuts.
  Actual production capacity is higher (~12.5 Mb/d). The simulator uses actual output.

### Consumption (Mb/d)
- **Definition**: Total petroleum products consumption (including refined products),
  annual average.
- **Source priority**: EIA > Energy Institute > IEA Oil Market Report.

### Refining Capacity (Mb/d)
- **Definition**: Nameplate atmospheric distillation capacity.
- **Source priority**: EIA Refinery Capacity Report > Energy Institute > Oil & Gas Journal.

### Strategic Reserves (Mb)
- **Definition**: Government-held strategic petroleum reserves (SPR). Does not include
  commercial inventories or industry-obligated stocks except where noted.
- **Source priority**: IEA Emergency Response data > national energy agency reports.
- **Notes**: China's SPR is estimated (government does not publish exact figures).
  Estimate of ~950 Mb is based on satellite imagery analysis and industry estimates.

### Trade Flows (Mb/d)
- **Definition**: Bilateral crude oil and refined product trade volumes, annual average.
- **Source priority**: National customs data > EIA > UN Comtrade > industry estimates.
- **France breakdown** (verified against SDES/INSEE 2023):
  USA 16.7%, Nigeria 12.4%, Kazakhstan 12.0%, Algeria 9.6%, Libya 8.7%,
  Iraq 7.6%, Saudi Arabia 7.5%, Norway 7.2%.
- **Routing**: Flows are assigned to maritime routes based on dominant shipping lanes.
  Pipeline flows (Druzhba, CPC, ESPO, Kazakhstan-China) are tracked separately.

### Confidence Levels
Each flow carries a confidence tag:
- **high**: Bilateral data from national customs or EIA with <5% uncertainty.
- **medium**: Derived from regional totals or cross-referenced from multiple sources.
  Uncertainty ~5-20%.
- **low**: Significant estimation. E.g., Iran exports under sanctions (opaque data).
- **estimated**: Gap-filled to balance supply/demand. Flagged for future verification.

## Key Findings from Verification

### France — Corrected
The original dataset only had France importing from Nigeria, Algeria, Libya, and Norway
(~0.55 Mb/d total). Actual French crude imports are ~0.93 Mb/d (2023). Major missing
suppliers:
- **USA** (1st supplier, 16.7%) — shale oil exports to France have surged since 2018
- **Kazakhstan** (3rd, 12.0%) — via CPC pipeline to Black Sea, then tanker
- **Iraq** (6th, 7.6%) — via Hormuz and Suez
- **Saudi Arabia** (7th, 7.5%) — via Hormuz and Suez
- **Russia** (0%) — fully embargoed since 2023

### Germany — Corrected
Kazakhstan is now Germany's #1 supplier (~30%) after the Russia embargo. The original
dataset underrepresented this shift.

### Global Trade Pattern Shifts (2022-2023)
- Russia redirected exports massively from Europe to India and China.
- USA became a top-5 crude exporter globally (shale revolution).
- European countries diversified away from Russia toward Middle East, USA, Africa, Caspian.

## Update Schedule
This dataset should be reviewed annually when the Energy Institute Statistical Review
is published (typically June). French data from SDES/INSEE is updated in Q1.

## File Manifest
| File | Records | Description |
|------|---------|-------------|
| `regions.json` | 9 | Geographic regions |
| `countries.json` | 65 | Country profiles with production, consumption, reserves (EIA 2023) |
| `chokepoints.json` | 8 | Maritime chokepoints with throughput |
| `routes.json` | 30 | Maritime and pipeline routes with chokepoint links |
| `flows.json` | 159 | Bilateral trade flows (131 crude + 28 refined) |
| `scenarios.json` | 14 | Preset simulation scenarios (bilingual FR/EN, 4 multi-action) |
