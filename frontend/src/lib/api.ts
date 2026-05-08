const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function parseApiUrl(rawUrl: string): { url: string; basicAuth: string | null } {
  try {
    const u = new URL(rawUrl);
    if (u.username || u.password) {
      const creds = `${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}`;
      const basic = btoa(creds);
      u.username = "";
      u.password = "";
      const cleaned = u.toString().replace(/\/$/, "");
      return { url: cleaned, basicAuth: basic };
    }
    return { url: rawUrl.replace(/\/$/, ""), basicAuth: null };
  } catch {
    return { url: rawUrl.replace(/\/$/, ""), basicAuth: null };
  }
}

const parsed = parseApiUrl(RAW_API_URL);
export const API_URL = parsed.url;
const BASIC_AUTH = parsed.basicAuth;

const TOKEN_KEY = "mohandes_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  else if (BASIC_AUTH) headers["Authorization"] = `Basic ${BASIC_AUTH}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) message = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

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

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (input: { full_name: string; email: string; password: string; role?: "student" | "teacher" }) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  me: () => request<User>("/api/auth/me"),

  listCourses: (params?: { featured?: boolean; teacher_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.featured !== undefined) q.set("featured", String(params.featured));
    if (params?.teacher_id !== undefined) q.set("teacher_id", String(params.teacher_id));
    const qs = q.toString();
    return request<Course[]>(`/api/courses${qs ? `?${qs}` : ""}`);
  },
  getCourse: (id: number) => request<Course>(`/api/courses/${id}`),
  createCourse: (data: { title: string; subject: string; grade: string; description?: string; cover_url?: string; is_featured?: boolean }) =>
    request<Course>("/api/courses", { method: "POST", body: JSON.stringify(data) }),

  listLectures: (params?: { course_id?: number; teacher_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.course_id) q.set("course_id", String(params.course_id));
    if (params?.teacher_id) q.set("teacher_id", String(params.teacher_id));
    const qs = q.toString();
    return request<Lecture[]>(`/api/lectures${qs ? `?${qs}` : ""}`);
  },
  createLecture: (data: { title: string; description?: string; video_url?: string; duration_minutes?: number; order_index?: number; course_id: number }) =>
    request<Lecture>("/api/lectures", { method: "POST", body: JSON.stringify(data) }),

  listQuestions: (params?: { answered?: boolean; course_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.answered !== undefined) q.set("answered", String(params.answered));
    if (params?.course_id) q.set("course_id", String(params.course_id));
    const qs = q.toString();
    return request<Question[]>(`/api/questions${qs ? `?${qs}` : ""}`);
  },
  askQuestion: (data: { title: string; body: string; course_id?: number }) =>
    request<Question>("/api/questions", { method: "POST", body: JSON.stringify(data) }),
  answerQuestion: (id: number, answer: string) =>
    request<Question>(`/api/questions/${id}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),

  listSchedule: () => request<ScheduleItem[]>("/api/schedule"),

  listNotifications: () => request<Notification[]>("/api/notifications"),
  markNotificationRead: (id: number) =>
    request<Notification>(`/api/notifications/${id}/read`, { method: "POST" }),

  listTeachers: () => request<User[]>("/api/teachers"),
  getTeacher: (id: number) => request<User>(`/api/teachers/${id}`),

  myEnrollments: () => request<Enrollment[]>("/api/enrollments/me"),
  enroll: (courseId: number) => request<Enrollment>(`/api/enrollments/${courseId}`, { method: "POST" }),

  stats: () => request<Stats>("/api/stats"),
};
