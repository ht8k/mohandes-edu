import {
  ArrowRight,
  BookOpen,
  Clock,
  PencilLine,
  PlayCircle,
  Save,
  Settings,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
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
  const [info, setInfo] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState<number | null>(null);

  const isOwner =
    !!user && user.role === "teacher" && !!course && course.teacher_id === user.id;

  const reloadLectures = async (courseId: number) => {
    const rows = await api.listLectures({ course_id: courseId });
    setLectures(rows);
  };

  const reloadCourse = async (courseId: number) => {
    const c = await api.getCourse(courseId);
    setCourse(c);
  };

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

  async function handleDeleteCourse() {
    if (!course) return;
    const ok = window.confirm(`هل تريد حذف كورس "${course.title}" مع جميع محاضراته؟`);
    if (!ok) return;
    try {
      await api.deleteCourse(course.id);
      navigate("/upload");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDeleteLecture(lecture: Lecture) {
    if (!course) return;
    const ok = window.confirm(`هل تريد حذف محاضرة "${lecture.title}"؟`);
    if (!ok) return;
    try {
      await api.deleteLecture(lecture.id);
      setInfo("تم حذف المحاضرة");
      await reloadLectures(course.id);
      await reloadCourse(course.id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

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
            <div className="flex items-start justify-between gap-2">
              {isOwner && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDeleteCourse}
                    className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center"
                    title="حذف الكورس"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingCourse((v) => !v)}
                    className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center"
                    title="تعديل الكورس"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              )}
              <h1 className="flex-1 text-lg font-extrabold text-slate-900 leading-tight">{course.title}</h1>
            </div>
            <p className="mt-2 text-sm text-slate-600">{course.teacher.full_name}</p>
            {course.description && (
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{course.description}</p>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="درس" value={String(course.lessons_count)} icon={<BookOpen className="w-4 h-4" />} />
              <Stat label="ساعة" value={String(course.hours_count)} icon={<Clock className="w-4 h-4" />} />
              <Stat label="مشاهدة" value={formatCount(course.views_count)} icon={<Users className="w-4 h-4" />} />
            </div>

            {isOwner && editingCourse && (
              <EditCourseInline
                course={course}
                onCancel={() => setEditingCourse(false)}
                onSaved={async () => {
                  setEditingCourse(false);
                  setInfo("تم حفظ التعديلات");
                  await reloadCourse(course.id);
                }}
                onError={setError}
              />
            )}

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
            {error && <p className="mt-2 text-xs text-red-600 text-right">{error}</p>}
            {info && <p className="mt-2 text-xs text-emerald-600 text-right">{info}</p>}
          </div>
        </div>
      </div>

      <SectionTitle
        title="المحاضرات"
        action={
          isOwner ? (
            <Link to="/upload" className="text-brand-700 font-semibold">
              إدارة الكل
            </Link>
          ) : undefined
        }
      />
      <div className="px-4 space-y-2">
        {lectures.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-5 text-center text-sm text-slate-500">
            لا توجد محاضرات حتى الآن
          </div>
        )}
        {lectures.map((lec) => {
          const isEditingLec = editingLectureId === lec.id;
          return (
            <div key={lec.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="p-3 flex items-center gap-3">
                <span className="text-xs text-slate-500 w-12 text-center font-semibold">
                  {lec.duration_minutes} د
                </span>
                <div className="flex-1 text-right">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{lec.title}</p>
                  {lec.description && <p className="text-xs text-slate-500 mt-1">{lec.description}</p>}
                </div>
                {isOwner ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteLecture(lec)}
                      className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingLectureId(isEditingLec ? null : lec.id)}
                      className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center"
                      title="تعديل"
                    >
                      <PencilLine className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                )}
              </div>
              {isOwner && isEditingLec && (
                <div className="px-3 pb-3">
                  <EditLectureInline
                    lecture={lec}
                    onCancel={() => setEditingLectureId(null)}
                    onSaved={async () => {
                      setEditingLectureId(null);
                      setInfo("تم حفظ التعديلات");
                      await reloadLectures(course.id);
                      await reloadCourse(course.id);
                    }}
                    onError={setError}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditCourseInline({
  course,
  onCancel,
  onSaved,
  onError,
}: {
  course: Course;
  onCancel: () => void;
  onSaved: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState(course.title);
  const [subject, setSubject] = useState(course.subject);
  const [description, setDescription] = useState(course.description ?? "");
  const [coverUrl, setCoverUrl] = useState(course.cover_url ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateCourse(course.id, {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim() || null,
        cover_url: coverUrl.trim() || null,
      });
      await onSaved();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 bg-slate-50 rounded-xl p-3">
      <InlineField label="عنوان الكورس">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={INLINE_INPUT_CLASS} />
      </InlineField>
      <InlineField label="المادة">
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required className={INLINE_INPUT_CLASS} />
      </InlineField>
      <InlineField label="الوصف">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={INLINE_INPUT_CLASS} />
      </InlineField>
      <InlineField label="رابط صورة الغلاف">
        <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className={INLINE_INPUT_CLASS} />
      </InlineField>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white text-slate-600 font-bold py-2 rounded-xl text-sm"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-1"
        >
          <Save className="w-4 h-4" />
          {submitting ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </form>
  );
}

function EditLectureInline({
  lecture,
  onCancel,
  onSaved,
  onError,
}: {
  lecture: Lecture;
  onCancel: () => void;
  onSaved: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState(lecture.title);
  const [description, setDescription] = useState(lecture.description ?? "");
  const [duration, setDuration] = useState(lecture.duration_minutes);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateLecture(lecture.id, {
        title: title.trim(),
        description: description.trim() || null,
        duration_minutes: duration,
      });
      await onSaved();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-slate-50 rounded-xl p-3">
      <InlineField label="عنوان المحاضرة">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={INLINE_INPUT_CLASS} />
      </InlineField>
      <InlineField label="الوصف">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={INLINE_INPUT_CLASS} />
      </InlineField>
      <InlineField label="المدة (دقائق)">
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
          className={INLINE_INPUT_CLASS}
        />
      </InlineField>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white text-slate-600 font-bold py-2 rounded-xl text-sm"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-1"
        >
          <Save className="w-4 h-4" />
          {submitting ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </form>
  );
}

function InlineField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-slate-600 block mb-1 text-right">{label}</label>
      {children}
    </div>
  );
}

const INLINE_INPUT_CLASS =
  "w-full bg-white rounded-xl px-3 py-2 text-sm outline-none border border-slate-200 focus:border-brand-400";

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <div className="flex items-center justify-center text-brand-700">{icon}</div>
      <p className="mt-1 text-base font-extrabold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}
