"""Seed FundMatch schemes from the Uttar Pradesh MSME department site.

Fetches the official beneficiary-scheme list at
https://msme.up.gov.in/en/home/Beneficiary_Schemes
and upserts rows that match the schemes table.

Capital ranges are filled only when the department brochure states them.
Other rows keep funding_min and funding_max at 0 and say so in the description.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from pathlib import Path

LIST_URL = "https://msme.up.gov.in/en/home/Beneficiary_Schemes"
BROCHURE_URL = "https://msme.up.gov.in/doc/Schemes/BROCHURE%20final.pdf"
SITE = "https://msme.up.gov.in"

SECTORS = [
    "EdTech",
    "FinTech",
    "HealthTech",
    "ClimaTech",
    "AI/ML",
    "AgriTech",
    "DeepTech",
    "Biotech",
    "Other",
]

ORDER_URLS = {
    "Vishwakarma Shram Samman Yojana 2.0 (Toolkit/Margin scheme)": "/doc/MSME_GO/VSSY/vssy_sanshodhan_18062020.pdf",
    "Uttar Pradesh Micro and Small Industries Technical Upgradation Scheme": "/doc/MSME_GO/tus/tus_15022019.pdf",
    "Handicraft Marketing Incentive Scheme": "/doc/MSME_GO/hstvpy/hstvpy_07012013.pdf",
    "ODOP Margin Money Scheme": "/doc/MSME_GO/odop_mm/odop_mm_17072020.pdf",
    "Training Scheme for SC/ST": "/doc/MSME_GO/sc_st/sc_st_19092012.pdf",
    "ODOP Marketing Development Assistance (MDA) Scheme": "/doc/MSME_GO/odop_mda/odop_mda_22042020.pdf",
    "Stamp Duty Exemption": "/doc/MSME_GO/stamp_duty/stamp_01052018.pdf",
    "ODOP Common Facility Center Promotion": "/doc/MSME_GO/odop_cfc/odop_cfc_06112018.pdf",
    "ODOP Training and Toolkit Scheme": "/doc/MSME_GO/odop_toolkit/odop_toolkit_05052020.pdf",
    "Training Scheme for OBC": "/doc/MSME_GO/obc/obc_29062018.pdf",
    "Mukhyamantri Yuva Udyami Vikas abhiyaan": "/doc/yuva_04102024.pdf",
}

# Amounts taken from the department brochure text, in lakhs.
BROCHURE_FACTS = {
    "ODOP Margin Money Scheme": {
        "funding_min": 0,
        "funding_max": 20,
        "detail": (
            "The department brochure sets margin money by project cost: "
            "up to Rs 25 lakh, 25 percent capped at Rs 6.25 lakh; "
            "above Rs 25 lakh up to Rs 50 lakh, Rs 6.25 lakh or 20 percent, whichever is higher; "
            "above Rs 50 lakh up to Rs 150 lakh, Rs 10 lakh or 10 percent, whichever is higher; "
            "above Rs 150 lakh, 10 percent capped at Rs 20 lakh."
        ),
        "criteria": [
            {
                "id": "age",
                "name": "Minimum age 18",
                "description": "The brochure requires the applicant to be at least 18 years old.",
                "required": True,
                "impact": "high",
            },
            {
                "id": "odop_product",
                "name": "Identified ODOP product",
                "description": "Assistance is for units making the ODOP product identified for that district.",
                "required": True,
                "impact": "high",
            },
            {
                "id": "defaulter",
                "name": "Not a defaulter",
                "description": "The applicant must not be a defaulter of a nationalised bank, financial institution, or government institution.",
                "required": True,
                "impact": "high",
            },
        ],
    },
    "ODOP Common Facility Center Promotion": {
        "funding_min": 0,
        "funding_max": 1500,
        "detail": (
            "The department brochure says a common facility centre can receive a grant of up to 90 percent "
            "of the detailed project report, capped at Rs 15 crore, and must be run by a registered SPV "
            "with at least 20 members."
        ),
        "criteria": [
            {
                "id": "spv",
                "name": "Registered SPV",
                "description": "The centre must be run by a trust, cooperative society, or company with at least 20 members.",
                "required": True,
                "impact": "high",
            }
        ],
    },
    "(MYSY) Mukhyamantri Yuva Swarojgar Yojana,U.P.": {
        "funding_min": 0,
        "funding_max": 0,
        "detail": (
            "The department brochure requires a Uttar Pradesh resident aged 18 to 40 with at least a high-school "
            "pass, who is not a bank defaulter and has not already taken another government self-employment benefit. "
            "That brochure section does not state a capital ceiling."
        ),
        "criteria": [
            {
                "id": "age",
                "name": "Age 18 to 40",
                "description": "The brochure requires the applicant to be between 18 and 40 years old.",
                "required": True,
                "impact": "high",
            },
            {
                "id": "education",
                "name": "High school",
                "description": "Minimum education is a high-school pass or equivalent.",
                "required": True,
                "impact": "medium",
            },
            {
                "id": "up_resident",
                "name": "Uttar Pradesh resident",
                "description": "The applicant must be a permanent resident of Uttar Pradesh.",
                "required": True,
                "impact": "high",
            },
        ],
    },
}


def load_database_url() -> str:
    env_path = Path(__file__).resolve().parents[1] / "backend" / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("DATABASE_URL="):
                return line.split("=", 1)[1].strip()
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        raise SystemExit("DATABASE_URL is missing. Set it in backend/.env.")
    return url


def fetch_schemes() -> list[dict]:
    request = urllib.request.Request(LIST_URL, headers={"User-Agent": "FundMatch/1.0"})
    with urllib.request.urlopen(request, timeout=40) as response:
        html = response.read().decode("utf-8", errors="replace")
    match = re.search(r"PopulateTable\(JSON\.parse\('(\[.*?\])'\)\)", html, re.S)
    if not match:
        raise SystemExit(f"Could not find the scheme list on {LIST_URL}")
    rows = json.loads(match.group(1))
    if not isinstance(rows, list) or not rows:
        raise SystemExit("The scheme list on the site was empty.")
    return rows


NON_CAPITAL = (
    "pension",
    "beema",
    "durghatana",
    "acknowledgement",
    "stamp duty",
    "training",
    "toolkit",
    "mda",
    "marketing",
)


def sectors_for(name: str) -> list[str]:
    lowered = name.lower()
    if any(word in lowered for word in NON_CAPITAL):
        return ["Other"]
    restricted = (
        "footwear",
        "leather",
        "handicraft",
        "hastshilp",
        "handloom",
        "textile",
        "vishwakarma",
        "cuisine",
        "odoc",
        "odop",
    )
    if any(word in lowered for word in restricted):
        return ["Other"]
    return list(SECTORS)


def stages_for(name: str) -> list[str]:
    lowered = name.lower()
    if any(word in lowered for word in NON_CAPITAL):
        return ["Pre-seed"]
    if any(word in lowered for word in ("swarojgar", "udyami", "udyam", "margin")):
        return ["Pre-seed", "Seed"]
    return ["Pre-seed", "Seed"]


def base_detail(name: str) -> str:
    lowered = name.lower()
    if "stamp duty" in lowered:
        return "Stamp-duty exemption listed by the department. It is not a capital grant, so the funding range is 0."
    if "training" in lowered or "toolkit" in lowered:
        return "Training or toolkit scheme listed by the department. The listing does not publish a capital range."
    if "pension" in lowered:
        return "Artisan pension listed by the department. It is not startup capital, so the funding range is 0."
    if "beema" in lowered or "insurance" in lowered or "durghatana" in lowered:
        return "Accident-insurance scheme listed by the department. The listing does not publish a capital range."
    if "acknowledgement" in lowered or "72" in lowered:
        return "72-hour acknowledgement certificate under the UP MSME Act 2020. It is not a capital grant."
    return "Beneficiary scheme listed by the MSME Department. The listing page does not publish a capital range."


def to_record(row: dict) -> dict:
    name = " ".join(str(row["scheme_name"]).split())
    facts = BROCHURE_FACTS.get(name, {})
    path = ORDER_URLS.get(name)
    source = f"{SITE}{path}" if path else LIST_URL
    detail = facts.get("detail") or base_detail(name)
    description = f"{name}. {detail} Source: MSME Department, Government of Uttar Pradesh."
    criteria = facts.get("criteria") or [
        {
            "id": "up_listing",
            "name": "Uttar Pradesh MSME beneficiary",
            "description": "The enterprise must qualify under this scheme as listed by the MSME Department, Government of Uttar Pradesh.",
            "required": True,
            "impact": "high",
        }
    ]
    return {
        "name": name[:255],
        "description": description,
        "eligible_sectors": sectors_for(name),
        "eligible_stages": stages_for(name),
        "eligible_locations": ["Uttar Pradesh"],
        "funding_min": int(facts.get("funding_min", 0)),
        "funding_max": int(facts.get("funding_max", 0)),
        "eligibility_criteria": criteria,
        "source_url": source[:500],
        "scheme_type": "State",
    }


def upsert(records: list[dict]) -> int:
    import psycopg

    sql = """
        INSERT INTO schemes (
            name, description, eligible_sectors, eligible_stages, eligible_locations,
            funding_min, funding_max, eligibility_criteria, source_url, scheme_type
        ) VALUES (
            %(name)s, %(description)s, %(eligible_sectors)s, %(eligible_stages)s,
            %(eligible_locations)s, %(funding_min)s, %(funding_max)s,
            %(eligibility_criteria)s::jsonb, %(source_url)s, %(scheme_type)s
        )
        ON CONFLICT (name) DO UPDATE SET
            description = EXCLUDED.description,
            eligible_sectors = EXCLUDED.eligible_sectors,
            eligible_stages = EXCLUDED.eligible_stages,
            eligible_locations = EXCLUDED.eligible_locations,
            funding_min = EXCLUDED.funding_min,
            funding_max = EXCLUDED.funding_max,
            eligibility_criteria = EXCLUDED.eligibility_criteria,
            source_url = EXCLUDED.source_url,
            scheme_type = EXCLUDED.scheme_type,
            updated_at = CURRENT_TIMESTAMP
    """
    with psycopg.connect(load_database_url(), client_encoding="UTF8") as connection:
        with connection.cursor() as cursor:
            for record in records:
                payload = dict(record)
                payload["eligibility_criteria"] = json.dumps(record["eligibility_criteria"])
                cursor.execute(sql, payload)
        connection.commit()
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM schemes")
            total = cursor.fetchone()[0]
    return int(total)


def main() -> None:
    rows = fetch_schemes()
    records = [to_record(row) for row in rows]
    names = [record["name"] for record in records]
    if len(names) != len(set(names)):
        raise SystemExit("The site returned duplicate scheme names.")
    total = upsert(records)
    print(f"Upserted {len(records)} schemes from {LIST_URL}")
    print(f"Brochure used for stated amounts: {BROCHURE_URL}")
    print(f"Schemes now in the database: {total}")
    for record in records:
        print(f"- {record['name']} | {record['funding_min']}-{record['funding_max']} lakh | {record['source_url']}")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(error, file=sys.stderr)
        raise
