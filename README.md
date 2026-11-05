# Inbound Logistics Management Platform

A full-stack logistics operations application that brings shipment intake, company administration, fleet assignment, driver execution, delivery confirmation, analytics, and trip planning into one web platform.

> **Project status:** consolidated engineering baseline. The main web application and core workflows are retained from the supplied project versions. Security fixes and structural cleanup have been applied, but the system still needs a complete automated integration and deployment review before it should be described as production-ready.

## What it includes

- **Company and user management:** company registration, join requests, approval workflows, and role-based access for administrators, MSME users, and drivers.
- **Shipment lifecycle:** create, update, dispatch, assign, pick up, transit, deliver, and confirm receipt.
- **Fleet operations:** vehicles, capacity/utilization, zones, and driver assignment.
- **Trip planning:** group pending shipments into a trip, validate the company/driver/vehicle relationship and combined capacity, order stops using the available route-optimization strategy, and track driver location.
- **Operations visibility:** dashboard metrics, shipment and driver analytics, audit history, notifications, exports, and shipment tracking.
- **Account settings:** password changes and logout.

## Technology

| Layer | Stack |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy (async), Pydantic |
| Authentication | JWT bearer tokens, bcrypt password hashing |
| Database | SQLite for local development; PostgreSQL supported through `DATABASE_URL` |
| Frontend | React 19, Vite, React Router, Ant Design, Axios |
| Maps and visualizations | Leaflet / React-Leaflet, Recharts, Three.js / React Three Fiber |
| Optional route service | Google Routes API when configured; local nearest-neighbour / distance fallback otherwise |

## Repository layout

```text
backend/       FastAPI application, data models, schemas, authentication and DB setup
frontend/      React/Vite web application
mobile/        Experimental Expo prototype (not production-ready)
docs/          Architecture, feature map, security and source provenance
```

## Local setup

### 1. Backend

Requirements: Python 3.11 or newer.

PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env`. For local SQLite development, keep the example `DATABASE_URL`. Generate a private key and place it in `SECRET_KEY`:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Run the API:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API documentation is available at `http://127.0.0.1:8000/docs` while the backend is running.

For PostgreSQL, set `DATABASE_URL` to an async SQLAlchemy URL, for example `postgresql+asyncpg://USER:PASSWORD@HOST:5432/DATABASE`. Store real values only in environment variables or a local `.env` file; never commit `.env`.

### 2. Frontend

Requirements: Node.js 20 or newer and npm.

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

The frontend defaults to `http://127.0.0.1:8000`. Set `VITE_API_URL` in `frontend/.env` when the API uses a different address. The Vite development server normally runs at `http://localhost:5173`.

### 3. Create the first company

Use the company registration flow in the web UI or the backend endpoint `POST /companies` to create a company and its first administrator. Users can then join a company using the join-request flow and be approved by its administrator.

## Environment variables

Backend variables are documented in [`backend/.env.example`](backend/.env.example). Important settings:

- `DATABASE_URL` — database connection string.
- `SECRET_KEY` — private JWT signing key. Production mode refuses to start without it.
- `APP_ENV` — use `production` for production deployments.
- `CORS_ORIGINS` — comma-separated exact frontend origins; do not use `*` with credentialed requests.
- `SQL_ECHO` — set to `true` only for local SQL debugging.

## Development checks

From the repository root:

```powershell
# Backend syntax check
python -m compileall backend

# Frontend dependency integrity and production bundle
cd frontend
npm ci
npm run build
```

The checks above do not replace API integration tests, database migration tests, permission tests, or end-to-end browser tests. See [`docs/SECURITY_REVIEW.md`](docs/SECURITY_REVIEW.md) for the current review scope and remaining release gates.

## Important notes

- The mobile app is retained as an experimental prototype. It currently needs a real authentication flow, environment-based API configuration, and a proper background-location/privacy review before real deployment.
- The backend currently creates missing tables at startup for development. A formal Alembic migration history and tested upgrade path are still required for production deployments.
- No open-source license was included with the supplied source projects. See [`docs/PROVENANCE.md`](docs/PROVENANCE.md) before redistributing or assigning a license.
