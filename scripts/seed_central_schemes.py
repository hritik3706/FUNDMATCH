"""Upsert the central government schemes used for the hackathon demo.

Amounts come from the ministry pages already checked:
SISFS, BIRAC BIG, MeitY SAMRIDH, PMEGP, Stand-Up India, MUDRA, NIDHI-PRAYAS, RKVY-RAFTAAR.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

UPDATES = [
    {
        "name": "Startup India Seed Fund Scheme",
        "description": (
            "DPIIT seed fund through incubators: up to Rs 20 lakh as a grant for proof of concept, "
            "and up to Rs 50 lakh as debt or convertible debentures for market entry. "
            "Source: https://seedfund.startupindia.gov.in"
        ),
        "eligible_sectors": [
            "EdTech", "FinTech", "HealthTech", "ClimaTech", "AI/ML",
            "AgriTech", "DeepTech", "Biotech", "Other",
        ],
        "eligible_stages": ["Pre-seed", "Seed"],
        "eligible_locations": ["Pan India"],
        "funding_min": 0,
        "funding_max": 50,
        "source_url": "https://seedfund.startupindia.gov.in",
        "scheme_type": "Central",
        "eligibility_criteria": [
            {
                "id": "dpiit",
                "name": "DPIIT Recognition",
                "description": "The startup must be recognised by DPIIT",
                "required": True,
                "impact": "high",
            },
            {
                "id": "incorporation",
                "name": "Incorporation Certificate",
                "description": "The startup must be incorporated not more than two years before the application",
                "required": True,
                "impact": "high",
            },
            {
                "id": "shareholding",
                "name": "Indian promoter shareholding",
                "description": "Indian promoters must hold at least 51 percent at the time of application",
                "required": True,
                "impact": "high",
            },
        ],
    },
    {
        "name": "BIRAC Biotechnology Ignition Grant",
        "description": (
            "BIRAC grant-in-aid of up to Rs 50 lakh for 18 months to take a biotech idea to proof of concept. "
            "Source: https://birac.nic.in/big.php"
        ),
        "eligible_sectors": ["Biotech", "HealthTech"],
        "eligible_stages": ["Pre-seed", "Seed"],
        "eligible_locations": ["Pan India"],
        "funding_min": 0,
        "funding_max": 50,
        "source_url": "https://www.birac.nic.in",
        "scheme_type": "Central",
        "eligibility_criteria": [
            {
                "id": "registration",
                "name": "Company Registration",
                "description": "An Indian company, LLP, or academic team can apply",
                "required": True,
                "impact": "high",
            },
            {
                "id": "proof",
                "name": "Technical proof",
                "description": "The idea must be a biotech or health proof of concept with a commercial path",
                "required": True,
                "impact": "high",
            },
        ],
    },
    {
        "name": "MeitY SAMRIDH",
        "description": (
            "MeitY matching investment of up to Rs 40 lakh for product startups in health, education, "
            "agriculture, fintech, software, and sustainability. Source: https://www.meity.gov.in"
        ),
        "eligible_sectors": [
            "EdTech", "FinTech", "HealthTech", "ClimaTech", "AI/ML", "AgriTech", "DeepTech",
        ],
        "eligible_stages": ["Seed", "Series A"],
        "eligible_locations": ["Pan India"],
        "funding_min": 0,
        "funding_max": 40,
        "source_url": "https://www.meity.gov.in",
        "scheme_type": "Central",
        "eligibility_criteria": [
            {
                "id": "dpiit",
                "name": "DPIIT Recognition",
                "description": "DPIIT recognition is required",
                "required": True,
                "impact": "high",
            },
            {
                "id": "registration",
                "name": "Incorporation Certificate",
                "description": "The startup must be incorporated in India",
                "required": True,
                "impact": "high",
            },
            {
                "id": "product",
                "name": "Product startup",
                "description": "The company must be a technology product startup selected by a SAMRIDH accelerator",
                "required": True,
                "impact": "high",
            },
        ],
    },
]

INSERTS = [
    {
        "name": "Prime Minister Employment Generation Programme",
        "description": (
            "MSME credit-linked subsidy for new non-farm micro units. Manufacturing projects are admissible "
            "up to Rs 50 lakh and service projects up to Rs 20 lakh. The subsidy is 15 percent for the general "
            "category in urban areas and up to 35 percent for special categories. Source: https://www.msme.gov.in"
        ),
        "eligible_sectors": [
            "EdTech", "FinTech", "HealthTech", "ClimaTech", "AI/ML",
            "AgriTech", "DeepTech", "Biotech", "Other",
        ],
        "eligible_stages": ["Pre-seed", "Seed"],
        "eligible_locations": ["Pan India"],
        "funding_min": 0,
        "funding_max": 50,
        "source_url": "https://www.msme.gov.in",
        "scheme_type": "Central",
        "eligibility_criteria": [
            {
                "id": "age",
                "name": "Minimum age 18",
                "description": "The applicant must be above 18 years of age",
                "required": True,
                "impact": "high",
            },
            {
                "id": "education",
                "name": "Class 8 for larger projects",
                "description": "At least Class 8 is required for manufacturing projects above Rs 10 lakh and service projects above Rs 5 lakh",
                "required": False,
                "impact": "medium",
            },
            {
                "id": "new_unit",
                "name": "No earlier subsidy",
                "description": "Units that already took a Government of India subsidy are not eligible for a new-unit PMEGP loan",
                "required": True,
                "impact": "high",
            },
        ],
    },
    {
        "name": "Stand-Up India",
        "description": (
            "Bank loan from Rs 10 lakh to Rs 1 crore for a greenfield enterprise set up by an SC or ST founder "
            "or a woman founder. Source: https://www.standupmitra.in"
        ),
        "eligible_sectors": [
            "EdTech", "FinTech", "HealthTech", "ClimaTech", "AI/ML",
            "AgriTech", "DeepTech", "Biotech", "Other",
        ],
        "eligible_stages": ["Seed"],
        "eligible_locations": ["Pan India"],
        "funding_min": 10,
        "funding_max": 100,
        "source_url": "https://www.standupmitra.in",
        "scheme_type": "Central",
        "eligibility_criteria": [
            {
                "id": "founder",
                "name": "SC, ST, or woman founder",
                "description": "At least one SC or ST borrower, or a woman borrower, must hold the enterprise",
                "required": True,
                "impact": "high",
            },
            {
                "id": "greenfield",
                "name": "Greenfield enterprise",
                "description": "The project must be a new enterprise, not an expansion of an existing one",
                "required": True,
                "impact": "high",
            },
            {
                "id": "registration",
                "name": "Company Registration",
                "description": "The enterprise must be registered in India",
                "required": True,
                "impact": "high",
            },
        ],
    },
    {
        "name": "Pradhan Mantri MUDRA Yojana",
        "description": (
            "Collateral-free bank loan for non-corporate small businesses. Shishu is up to Rs 50,000, "
            "Kishore up to Rs 5 lakh, and Tarun up to Rs 10 lakh. Source: https://www.mudra.org.in"
        ),
        "eligible_sectors": ["Other"],
        "eligible_stages": ["Pre-seed", "Seed"],
        "eligible_locations": ["Pan India"],
        "funding_min": 0,
        "funding_max": 10,
        "source_url": "https://www.mudra.org.in",
        "scheme_type": "Central",
        "eligibility_criteria": [
            {
                "id": "non_corporate",
                "name": "Non-corporate small business",
                "description": "The borrower should be a micro or small non-farm enterprise that is not a company",
                "required": True,
                "impact": "high",
            }
        ],
    },
    {
        "name": "NIDHI-PRAYAS",
        "description": (
            "DST grant of up to Rs 10 lakh to turn a prototype into a proof of concept before a company raises a seed round. "
            "Source: https://dst.gov.in"
        ),
        "eligible_sectors": ["DeepTech", "AI/ML", "Biotech", "HealthTech"],
        "eligible_stages": ["Pre-seed"],
        "eligible_locations": ["Pan India"],
        "funding_min": 0,
        "funding_max": 10,
        "source_url": "https://dst.gov.in",
        "scheme_type": "Central",
        "eligibility_criteria": [
            {
                "id": "prototype",
                "name": "Technical proof",
                "description": "The idea must be a hardware or technology prototype, not a pure service",
                "required": True,
                "impact": "high",
            }
        ],
    },
    {
        "name": "RKVY-RAFTAAR Agripreneurship",
        "description": (
            "Ministry of Agriculture seed-stage grant of up to Rs 25 lakh for agri startups. "
            "Source: https://rkvy.da.gov.in"
        ),
        "eligible_sectors": ["AgriTech"],
        "eligible_stages": ["Pre-seed", "Seed"],
        "eligible_locations": ["Pan India"],
        "funding_min": 0,
        "funding_max": 25,
        "source_url": "https://rkvy.da.gov.in",
        "scheme_type": "Central",
        "eligibility_criteria": [
            {
                "id": "sector",
                "name": "Agriculture innovation",
                "description": "The product or service must be for agriculture, food processing, or the agri value chain",
                "required": True,
                "impact": "high",
            },
            {
                "id": "registration",
                "name": "Company Registration",
                "description": "A registered Indian startup is expected at the seed stage",
                "required": True,
                "impact": "high",
            },
        ],
    },
]


def database_url() -> str:
    env_path = Path(__file__).resolve().parents[1] / "backend" / ".env"
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if line.startswith("DATABASE_URL="):
            return line.split("=", 1)[1].strip()
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        raise SystemExit("DATABASE_URL is missing")
    return url


def main() -> None:
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
    records = UPDATES + INSERTS
    with psycopg.connect(database_url(), client_encoding="UTF8") as connection:
        with connection.cursor() as cursor:
            for record in records:
                payload = dict(record)
                payload["eligibility_criteria"] = json.dumps(record["eligibility_criteria"])
                cursor.execute(sql, payload)
        connection.commit()
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM schemes")
            total = cursor.fetchone()[0]
    print(f"Upserted {len(records)} government schemes. Catalog size: {total}")
    for record in records:
        print(f"- {record['name']} | {record['funding_min']}-{record['funding_max']} lakh")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(error, file=sys.stderr)
        raise
