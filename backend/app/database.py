import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_PATH = os.environ.get("DATABASE_PATH", "/data/app.db")
if not os.path.exists(os.path.dirname(DATABASE_PATH)):
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), "..", "app.db")
    DATABASE_PATH = os.path.abspath(DATABASE_PATH)

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
