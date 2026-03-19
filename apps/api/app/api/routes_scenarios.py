"""API routes for scenario management."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Scenario, ScenarioAction
from app.db.session import get_db
from app.domain.schemas import ScenarioCreate, ScenarioOut, ScenarioUpdate

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("", response_model=list[ScenarioOut])
async def list_scenarios(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Scenario)
        .options(selectinload(Scenario.actions))
        .order_by(Scenario.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{scenario_id}", response_model=ScenarioOut)
async def get_scenario(scenario_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Scenario)
        .options(selectinload(Scenario.actions))
        .where(Scenario.id == scenario_id)
    )
    scenario = result.scalar_one_or_none()
    if not scenario:
        raise HTTPException(404, "Scenario not found")
    return scenario


@router.post("", response_model=ScenarioOut, status_code=201)
async def create_scenario(body: ScenarioCreate, db: AsyncSession = Depends(get_db)):
    scenario = Scenario(
        id=uuid.uuid4(),
        name=body.name,
        description=body.description,
        is_preset=False,
    )
    for i, action_in in enumerate(body.actions):
        scenario.actions.append(ScenarioAction(
            id=uuid.uuid4(),
            action_type=action_in.action_type.value,
            target_id=action_in.target_id,
            severity=action_in.severity,
            params=action_in.params,
            order_index=action_in.order_index or i,
        ))
    db.add(scenario)
    await db.flush()
    await db.refresh(scenario, attribute_names=["actions"])
    return scenario


@router.put("/{scenario_id}", response_model=ScenarioOut)
async def update_scenario(
    scenario_id: uuid.UUID,
    body: ScenarioUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Scenario)
        .options(selectinload(Scenario.actions))
        .where(Scenario.id == scenario_id)
    )
    scenario = result.scalar_one_or_none()
    if not scenario:
        raise HTTPException(404, "Scenario not found")
    if scenario.is_preset:
        raise HTTPException(400, "Cannot modify preset scenarios")

    if body.name is not None:
        scenario.name = body.name
    if body.description is not None:
        scenario.description = body.description
    if body.actions is not None:
        # Replace all actions
        scenario.actions.clear()
        for i, action_in in enumerate(body.actions):
            scenario.actions.append(ScenarioAction(
                id=uuid.uuid4(),
                action_type=action_in.action_type.value,
                target_id=action_in.target_id,
                severity=action_in.severity,
                params=action_in.params,
                order_index=action_in.order_index or i,
            ))

    await db.flush()
    await db.refresh(scenario, attribute_names=["actions"])
    return scenario


@router.delete("/{scenario_id}", status_code=204)
async def delete_scenario(scenario_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Scenario).where(Scenario.id == scenario_id)
    )
    scenario = result.scalar_one_or_none()
    if not scenario:
        raise HTTPException(404, "Scenario not found")
    if scenario.is_preset:
        raise HTTPException(400, "Cannot delete preset scenarios")
    await db.delete(scenario)
