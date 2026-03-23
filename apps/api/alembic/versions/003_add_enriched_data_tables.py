"""Add enriched data tables from petrole-datas backbone.

Revision ID: 003
Revises: 002
Create Date: 2026-03-22

New tables:
- annual_baselines: 20 indicators per country with machine-verified confidence
- trade_flows_detailed: UN Comtrade data with sources and percentages
- verification_logs: Audit trail for every machine verification attempt
- simulation_parameters_data: Hypothetical parameters with justifications
"""

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    # --- annual_baselines ---
    op.create_table(
        "annual_baselines",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("country_code", sa.String(2), nullable=False),
        sa.Column("indicator", sa.String(60), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(30), nullable=False),
        sa.Column("reference_year", sa.Integer(), nullable=False),
        sa.Column("source_name", sa.String(200), nullable=False),
        sa.Column("source_url", sa.String(500), nullable=True),
        sa.Column("definition", sa.Text(), nullable=True),
        sa.Column("confidence_score", sa.String(20), nullable=False, server_default="Low"),
        sa.Column("verification_method", sa.String(30), nullable=True),
        sa.Column("verified_date", sa.String(30), nullable=True),
        sa.Column("raw_source_snippet", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ab_country", "annual_baselines", ["country_code"])
    op.create_index("ix_ab_indicator", "annual_baselines", ["indicator"])
    op.create_index("ix_ab_country_indicator", "annual_baselines", ["country_code", "indicator"])

    # --- trade_flows_detailed ---
    op.create_table(
        "trade_flows_detailed",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("country_code", sa.String(2), nullable=False),
        sa.Column("flow_type", sa.String(10), nullable=False, server_default="import"),
        sa.Column("partner_country", sa.String(100), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(10), nullable=False, server_default="kt"),
        sa.Column("percentage", sa.Float(), nullable=False),
        sa.Column("reference_year", sa.Integer(), nullable=False),
        sa.Column("reference_month", sa.Integer(), nullable=True),
        sa.Column("source_name", sa.String(200), nullable=False),
        sa.Column("source_url", sa.String(500), nullable=True),
        sa.Column("confidence_score", sa.String(20), nullable=False, server_default="High"),
        sa.Column("verification_method", sa.String(30), nullable=True),
        sa.Column("verified_date", sa.String(30), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tfd_country", "trade_flows_detailed", ["country_code"])

    # --- verification_logs ---
    op.create_table(
        "verification_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("table_name", sa.String(50), nullable=False),
        sa.Column("record_id", sa.Integer(), nullable=False),
        sa.Column("country_code", sa.String(2), nullable=False),
        sa.Column("indicator", sa.String(60), nullable=False),
        sa.Column("claimed_value", sa.Float(), nullable=False),
        sa.Column("source_url", sa.String(500), nullable=False),
        sa.Column("verification_date", sa.String(30), nullable=False),
        sa.Column("method", sa.String(30), nullable=False),
        sa.Column("found_value", sa.Float(), nullable=True),
        sa.Column("match", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("tolerance_pct", sa.Float(), nullable=False, server_default=sa.text("5.0")),
        sa.Column("raw_snippet", sa.Text(), nullable=True),
        sa.Column("result", sa.String(30), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vl_country", "verification_logs", ["country_code"])
    op.create_index("ix_vl_result", "verification_logs", ["result"])

    # --- simulation_parameters_data ---
    op.create_table(
        "simulation_parameters_data",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("country_code", sa.String(2), nullable=False),
        sa.Column("parameter_name", sa.String(60), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(30), nullable=False),
        sa.Column("source_name", sa.String(200), nullable=False),
        sa.Column("source_url", sa.String(500), nullable=True),
        sa.Column("is_hypothesis", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("justification", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_spd_country", "simulation_parameters_data", ["country_code"])


def downgrade() -> None:
    op.drop_table("simulation_parameters_data")
    op.drop_table("verification_logs")
    op.drop_table("trade_flows_detailed")
    op.drop_table("annual_baselines")
