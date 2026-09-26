"""Tighten scheme rows so sector, stage, funding, and criteria stay apart.

Recognition, registration, training, and pension schemes are not stored as large grants.
Criterion names used by the matcher stay GST Registration, DPIIT Recognition,
Incorporation Certificate, and Company Registration.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

ALL_SECTORS = [
    "EdTech", "FinTech", "HealthTech", "ClimaTech", "AI/ML",
    "AgriTech", "DeepTech", "Biotech", "Other",
]
NON_CAPITAL = (
    "pension", "beema", "durghatana", "acknowledgement", "stamp duty",
    "training", "toolkit", "mda", "marketing incentive",
)
CRAFT = (
    "footwear", "leather", "handicraft", "hastshilp", "handloom", "textile",
    "vishwakarma", "cuisine", "odoc", "odop",
)

CANON = {
    "gst": ("gst_registration", "GST Registration"),
    "dpiit": ("dpiit_recognition", "DPIIT Recognition"),
    "incorporation": ("incorporation_certificate", "Incorporation Certificate"),
    "company": ("company_registration", "Company Registration"),
}


def database_url() -> str:
    env_path = Path(__file__).resolve().parents[1] / "backend" / ".env"
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if line.startswith("DATABASE_URL="):
            return line.split("=", 1)[1].strip()
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        raise SystemExit("DATABASE_URL is missing")
    return url


def canon_criterion(item: dict) -> dict:
    text = f"{item.get('id', '')} {item.get('name', '')}".lower()
    if "udyam" in text or "women" in text or "shareholding" in text:
        return item
    key = None
    if "gst" in text:
        key = "gst"
    elif "dpiit" in text:
        key = "dpiit"
    elif "incorporation" in text:
        key = "incorporation"
    elif "registration" in text or "company" in text:
        key = "company"
    if key is None:
        return item
    criterion_id, name = CANON[key]
    updated = dict(item)
    updated["id"] = criterion_id
    updated["name"] = name
    return updated


def ensure(criteria: list[dict], criterion: dict) -> list[dict]:
    names = {item.get("name") for item in criteria}
    if criterion["name"] not in names:
        criteria.append(criterion)
    return criteria


def classify(name: str, funding_max: int) -> tuple[list[str], list[str], int, int] | None:
    lowered = name.lower()
    if name == "STARTUP INDIA Scheme":
        return (ALL_SECTORS, ["Pre-seed", "Seed", "Series A", "Series B"], 0, 0)
    if name == "MSME Udyam Scheme":
        return (ALL_SECTORS, ["Pre-seed", "Seed"], 0, 0)
    if name == "Women Entrepreneurship Platform":
        return (ALL_SECTORS, ["Pre-seed", "Seed", "Series A", "Series B"], 0, 0)
    if any(word in lowered for word in NON_CAPITAL):
        return (["Other"], ["Pre-seed"], 0, funding_max if funding_max else 0)
    if any(word in lowered for word in CRAFT):
        return (["Other"], ["Pre-seed", "Seed"], None, None)
    return None


def main() -> None:
    import psycopg

    with psycopg.connect(database_url(), client_encoding="UTF8") as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT name, eligible_sectors, eligible_stages, funding_min, funding_max, eligibility_criteria
                FROM schemes
                """
            )
            rows = cursor.fetchall()
            for name, sectors, stages, funding_min, funding_max, criteria in rows:
                criteria = criteria if isinstance(criteria, list) else json.loads(criteria)
                criteria = [canon_criterion(item) for item in criteria]
                update = classify(name, funding_max)
                next_sectors, next_stages = sectors, stages
                next_min, next_max = funding_min, funding_max
                if update:
                    next_sectors, next_stages, new_min, new_max = update
                    if new_min is not None:
                        next_min = new_min
                    if new_max is not None:
                        next_max = new_max
                if name == "Startup India Seed Fund Scheme":
                    criteria = ensure(criteria, {
                        "id": "dpiit_recognition",
                        "name": "DPIIT Recognition",
                        "description": "The startup must be recognised by DPIIT",
                        "required": True,
                        "impact": "high",
                    })
                    criteria = ensure(criteria, {
                        "id": "incorporation_certificate",
                        "name": "Incorporation Certificate",
                        "description": "Incorporated not more than two years before the application",
                        "required": True,
                        "impact": "high",
                    })
                    criteria = ensure(criteria, {
                        "id": "company_registration",
                        "name": "Company Registration",
                        "description": "Private limited company, partnership, or LLP",
                        "required": True,
                        "impact": "high",
                    })
                if name == "UP Startup Policy":
                    criteria = ensure(criteria, {
                        "id": "dpiit_recognition",
                        "name": "DPIIT Recognition",
                        "description": "DPIIT recognition is required for the state incentive",
                        "required": True,
                        "impact": "high",
                    })
                    criteria = ensure(criteria, {
                        "id": "company_registration",
                        "name": "Company Registration",
                        "description": "The unit must be registered in Uttar Pradesh",
                        "required": True,
                        "impact": "high",
                    })
                    criteria = ensure(criteria, {
                        "id": "gst_registration",
                        "name": "GST Registration",
                        "description": "GST registration or a pending application",
                        "required": False,
                        "impact": "medium",
                    })
                cursor.execute(
                    """
                    UPDATE schemes
                    SET eligible_sectors = %s,
                        eligible_stages = %s,
                        funding_min = %s,
                        funding_max = %s,
                        eligibility_criteria = %s::jsonb,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE name = %s
                    """,
                    (next_sectors, next_stages, next_min, next_max, json.dumps(criteria), name),
                )
        connection.commit()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT scheme_type, COUNT(*)
                FROM schemes
                GROUP BY scheme_type
                ORDER BY scheme_type
                """
            )
            print("BY TYPE")
            for scheme_type, count in cursor.fetchall():
                print(f"  {scheme_type}: {count}")
            cursor.execute(
                """
                SELECT COUNT(*) FROM schemes
                WHERE funding_max = 0
                """
            )
            print(f"Non-capital rows (funding max 0): {cursor.fetchone()[0]}")


if __name__ == "__main__":
    main()
