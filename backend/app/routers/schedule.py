from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Course, ScheduleItem, User
from ..schemas import ScheduleItemCreate, ScheduleItemOut
from ..auth import require_teacher

router = APIRouter(prefix="/api/schedule", tags=["schedule"])


@router.get("", response_model=List[ScheduleItemOut])
def list_schedule(db: Session = Depends(get_db)):
    return db.query(ScheduleItem).order_by(ScheduleItem.starts_at.asc()).all()


@router.post("", response_model=ScheduleItemOut)
def create_schedule_item(
    payload: ScheduleItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")
    item = ScheduleItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
