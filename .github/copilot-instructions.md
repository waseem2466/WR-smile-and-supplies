# Copilot Instructions for wr-smile-billing

## Project Overview
- **Type:** React + TypeScript POS (Point of Sale) app for retail billing, inventory, and customer/loan management.
- **Architecture:**
  - UI in React (see App.tsx, components/)
  - Data models in types.ts and prisma/schema.prisma
  - Local development uses mockDb.ts (localStorage-based, async API)
  - Real DB integration via Prisma (PostgreSQL, see prisma/schema.prisma)

## Key Files & Structure
- **App.tsx:** Main app shell, view routing, authentication.
- **components/**: UI modules (BillingPOS, ProductManager, CustomerManager, Dashboard, Login)
- **components/ui/**: Shared UI widgets (GlassButton, GlassCard, GlassInput)
- **services/mockDb.ts:** In-memory/localStorage DB for dev/testing. Mimics async API, updates stock, loans, payments, etc.
- **types.ts:** TypeScript types for all business entities (Product, Customer, Bill, Loan, Payment, etc.)
- **prisma/schema.prisma:** Production DB schema (PostgreSQL, Prisma ORM)
- **utils/**: Utility helpers (uuid, storage)

## Data Flow & Patterns
- **State:** React useState/useEffect for local state, no Redux/MobX.
- **Persistence:**
  - Dev: All CRUD via mockDb.ts (localStorage, async)
  - Prod: Use Prisma client (not wired in by default)
- **ID Generation:** Use uuid() from utils/uuid.ts for all new entities.
- **Adding/Updating Data:** Always update both local state and persist via mockDb API.
- **Business Logic:**
  - Stock decremented on bill creation
  - Loans/payments update customer balances
  - Discounts, profit, and totals calculated in BillingPOS

## Developer Workflows
- **Install:** `npm install`
- **Run (dev):** `npm run dev`
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **API Keys:** Set `GEMINI_API_KEY` in .env.local if using Gemini features

## Conventions & Tips
- **Component Naming:** PascalCase for all components/files
- **Type Safety:** All data must conform to types in types.ts
- **UI:** Use components/ui/ for consistent look/feel
- **No direct localStorage access in components** (use mockDb or utils/storage)
- **Testing:** No formal test suite; manual testing via UI
- **Extending Models:** Update both types.ts and schema.prisma for new fields/entities

## Integration Points
- **Prisma:** For production DB, migrate schema and use @prisma/client
- **AI Studio:** App can be viewed/deployed via AI Studio (see README)

---
For questions, review App.tsx, mockDb.ts, and types.ts for core logic and patterns.
