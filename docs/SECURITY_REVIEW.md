# Security review and release gates

## Scope

This is a static review of the supplied source tree and the consolidation changes. No penetration test, independent security assessment, production database test, or full end-to-end test suite has been completed. Do not treat this document as a security certification.

## Changes made in this consolidation

- Removed the predictable JWT fallback secret. Development uses a fresh per-process random secret when none is supplied; production (`APP_ENV=production`) requires `SECRET_KEY` to be set.
- Replaced credentialed wildcard CORS with a configurable exact-origin allowlist.
- Disabled SQL statement echo by default.
- Added explicit company scope to key shipment reads and edits, trip creation/list/detail/cancellation, fleet and zone management, user-management reads/updates, operations dashboards, analytics, and CSV exports.
- Restricted receipt confirmation to the MSME user who created the shipment.
- Added checks for company-owned active driver/vehicle/shipments, duplicate shipment IDs, driver active-trip conflict, and combined remaining vehicle capacity when creating a trip.
- Removed a duplicate, unscoped `/admin/audit-logs` route in favor of the company-filtered implementation.
- Removed debug output, local user lists, manual test transcripts, and generated thesis/report artifacts from the consolidated repository.

## Known release blockers / items requiring further validation

1. **Full route-by-route authorization audit:** not every legacy endpoint has been reviewed end-to-end. Re-check all company, shipment, user, vendor, dock, delivery, address, notification, upload, search, and reporting routes against MSME/driver/admin threat cases.
2. **Automated tenant-isolation tests:** add repeatable tests that create two companies and prove that reads, updates, deletes, trip assignments, reports, and dashboards cannot cross company boundaries.
3. **Trip lifecycle edge cases:** test partial trip cancellation, driver reassignment, vehicle capacity recalculation, concurrent scheduling, and delivery completion across multiple stops.
4. **Database migrations:** the app creates tables on startup; create a versioned Alembic migration history and test upgrades from every deployed schema before production use.
5. **JWT lifecycle and password policy:** define token revocation/rotation, account lockout/rate limiting, password strength policy, and safe handling for password-reset flows.
6. **Uploads and data retention:** validate file type/size/content, store uploads outside the web root or in object storage, enforce per-company access, and define retention/deletion policy.
7. **Operational hardening:** add structured secret-safe logging, health/readiness checks, monitoring, backup/restore drills, TLS/reverse-proxy configuration, and dependency vulnerability scans.
8. **Email delivery:** the current optional SMTP helper suppresses failures; add observable delivery status and retry handling if email is a critical workflow.
9. **Mobile prototype:** replace simulated auth and hard-coded API settings; implement and validate background location behavior and consent/retention before any real driver use.
10. **Collaborator rights and license:** confirm permission from all contributors and choose an appropriate license before public redistribution.

## Required pre-release test plan

- Start backend with a clean SQLite database and with PostgreSQL.
- Run migration upgrade tests from a copy of each deployed schema.
- Run `pytest` API tests for each role and two-company isolation.
- Run frontend lint and production build.
- Run browser smoke tests for signup, login, create shipment, dispatch, trip creation, driver pickup/transit/delivery, receipt confirmation, settings, and exports.
- Test unauthorized object IDs across tenants for every relevant route.
