from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserOut

router = APIRouter(prefix="/api/teachers", tags=["teachers"])


@router.get("", response_model=List[UserOut])
def list_teachers(db: Session = Depends(get_db)):
    return (
        db.query(User)
        .filter(User.role == "teacher")
        .order_by(User.rating.desc(), User.students_count.desc())
        .all()
    )


@router.get("/{teacher_id}", response_model=UserOut)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher
