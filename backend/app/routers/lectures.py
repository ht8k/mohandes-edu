from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Course, Lecture, User
from ..schemas import LectureCreate, LectureOut
from ..auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/lectures", tags=["lectures"])


@router.get("", response_model=List[LectureOut])
def list_lectures(
    course_id: Optional[int] = Query(None),
    teacher_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Lecture)
    if course_id is not None:
        q = q.filter(Lecture.course_id == course_id)
    if teacher_id is not None:
        q = q.join(Course).filter(Course.teacher_id == teacher_id)
    return q.order_by(Lecture.order_index.asc(), Lecture.created_at.desc()).all()


@router.get("/{lecture_id}", response_model=LectureOut)
def get_lecture(lecture_id: int, db: Session = Depends(get_db)):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    lecture.views_count += 1
    db.commit()
    db.refresh(lecture)
    return lecture


@router.post("", response_model=LectureOut)
def create_lecture(
    payload: LectureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")
    lecture = Lecture(**payload.model_dump())
    db.add(lecture)
    course.lessons_count = (course.lessons_count or 0) + 1
    course.hours_count = (course.hours_count or 0) + max(0, payload.duration_minutes // 60)
    db.commit()
    db.refresh(lecture)
    return lecture


@router.delete("/{lecture_id}")
def delete_lecture(
    lecture_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    course = db.query(Course).filter(Course.id == lecture.course_id).first()
    if not course or course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your lecture")
    db.delete(lecture)
    if course.lessons_count and course.lessons_count > 0:
        course.lessons_count -= 1
    db.commit()
    return {"ok": True}
