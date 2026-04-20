# Svara — AI Operator for Service Businesses in Sweden

Svara is a web-based SaaS MVP that helps Swedish service businesses respond to incoming leads instantly with AI-generated replies in Swedish. When a customer submits a job request, Svara classifies the job, generates a professional Swedish reply with a price estimate in SEK, and notifies the business — all within 1–2 minutes.

---

## Features

- **Public lead-capture form** — Swedish form with phone (+46), postal code, GDPR consent  
- **AI auto-reply** — OpenAI generates a Swedish response with job classification, follow-up questions, and a SEK price range  
- **ROT/RUT awareness** — AI mentions tax deduction eligibility per category  
- **Business dashboard** — Lead inbox, conversation history, AI draft editing, CRM pipeline (Ny / Pågående / Vunnen / Förlorad)  
- **GDPR basics** — consent tracking, erasure endpoint, data export  
- **Modular architecture** — seams for marketplace multi-business matching, geo resolver, pluggable storage and SMS providers  

---

## Quick Start (Docker Compose)

```bash
# 1. Clone and enter the repo
git clone <repo-url> && cd Svara

# 2. Configure environment
cp .env.example .env
# Edit .env — set OPENAI_API_KEY, JWT_SECRET, SMTP_* etc.

# 3. Start all services
docker-compose up --build

# 4. Run migrations and seed
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx tsx prisma/seed.ts
```

The app is now available at:
- **Frontend**: http://localhost:5173  
- **Backend API**: http://localhost:3001  
- **Demo login**: demo@svara.se / demo1234  

---

## Local Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### Backend

```bash
cd backend
cp ../.env.example .env   # set DATABASE_URL etc.
npm install
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npm run dev               # starts on :3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # starts on :5173 (proxies /api to :3001)
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs — use a long random string |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `OPENAI_MODEL` | — | Model to use (default: `gpt-4o-mini`) |
| `APP_BASE_URL` | — | Public URL of the backend (default: `http://localhost:3001`) |
| `FRONTEND_URL` | — | Frontend URL for CORS (default: `http://localhost:5173`) |
| `SMTP_HOST` | — | SMTP server host for email notifications |
| `SMTP_PORT` | — | SMTP port (default: 587) |
| `SMTP_USER` / `SMTP_PASS` | — | SMTP credentials |
| `SMTP_FROM` | — | From address for outgoing email |
| `SMS_PROVIDER` | — | `twilio` or `46elks` (blank = stub/console) |
| `SMS_FROM` | — | Sender phone number for SMS |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | — | Twilio credentials |
| `BUSINESS_ID` | — | Force leads to this business ID (single-tenant) |
| `PORT` | — | Backend HTTP port (default: 3001) |

---

## Running Tests

```bash
cd backend
npm test          # unit tests only (no DB needed)
```

Unit tests cover:
- Swedish phone normalization (`070-123 45 67` → `+46701234567`)
- Postal code validation (5 digits, optional space)
- Pricing estimator per category
- AI response fallback (mocked)

Integration test (requires DATABASE_URL):
```bash
cd backend
npm run test -- --include 'src/tests/leads.integration.test.ts'
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (:5173)                       │
│  React + Vite + TypeScript + Tailwind + React Query      │
│  Pages: / | /login | /dashboard | /dashboard/leads/:id   │
│          /dashboard/pipeline | /integritetspolicy        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (proxied in dev)
┌──────────────────────▼──────────────────────────────────┐
│                    BACKEND (:3001)                        │
│  Express + TypeScript + Prisma                           │
│                                                          │
│  POST /api/leads ──► leadQueue (p-queue)                 │
│                           │                              │
│              ┌────────────▼───────────┐                  │
│              │  AI Service (OpenAI)   │  ← prompts/sv    │
│              │  pricing/ (SEK ranges) │                  │
│              │  matching/ (LeadMatcher│                  │
│              │  geo/ (PostnummerGeo)  │                  │
│              └────────────┬───────────┘                  │
│                           │                              │
│         notifications/ (email + SMS stub)                │
│         storage/ (local /uploads, modular)               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  PostgreSQL (Prisma)                      │
│  Business | Lead | Category | Message | LeadImage        │
│  AuditLog | LeadDistribution | PostnummerGeo             │
└─────────────────────────────────────────────────────────┘
```

### Marketplace Extension Points

The following seams are designed for future multi-business marketplace expansion:

| Module | Location | Extension |
|---|---|---|
| **Lead matching** | `backend/src/matching/` | Replace `SingleTenantMatcher` with geo+category matcher — route leads to multiple businesses by postnummer coverage and category capabilities |
| **Geo resolver** | `backend/src/geo/` | Replace seed table with full SCB postnummer→kommun dataset (~100k rows) for accurate routing |
| **Storage** | `backend/src/storage/` | Replace `LocalStorageProvider` with S3/Azure Blob — implement `StorageProvider` interface |
| **SMS** | `backend/src/notifications/sms.ts` | Implement `NotificationProvider` for Twilio or 46elks |
| **Job queue** | `backend/src/services/leadQueue.ts` | Replace `p-queue` with Redis/BullMQ for multi-instance deployments |
| **Pricing** | `backend/src/pricing/` | Add per-business pricing or ML-based estimator behind `PriceEstimator` interface |

### GDPR Handling

- Consent timestamp stored per lead (`consentAt`)  
- No PII logged in `AuditLog` beyond `leadId`  
- `DELETE /api/leads/:id` cascades: messages, images, files on disk  
- `GET /api/leads/:id/export` returns JSON for data portability  
- Privacy policy page at `/integritetspolicy`  

### Pricing Note

Price ranges in `backend/src/pricing/rates.ts` are **ballpark figures** based on typical Swedish market rates. Tune them in one place. ROT deduction reduces the effective cost by 30% for labor (max 50,000 kr/year per person); RUT by 50% (max 75,000 kr/year).

### Postnummer→Kommun Data Note

`PostnummerGeo` is seeded with 8 major Swedish cities for the MVP. Replace with the full SCB/Postnord dataset (~14,000 entries) for production geo-routing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express 4, TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| AI | OpenAI API (`gpt-4o-mini` default) |
| Email | Nodemailer |
| SMS | Pluggable (stub, Twilio/46elks ready) |
| Job queue | p-queue (→ BullMQ/Redis for production) |
| Auth | bcrypt + JWT |
| Frontend | React 18, Vite 5, TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Data fetching | TanStack React Query 5 |
| Routing | React Router 6 |
| Dates | date-fns with `sv` locale |
| Containerisation | Docker Compose |

---

## License

MIT