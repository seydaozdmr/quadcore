# RetroAction AI

AI-powered Agile Retrospective and Action Tracking Platform.

## Architecture

- **Pattern**: Hexagonal Architecture (Port/Adapter), DDD bounded contexts
- **Backend**: Spring Boot 3.3, Java 21
- **Frontend**: Angular 18 (Standalone Components + Signals)
- **Database**: H2 in-memory (dev), PostgreSQL 16 + pgvector (prod)
- **Profiles**: `mock` (no API key), `openai`, `anthropic`

## Key Patterns

- `LlmPort` / `EmbeddingPort` — AI provider abstraction interfaces (domain ports)
- Adapters per provider: Claude, OpenAI, Mock
- `RetroPhase` state machine: COLLECT -> VOTE -> ACTION -> SUMMARY
- Java 21 records for all DTOs (no Lombok)
- Constructor injection throughout

## Package Structure

```
com.quadcore.retroaction
├── api/controller/         TeamController, RetroController
├── application/dto/        Dtos.java (request/response records)
├── domain/
│   ├── model/              Team, RetroSession, RetroItem, RetroPhase, RetroCategory, ActionStatus
│   ├── port/out/           LlmPort, EmbeddingPort
│   └── service/            RetroAIService, RetroService, TeamService
└── infrastructure/
    ├── adapter/out/llm/    ClaudeLlmAdapter, OpenAILlmAdapter, MockLlmAdapter
    ├── adapter/out/embedding/  OpenAIEmbeddingAdapter, MockEmbeddingAdapter
    ├── config/             WebConfig, DataSeeder
    └── repository/         TeamRepository, RetroSessionRepository, RetroItemRepository
```

## Conventions

- No Lombok; use Java records for DTOs and manual getters/setters for JPA entities
- Constructor injection (no @Autowired on fields)
- Domain layer has zero framework dependencies beyond JPA annotations
- Adapters are selected via Spring `@Profile`
