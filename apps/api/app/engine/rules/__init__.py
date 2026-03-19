"""Simulation rules A through I."""

from app.engine.rules.rule_a_chokepoints import apply_rule_a
from app.engine.rules.rule_b_embargo import apply_rule_b
from app.engine.rules.rule_c_production import apply_rule_c
from app.engine.rules.rule_d_domestic import apply_rule_d
from app.engine.rules.rule_e_refining import apply_rule_e
from app.engine.rules.rule_f_reserves import apply_rule_f
from app.engine.rules.rule_g_coverage import apply_rule_g
from app.engine.rules.rule_h_stress import apply_rule_h
from app.engine.rules.rule_i_price import apply_rule_i

__all__ = [
    "apply_rule_a", "apply_rule_b", "apply_rule_c",
    "apply_rule_d", "apply_rule_e", "apply_rule_f",
    "apply_rule_g", "apply_rule_h", "apply_rule_i",
]
