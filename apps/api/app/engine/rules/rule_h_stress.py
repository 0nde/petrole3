"""Rule H — Stress Scoring.

Each country receives a stress score [0-100] based on demand coverage ratio.

Mapping (linear interpolation within bands):
  coverage >= 0.95  →  0-10   (stable)
  0.80 <= cov < 0.95 → 10-40  (tension)
  0.60 <= cov < 0.80 → 40-70  (critical)
  cov < 0.60         → 70-100 (emergency)

Status thresholds:
  0-20:   stable
  20-50:  tension
  50-80:  critical
  80-100: emergency
"""

from app.engine.types import SimulationState


def _coverage_to_stress(coverage: float) -> float:
    """Convert demand coverage ratio to stress score [0-100]."""
    if coverage >= 1.0:
        return 0.0
    elif coverage >= 0.95:
        # 0.95-1.0 → 0-10
        t = (1.0 - coverage) / 0.05
        return t * 10.0
    elif coverage >= 0.80:
        # 0.80-0.95 → 10-40
        t = (0.95 - coverage) / 0.15
        return 10.0 + t * 30.0
    elif coverage >= 0.60:
        # 0.60-0.80 → 40-70
        t = (0.80 - coverage) / 0.20
        return 40.0 + t * 30.0
    elif coverage >= 0.0:
        # 0.0-0.60 → 70-100
        t = (0.60 - coverage) / 0.60
        return 70.0 + t * 30.0
    else:
        return 100.0


def _score_to_status(score: float) -> str:
    """Convert stress score to status label."""
    if score < 20:
        return "stable"
    elif score < 50:
        return "tension"
    elif score < 80:
        return "critical"
    else:
        return "emergency"


def apply_rule_h(state: SimulationState) -> None:
    status_counts = {"stable": 0, "tension": 0, "critical": 0, "emergency": 0}
    emergency_countries: list[str] = []
    critical_countries: list[str] = []

    for country in state.countries.values():
        coverage = getattr(country, "_coverage", 1.0)
        score = _coverage_to_stress(coverage)
        status = _score_to_status(score)

        country._stress_score = score  # type: ignore[attr-defined]
        country._stress_status = status  # type: ignore[attr-defined]

        status_counts[status] += 1
        if status == "emergency":
            emergency_countries.append(country.code)
        elif status == "critical":
            critical_countries.append(country.code)

    state.add_step(
        rule_id="H",
        description=(
            f"Stress scoring: "
            f"{status_counts['stable']} stable, "
            f"{status_counts['tension']} tension, "
            f"{status_counts['critical']} critical, "
            f"{status_counts['emergency']} emergency"
        ),
        affected_entities={
            "countries": emergency_countries + critical_countries,
        },
        detail={
            "status_counts": status_counts,
            "emergency_countries": emergency_countries,
            "critical_countries": critical_countries,
        },
    )
