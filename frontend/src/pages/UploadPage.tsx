import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  PencilLine,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionTitle } from "../components/PageContainer";
import { api } from "../lib/api";
import type { Course, Lecture } from "../lib/api";
import { useAuth } from "../lib/auth";

export function UploadPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturesByCourse, setLecturesByCourse] = useState<Record<number, Lecture[]>>({});
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const refresh = async (teacherId: number) => {
    try {
      const rows = await api.listCourses({ teacher_id: teacherId });
      setCourses(rows);
      const byCourse: Record<number, Lecture[]> = {};
      await Promise.all(
        rows.map(async (c) => {
          byCourse[c.id] = await api.listLectures({ course_id: c.id });
        }),
      );
      setLecturesByCourse(byCourse);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    if (user && user.role === "teacher") {
      refresh(user.id);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="px-4 mt-8 text-center">
        <div className="bg-white rounded-3xl shadow-card p-6">
          <p className="text-sm text-slate-600">سجّل دخولك للوصول إلى لوحة الأستاذ</p>
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

  async function handleDeleteCourse(course: Course) {
    if (!user) return;
    const ok = window.confirm(`هل تريد حذف كورس "${course.title}" مع جميع محاضراته؟`);
    if (!ok) return;
    try {
      await api.deleteCourse(course.id);
      setInfo("تم حذف الكورس");
      await refresh(user.id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDeleteLecture(lecture: Lecture) {
    if (!user) return;
    const ok = window.confirm(`هل تريد حذف محاضرة "${lecture.title}"؟`);
    if (!ok) return;
    try {
      await api.deleteLecture(lecture.id);
      setInfo("تم حذف المحاضرة");
      await refresh(user.id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="px-4 pt-4 flex items-center gap-2">
        <Link to="/" className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center text-slate-600">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <span className="text-sm font-semibold text-slate-700">لوحة الأستاذ</span>
      </div>

      <SectionTitle
        title="إدارة الكورسات"
        action={
          <button
            onClick={() => setShowNewCourse((v) => !v)}
            className="flex items-center gap-1 text-brand-700 font-semibold"
          >
            {showNewCourse ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showNewCourse ? "إلغاء" : "إضافة كورس"}</span>
          </button>
        }
      />

      {error && (
        <div className="mx-4 mb-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2 text-right">
          {error}
        </div>
      )}
      {info && (
        <div className="mx-4 mb-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl px-3 py-2 text-right">
          {info}
        </div>
      )}

      {showNewCourse && (
        <NewCourseForm
          onCancel={() => setShowNewCourse(false)}
          onCreated={async () => {
            setShowNewCourse(false);
            setInfo("تم إنشاء الكورس");
            if (user) await refresh(user.id);
          }}
          onError={setError}
        />
      )}

      <div className="px-4 space-y-3 mt-2">
        {courses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-5 text-center text-sm text-slate-500">
            لا تملك كورسات بعد. اضغط "إضافة كورس" لتبدأ.
          </div>
        )}
        {courses.map((c) => {
          const isExpanded = expandedCourseId === c.id;
          const isEditing = editingCourseId === c.id;
          const lectures = lecturesByCourse[c.id] ?? [];
          return (
            <div key={c.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteCourse(c)}
                      className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center"
                      title="حذف الكورس"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCourseId(isEditing ? null : c.id)}
                      className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center"
                      title="تعديل الكورس"
                    >
                      <PencilLine className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate">{c.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {c.subject} • {c.grade}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {c.lessons_count} محاضرة • {c.hours_count} ساعة
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <EditCourseForm
                    course={c}
                    onCancel={() => setEditingCourseId(null)}
                    onSaved={async () => {
                      setEditingCourseId(null);
                      setInfo("تم حفظ التعديلات");
                      if (user) await refresh(user.id);
                    }}
                    onError={setError}
                  />
                )}

                <button
                  onClick={() => setExpandedCourseId(isExpanded ? null : c.id)}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-brand-700 font-bold py-2 bg-brand-50 rounded-xl"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {isExpanded ? "إخفاء المحاضرات" : `إدارة المحاضرات (${lectures.length})`}
                </button>
              </div>

              {isExpanded && (
                <div className="bg-slate-50 px-3 py-3 space-y-2 border-t border-slate-100">
                  {lectures.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-2">لا توجد محاضرات في هذا الكورس</p>
                  )}
                  {lectures.map((lec) => (
                    <LectureRow
                      key={lec.id}
                      lecture={lec}
                      onDeleted={async () => {
                        await handleDeleteLecture(lec);
                      }}
                      onSaved={async () => {
                        setInfo("تم حفظ التعديلات");
                        if (user) await refresh(user.id);
                      }}
                      onError={setError}
                    />
                  ))}

                  <NewLectureForm
                    courseId={c.id}
                    onCreated={async () => {
                      setInfo("تم رفع المحاضرة");
                      if (user) await refresh(user.id);
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

function NewCourseForm({
  onCancel,
  onCreated,
  onError,
}: {
  onCancel: () => void;
  onCreated: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("السادس العلمي");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createCourse({
        title: title.trim(),
        subject: subject.trim(),
        grade: grade.trim(),
        description: description.trim() || undefined,
        cover_url: coverUrl.trim() || undefined,
      });
      await onCreated();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-4 bg-white rounded-2xl shadow-card p-4 space-y-2 mb-3">
      <Field label="عنوان الكورس">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={INPUT_CLASS} />
      </Field>
      <Field label="المادة">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="مثال: فيزياء"
          required
          className={INPUT_CLASS}
        />
      </Field>
      <Field label="المرحلة">
        <input value={grade} onChange={(e) => setGrade(e.target.value)} required className={INPUT_CLASS} />
      </Field>
      <Field label="الوصف">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={INPUT_CLASS} />
      </Field>
      <Field label="رابط صورة الغلاف (اختياري)">
        <input
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://..."
          className={INPUT_CLASS}
        />
      </Field>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-sm"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-brand-700 disabled:bg-slate-300 text-white font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {submitting ? "جاري الإنشاء..." : "إنشاء"}
        </button>
      </div>
    </form>
  );
}

function EditCourseForm({
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
  const [grade, setGrade] = useState(course.grade);
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
        grade: grade.trim(),
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
      <Field label="عنوان الكورس">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={INPUT_CLASS} />
      </Field>
      <Field label="المادة">
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required className={INPUT_CLASS} />
      </Field>
      <Field label="المرحلة">
        <input value={grade} onChange={(e) => setGrade(e.target.value)} required className={INPUT_CLASS} />
      </Field>
      <Field label="الوصف">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={INPUT_CLASS} />
      </Field>
      <Field label="رابط صورة الغلاف">
        <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className={INPUT_CLASS} />
      </Field>
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

function LectureRow({
  lecture,
  onDeleted,
  onSaved,
  onError,
}: {
  lecture: Lecture;
  onDeleted: () => Promise<void>;
  onSaved: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lecture.title);
  const [description, setDescription] = useState(lecture.description ?? "");
  const [duration, setDuration] = useState(lecture.duration_minutes);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(lecture.title);
    setDescription(lecture.description ?? "");
    setDuration(lecture.duration_minutes);
  }, [lecture]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateLecture(lecture.id, {
        title: title.trim(),
        description: description.trim() || null,
        duration_minutes: duration,
      });
      setEditing(false);
      await onSaved();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onDeleted}
            className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditing((v) => !v)}
            className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center"
            title="تعديل"
          >
            <PencilLine className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 text-right min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{lecture.title}</p>
          {lecture.description && (
            <p className="text-[11px] text-slate-500 truncate">{lecture.description}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-0.5">{lecture.duration_minutes} دقيقة</p>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="mt-3 space-y-2 bg-slate-50 rounded-xl p-3">
          <Field label="عنوان المحاضرة">
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={INPUT_CLASS} />
          </Field>
          <Field label="الوصف">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={INPUT_CLASS} />
          </Field>
          <Field label="المدة (دقائق)">
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
              className={INPUT_CLASS}
            />
          </Field>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEditing(false)}
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
      )}
    </div>
  );
}

function NewLectureForm({
  courseId,
  onCreated,
  onError,
}: {
  courseId: number;
  onCreated: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createLecture({
        title: title.trim(),
        description: description.trim() || undefined,
        duration_minutes: duration,
        course_id: courseId,
      });
      setTitle("");
      setDescription("");
      setDuration(60);
      setOpen(false);
      await onCreated();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-white border border-dashed border-brand-300 text-brand-700 text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1"
      >
        <Plus className="w-4 h-4" />
        إضافة محاضرة جديدة
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-3 space-y-2">
      <Field label="عنوان المحاضرة">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={INPUT_CLASS} />
      </Field>
      <Field label="الوصف">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={INPUT_CLASS} />
      </Field>
      <Field label="المدة (دقائق)">
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
          className={INPUT_CLASS}
        />
      </Field>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-sm"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-brand-700 disabled:bg-slate-300 text-white font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-1"
        >
          <Upload className="w-4 h-4" />
          {submitting ? "جاري الرفع..." : "رفع"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-slate-600 block mb-1 text-right">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLASS =
  "w-full bg-white rounded-xl px-3 py-2 text-sm outline-none border border-slate-200 focus:border-brand-400";
