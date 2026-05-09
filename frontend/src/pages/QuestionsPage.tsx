import { CheckCircle2, Clock4, MessageCircleQuestion, PencilLine, Plus, Send, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { SectionTitle } from "../components/PageContainer";
import { api } from "../lib/api";
import type { Course, Question } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatRelative } from "../lib/format";

export function QuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tab, setTab] = useState<"all" | "answered" | "pending">("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [courseId, setCourseId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = () => {
    api.listQuestions().then(setQuestions).catch(() => undefined);
  };

  useEffect(() => {
    refresh();
    api.listCourses().then(setCourses).catch(() => undefined);
  }, []);

  const filtered = questions.filter((q) => {
    if (tab === "answered") return q.is_answered;
    if (tab === "pending") return !q.is_answered;
    return true;
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await api.askQuestion({
        title,
        body,
        course_id: courseId === "" ? undefined : Number(courseId),
      });
      setTitle("");
      setBody("");
      setCourseId("");
      setShowForm(false);
      refresh();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <SectionTitle
        title="أسئلة الطلاب"
        action={
          user ? (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1 text-brand-700 font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>سؤال جديد</span>
            </button>
          ) : undefined
        }
      />

      <div className="px-4 flex gap-2 mb-3">
        {(
          [
            { key: "all", label: "الكل" },
            { key: "answered", label: "تمت الإجابة" },
            { key: "pending", label: "قيد الإجابة" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === t.key ? "bg-brand-700 text-white" : "bg-white text-slate-600 shadow-card"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showForm && user && (
        <form onSubmit={handleSubmit} className="mx-4 mb-4 bg-white rounded-2xl shadow-card p-4 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان السؤال"
            className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-brand-300"
            required
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="اكتب سؤالك بالتفصيل..."
            rows={3}
            className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-brand-300"
            required
          />
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-brand-300"
          >
            <option value="">اختر المادة (اختياري)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subject} - {c.teacher.full_name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-700 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? "جاري الإرسال..." : "إرسال السؤال"}
          </button>
        </form>
      )}

      <div className="px-4 space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <MessageCircleQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">لا توجد أسئلة في هذا القسم</p>
          </div>
        )}
        {filtered.map((q) => (
          <QuestionCard key={q.id} q={q} onAnswered={refresh} />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ q, onAnswered }: { q: Question; onAnswered: () => void }) {
  const { user } = useAuth();
  const [showAnswer, setShowAnswer] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(false);
  const [answer, setAnswer] = useState(q.answer ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isTeacher = user?.role === "teacher";

  async function handleAnswer(e: FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      await api.answerQuestion(q.id, answer);
      setShowAnswer(false);
      setEditingAnswer(false);
      onAnswered();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveAnswer() {
    const ok = window.confirm("هل تريد حذف الإجابة؟");
    if (!ok) return;
    try {
      await api.unanswerQuestion(q.id);
      setAnswer("");
      setEditingAnswer(false);
      onAnswered();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-2 justify-end">
        {q.is_answered ? (
          <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            تمت الإجابة
          </span>
        ) : (
          <span className="text-amber-600 text-xs font-bold flex items-center gap-1">
            <Clock4 className="w-4 h-4" />
            قيد الإجابة
          </span>
        )}
      </div>
      <h3 className="mt-2 font-extrabold text-slate-900 text-right">{q.title}</h3>
      <p className="mt-1 text-sm text-slate-700 leading-relaxed text-right">{q.body}</p>
      <p className="mt-2 text-[11px] text-slate-400 text-right">
        {q.student.full_name} • {formatRelative(q.created_at)}
      </p>
      {q.is_answered && q.answer && !editingAnswer && (
        <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-right">
          <div className="flex items-start justify-between gap-2">
            {isTeacher && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleRemoveAnswer}
                  className="w-7 h-7 rounded-full bg-white text-red-600 flex items-center justify-center"
                  title="حذف الإجابة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setAnswer(q.answer ?? "");
                    setEditingAnswer(true);
                  }}
                  className="w-7 h-7 rounded-full bg-white text-brand-700 flex items-center justify-center"
                  title="تعديل الإجابة"
                >
                  <PencilLine className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex-1 text-sm text-slate-700">
              <p className="font-bold text-emerald-700 mb-1">الإجابة:</p>
              <p>{q.answer}</p>
            </div>
          </div>
        </div>
      )}
      {isTeacher && !q.is_answered && (
        <div className="mt-3">
          {!showAnswer ? (
            <button
              onClick={() => {
                setAnswer("");
                setShowAnswer(true);
              }}
              className="w-full bg-brand-50 text-brand-700 font-bold py-2 rounded-xl text-sm"
            >
              الإجابة على السؤال
            </button>
          ) : (
            <form onSubmit={handleAnswer} className="space-y-2">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="اكتب إجابتك..."
                rows={3}
                className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-brand-300"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnswer(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-2 rounded-xl text-sm"
                >
                  {submitting ? "جاري الإرسال..." : "إرسال الإجابة"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      {isTeacher && q.is_answered && editingAnswer && (
        <form onSubmit={handleAnswer} className="mt-3 space-y-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="اكتب إجابتك..."
            rows={3}
            className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-brand-300"
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditingAnswer(false)}
              className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-2 rounded-xl text-sm"
            >
              {submitting ? "جاري الحفظ..." : "حفظ التعديل"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
