from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str = "student"
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: int
    rating: float
    students_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class CourseBase(BaseModel):
    title: str
    subject: str
    grade: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    is_featured: bool = False


class CourseCreate(CourseBase):
    pass


class CourseOut(CourseBase):
    id: int
    rating: float
    lessons_count: int
    hours_count: int
    views_count: int
    questions_answered: int
    teacher_id: int
    teacher: UserOut
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LectureBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: int = 0
    order_index: int = 0
    is_published: bool = True


class LectureCreate(LectureBase):
    course_id: int


class LectureOut(LectureBase):
    id: int
    course_id: int
    views_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionBase(BaseModel):
    title: str
    body: str
    course_id: Optional[int] = None


class QuestionCreate(QuestionBase):
    pass


class QuestionAnswer(BaseModel):
    answer: str


class QuestionOut(QuestionBase):
    id: int
    answer: Optional[str] = None
    is_answered: bool
    student_id: int
    student: UserOut
    created_at: datetime
    answered_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ScheduleItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: int
    teacher_name: str
    starts_at: datetime
    ends_at: datetime
    status: str = "upcoming"


class ScheduleItemCreate(ScheduleItemBase):
    pass


class ScheduleItemOut(ScheduleItemBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class NotificationOut(BaseModel):
    id: int
    title: str
    body: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    progress: int
    score: int
    enrolled_at: datetime
    course: CourseOut

    model_config = ConfigDict(from_attributes=True)


class StatsOut(BaseModel):
    courses_count: int
    students_count: int
    lectures_count: int
    questions_answered: int
