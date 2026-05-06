# Payment Gateway Assignment (Strpie, Razorpay, Mock)

## System Architecture

1. **API Layer (Controllers & Routes):** Handles HTTP requests, rate limiting, and strictly validates incoming JSON payloads using `Zod`. No business logic resides here.
2. **Service Layer (Business Logic):** Orchestrates the payment state machine, handles Redis idempotency checks, pushes tasks to background queues, and coordinates with external providers via a Strategy/Factory pattern (Stripe, Razorpay, Mock).
3. **Data Access Layer (Repositories):** The only layer permitted to interact with PostgreSQL.

### 1. Idempotency (Double-Charge Prevention)

Every payment request must include an `Idempotency-Key` header.

- **Layer 1 (Redis Cache):** The system checks Redis. If the key exists, it instantly returns the cached HTTP response, saving database cycles.
- **Layer 2 (PostgreSQL Constraint):** In case Redis drops, the DB enforces a `@unique` constraint on the `idempotency_key` column, throwing a `409 Conflict` on race-condition inserts.

### 2. Concurrency & Race Conditions (Database Locking)

When handling asynchronous Webhooks, two updates for the same payment might arrive at the exact same millisecond. To prevent "Read-Modify-Write" race conditions, the system uses **Pessimistic Locking**:

- The repository uses a Prisma `$transaction` with a raw `SELECT ... FOR UPDATE` query.
- This forces PostgreSQL to queue simultaneous updates to a specific payment row sequentially, ensuring the state machine (`PENDING` -> `SUCCESS`) is never corrupted.

### 3. Failure Handling & Retries (Queue-Driven)

- Synchronous API endpoints return `202 Accepted` immediately after persisting the `PENDING` state and dispatching a job to **BullMQ**.
- A background worker processes the external gateway calls.
- If a gateway times out or throws a network error, BullMQ automatically catches it and retries using an **Exponential Backoff Strategy** (max 3 attempts).
