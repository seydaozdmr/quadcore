# RetroAction AI

**AI-destekli Agile Retrospektif & Aksiyon Takip Platformu**

Prompt Sprint AI Hackathon 2026 — Takım QuadCore

---

## Problem

Ekiplerin retrospektif toplantılarında alınan kararlar (aksiyon maddeleri) takip edilemiyor. Mevcut araçlar (Miro, EasyRetro, Parabol) retro facilitasyonu yapıyor ama toplantı bittikten sonra aksiyonlar Jira/Confluence'ta kayboluyor, sonraki sprint'lerde aynı sorunlar tekrar gündeme geliyor ve kimse fark etmiyor.

Kök sorun: retro aracı ile aksiyon takip aracı birbirinden kopuk. Aradaki boşlukta aksiyonlar unutuluyor.

## Çözüm

RetroAction AI, retrospektif sürecini 4 fazlı bir oyun akışına dönüştürür. Her faz farklı AI yeteneklerini tetikler ve aksiyonlar retro içinden doğar — dışarıya taşınmak zorunda kalmaz.

### Faz akışı

| Faz | Kullanıcı ne yapıyor | AI ne yapıyor |
|-----|---------------------|---------------|
| **1. Toplama** | Retro maddelerini yazar | Otomatik etiketleme (İyi gitti / İyileştir / Eylem) + Déjà Vu tespiti + Embedding kayıt |
| **2. Oylama** | En önemli maddeleri oylar | Beklemede (insan kararı) |
| **3. Aksiyon** | Çok oy alan maddeleri aksiyona çevirir | SMART Coach devreye girer: eksik bilgileri sorar |
| **4. Özet** | Retro kapanır | AI özet raporu + tekrarlayan tema analizi + ekip morali değerlendirmesi |

### X-Factor 1: Déjà Vu Detector

Her retro maddesi girildiğinde bir embedding vektörü (1536 boyut) üretilip veritabanına kaydedilir. Yeni bir madde girildiğinde geçmiş retroların embedding'leriyle cosine similarity araması yapılır. Eşik değer (0.78) aşılırsa kullanıcıya uyarı gösterilir:

```
⚠️ Déjà Vu Algılandı!
Bu konu daha önce de gündeme gelmiş:
  • Sprint 12 Retro → "CI/CD pipeline çok yavaş" (%89 benzerlik)  
  • Sprint 14 Retro → "Deploy süresi hala uzun" (%85 benzerlik)

💡 AI Yorumu: "Bu konu 3 aydır tekrarlıyor. Muhtemel kök neden:
   DevOps kapasitesi yetersiz veya pipeline optimizasyonu önceliklendirilmemiş."
```

Teknik akış: `Kullanıcı yazar → EmbeddingPort.generate(text) → pgvector cosine search → LlmPort.classify(text, similarItems) → Response`

### X-Factor 2: SMART Coach

Bir madde aksiyona dönüştürüldüğünde AI, SMART kriterlerini kontrol eder. Eksik alanları tespit eder ve başarı kriteri önerir:

```
🤖 SMART Coach: Bu madde henüz SMART değil.
   Eksik: Sorumlu (Assignable), Tarih (Time-bound), Ölçüt (Measurable)
   Öneri: "PR bekleme süresi < 24 saat"
```

Kullanıcı SMART alanlarını (sorumlu, tarih, başarı kriteri) doldurduktan sonra aksiyon kaydedilir.

---

## Mimari

### Genel görünüm

```
┌──────────────────────────────────────────────────┐
│              Next.js 15 Frontend                 │
│     React 18 + Tailwind CSS + Zustand + AI SDK   │
└────────────────────────┬─────────────────────────┘
                         │ REST API
┌────────────────────────┴─────────────────────────┐
│              Spring Boot 3.3 Backend             │
│                                                  │
│  ┌──────────────────┐   ┌──────────────────────┐ │
│  │  RetroAIService   │   │  LlmPort (interface) │ │
│  │  (orchestrator)   │──▶│  ├─ ClaudeLlmAdapter │ │
│  │                   │   │  ├─ OpenAILlmAdapter  │ │
│  └────────┬──────────┘   │  └─ MockLlmAdapter    │ │
│           │              └──────────────────────┘ │
│           │              ┌──────────────────────┐ │
│           └─────────────▶│ EmbeddingPort        │ │
│                          │  ├─ OpenAIEmbedding   │ │
│                          │  ├─ AnthropicEmbed    │ │
│                          │  └─ MockEmbedding     │ │
│                          └──────────┬───────────┘ │
└─────────────────────────────────────┼─────────────┘
                                      │
┌─────────────────────────────────────┴─────────────┐
│          PostgreSQL + pgvector extension          │
│     Cosine similarity (IVFFlat index)             │
│                                                    │
│   H2 in-memory (geliştirme / demo modu)           │
└───────────────────────────────────────────────────┘
```

### Hexagonal Architecture (Port / Adapter)

Domain katmanı LLM provider'a bağımlı değildir. `LlmPort` ve `EmbeddingPort` arayüzleri üzerinden soyutlanmıştır. Provider değişimi tek satır konfigürasyon:

```yaml
# application.yml
spring.profiles.active: anthropic   # veya "openai" veya "mock"
```

| Profil | LLM | Embedding | API Key Gerekli |
|--------|-----|-----------|-----------------|
| `mock` | Keyword-based sınıflandırma | Hash-based pseudo-embedding | Hayır |
| `openai` | GPT-4o-mini | text-embedding-3-small | OPENAI_API_KEY |
| `anthropic` | Claude Sonnet 4 | OpenAI embedding (fallback) veya mock | ANTHROPIC_API_KEY |

### Bounded Contexts (DDD)

```
com.quadcore.retroaction
├── domain/
│   ├── model/          Team, RetroSession, RetroItem, RetroPhase, RetroCategory
│   ├── port/out/       LlmPort, EmbeddingPort (interfaces)
│   └── service/        RetroAIService, RetroService, TeamService
├── infrastructure/
│   ├── adapter/out/
│   │   ├── llm/        ClaudeLlmAdapter, OpenAILlmAdapter, MockLlmAdapter
│   │   └── embedding/  OpenAIEmbeddingAdapter, AnthropicEmbeddingAdapter, MockEmbeddingAdapter
│   ├── config/         WebConfig (CORS), DataSeeder (demo veri)
│   └── repository/     TeamRepository, RetroSessionRepository, RetroItemRepository
├── application/
│   └── dto/            Request/Response records (CreateTeamRequest, PreviewResponse, vb.)
└── api/
    └── controller/     TeamController, RetroController
```

---

## Kurulum

### Gereksinimler

- Java 21+
- Maven 3.9+ (veya mvnw kullanın)
- Node.js 20+ (Next.js frontend için)

Opsiyonel:
- PostgreSQL 16+ with pgvector (production için; varsayılan H2 in-memory)
- OpenAI API key veya Anthropic API key (varsayılan mock mod, key gerektirmez)

### Hızlı başlangıç (API key olmadan)

```bash
git clone https://github.com/quadcore/retroaction.git
cd retroaction/backend

# Mock profili ile çalıştır — API key gerektirmez
SPRING_PROFILES_ACTIVE=mock ./mvnw spring-boot:run
```

Uygulama `http://localhost:8080` adresinde çalışır. H2 Console: `http://localhost:8080/h2-console`

### Claude API ile çalıştırma

```bash
cd backend
export SPRING_PROFILES_ACTIVE=anthropic
export ANTHROPIC_API_KEY=sk-ant-your-key-here

./mvnw spring-boot:run
```

### OpenAI API ile çalıştırma

```bash
cd backend
export SPRING_PROFILES_ACTIVE=openai
export OPENAI_API_KEY=sk-your-key-here

./mvnw spring-boot:run
```

### Frontend

```bash
# Proje kökünde
npm install
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışır.

---

## Ortam Değişkenleri

```env
# LLM Provider: "openai" | "anthropic" | "mock"
SPRING_PROFILES_ACTIVE=mock

# OpenAI (SPRING_PROFILES_ACTIVE=openai ise gerekli)
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Anthropic (SPRING_PROFILES_ACTIVE=anthropic ise gerekli)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Veritabanı (varsayılan: H2 in-memory)
# PostgreSQL için:
# DB_URL=jdbc:postgresql://localhost:5432/retrodb
# DB_USERNAME=retro
# DB_PASSWORD=retro123
# DB_DRIVER=org.postgresql.Driver

# Benzerlik Araması
SIMILARITY_THRESHOLD=0.78
SIMILARITY_MAX_RESULTS=5
```

Tüm değişkenler `.env.example` dosyasında listelenmiştir.

---

## API Endpoint'leri

### Ekip Yönetimi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/teams` | Yeni ekip oluştur |
| GET | `/api/teams` | Tüm ekipleri listele |
| GET | `/api/teams/{id}` | Ekip detayı |

### Retro Oturum Yönetimi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/retros/teams/{teamId}` | Yeni retro odası aç (roomCode döner) |
| GET | `/api/retros/teams/{teamId}` | Ekibin retro geçmişi |
| GET | `/api/retros/join/{roomCode}` | Oda koduyla katıl |
| POST | `/api/retros/{roomCode}/advance` | Faz ilerlet (COLLECT→VOTE→ACTION→SUMMARY) |

### Faz 1: Toplama (COLLECT)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/retros/{roomCode}/items/preview` | AI analiz (kaydetmez, debounce ile çağrılır) |
| POST | `/api/retros/{roomCode}/items` | Madde ekle + AI etiketle + embedding kaydet |
| GET | `/api/retros/{roomCode}/items` | Tüm maddeleri listele |

### Faz 2: Oylama (VOTE)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/retros/{roomCode}/items/{itemId}/vote` | Oy ver |

### Faz 3: Aksiyon (ACTION)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/retros/{roomCode}/items/{itemId}/promote` | Aksiyona terfi et (SMART coach tetiklenir) |
| PUT | `/api/retros/{roomCode}/items/{itemId}/action` | SMART bilgileriyle aksiyonu kaydet |

### Faz 4: Özet (SUMMARY)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/retros/{roomCode}/summary` | AI retro özeti |

---

## Kullanılan AI Araçları

### Geliştirme sürecinde

| Araç | Kullanım Alanı |
|------|---------------|
| Claude (claude.ai) | Mimari tasarım, faz akışı modelleme, tüm backend/frontend kod üretimi, dokümantasyon |
| CLAUDE.md | AI'a proje bağlamı, DDD kuralları ve kod standartları veren talimat dosyası |

### Runtime (üründe çalışan AI)

| Araç | Model | Kullanım |
|------|-------|----------|
| Anthropic Claude API | claude-sonnet-4-20250514 | Madde sınıflandırma, SMART analizi, déjà vu yorumu, retro özeti |
| OpenAI Embedding API | text-embedding-3-small | 1536 boyutlu embedding üretimi, cosine similarity ile déjà vu tespiti |

### AI Maliyet Analizi (retro başına)

| İşlem | Çağrı | Token | Maliyet |
|-------|-------|-------|---------|
| Embedding (15 madde + 20 preview) | ~35 | ~3,500 | ~$0.001 |
| Sınıflandırma (20 preview) | ~20 | ~6,000 | ~$0.001 |
| SMART analizi (3 aksiyon) | ~3 | ~1,500 | ~$0.001 |
| Retro özeti | 1 | ~2,000 | ~$0.001 |
| **Toplam** | **~59** | **~13,000** | **~$0.004** |

---

## Demo Verisi

Uygulama başlatıldığında otomatik olarak demo verisi yüklenir:

- 1 ekip: "QuadCore Backend Team"
- 3 geçmiş retro: Sprint 12, Sprint 14, Sprint 15
- 12+ retro maddesi (çeşitli kategorilerde)
- Tekrarlayan konular: CI/CD yavaşlığı, code review gecikmeleri (déjà vu demo'su için)

Bu sayede "Deploy sürecini hızlandır" gibi bir madde yazıldığında déjà vu uyarısı hemen tetiklenir.

---

## Proje Dosya Yapısı

```
quadcore/
├── docs/
│   ├── README.md                       # Bu dosya
│   └── CLAUDE.md                       # AI yönlendirme talimatları
├── .env.example                        # Ortam değişkenleri şablonu
├── .gitignore
│
├── app/                                # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                        # Ana sayfa (SMART demo)
│   ├── globals.css
│   └── api/
│       └── validate-smart/             # SMART doğrulama API route
│
├── components/
│   └── SmartActionModal.tsx            # SMART Aksiyon modal bileşeni
│
├── store/
│   └── useGameStore.ts                 # Zustand global state
│
├── next.config.ts
├── tailwind.config.ts
├── package.json                        # Next.js 15, React 18, AI SDK, Zustand
│
└── backend/
    ├── pom.xml                         # Maven — Spring Boot 3.3, JPA, H2, PostgreSQL
    └── src/main/
        ├── resources/
        │   └── application.yml         # Profil bazlı konfigürasyon
        └── java/com/quadcore/retroaction/
            ├── RetroActionApplication.java
            ├── api/controller/
            │   ├── TeamController.java
            │   └── RetroController.java          # Tüm faz endpoint'leri
            ├── application/dto/
            │   └── Dtos.java                     # Request/Response record'ları
            ├── domain/
            │   ├── model/
            │   │   ├── Team.java
            │   │   ├── RetroSession.java         # Phase state machine
            │   │   ├── RetroItem.java             # Embedding + SMART alanları
            │   │   ├── RetroPhase.java            # COLLECT → VOTE → ACTION → SUMMARY
            │   │   ├── RetroCategory.java         # WENT_WELL, IMPROVE, ACTION
            │   │   └── ActionStatus.java          # OPEN → IN_PROGRESS → DONE → CARRY_OVER
            │   ├── port/out/
            │   │   ├── LlmPort.java               # LLM soyutlama arayüzü
            │   │   └── EmbeddingPort.java          # Embedding soyutlama arayüzü
            │   └── service/
            │       ├── RetroAIService.java         # AI orkestratör (classify + déjà vu + SMART)
            │       ├── RetroService.java           # İş mantığı (oda, madde, oylama)
            │       └── TeamService.java
            └── infrastructure/
                ├── adapter/out/
                │   ├── llm/
                │   │   ├── ClaudeLlmAdapter.java   # Anthropic Messages API v1
                │   │   ├── OpenAILlmAdapter.java   # OpenAI Chat Completions API
                │   │   └── MockLlmAdapter.java     # Keyword-based (API key gerektirmez)
                │   └── embedding/
                │       ├── OpenAIEmbeddingAdapter.java
                │       ├── AnthropicEmbeddingAdapter.java  # OpenAI fallback + mock
                │       └── MockEmbeddingAdapter.java       # Hash-based pseudo-embedding
                ├── config/
                │   ├── WebConfig.java              # CORS ayarları
                │   └── DataSeeder.java             # Demo veri (3 retro, 12+ madde)
                └── repository/
                    ├── TeamRepository.java
                    ├── RetroSessionRepository.java
                    └── RetroItemRepository.java    # Embedding scoped query'ler
```

---

## Teknik Kararlar

| Karar | Neden |
|-------|-------|
| Next.js 15 (App Router) | Full-stack React framework; API route'ları doğrudan frontend içinde, ayrı proxy gerekmez |
| Zustand | Minimal global state yönetimi, Redux boilerplate'i olmadan |
| Vercel AI SDK | Claude entegrasyonu için streaming ve structured output desteği |
| Monolith (modüler paketler) | Hackathon zaman kısıtı; DDD bounded context'leri paket seviyesinde ayrılmış |
| H2 in-memory (varsayılan) | Sıfır konfigürasyonla çalışır, demo için yeterli |
| Embedding JSON olarak saklanma | H2'de pgvector yok; production'da native `vector(1536)` type'a geçiş tek migration |
| Java record'lar (DTO) | Immutable, boilerplate-free, Java 21 idiomatik |
| `@Profile` ile adapter seçimi | Tek codebase, N provider; yeni provider eklemek = 1 adapter class |
| Mock profili | API key olmadan geliştirme ve demo yapabilme |
| Seed data (DataSeeder) | Demo sırasında déjà vu'nun çalıştığını anında gösterebilme |

---

## Takım

**QuadCore** — Prompt Sprint AI Hackathon 2026
