"""Add name_fr and description_fr to scenarios

Revision ID: 002
Revises: 001
Create Date: 2026-03-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("scenarios", sa.Column("name_fr", sa.String(300), nullable=True))
    op.add_column("scenarios", sa.Column("description_fr", sa.Text, nullable=True))


def downgrade() -> None:
    op.drop_column("scenarios", "description_fr")
    op.drop_column("scenarios", "name_fr")
