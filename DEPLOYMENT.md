# Deployment Notes

## Recommended split

- Frontend: Vercel
- Backend: Render or Railway
- Database for demo: SQLite on a persistent disk / volume

## Why not full-stack on Vercel with the current backend?

This backend writes to SQLite and uploads on the local filesystem. Vercel Functions are not a good fit for that storage model because the function filesystem is not persistent across invocations and deployments.

## Backend environment

Use the values in `backend/.env.example` as the starting point:

- `ALLOWED_ORIGINS`
- `SQLITE_PATH`
- `UPLOADS_PATH`
- `ERP_DEMO_MODE`
- `ENABLE_RESEED_ROUTE`

For a mounted persistent disk / volume, point:

- `SQLITE_PATH` to the mounted data directory
- `UPLOADS_PATH` to a folder inside that mounted data directory

Example:

```env
ALLOWED_ORIGINS=https://your-frontend.example.com
SQLITE_PATH=/data/erp_university.db
UPLOADS_PATH=/data/uploads
ERP_DEMO_MODE=true
ENABLE_RESEED_ROUTE=false
```

## Frontend environment

Use `college-erp/.env.example`:

```env
VITE_API_BASE_URL=https://your-backend.example.com
VITE_DEMO_MODE=true
```

## Demo reset

Before a client demo, rebuild the demo database from the seeded CSV data:

```bash
cd backend
python3 prepare_demo_db.py
```

This creates a backup of the current SQLite file and rebuilds a clean demo DB.
