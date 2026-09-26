# PS41 — Database Schema & Architecture Document

**Core Design Principle:** A strict "Top-Down" hierarchy ensuring LLM determinism. The master taxonomy is a rigid framework, and all unstructured scheme documents and startup applications are parsed and mapped *upward* into these predefined nodes.

---

## 1. Relational Schema ER Diagram

The following Entity-Relationship diagram outlines the PostgreSQL 16 schema, enforcing the Top-Down jurisdiction hierarchy and the deterministic pre-bifurcated taxonomy design[cite: 1, 2].

```mermaid
erDiagram
    %% THE "TOP": MASTER TAXONOMY & JURISDICTION
    REGIONS {
        UUID id PK
        VARCHAR state_name UK
        BOOLEAN is_active
    }
    
    GOVERNING_BODIES {
        UUID id PK
        VARCHAR name
        ENUM level "CENTRAL | STATE"
        UUID region_id FK "Nullable for CENTRAL"
    }

    TAXONOMY_NODES {
        UUID id PK
        VARCHAR node_code UK
        ENUM node_type "SECTOR, STAGE, FUNDING_TYPE, etc."
        VARCHAR name
        UUID parent_id FK
    }

    %% CORE ENTITIES & USERS
    USERS {
        UUID id PK
        VARCHAR email UK
        ENUM role "USER | ADMIN"
    }

    STARTUP_PROFILES {
        UUID id PK
        UUID user_id FK
        VARCHAR company_name
        BOOLEAN dpiit_recognized
        NUMERIC annual_revenue
        UUID region_id FK
        JSONB raw_application_data
    }

    SCHEMES {
        UUID id PK
        UUID governing_body_id FK
        VARCHAR name
        TEXT official_portal_url
        INT catalog_version
    }

    %% THE MAPPING: FORCING DATA UPWARD
    SCHEME_TAXONOMY_MAP {
        UUID scheme_id PK, FK
        UUID taxonomy_node_id PK, FK
    }

    STARTUP_CLASSIFICATIONS {
        UUID startup_id PK, FK
        UUID taxonomy_node_id PK, FK
        NUMERIC confidence
    }

    %% RULES & EVIDENCE (THE "BOTTOM")
    DOCUMENTS {
        UUID id PK
        UUID scheme_id FK
        TEXT source_url
        VARCHAR checksum
    }

    EVIDENCE_CLAUSES {
        UUID id PK
        UUID scheme_id FK
        UUID document_id FK
        TEXT raw_clause_text
        UUID qdrant_point_id "Vector DB Ref"
    }

    ELIGIBILITY_RULES {
        UUID id PK
        UUID scheme_id FK
        VARCHAR field_key
        ENUM operator "EQUALS, LTE, GTE, etc."
        JSONB expected_value
        UUID evidence_clause_id FK "Nullable"
    }

    %% 2-STAGE MATCHING OUTPUT
    RECOMMENDATIONS {
        UUID id PK
        UUID startup_id FK
        UUID scheme_id FK
        ENUM status
    }

    RECOMMENDATION_BASIS {
        UUID id PK
        UUID recommendation_id FK
        ENUM matched_jurisdiction
        JSONB matched_taxonomy_nodes
        JSONB application_data_evaluated
        JSONB rules_satisfied
        NUMERIC llm_confidence
    }

    %% RELATIONSHIPS
    REGIONS ||--o{ GOVERNING_BODIES : "defines state for"
    TAXONOMY_NODES ||--o{ TAXONOMY_NODES : "parent/child"
    USERS ||--|| STARTUP_PROFILES : "owns"
    REGIONS ||--o{ STARTUP_PROFILES : "locates"
    STARTUP_PROFILES ||--o{ STARTUP_CLASSIFICATIONS : "mapped upward to"
    TAXONOMY_NODES ||--o{ STARTUP_CLASSIFICATIONS : "classifies"
    GOVERNING_BODIES ||--o{ SCHEMES : "administers"
    SCHEMES ||--o{ SCHEME_TAXONOMY_MAP : "mapped upward to"
    TAXONOMY_NODES ||--o{ SCHEME_TAXONOMY_MAP : "classifies"
    SCHEMES ||--o{ DOCUMENTS : "sourced from"
    DOCUMENTS ||--o{ EVIDENCE_CLAUSES : "chunked into"
    SCHEMES ||--o{ ELIGIBILITY_RULES : "contains"
    EVIDENCE_CLAUSES ||--o| ELIGIBILITY_RULES : "justifies (RAG)"
    STARTUP_PROFILES ||--o{ RECOMMENDATIONS : "receives"
    SCHEMES ||--o{ RECOMMENDATIONS : "recommended as"
    RECOMMENDATIONS ||--|| RECOMMENDATION_BASIS : "explained by"