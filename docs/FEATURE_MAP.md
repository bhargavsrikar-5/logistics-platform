# Feature map

| Area | Primary implementation | Notes |
|---|---|---|
| Authentication and roles | `backend/auth.py`, `frontend/src/context/AuthContext.jsx` | JWT bearer token and role-protected routes |
| Company onboarding | `backend/main.py` company and join-request routes | First company admin can register; MSME join requests require approval |
| Shipment management | `backend/main.py` `/shipments` routes, frontend shipment pages | Pending → Assigned → Picked up → In transit → Delivered → Confirmed |
| Fleet management | `/vehicles`, `/zones`, frontend fleet and zone pages | Vehicle capacity and company ownership checks |
| Trip planning | `/trips`, `backend/models.py` Trip / TripStop, `AdminTrips.jsx` | Admin creates grouped trip with current shipment-based contract |
| Driver trip sheet | `/trips`, `/driver/update-location`, `MyTrips.jsx` | Driver can list only trips assigned to them |
| Live tracking | Trip location and route-tracking endpoints/pages | Requires real location permission and production privacy controls |
| Notifications | `/notifications`, `NotificationContext.jsx` | In-app notification list and read-state updates |
| Analytics and exports | `/admin/stats`, `/analytics/*`, report export routes | Major company-scoped reads were hardened; see security review |
| Account settings | `/change-password`, `Settings.jsx` | Password update and sign out |
| Mobile | `mobile/` | Experimental prototype; not part of production claim |
