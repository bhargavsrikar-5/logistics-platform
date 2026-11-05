# Architecture overview

## Application shape

The application is a single repository with two independently started runtime services:

1. A FastAPI backend in `backend/` exposes REST endpoints and owns authentication, authorization, workflow transitions, persistence, notification creation, reporting, and route planning.
2. A React/Vite frontend in `frontend/` provides public landing/login/signup pages and role-specific workspaces for administrators, MSME users, and drivers.

The optional `mobile/` folder is a prototype only; it is not required by the web application.

## Backend boundaries

- `main.py` registers HTTP routes and workflow handlers.
- `models.py` defines SQLAlchemy entities, including companies, users, vehicles, zones, shipments, shipment items/timelines, delivery receipts, audit logs, notifications, saved addresses, trips, and trip stops.
- `schemas.py` defines Pydantic request and response contracts.
- `auth.py` implements JWT issue/validation and password hashing.
- `database.py` configures the async SQLAlchemy engine/session and declarative base.

The backend uses a `company_id` boundary for tenant-sensitive resources. The current hardening adds explicit company ownership checks to major shipment, trip, fleet, zone, user-management, dashboard, analytics, and export paths. This is an improvement to the supplied code, not a certification that every route is fully audited.

## Frontend boundaries

- `src/App.jsx` composes routing, providers, and role-protected workspaces.
- `src/context/AuthContext.jsx` manages the signed-in user and bearer token.
- `src/context/NotificationContext.jsx` loads and updates user notifications.
- `src/components/AppLayout.jsx` provides the authenticated navigation shell.
- `src/pages/` contains user-facing workflows.
- `src/apiConfig.js` centralizes the API base URL.

The landing page and settings page from the user's companion `logistics` copy have been merged into the newer `traveling` frontend. A trip-planning page and a driver-facing trip sheet have been added to use the newer `/trips` API contract.

## Trip lifecycle

1. An administrator selects pending shipments from their company.
2. The administrator selects an available company vehicle and active company driver.
3. The backend checks shipment ownership, driver/vehicle membership, driver availability, and combined load capacity.
4. The route ordering helper uses Google Routes when configured and falls back to the local ordering/distance strategy.
5. The backend creates a `Trip` and ordered `TripStop` rows and assigns the shipments.
6. The assigned driver reads their own trips and posts location updates. Delivery status transitions update stop/trip state.

## Data and migrations

SQLite is supported for local development and PostgreSQL can be configured with `DATABASE_URL`. The current application invokes SQLAlchemy `create_all()` on startup. That is not a substitute for versioned migrations; production deployment should add and test a formal Alembic migration history before schema changes are rolled out.
