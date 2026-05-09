# Multi-stage build for the integrated mohandes-edu app.
# Stage 1: build the React/Vite frontend.
FROM node:22-bookworm AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./
# Empty VITE_API_URL = same origin; FastAPI serves both API and SPA.
RUN echo "VITE_API_URL=" > .env && npm run build

# Stage 2: install Python dependencies into a virtualenv.
FROM python:3.12-slim AS backend-builder

ENV POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app/backend

RUN pip install poetry==1.8.3

COPY backend/pyproject.toml backend/poetry.lock* ./
RUN poetry install --no-root --without dev || poetry install --no-root

# Stage 3: runtime.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/backend/.venv/bin:$PATH" \
    PORT=8000

WORKDIR /app/backend

RUN apt-get update -y \
 && apt-get install -y --no-install-recommends libpq5 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY --from=backend-builder /app/backend/.venv ./.venv
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./static

EXPOSE 8000
CMD ["sh", "-c", "fastapi run app/main.py --host 0.0.0.0 --port ${PORT:-8000}"]
