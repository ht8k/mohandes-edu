import { ArrowRight, BookOpen, Clock, PlayCircle, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SectionTitle } from "../components/PageContainer";
import { api } from "../lib/api";
import type { Course, Lecture } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatCount } from "../lib/format";

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const courseId = Number(id);
    api.getCourse(courseId).then(setCourse).catch(() => undefined);
    api.listLectures({ course_id: courseId }).then(setLectures).catch(() => undefined);
    if (user && user.role === "student") {
      api
        .myEnrollments()
        .then((rows) => setEnrolled(rows.some((r) => r.course_id === courseId)))
        .catch(() => undefined);
    }
  }, [id, user]);

  async function handleEnroll() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!course) return;
    setEnrolling(true);
    setError(null);
    try {
      await api.enroll(course.id);
      setEnrolled(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnrolling(false);
    }
  }

  if (!course) {
    return (
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-card h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-4 flex items-center gap-2">
        <Link to="/" className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center text-slate-600">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <span className="text-sm font-semibold text-slate-700">{course.subject}</span>
      </div>

      <div className="px-4 mt-4">
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          <div className="aspect-[16/9] bg-slate-200 relative">
            {course.cover_url && (
              <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs font-bold text-slate-800 flex items-center gap-1">
              {course.rating.toFixed(1)}
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          <div className="p-4 text-right">
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{course.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{course.teacher.full_name}</p>
            {course.description && (
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{course.description}</p>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="درس" value={String(course.lessons_count)} icon={<BookOpen className="w-4 h-4" />} />
              <Stat label="ساعة" value={String(course.hours_count)} icon={<Clock className="w-4 h-4" />} />
              <Stat label="مشاهدة" value={formatCount(course.views_count)} icon={<Users className="w-4 h-4" />} />
            </div>
            {user?.role === "student" && (
              <button
                onClick={handleEnroll}
                disabled={enrolling || enrolled}
                className="mt-4 w-full bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 disabled:text-slate-600 text-white font-bold py-3 rounded-2xl transition-colors"
              >
                {enrolled ? "أنت مسجّل في هذه الدورة" : enrolling ? "جاري التسجيل..." : "سجّل في الدورة"}
              </button>
            )}
            {!user && (
              <Link to="/login" className="mt-4 block w-full text-center bg-brand-700 text-white font-bold py-3 rounded-2xl">
                سجّل دخول للاشتراك
              </Link>
            )}
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>
        </div>
      </div>

      <SectionTitle title="المحاضرات" />
      <div className="px-4 space-y-2">
        {lectures.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-5 text-center text-sm text-slate-500">
            لا توجد محاضرات حتى الآن
          </div>
        )}
        {lectures.map((lec) => (
          <div key={lec.id} className="bg-white rounded-2xl shadow-card p-3 flex items-center gap-3">
            <span className="text-xs text-slate-500 w-12 text-center font-semibold">
              {lec.duration_minutes} د
            </span>
            <div className="flex-1 text-right">
              <p className="text-sm font-bold text-slate-900 leading-tight">{lec.title}</p>
              {lec.description && <p className="text-xs text-slate-500 mt-1">{lec.description}</p>}
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
              <PlayCircle className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <div className="flex items-center justify-center text-brand-700">{icon}</div>
      <p className="mt-1 text-base font-extrabold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}
