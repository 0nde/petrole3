"""PetroSim Data Pipeline — automated country data refresh.

Steps:
  1. fetch_owid   — Download OWID energy CSV (free, no key)
  2. fetch_eia    — EIA API v2 international data (requires EIA_API_KEY)
  3. validate_score — Cross-reference sources, compute confidence badges
  4. update_db    — UPSERT annual_baselines; optional countries table update
  5. generate_report — Markdown report for GitHub Job Summary / S3
"""
