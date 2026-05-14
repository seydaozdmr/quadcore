# RetroAction AI

AI-powered Agile Retrospective and Action Tracking Platform.

## Architecture

- **Pattern**: Hexagonal Architecture (Port/Adapter), DDD bounded contexts
- **Backend**: Spring Boot 3.3, Java 21
- **Frontend**: Next.js 15 (App Router), React 18, Tailwind CSS, Zustand, Vercel AI SDK
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

---

# Retro-Opoly: AI Mimari ve Strateji Dökümanı

Bu döküman, Prompt Sprint AI Hackathon kapsamında geliştirdiğimiz "Retro-Opoly" projesinin temel mimarisini ve yapay zeka entegrasyon stratejisini açıklamaktadır.

## 🎯 Projenin Temel Çözümü
Ekiplerin retro kararlarını unutması problemini, süreci bir **kutu oyununa** dönüştürerek ve alınan kararları anlık olarak **LLM destekli SMART (Specific, Measurable, Achievable, Relevant, Time-Bound) filtresinden** geçirerek çözüyoruz.

## 🧠 AI Entegrasyon Noktaları (İş Akışı)

Projemizde yapay zeka, sıradan bir metin üretici değil, "Sürecin Yöneticisi ve Denetçisi" olarak 3 farklı istasyonda görev yapmaktadır:

### 1. Pre-Processing Agent (Veri Temizleyici)
- **Görev:** Ekip üyelerinin anonim olarak girdiği dağınık retro notlarını analiz eder.
- **Prompt Stratejisi:** `Sen bir Agile Koçusun. Gelen metinlerdeki duygusal ve suçlayıcı ifadeleri filtrele, yapıcı bir dile çevir. Benzer konuları grupla ve 'Gündem Kartları' oluştur.`
- **Çıktı:** Oyun tahtasında kullanılacak standardize edilmiş konu başlıkları.

### 2. The SMART Validator (X-Factor Agent)
- **Görev:** Oyun sırasında bir "Aksiyon" kararı alındığında, bu kararın uygulanabilirliğini denetler. (Uygulamanın asıl inovasyon noktasıdır).
- **Prompt Stratejisi:** `Girilen aksiyon maddesini SMART kriterlerine göre analiz et. Eğer aksiyonda 'Kim yapacak?' veya 'Ne zaman bitecek?' gibi bilgiler eksikse, puanı düşür ve eksikleri belirterek eyleme dönüştürülebilir mükemmel bir şablon öner.`
- **Çıktı:** JSON formatında `{ score: Number, missingFields: Array, improvedAction: String }`. Bu sayede havada kalan veya unutulmaya müsait hiçbir aksiyon sisteme kaydedilemez.

### 3. Persona Generator (Kapanış Agent'ı)
- **Görev:** Oyun bittiğinde, retro boyunca sergilenen takım dinamiklerini analiz eder.
- **Prompt Stratejisi:** `Oyun loglarını (kim kaç kudos verdi, kim en çok aksiyonu üstlendi) incele. Her oyuncuya 'Ekip Koşucusu', 'Retro Gevezesi' gibi oyunlaştırma elementlerine uygun eğlenceli unvanlar ata.`

## 🛠️ Teknik Altyapı
- **Frontend Framework:** Next.js 15 (App Router), React 18, Tailwind CSS, Zustand, Vercel AI SDK
- **Backend:** Spring Boot 3.3, Java 21
- **AI Entegrasyonu:** Claude (Anthropic) / OpenAI API — `LlmPort` adaptör mimarisi

## 👥 Geliştirme Süreci (Agentic Workflow)
Bu proje, Cursor ve Claude kullanılarak "Modüler Bağımsızlık" prensibiyle 3 saatte geliştirilmiştir. Proje 4 ana parçaya bölünmüş, 4 takım üyesinin paralel çalışmasına (Pre-game, Board, AI Core, Dashboard) olanak sağlanmıştır.
