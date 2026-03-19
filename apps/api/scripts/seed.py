"""Seed the database with reference data from data/seed/ JSON files.

Usage:
    cd apps/api
    python -m scripts.seed
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.config import settings

SEED_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "seed"


def load_json(filename: str) -> list[dict]:
    path = SEED_DIR / filename
    if not path.exists():
        print(f"  WARNING: {path} not found, skipping")
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed(session: Session) -> None:
    # 1. Products
    print("Seeding products...")
    session.execute(text("DELETE FROM products"))
    for p in [{"id": "crude", "name": "Crude Oil"}, {"id": "refined", "name": "Refined Products"}]:
        session.execute(
            text("INSERT INTO products (id, name) VALUES (:id, :name)"),
            p,
        )

    # 2. Regions
    print("Seeding regions...")
    session.execute(text("DELETE FROM regions CASCADE"))
    for r in load_json("regions.json"):
        session.execute(
            text("INSERT INTO regions (id, name) VALUES (:id, :name)"),
            r,
        )

    # 3. Countries
    print("Seeding countries...")
    session.execute(text("DELETE FROM countries CASCADE"))
    for c in load_json("countries.json"):
        session.execute(
            text("""
                INSERT INTO countries (
                    code, name, region_id, production_mbpd, consumption_mbpd,
                    refining_capacity_mbpd, strategic_reserves_mb, reserve_release_rate_mbpd,
                    is_refining_hub, domestic_priority_ratio, longitude, latitude
                ) VALUES (
                    :code, :name, :region_id, :production_mbpd, :consumption_mbpd,
                    :refining_capacity_mbpd, :strategic_reserves_mb, :reserve_release_rate_mbpd,
                    :is_refining_hub, :domestic_priority_ratio, :longitude, :latitude
                )
            """),
            c,
        )

    # 4. Chokepoints
    print("Seeding chokepoints...")
    session.execute(text("DELETE FROM chokepoints CASCADE"))
    for cp in load_json("chokepoints.json"):
        session.execute(
            text("""
                INSERT INTO chokepoints (id, name, throughput_mbpd, longitude, latitude)
                VALUES (:id, :name, :throughput_mbpd, :longitude, :latitude)
            """),
            cp,
        )

    # 5. Routes and route_chokepoints
    print("Seeding routes...")
    session.execute(text("DELETE FROM route_chokepoints"))
    session.execute(text("DELETE FROM routes CASCADE"))
    for r in load_json("routes.json"):
        session.execute(
            text("""
                INSERT INTO routes (id, name, route_type)
                VALUES (:id, :name, :route_type)
            """),
            {"id": r["id"], "name": r["name"], "route_type": r["route_type"]},
        )
        for rc in r.get("chokepoints", []):
            session.execute(
                text("""
                    INSERT INTO route_chokepoints (route_id, chokepoint_id, order_index)
                    VALUES (:route_id, :chokepoint_id, :order_index)
                """),
                {"route_id": r["id"], **rc},
            )

    # 6. Flows
    print("Seeding flows...")
    session.execute(text("DELETE FROM flows CASCADE"))
    for f in load_json("flows.json"):
        session.execute(
            text("""
                INSERT INTO flows (id, exporter_code, importer_code, product_id, volume_mbpd, route_id, confidence, source)
                VALUES (:id, :exporter_code, :importer_code, :product_id, :volume_mbpd, :route_id, :confidence, :source)
            """),
            f,
        )

    # 7. Scenarios (presets)
    print("Seeding preset scenarios...")
    # Don't delete user scenarios, only presets
    session.execute(text("DELETE FROM scenario_actions WHERE scenario_id IN (SELECT id FROM scenarios WHERE is_preset = true)"))
    session.execute(text("DELETE FROM scenarios WHERE is_preset = true"))
    for s in load_json("scenarios.json"):
        scenario_id = uuid.uuid4()
        session.execute(
            text("""
                INSERT INTO scenarios (id, name, description, is_preset)
                VALUES (:id, :name, :description, :is_preset)
            """),
            {"id": str(scenario_id), "name": s["name"], "description": s["description"], "is_preset": True},
        )
        for a in s.get("actions", []):
            session.execute(
                text("""
                    INSERT INTO scenario_actions (id, scenario_id, action_type, target_id, severity, params, order_index)
                    VALUES (:id, :scenario_id, :action_type, :target_id, :severity, :params, :order_index)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "scenario_id": str(scenario_id),
                    "action_type": a["action_type"],
                    "target_id": a["target_id"],
                    "severity": a["severity"],
                    "params": json.dumps(a.get("params", {})),
                    "order_index": a.get("order_index", 0),
                },
            )

    # 8. Data snapshot record
    print("Seeding data snapshot...")
    session.execute(text("DELETE FROM data_snapshots"))
    session.execute(
        text("""
            INSERT INTO data_snapshots (id, name, source, period, notes)
            VALUES (:id, :name, :source, :period, :notes)
        """),
        {
            "id": str(uuid.uuid4()),
            "name": "Initial Seed v1",
            "source": "EIA, IEA, BP Statistical Review 2022-2023",
            "period": "2022-2023",
            "notes": "Initial reference dataset. See docs/data-lineage.md for details.",
        },
    )

    session.commit()
    print("Seed completed successfully.")


def main() -> None:
    sync_url = settings.SYNC_DATABASE_URL
    engine = create_engine(sync_url, echo=False)
    with Session(engine) as session:
        seed(session)


if __name__ == "__main__":
    main()
