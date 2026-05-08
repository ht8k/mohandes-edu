from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from .auth import hash_password
from .models import (
    Course,
    Enrollment,
    Lecture,
    Notification,
    Question,
    ScheduleItem,
    User,
)


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    teacher_ahmed = User(
        full_name="الأستاذ أحمد الجبوري",
        email="ahmed@mohandes.edu",
        password_hash=hash_password("password123"),
        role="teacher",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
        bio="مدرس مادة الفيزياء للصف السادس العلمي",
        rating=4.9,
        students_count=12450,
    )
    teacher_khaled = User(
        full_name="الأستاذ خالد علي",
        email="khaled@mohandes.edu",
        password_hash=hash_password("password123"),
        role="teacher",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=khaled",
        bio="مدرس مادة الرياضيات",
        rating=4.8,
        students_count=8200,
    )
    teacher_sara = User(
        full_name="الأستاذة سارة حسن",
        email="sara@mohandes.edu",
        password_hash=hash_password("password123"),
        role="teacher",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
        bio="مدرسة مادة الكيمياء للصف السادس العلمي",
        rating=4.7,
        students_count=6500,
    )
    student = User(
        full_name="علي محمد",
        email="student@mohandes.edu",
        password_hash=hash_password("password123"),
        role="student",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=student",
    )
    db.add_all([teacher_ahmed, teacher_khaled, teacher_sara, student])
    db.commit()
    for u in [teacher_ahmed, teacher_khaled, teacher_sara, student]:
        db.refresh(u)

    physics = Course(
        title='"فيزياء - السادس العلمي (المنهج الكامل)"',
        subject="الفيزياء",
        grade="السادس العلمي",
        description="دورة شاملة لمادة الفيزياء للصف السادس العلمي تغطي المنهج الكامل مع شرح تفصيلي وحلول للأسئلة الوزارية.",
        cover_url="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60",
        rating=4.9,
        lessons_count=65,
        hours_count=52,
        views_count=25100,
        questions_answered=410,
        teacher_id=teacher_ahmed.id,
        is_featured=True,
    )
    math = Course(
        title="رياضيات - السادس العلمي (المنهج الكامل)",
        subject="الرياضيات",
        grade="السادس العلمي",
        description="دورة شاملة لمادة الرياضيات للصف السادس العلمي.",
        cover_url="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60",
        rating=4.8,
        lessons_count=58,
        hours_count=48,
        views_count=18900,
        questions_answered=320,
        teacher_id=teacher_khaled.id,
        is_featured=False,
    )
    chemistry = Course(
        title="كيمياء - السادس العلمي (المنهج الكامل)",
        subject="الكيمياء",
        grade="السادس العلمي",
        description="دورة شاملة لمادة الكيمياء للصف السادس العلمي.",
        cover_url="https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800&auto=format&fit=crop&q=60",
        rating=4.7,
        lessons_count=50,
        hours_count=42,
        views_count=14200,
        questions_answered=240,
        teacher_id=teacher_sara.id,
        is_featured=False,
    )
    db.add_all([physics, math, chemistry])
    db.commit()
    for c in [physics, math, chemistry]:
        db.refresh(c)

    lectures = [
        Lecture(
            title="المحاضرة الأولى - الكميات الفيزيائية",
            description="مقدمة عن الكميات الفيزيائية والوحدات",
            duration_minutes=65,
            order_index=1,
            course_id=physics.id,
            views_count=4500,
        ),
        Lecture(
            title="المحاضرة الثانية - الحركة في خط مستقيم",
            description="دراسة حركة الجسم في خط مستقيم",
            duration_minutes=72,
            order_index=2,
            course_id=physics.id,
            views_count=4200,
        ),
        Lecture(
            title="المحاضرة الثالثة - قوانين نيوتن",
            description="شرح قوانين نيوتن الثلاثة",
            duration_minutes=80,
            order_index=3,
            course_id=physics.id,
            views_count=3800,
        ),
        Lecture(
            title="المحاضرة الأولى - النهايات والاتصال",
            description="مفهوم النهاية والاتصال",
            duration_minutes=60,
            order_index=1,
            course_id=math.id,
            views_count=3100,
        ),
        Lecture(
            title="المحاضرة الأولى - الكيمياء العضوية",
            description="مقدمة في الكيمياء العضوية",
            duration_minutes=55,
            order_index=1,
            course_id=chemistry.id,
            views_count=2400,
        ),
    ]
    db.add_all(lectures)

    questions = [
        Question(
            title="سؤال حول قانون نيوتن الثاني",
            body="ما هو قانون نيوتن الثاني وكيف يطبق على الأجسام المتحركة؟",
            answer="قانون نيوتن الثاني ينص على أن القوة المؤثرة على الجسم تساوي حاصل ضرب كتلته في تسارعه (F = m × a).",
            is_answered=True,
            student_id=student.id,
            course_id=physics.id,
            answered_at=datetime.utcnow() - timedelta(hours=2),
        ),
        Question(
            title="سؤال حول التكامل بالتعويض",
            body="كيف نحل التكاملات بطريقة التعويض؟",
            student_id=student.id,
            course_id=math.id,
            is_answered=False,
        ),
        Question(
            title="سؤال حول التفاعلات الكيميائية",
            body="ما الفرق بين التفاعل الطارد والماص للحرارة؟",
            answer="التفاعل الطارد للحرارة يطلق طاقة، أما الماص للحرارة فيمتص طاقة من المحيط.",
            is_answered=True,
            student_id=student.id,
            course_id=chemistry.id,
            answered_at=datetime.utcnow() - timedelta(days=1),
        ),
    ]
    db.add_all(questions)

    today_10 = datetime.utcnow().replace(hour=10, minute=0, second=0, microsecond=0)
    schedule_items = [
        ScheduleItem(
            title="خالد علي (المنهج الكامل) محرس",
            description="محاضرة في الرياضيات",
            course_id=math.id,
            teacher_name="خالد علي",
            starts_at=today_10,
            ends_at=today_10 + timedelta(hours=1),
            status="upcoming",
        ),
        ScheduleItem(
            title="أحمد الجبوري - الفيزياء",
            description="محاضرة في الفيزياء",
            course_id=physics.id,
            teacher_name="أحمد الجبوري",
            starts_at=today_10 + timedelta(hours=2),
            ends_at=today_10 + timedelta(hours=3),
            status="upcoming",
        ),
        ScheduleItem(
            title="سارة حسن - الكيمياء",
            description="محاضرة في الكيمياء",
            course_id=chemistry.id,
            teacher_name="سارة حسن",
            starts_at=today_10 + timedelta(days=1),
            ends_at=today_10 + timedelta(days=1, hours=1),
            status="upcoming",
        ),
    ]
    db.add_all(schedule_items)

    db.add_all(
        [
            Enrollment(student_id=student.id, course_id=physics.id, progress=45, score=88),
            Enrollment(student_id=student.id, course_id=math.id, progress=20, score=75),
        ]
    )

    db.add_all(
        [
            Notification(
                user_id=student.id,
                title="محاضرة جديدة متاحة",
                body="تم نشر محاضرة جديدة في مادة الفيزياء",
            ),
            Notification(
                user_id=student.id,
                title="تم الإجابة على سؤالك",
                body="أجاب الأستاذ على سؤالك في الفيزياء",
            ),
            Notification(
                user_id=student.id,
                title="تذكير بمحاضرة قادمة",
                body="لديك محاضرة بعد ساعة في مادة الرياضيات",
            ),
        ]
    )

    db.commit()
