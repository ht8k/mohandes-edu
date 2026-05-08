from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Course, Enrollment, User
from ..schemas import EnrollmentOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/enrollments", tags=["enrollments"])


@router.get("/me", response_model=List[EnrollmentOut])
def list_my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Enrollment)
        .filter(Enrollment.student_id == current_user.id)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )


@router.post("/{course_id}", response_model=EnrollmentOut)
def enroll(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    existing = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
        )
        .first()
    )
    if existing:
        return existing
    enrollment = Enrollment(student_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    course.teacher.students_count = (course.teacher.students_count or 0) + 1
    db.commit()
    db.refresh(enrollment)
    return enrollment
