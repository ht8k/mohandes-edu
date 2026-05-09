// Static, browser-only "API" for the GitHub Pages deployment.
//
// All data lives in localStorage. On first visit (or after the seed version
// is bumped) we hydrate from the bundled Arabic seed data in seedData.ts.
// Subsequent reads/writes go through the same in-memory copy and are flushed
// back to localStorage. Network calls are intentionally avoided so the SPA
// works as a fully static GitHub Pages site without any backend.
//
// User-generated data (new courses, lectures, questions, enrollments,
// answers, notifications) is preserved per browser. Users on different
// devices see independent state — this is by design for the static demo.

import { buildSeedData } from "./seedData";

const STORAGE_KEY = "mohandes_state_v1";
const TOKEN_KEY = "mohandes_token";
const CURRENT_USER_ID_KEY = "mohandes_current_user_id";

export const API_URL = "static://mohandes-edu";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "student" | "teacher";
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  students_count: number;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  subject: string;
  grade: string;
  description: string | null;
  cover_url: string | null;
  rating: number;
  lessons_count: number;
  hours_count: number;
  views_count: number;
  questions_answered: number;
  is_featured: boolean;
  teacher_id: number;
  teacher: User;
  created_at: string;
}

export interface Lecture {
  id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  is_published: boolean;
  course_id: number;
  views_count: number;
  created_at: string;
}

export interface Question {
  id: number;
  title: string;
  body: string;
  answer: string | null;
  is_answered: boolean;
  student_id: number;
  course_id: number | null;
  student: User;
  created_at: string;
  answered_at: string | null;
}

export interface ScheduleItem {
  id: number;
  title: string;
  description: string | null;
  course_id: number;
  teacher_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
}

export interface Notification {
  id: number;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  progress: number;
  score: number;
  enrolled_at: string;
  course: Course;
}

export interface Stats {
  courses_count: number;
  students_count: number;
  lectures_count: number;
  questions_answered: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface PersistedState {
  users: User[];
  courses: Course[];
  lectures: Lecture[];
  questions: Question[];
  scheduleItems: ScheduleItem[];
  enrollments: Enrollment[];
  notificationsByUser: Record<number, Notification[]>;
  passwords: Record<string, string>;
  nextIds: {
    user: number;
    course: number;
    lecture: number;
    question: number;
    schedule: number;
    enrollment: number;
    notification: number;
  };
}

function maxId(items: { id: number }[]): number {
  return items.reduce((max, item) => (item.id > max ? item.id : max), 0);
}

function buildInitialState(): PersistedState {
  const seed = buildSeedData();
  const notificationsByUser: Record<number, Notification[]> = {};
  const seededStudent = seed.users.find((u) => u.email === "student@mohandes.edu");
  if (seededStudent) {
    notificationsByUser[seededStudent.id] = seed.notifications;
  }
  return {
    users: seed.users,
    courses: seed.courses,
    lectures: seed.lectures,
    questions: seed.questions,
    scheduleItems: seed.scheduleItems,
    enrollments: seed.enrollments,
    notificationsByUser,
    passwords: seed.passwords,
    nextIds: {
      user: maxId(seed.users) + 1,
      course: maxId(seed.courses) + 1,
      lecture: maxId(seed.lectures) + 1,
      question: maxId(seed.questions) + 1,
      schedule: maxId(seed.scheduleItems) + 1,
      enrollment: maxId(seed.enrollments) + 1,
      notification: maxId(seed.notifications) + 1,
    },
  };
}

function loadState(): PersistedState {
  if (typeof window === "undefined") {
    return buildInitialState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedState;
    }
  } catch {
    // fall through to seeded state
  }
  const fresh = buildInitialState();
  saveState(fresh);
  return fresh;
}

function saveState(s: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // localStorage quota exceeded or disabled — silently ignore
  }
}

const state: PersistedState = loadState();

function persist(): void {
  saveState(state);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function tokenForUser(userId: number): string {
  return `static-token.${userId}.${Date.now()}`;
}

function userIdFromToken(token: string): number | null {
  const match = /^static-token\.(\d+)\./.exec(token);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

function findUser(userId: number): User {
  const user = state.users.find((u) => u.id === userId);
  if (!user) throw new Error("المستخدم غير موجود");
  return user;
}

function ensureCurrentUser(): User {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("الرجاء تسجيل الدخول أولاً");
  return findUser(userId);
}

function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(clone(value)), ms));
}

function recomputeCourseTotals(courseId: number): void {
  const course = state.courses.find((c) => c.id === courseId);
  if (!course) return;
  const lectures = state.lectures.filter((l) => l.course_id === courseId);
  course.lessons_count = lectures.length;
  course.hours_count = Math.ceil(
    lectures.reduce((sum, l) => sum + l.duration_minutes, 0) / 60,
  );
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(CURRENT_USER_ID_KEY);
  }
}

function setCurrentUserId(id: number | null): void {
  if (typeof window === "undefined") return;
  if (id === null) window.localStorage.removeItem(CURRENT_USER_ID_KEY);
  else window.localStorage.setItem(CURRENT_USER_ID_KEY, String(id));
}

function getCurrentUserId(): number | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(CURRENT_USER_ID_KEY);
  if (stored) {
    const parsed = Number.parseInt(stored, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const token = getToken();
  if (!token) return null;
  return userIdFromToken(token);
}

export const api = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const normalized = email.trim().toLowerCase();
    const user = state.users.find((u) => u.email.toLowerCase() === normalized);
    if (!user) {
      throw new Error("البريد الإلكتروني غير مسجل في الحسابات التجريبية");
    }
    const expected = state.passwords[user.email];
    if (expected && expected !== password) {
      throw new Error("كلمة المرور غير صحيحة");
    }
    const token = tokenForUser(user.id);
    setCurrentUserId(user.id);
    return delay({
      access_token: token,
      token_type: "bearer",
      user,
    });
  },

  register: async (input: {
    full_name: string;
    email: string;
    password: string;
    role?: "student" | "teacher";
  }): Promise<AuthResponse> => {
    const email = input.email.trim().toLowerCase();
    if (state.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error("البريد الإلكتروني مستخدم بالفعل");
    }
    const user: User = {
      id: state.nextIds.user++,
      full_name: input.full_name,
      email,
      role: input.role || "student",
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      bio: null,
      rating: 0,
      students_count: 0,
      created_at: new Date().toISOString(),
    };
    state.users.push(user);
    state.passwords[user.email] = input.password;
    persist();
    const token = tokenForUser(user.id);
    setCurrentUserId(user.id);
    return delay({
      access_token: token,
      token_type: "bearer",
      user,
    });
  },

  me: async (): Promise<User> => {
    const user = ensureCurrentUser();
    return delay(user);
  },

  listCourses: async (params?: { featured?: boolean; teacher_id?: number }): Promise<Course[]> => {
    let result = state.courses.slice();
    if (params?.featured !== undefined) {
      result = result.filter((c) => c.is_featured === params.featured);
    }
    if (params?.teacher_id !== undefined) {
      result = result.filter((c) => c.teacher_id === params.teacher_id);
    }
    result.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || b.id - a.id);
    return delay(result);
  },

  getCourse: async (id: number): Promise<Course> => {
    const course = state.courses.find((c) => c.id === id);
    if (!course) throw new Error("الكورس غير موجود");
    return delay(course);
  },

  createCourse: async (data: {
    title: string;
    subject: string;
    grade: string;
    description?: string;
    cover_url?: string;
    is_featured?: boolean;
  }): Promise<Course> => {
    const teacher = ensureCurrentUser();
    if (teacher.role !== "teacher") {
      throw new Error("فقط الأساتذة يمكنهم إضافة كورسات");
    }
    const course: Course = {
      id: state.nextIds.course++,
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      description: data.description ?? null,
      cover_url: data.cover_url ?? null,
      rating: 0,
      lessons_count: 0,
      hours_count: 0,
      views_count: 0,
      questions_answered: 0,
      is_featured: data.is_featured ?? false,
      teacher_id: teacher.id,
      teacher,
      created_at: new Date().toISOString(),
    };
    state.courses.push(course);
    persist();
    return delay(course);
  },

  listLectures: async (params?: { course_id?: number; teacher_id?: number }): Promise<Lecture[]> => {
    let result = state.lectures.slice();
    if (params?.course_id !== undefined) {
      result = result.filter((l) => l.course_id === params.course_id);
    }
    if (params?.teacher_id !== undefined) {
      const teacherCourseIds = state.courses
        .filter((c) => c.teacher_id === params.teacher_id)
        .map((c) => c.id);
      result = result.filter((l) => teacherCourseIds.includes(l.course_id));
    }
    result.sort((a, b) => a.order_index - b.order_index);
    return delay(result);
  },

  createLecture: async (data: {
    title: string;
    description?: string;
    video_url?: string;
    duration_minutes?: number;
    order_index?: number;
    course_id: number;
  }): Promise<Lecture> => {
    const teacher = ensureCurrentUser();
    if (teacher.role !== "teacher") {
      throw new Error("فقط الأساتذة يمكنهم رفع المحاضرات");
    }
    const course = state.courses.find((c) => c.id === data.course_id);
    if (!course) throw new Error("الكورس غير موجود");
    if (course.teacher_id !== teacher.id) {
      throw new Error("لا يمكنك إضافة محاضرة إلى كورس لا تملكه");
    }
    const lecture: Lecture = {
      id: state.nextIds.lecture++,
      title: data.title,
      description: data.description ?? null,
      video_url: data.video_url ?? null,
      duration_minutes: data.duration_minutes ?? 0,
      order_index:
        data.order_index ??
        (state.lectures.filter((l) => l.course_id === course.id).length + 1),
      is_published: true,
      course_id: course.id,
      views_count: 0,
      created_at: new Date().toISOString(),
    };
    state.lectures.push(lecture);
    recomputeCourseTotals(course.id);
    persist();
    return delay(lecture);
  },

  updateLecture: async (
    id: number,
    data: {
      title?: string;
      description?: string | null;
      duration_minutes?: number;
    },
  ): Promise<Lecture> => {
    const teacher = ensureCurrentUser();
    if (teacher.role !== "teacher") {
      throw new Error("فقط الأساتذة يمكنهم تعديل المحاضرات");
    }
    const lecture = state.lectures.find((l) => l.id === id);
    if (!lecture) throw new Error("المحاضرة غير موجودة");
    const course = state.courses.find((c) => c.id === lecture.course_id);
    if (!course || course.teacher_id !== teacher.id) {
      throw new Error("لا يمكنك تعديل محاضرة لا تملكها");
    }
    if (data.title !== undefined) lecture.title = data.title;
    if (data.description !== undefined) lecture.description = data.description;
    if (data.duration_minutes !== undefined) lecture.duration_minutes = data.duration_minutes;
    recomputeCourseTotals(course.id);
    persist();
    return delay(lecture);
  },

  deleteLecture: async (id: number): Promise<void> => {
    const teacher = ensureCurrentUser();
    if (teacher.role !== "teacher") {
      throw new Error("فقط الأساتذة يمكنهم حذف المحاضرات");
    }
    const lecture = state.lectures.find((l) => l.id === id);
    if (!lecture) throw new Error("المحاضرة غير موجودة");
    const course = state.courses.find((c) => c.id === lecture.course_id);
    if (!course || course.teacher_id !== teacher.id) {
      throw new Error("لا يمكنك حذف محاضرة لا تملكها");
    }
    state.lectures = state.lectures.filter((l) => l.id !== id);
    recomputeCourseTotals(course.id);
    persist();
    return delay(undefined as unknown as void);
  },

  updateCourse: async (
    id: number,
    data: {
      title?: string;
      subject?: string;
      grade?: string;
      description?: string | null;
      cover_url?: string | null;
      is_featured?: boolean;
    },
  ): Promise<Course> => {
    const teacher = ensureCurrentUser();
    if (teacher.role !== "teacher") {
      throw new Error("فقط الأساتذة يمكنهم تعديل الكورسات");
    }
    const course = state.courses.find((c) => c.id === id);
    if (!course) throw new Error("الكورس غير موجود");
    if (course.teacher_id !== teacher.id) {
      throw new Error("لا يمكنك تعديل كورس لا تملكه");
    }
    if (data.title !== undefined) course.title = data.title;
    if (data.subject !== undefined) course.subject = data.subject;
    if (data.grade !== undefined) course.grade = data.grade;
    if (data.description !== undefined) course.description = data.description;
    if (data.cover_url !== undefined) course.cover_url = data.cover_url;
    if (data.is_featured !== undefined) course.is_featured = data.is_featured;
    persist();
    return delay(course);
  },

  deleteCourse: async (id: number): Promise<void> => {
    const teacher = ensureCurrentUser();
    if (teacher.role !== "teacher") {
      throw new Error("فقط الأساتذة يمكنهم حذف الكورسات");
    }
    const course = state.courses.find((c) => c.id === id);
    if (!course) throw new Error("الكورس غير موجود");
    if (course.teacher_id !== teacher.id) {
      throw new Error("لا يمكنك حذف كورس لا تملكه");
    }
    state.courses = state.courses.filter((c) => c.id !== id);
    state.lectures = state.lectures.filter((l) => l.course_id !== id);
    state.scheduleItems = state.scheduleItems.filter((s) => s.course_id !== id);
    state.enrollments = state.enrollments.filter((e) => e.course_id !== id);
    state.questions = state.questions.map((q) =>
      q.course_id === id ? { ...q, course_id: null } : q,
    );
    persist();
    return delay(undefined as unknown as void);
  },

  listQuestions: async (params?: { answered?: boolean; course_id?: number }): Promise<Question[]> => {
    let result = state.questions.slice();
    if (params?.answered !== undefined) {
      result = result.filter((q) => q.is_answered === params.answered);
    }
    if (params?.course_id !== undefined) {
      result = result.filter((q) => q.course_id === params.course_id);
    }
    result.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return delay(result);
  },

  askQuestion: async (data: { title: string; body: string; course_id?: number }): Promise<Question> => {
    const student = ensureCurrentUser();
    const question: Question = {
      id: state.nextIds.question++,
      title: data.title,
      body: data.body,
      answer: null,
      is_answered: false,
      student_id: student.id,
      course_id: data.course_id ?? null,
      student,
      created_at: new Date().toISOString(),
      answered_at: null,
    };
    state.questions.push(question);
    persist();
    return delay(question);
  },

  answerQuestion: async (id: number, answer: string): Promise<Question> => {
    const teacher = ensureCurrentUser();
    if (teacher.role !== "teacher") {
      throw new Error("فقط الأساتذة يمكنهم الإجابة");
    }
    const question = state.questions.find((q) => q.id === id);
    if (!question) throw new Error("السؤال غير موجود");
    question.answer = answer;
    question.is_answered = true;
    question.answered_at = new Date().toISOString();
    persist();
    return delay(question);
  },

  unanswerQuestion: async (id: number): Promise<Question> => {
    const teacher = ensureCurrentUser();
    if (teacher.role !== "teacher") {
      throw new Error("فقط الأساتذة يمكنهم حذف الإجابة");
    }
    const question = state.questions.find((q) => q.id === id);
    if (!question) throw new Error("السؤال غير موجود");
    question.answer = null;
    question.is_answered = false;
    question.answered_at = null;
    persist();
    return delay(question);
  },

  listSchedule: async (): Promise<ScheduleItem[]> => {
    const sorted = state.scheduleItems.slice().sort((a, b) => (a.starts_at < b.starts_at ? -1 : 1));
    return delay(sorted);
  },

  listNotifications: async (): Promise<Notification[]> => {
    const userId = getCurrentUserId();
    if (!userId) return delay([]);
    const items = state.notificationsByUser[userId] ?? [];
    const sorted = items.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return delay(sorted);
  },

  markNotificationRead: async (id: number): Promise<Notification> => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("الرجاء تسجيل الدخول أولاً");
    const items = state.notificationsByUser[userId] ?? [];
    const notification = items.find((n) => n.id === id);
    if (!notification) throw new Error("الإشعار غير موجود");
    notification.is_read = true;
    state.notificationsByUser[userId] = items;
    persist();
    return delay(notification);
  },

  listTeachers: async (): Promise<User[]> => {
    const teachers = state.users
      .filter((u) => u.role === "teacher")
      .sort((a, b) => b.rating - a.rating);
    return delay(teachers);
  },

  getTeacher: async (id: number): Promise<User> => {
    const user = state.users.find((u) => u.id === id && u.role === "teacher");
    if (!user) throw new Error("الأستاذ غير موجود");
    return delay(user);
  },

  myEnrollments: async (): Promise<Enrollment[]> => {
    const userId = getCurrentUserId();
    if (!userId) return delay([]);
    const items = state.enrollments
      .filter((e) => e.student_id === userId)
      .map((e) => {
        const course = state.courses.find((c) => c.id === e.course_id);
        return course ? { ...e, course } : e;
      });
    return delay(items);
  },

  enroll: async (courseId: number): Promise<Enrollment> => {
    const student = ensureCurrentUser();
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) throw new Error("الكورس غير موجود");
    const existing = state.enrollments.find(
      (e) => e.student_id === student.id && e.course_id === courseId,
    );
    if (existing) {
      return delay(existing);
    }
    const enrollment: Enrollment = {
      id: state.nextIds.enrollment++,
      student_id: student.id,
      course_id: course.id,
      progress: 0,
      score: 0,
      enrolled_at: new Date().toISOString(),
      course,
    };
    state.enrollments.push(enrollment);
    persist();
    return delay(enrollment);
  },

  stats: async (): Promise<Stats> => {
    const stats: Stats = {
      courses_count: state.courses.length,
      students_count: state.users.filter((u) => u.role === "student").length,
      lectures_count: state.lectures.length,
      questions_answered: state.questions.filter((q) => q.is_answered).length,
    };
    return delay(stats);
  },
};
