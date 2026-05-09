// Seed data bundled into the static GitHub Pages build. Mirrors backend/app/seed.py.
// All timestamps are computed at runtime relative to "now" so the schedule keeps
// looking fresh between visits.

import type {
  Course,
  Enrollment,
  Lecture,
  Notification,
  Question,
  ScheduleItem,
  User,
} from "./api";

const now = () => new Date();

const isoOffset = (deltaMs: number): string =>
  new Date(now().getTime() + deltaMs).toISOString();

const todayAt = (hour: number, minute = 0): Date => {
  const d = now();
  d.setHours(hour, minute, 0, 0);
  return d;
};

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

export interface SeededData {
  users: User[];
  courses: Course[];
  lectures: Lecture[];
  questions: Question[];
  scheduleItems: ScheduleItem[];
  enrollments: Enrollment[];
  notifications: Notification[];
  // Map of email -> password used purely for the static demo "auth".
  passwords: Record<string, string>;
}

export function buildSeedData(): SeededData {
  const teacherAhmed: User = {
    id: 1,
    full_name: "الأستاذ أحمد الجبوري",
    email: "ahmed@mohandes.edu",
    role: "teacher",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
    bio: "مدرس مادة الفيزياء للصف السادس العلمي",
    rating: 4.9,
    students_count: 12450,
    created_at: isoOffset(-30 * DAY),
  };
  const teacherKhaled: User = {
    id: 2,
    full_name: "الأستاذ خالد علي",
    email: "khaled@mohandes.edu",
    role: "teacher",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=khaled",
    bio: "مدرس مادة الرياضيات",
    rating: 4.8,
    students_count: 8200,
    created_at: isoOffset(-30 * DAY),
  };
  const teacherSara: User = {
    id: 3,
    full_name: "الأستاذة سارة حسن",
    email: "sara@mohandes.edu",
    role: "teacher",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
    bio: "مدرسة مادة الكيمياء للصف السادس العلمي",
    rating: 4.7,
    students_count: 6500,
    created_at: isoOffset(-30 * DAY),
  };
  const teacher: User = {
    id: 4,
    full_name: "الأستاذ التجريبي",
    email: "teacher@mohandes.edu",
    role: "teacher",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher",
    bio: "حساب تجربة لدور الأستاذ",
    rating: 4.6,
    students_count: 320,
    created_at: isoOffset(-30 * DAY),
  };
  const student: User = {
    id: 5,
    full_name: "علي محمد",
    email: "student@mohandes.edu",
    role: "student",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=student",
    bio: null,
    rating: 0,
    students_count: 0,
    created_at: isoOffset(-15 * DAY),
  };

  const users = [teacherAhmed, teacherKhaled, teacherSara, teacher, student];

  const physics: Course = {
    id: 1,
    title: "فيزياء - السادس العلمي (المنهج الكامل)",
    subject: "الفيزياء",
    grade: "السادس العلمي",
    description:
      "دورة شاملة لمادة الفيزياء للصف السادس العلمي تغطي المنهج الكامل مع شرح تفصيلي وحلول للأسئلة الوزارية.",
    cover_url:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60",
    rating: 4.9,
    lessons_count: 65,
    hours_count: 52,
    views_count: 25100,
    questions_answered: 410,
    teacher_id: teacherAhmed.id,
    teacher: teacherAhmed,
    is_featured: true,
    created_at: isoOffset(-30 * DAY),
  };
  const math: Course = {
    id: 2,
    title: "رياضيات - السادس العلمي (المنهج الكامل)",
    subject: "الرياضيات",
    grade: "السادس العلمي",
    description: "دورة شاملة لمادة الرياضيات للصف السادس العلمي.",
    cover_url:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60",
    rating: 4.8,
    lessons_count: 58,
    hours_count: 48,
    views_count: 18900,
    questions_answered: 320,
    teacher_id: teacherKhaled.id,
    teacher: teacherKhaled,
    is_featured: false,
    created_at: isoOffset(-30 * DAY),
  };
  const chemistry: Course = {
    id: 3,
    title: "كيمياء - السادس العلمي (المنهج الكامل)",
    subject: "الكيمياء",
    grade: "السادس العلمي",
    description: "دورة شاملة لمادة الكيمياء للصف السادس العلمي.",
    cover_url:
      "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800&auto=format&fit=crop&q=60",
    rating: 4.7,
    lessons_count: 50,
    hours_count: 42,
    views_count: 14200,
    questions_answered: 240,
    teacher_id: teacherSara.id,
    teacher: teacherSara,
    is_featured: false,
    created_at: isoOffset(-30 * DAY),
  };

  const courses = [physics, math, chemistry];

  const lectures: Lecture[] = [
    {
      id: 1,
      title: "المحاضرة الأولى - الكميات الفيزيائية",
      description: "مقدمة عن الكميات الفيزيائية والوحدات",
      video_url: null,
      duration_minutes: 65,
      order_index: 1,
      is_published: true,
      course_id: physics.id,
      views_count: 4500,
      created_at: isoOffset(-25 * DAY),
    },
    {
      id: 2,
      title: "المحاضرة الثانية - الحركة في خط مستقيم",
      description: "دراسة حركة الجسم في خط مستقيم",
      video_url: null,
      duration_minutes: 72,
      order_index: 2,
      is_published: true,
      course_id: physics.id,
      views_count: 4200,
      created_at: isoOffset(-22 * DAY),
    },
    {
      id: 3,
      title: "المحاضرة الثالثة - قوانين نيوتن",
      description: "شرح قوانين نيوتن الثلاثة",
      video_url: null,
      duration_minutes: 80,
      order_index: 3,
      is_published: true,
      course_id: physics.id,
      views_count: 3800,
      created_at: isoOffset(-19 * DAY),
    },
    {
      id: 4,
      title: "المحاضرة الأولى - النهايات والاتصال",
      description: "مفهوم النهاية والاتصال",
      video_url: null,
      duration_minutes: 60,
      order_index: 1,
      is_published: true,
      course_id: math.id,
      views_count: 3100,
      created_at: isoOffset(-20 * DAY),
    },
    {
      id: 5,
      title: "المحاضرة الأولى - الكيمياء العضوية",
      description: "مقدمة في الكيمياء العضوية",
      video_url: null,
      duration_minutes: 55,
      order_index: 1,
      is_published: true,
      course_id: chemistry.id,
      views_count: 2400,
      created_at: isoOffset(-18 * DAY),
    },
  ];

  const questions: Question[] = [
    {
      id: 1,
      title: "سؤال حول قانون نيوتن الثاني",
      body: "ما هو قانون نيوتن الثاني وكيف يطبق على الأجسام المتحركة؟",
      answer:
        "قانون نيوتن الثاني ينص على أن القوة المؤثرة على الجسم تساوي حاصل ضرب كتلته في تسارعه (F = m × a).",
      is_answered: true,
      student_id: student.id,
      course_id: physics.id,
      student,
      created_at: isoOffset(-3 * DAY),
      answered_at: isoOffset(-2 * HOUR),
    },
    {
      id: 2,
      title: "سؤال حول التكامل بالتعويض",
      body: "كيف نحل التكاملات بطريقة التعويض؟",
      answer: null,
      is_answered: false,
      student_id: student.id,
      course_id: math.id,
      student,
      created_at: isoOffset(-1 * DAY),
      answered_at: null,
    },
    {
      id: 3,
      title: "سؤال حول التفاعلات الكيميائية",
      body: "ما الفرق بين التفاعل الطارد والماص للحرارة؟",
      answer:
        "التفاعل الطارد للحرارة يطلق طاقة، أما الماص للحرارة فيمتص طاقة من المحيط.",
      is_answered: true,
      student_id: student.id,
      course_id: chemistry.id,
      student,
      created_at: isoOffset(-4 * DAY),
      answered_at: isoOffset(-1 * DAY),
    },
  ];

  const todayTen = todayAt(10);
  const scheduleItems: ScheduleItem[] = [
    {
      id: 1,
      title: "خالد علي (المنهج الكامل) محرس",
      description: "محاضرة في الرياضيات",
      course_id: math.id,
      teacher_name: "خالد علي",
      starts_at: todayTen.toISOString(),
      ends_at: new Date(todayTen.getTime() + HOUR).toISOString(),
      status: "upcoming",
    },
    {
      id: 2,
      title: "أحمد الجبوري - الفيزياء",
      description: "محاضرة في الفيزياء",
      course_id: physics.id,
      teacher_name: "أحمد الجبوري",
      starts_at: new Date(todayTen.getTime() + 2 * HOUR).toISOString(),
      ends_at: new Date(todayTen.getTime() + 3 * HOUR).toISOString(),
      status: "upcoming",
    },
    {
      id: 3,
      title: "سارة حسن - الكيمياء",
      description: "محاضرة في الكيمياء",
      course_id: chemistry.id,
      teacher_name: "سارة حسن",
      starts_at: new Date(todayTen.getTime() + DAY).toISOString(),
      ends_at: new Date(todayTen.getTime() + DAY + HOUR).toISOString(),
      status: "upcoming",
    },
  ];

  const enrollments: Enrollment[] = [
    {
      id: 1,
      student_id: student.id,
      course_id: physics.id,
      progress: 45,
      score: 88,
      enrolled_at: isoOffset(-10 * DAY),
      course: physics,
    },
    {
      id: 2,
      student_id: student.id,
      course_id: math.id,
      progress: 20,
      score: 75,
      enrolled_at: isoOffset(-5 * DAY),
      course: math,
    },
  ];

  const notifications: Notification[] = [
    {
      id: 1,
      title: "محاضرة جديدة متاحة",
      body: "تم نشر محاضرة جديدة في مادة الفيزياء",
      is_read: false,
      created_at: isoOffset(-1 * HOUR),
    },
    {
      id: 2,
      title: "تم الإجابة على سؤالك",
      body: "أجاب الأستاذ على سؤالك في الفيزياء",
      is_read: false,
      created_at: isoOffset(-3 * HOUR),
    },
    {
      id: 3,
      title: "تذكير بمحاضرة قادمة",
      body: "لديك محاضرة بعد ساعة في مادة الرياضيات",
      is_read: true,
      created_at: isoOffset(-DAY),
    },
  ];

  // For demo purposes only — these passwords live entirely in the user's
  // browser. Anyone can pick a different one when registering a new account.
  const passwords: Record<string, string> = {
    "ahmed@mohandes.edu": "password123",
    "khaled@mohandes.edu": "password123",
    "sara@mohandes.edu": "password123",
    "teacher@mohandes.edu": "password123",
    "student@mohandes.edu": "password123",
  };

  return {
    users,
    courses,
    lectures,
    questions,
    scheduleItems,
    enrollments,
    notifications,
    passwords,
  };
}
