# Backend — FastAPI

```bash
poetry install
poetry run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/healthz
- Env: copy `.env.example` to `.env` and adjust `DATABASE_URL` / `JWT_SECRET`.

The lifespan hook creates tables and seeds Arabic sample data on first boot.

If `backend/static/` exists (built React bundle copied in), FastAPI also serves the SPA at `/` with a fallback route.
