import { ArrowRight, Upload } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SectionTitle } from "../components/PageContainer";
import { api } from "../lib/api";
import type { Course } from "../lib/api";
import { useAuth } from "../lib/auth";

export function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "teacher") return;
    api
      .listCourses({ teacher_id: user.id })
      .then((rows) => {
        setCourses(rows);
        if (rows.length > 0) setCourseId(rows[0].id);
      })
      .catch(() => undefined);
  }, [user]);

  if (!user) {
    return (
      <div className="px-4 mt-8 text-center">
        <div className="bg-white rounded-3xl shadow-card p-6">
          <p className="text-sm text-slate-600">سجّل دخولك للوصول إلى رفع المحاضرات</p>
          <Link to="/login" className="mt-4 inline-block bg-brand-700 text-white font-bold px-6 py-2 rounded-xl">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "teacher") {
    return (
      <div className="px-4 mt-8 text-center">
        <div className="bg-white rounded-3xl shadow-card p-6">
          <p className="text-sm text-slate-600">هذه الصفحة متاحة للأساتذة فقط</p>
          <Link to="/" className="mt-4 inline-block bg-brand-700 text-white font-bold px-6 py-2 rounded-xl">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (courseId === "") return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await api.createLecture({
        title,
        description,
        duration_minutes: duration,
        course_id: Number(courseId),
      });
      setSuccess(true);
      setTitle("");
      setDescription("");
      setDuration(60);
      setTimeout(() => navigate(`/courses/${courseId}`), 1200);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="px-4 pt-4 flex items-center gap-2">
        <Link to="/" className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center text-slate-600">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <span className="text-sm font-semibold text-slate-700">رفع محاضرة</span>
      </div>
      <SectionTitle title="رفع محاضرة جديدة" />

      <form onSubmit={handleSubmit} className="mx-4 bg-white rounded-3xl shadow-card p-5 space-y-3">
        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">المادة</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value === "" ? "" : Number(e.target.value))}
            required
            className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-400"
          >
            {courses.length === 0 && <option value="">لا توجد مواد</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">عنوان المحاضرة</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">المدة (دقائق)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            required
            className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-400"
          />
        </div>

        {error && <p className="text-xs text-red-600 text-right">{error}</p>}
        {success && <p className="text-xs text-emerald-600 text-right">تم رفع المحاضرة بنجاح!</p>}

        <button
          type="submit"
          disabled={submitting || courses.length === 0}
          className="w-full bg-brand-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          {submitting ? "جاري الرفع..." : "رفع المحاضرة"}
        </button>
      </form>
    </div>
  );
}
