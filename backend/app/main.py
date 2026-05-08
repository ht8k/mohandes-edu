import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import Course, Lecture, Question, User
from .schemas import StatsOut
from .seed import seed_database
from .routers import auth as auth_router
from .routers import courses as courses_router
from .routers import enrollments as enrollments_router
from .routers import lectures as lectures_router
from .routers import notifications as notifications_router
from .routers import questions as questions_router
from .routers import schedule as schedule_router
from .routers import teachers as teachers_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(title="منصة المهندس التعليمية API", lifespan=lifespan)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/api/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    return StatsOut(
        courses_count=db.query(Course).count(),
        students_count=db.query(User).filter(User.role == "student").count(),
        lectures_count=db.query(Lecture).count(),
        questions_answered=db.query(Question).filter(Question.is_answered == True).count(),
    )


app.include_router(auth_router.router)
app.include_router(courses_router.router)
app.include_router(enrollments_router.router)
app.include_router(lectures_router.router)
app.include_router(notifications_router.router)
app.include_router(questions_router.router)
app.include_router(schedule_router.router)
app.include_router(teachers_router.router)


_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DIST_DIR = _BACKEND_DIR / "static"

if _DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(_DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("assets/") or full_path == "healthz":
            raise HTTPException(status_code=404)
        candidate = _DIST_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(_DIST_DIR / "index.html"))
