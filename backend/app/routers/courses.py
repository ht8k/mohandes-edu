from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Course, User
from ..schemas import CourseCreate, CourseOut
from ..auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("", response_model=List[CourseOut])
def list_courses(
    db: Session = Depends(get_db),
    featured: Optional[bool] = Query(None),
    teacher_id: Optional[int] = Query(None),
):
    q = db.query(Course)
    if featured is not None:
        q = q.filter(Course.is_featured == featured)
    if teacher_id is not None:
        q = q.filter(Course.teacher_id == teacher_id)
    return q.order_by(Course.is_featured.desc(), Course.created_at.desc()).all()


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("", response_model=CourseOut)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    course = Course(
        title=payload.title,
        subject=payload.subject,
        grade=payload.grade,
        description=payload.description,
        cover_url=payload.cover_url,
        is_featured=payload.is_featured,
        teacher_id=current_user.id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")
    db.delete(course)
    db.commit()
    return {"ok": True}
