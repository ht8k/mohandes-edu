from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Course, Question, User
from ..schemas import QuestionAnswer, QuestionCreate, QuestionOut
from ..auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.get("", response_model=List[QuestionOut])
def list_questions(
    answered: Optional[bool] = Query(None),
    course_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Question)
    if answered is not None:
        q = q.filter(Question.is_answered == answered)
    if course_id is not None:
        q = q.filter(Question.course_id == course_id)
    return q.order_by(Question.created_at.desc()).all()


@router.post("", response_model=QuestionOut)
def ask_question(
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    question = Question(
        title=payload.title,
        body=payload.body,
        course_id=payload.course_id,
        student_id=current_user.id,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.post("/{question_id}/answer", response_model=QuestionOut)
def answer_question(
    question_id: int,
    payload: QuestionAnswer,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question.answer = payload.answer
    question.is_answered = True
    question.answered_at = datetime.utcnow()
    if question.course_id:
        course = db.query(Course).filter(Course.id == question.course_id).first()
        if course:
            course.questions_answered = (course.questions_answered or 0) + 1
    db.commit()
    db.refresh(question)
    return question
