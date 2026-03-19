"""Initial schema

Revision ID: 001
Revises: None
Create Date: 2025-01-01 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Regions
    op.create_table(
        "regions",
        sa.Column("id", sa.String(50), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
    )

    # Countries
    op.create_table(
        "countries",
        sa.Column("code", sa.String(3), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("region_id", sa.String(50), sa.ForeignKey("regions.id"), nullable=False),
        sa.Column("production_mbpd", sa.Float, nullable=False, server_default="0"),
        sa.Column("consumption_mbpd", sa.Float, nullable=False, server_default="0"),
        sa.Column("refining_capacity_mbpd", sa.Float, nullable=False, server_default="0"),
        sa.Column("strategic_reserves_mb", sa.Float, nullable=False, server_default="0"),
        sa.Column("reserve_release_rate_mbpd", sa.Float, nullable=False, server_default="0"),
        sa.Column("is_refining_hub", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("domestic_priority_ratio", sa.Float, nullable=False, server_default="0.3"),
        sa.Column("longitude", sa.Float, nullable=False),
        sa.Column("latitude", sa.Float, nullable=False),
        sa.CheckConstraint("production_mbpd >= 0", name="ck_country_production"),
        sa.CheckConstraint("consumption_mbpd >= 0", name="ck_country_consumption"),
        sa.CheckConstraint("domestic_priority_ratio >= 0 AND domestic_priority_ratio <= 1", name="ck_country_dpr"),
    )

    # Ports
    op.create_table(
        "ports",
        sa.Column("id", sa.String(50), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("country_code", sa.String(3), sa.ForeignKey("countries.code"), nullable=False),
        sa.Column("capacity_mbpd", sa.Float, nullable=False, server_default="0"),
        sa.Column("port_type", sa.String(20), nullable=False),
        sa.Column("longitude", sa.Float, nullable=False),
        sa.Column("latitude", sa.Float, nullable=False),
        sa.CheckConstraint("port_type IN ('export', 'import', 'both')", name="ck_port_type"),
    )

    # Chokepoints
    op.create_table(
        "chokepoints",
        sa.Column("id", sa.String(50), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("throughput_mbpd", sa.Float, nullable=False, server_default="0"),
        sa.Column("longitude", sa.Float, nullable=False),
        sa.Column("latitude", sa.Float, nullable=False),
    )

    # Routes
    op.create_table(
        "routes",
        sa.Column("id", sa.String(50), primary_key=True),
        sa.Column("name", sa.String(300), nullable=False),
        sa.Column("route_type", sa.String(20), nullable=False, server_default="maritime"),
        sa.CheckConstraint("route_type IN ('maritime', 'pipeline', 'mixed')", name="ck_route_type"),
    )

    # Route-Chokepoint association
    op.create_table(
        "route_chokepoints",
        sa.Column("route_id", sa.String(50), sa.ForeignKey("routes.id"), primary_key=True),
        sa.Column("chokepoint_id", sa.String(50), sa.ForeignKey("chokepoints.id"), primary_key=True),
        sa.Column("order_index", sa.Integer, nullable=False),
    )

    # Products
    op.create_table(
        "products",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
    )

    # Flows
    op.create_table(
        "flows",
        sa.Column("id", sa.String(100), primary_key=True),
        sa.Column("exporter_code", sa.String(3), sa.ForeignKey("countries.code"), nullable=False),
        sa.Column("importer_code", sa.String(3), sa.ForeignKey("countries.code"), nullable=False),
        sa.Column("product_id", sa.String(20), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("volume_mbpd", sa.Float, nullable=False),
        sa.Column("route_id", sa.String(50), sa.ForeignKey("routes.id"), nullable=False),
        sa.Column("confidence", sa.String(20), nullable=False, server_default="medium"),
        sa.Column("source", sa.String(500), nullable=True),
        sa.CheckConstraint("volume_mbpd >= 0", name="ck_flow_volume"),
        sa.CheckConstraint("confidence IN ('high', 'medium', 'low', 'estimated')", name="ck_flow_confidence"),
    )
    op.create_index("ix_flow_exporter", "flows", ["exporter_code"])
    op.create_index("ix_flow_importer", "flows", ["importer_code"])
    op.create_index("ix_flow_route", "flows", ["route_id"])

    # Scenarios
    op.create_table(
        "scenarios",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(300), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("is_preset", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Scenario Actions
    op.create_table(
        "scenario_actions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("scenario_id", UUID(as_uuid=True), sa.ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action_type", sa.String(50), nullable=False),
        sa.Column("target_id", sa.String(100), nullable=False),
        sa.Column("severity", sa.Float, nullable=False, server_default="1.0"),
        sa.Column("params", JSONB, nullable=False, server_default="{}"),
        sa.Column("order_index", sa.Integer, nullable=False, server_default="0"),
        sa.CheckConstraint("severity >= 0 AND severity <= 1", name="ck_action_severity"),
    )
    op.create_index("ix_action_scenario", "scenario_actions", ["scenario_id"])

    # Simulation Runs
    op.create_table(
        "simulation_runs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("scenario_id", UUID(as_uuid=True), sa.ForeignKey("scenarios.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("duration_ms", sa.Integer, nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="running"),
        sa.Column("global_stress_score", sa.Float, nullable=True),
        sa.Column("global_supply_loss_pct", sa.Float, nullable=True),
        sa.Column("estimated_price_impact_pct", sa.Float, nullable=True),
        sa.Column("summary", JSONB, nullable=True),
    )

    # Country Impacts
    op.create_table(
        "simulation_country_impacts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("run_id", UUID(as_uuid=True), sa.ForeignKey("simulation_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("country_code", sa.String(3), sa.ForeignKey("countries.code"), nullable=False),
        sa.Column("production_before", sa.Float, nullable=False),
        sa.Column("production_after", sa.Float, nullable=False),
        sa.Column("consumption", sa.Float, nullable=False),
        sa.Column("imports_before", sa.Float, nullable=False),
        sa.Column("imports_after", sa.Float, nullable=False),
        sa.Column("exports_before", sa.Float, nullable=False),
        sa.Column("exports_after", sa.Float, nullable=False),
        sa.Column("domestic_available", sa.Float, nullable=False),
        sa.Column("demand_coverage_ratio", sa.Float, nullable=False),
        sa.Column("stress_score", sa.Float, nullable=False),
        sa.Column("stress_status", sa.String(20), nullable=False),
        sa.Column("reserve_mobilized_mbpd", sa.Float, nullable=False, server_default="0"),
    )
    op.create_index("ix_ci_run", "simulation_country_impacts", ["run_id"])
    op.create_index("ix_ci_country", "simulation_country_impacts", ["country_code"])

    # Flow Impacts
    op.create_table(
        "simulation_flow_impacts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("run_id", UUID(as_uuid=True), sa.ForeignKey("simulation_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("flow_id", sa.String(100), sa.ForeignKey("flows.id"), nullable=False),
        sa.Column("volume_before", sa.Float, nullable=False),
        sa.Column("volume_after", sa.Float, nullable=False),
        sa.Column("loss_pct", sa.Float, nullable=False),
        sa.Column("loss_reasons", JSONB, nullable=False, server_default="[]"),
    )
    op.create_index("ix_fi_run", "simulation_flow_impacts", ["run_id"])

    # Simulation Steps (Journal)
    op.create_table(
        "simulation_steps",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("run_id", UUID(as_uuid=True), sa.ForeignKey("simulation_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("step_number", sa.Integer, nullable=False),
        sa.Column("rule_id", sa.String(10), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("affected_entities", JSONB, nullable=False, server_default="{}"),
        sa.Column("detail", JSONB, nullable=False, server_default="{}"),
    )
    op.create_index("ix_step_run_num", "simulation_steps", ["run_id", "step_number"])

    # Data Snapshots
    op.create_table(
        "data_snapshots",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("source", sa.String(500), nullable=True),
        sa.Column("period", sa.String(50), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
    )

    # Source Provenance
    op.create_table(
        "source_provenance",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.String(100), nullable=False),
        sa.Column("source_name", sa.String(300), nullable=False),
        sa.Column("source_url", sa.String(500), nullable=True),
        sa.Column("source_date", sa.String(20), nullable=True),
        sa.Column("coverage", sa.String(200), nullable=True),
        sa.Column("confidence", sa.String(20), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("source_provenance")
    op.drop_table("data_snapshots")
    op.drop_table("simulation_steps")
    op.drop_table("simulation_flow_impacts")
    op.drop_table("simulation_country_impacts")
    op.drop_table("simulation_runs")
    op.drop_table("scenario_actions")
    op.drop_table("scenarios")
    op.drop_table("flows")
    op.drop_table("products")
    op.drop_table("route_chokepoints")
    op.drop_table("routes")
    op.drop_table("chokepoints")
    op.drop_table("ports")
    op.drop_table("countries")
    op.drop_table("regions")
