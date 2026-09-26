sequenceDiagram
    autonumber
    actor Startup
    participant Parser as LLM Parser (Bottom)
    participant Classifier as Taxonomy Mapper (Top)
    participant DB as PostgreSQL DB
    participant Stage1 as Engine: Stage 1 (SQL)
    participant Stage2 as Engine: Stage 2 (Rules/LLM)
    
    Startup->>Parser: Submit Raw Application Data (NL, Forms)
    
    rect rgb(30, 41, 59)
    note right of Parser: BOTTOM: Extract Application Data
    Parser-->>Parser: Extract structured fields (Revenue, DPIIT status, Location)
    end
    
    Parser->>Classifier: Pass structured profile
    
    rect rgb(30, 41, 59)
    note right of Classifier: TOP: Force Data Upward
    Classifier-->>Classifier: Map to Jurisdiction (CENTRAL / STATE: UP)
    Classifier-->>Classifier: Map to Taxonomy (SECTOR, STAGE)
    end
    
    Classifier->>DB: Save to startup_profiles & startup_classifications
    
    rect rgb(15, 82, ba)
    note right of Stage1: STAGE 1: Deterministic Taxonomy Match
    Stage1->>DB: Intersect Startup Taxonomy vs Scheme Taxonomy Map
    DB-->>Stage1: Return Candidate Schemes (Fast SQL Join)
    end
    
    Stage1->>Stage2: Pass Candidate Schemes + Startup Profile
    
    rect rgb(15, 82, ba)
    note right of Stage2: STAGE 2: Application Data vs Rules
    Stage2-->>Stage2: Evaluate deterministic rules (e.g., revenue < 5Cr)
    Stage2-->>Stage2: Evaluate textual rules via constrained LLM + Vector DB
    end
    
    Stage2->>DB: Save to recommendations & recommendation_basis
    DB-->>Startup: Return Ministry-wise Results & Match Basis