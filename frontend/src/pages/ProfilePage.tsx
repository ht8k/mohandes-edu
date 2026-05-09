import { Award, BookOpen, GraduationCap, LogIn, LogOut, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionTitle } from "../components/PageContainer";
import { api } from "../lib/api";
import type { Enrollment } from "../lib/api";
import { useAuth } from "../lib/auth";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (!user || user.role !== "student") return;
    api.myEnrollments().then(setEnrollments).catch(() => undefined);
  }, [user]);

  if (!user) {
    return (
      <div className="px-4 mt-8 text-center space-y-4">
        <div className="bg-white rounded-3xl shadow-card p-8">
          <GraduationCap className="w-12 h-12 text-brand-700 mx-auto mb-3" />
          <h2 className="text-lg font-extrabold text-slate-900">مرحباً بك في منصة المهندس</h2>
          <p className="mt-2 text-sm text-slate-600">
            سجّل دخولك للوصول إلى دوراتك وأسئلتك ونتائجك
          </p>
          <Link
            to="/login"
            className="mt-5 inline-flex items-center gap-2 bg-brand-700 text-white font-bold px-6 py-3 rounded-2xl"
          >
            <LogIn className="w-5 h-5" />
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const avgScore =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + e.score, 0) / enrollments.length)
      : 0;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
      : 0;

  return (
    <div>
      <div className="px-4 mt-4">
        <div className="bg-white rounded-3xl shadow-card p-5 flex items-center gap-4">
          <img
            src={user.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
            alt={user.full_name}
            className="w-16 h-16 rounded-full bg-slate-100 object-cover"
          />
          <div className="flex-1 text-right">
            <h2 className="text-lg font-extrabold text-slate-900">{user.full_name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="mt-1 inline-block bg-brand-50 text-brand-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {user.role === "teacher" ? "أستاذ" : "طالب"}
            </span>
          </div>
        </div>
      </div>

      {user.role === "student" && (
        <>
          <SectionTitle title="نتائج الطلاب" />
          <div className="px-4 grid grid-cols-3 gap-3">
            <StatCard label="الدورات" value={String(enrollments.length)} icon={<BookOpen className="w-5 h-5 text-brand-700" />} />
            <StatCard label="نسبة التقدم" value={`${avgProgress}%`} icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} />
            <StatCard label="المعدل" value={`${avgScore}%`} icon={<Award className="w-5 h-5 text-amber-500" />} />
          </div>

          <SectionTitle title="دوراتي" />
          <div className="px-4 space-y-3">
            {enrollments.length === 0 && (
              <div className="bg-white rounded-2xl shadow-card p-5 text-center text-sm text-slate-500">
                لم تسجّل في أي دورة بعد
              </div>
            )}
            {enrollments.map((en) => (
              <Link
                key={en.id}
                to={`/courses/${en.course.id}`}
                className="block bg-white rounded-2xl shadow-card p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600">{en.score}%</span>
                  <h3 className="text-sm font-bold text-slate-900 text-right">{en.course.title}</h3>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-brand-500 to-brand-700 rounded-full"
                    style={{ width: `${en.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 text-right">تقدّم: {en.progress}%</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {user.role === "teacher" && (
        <>
          <SectionTitle title="إحصائيات الأستاذ" />
          <div className="px-4 grid grid-cols-3 gap-3">
            <StatCard label="الطلاب" value={String(user.students_count)} icon={<BookOpen className="w-5 h-5 text-brand-700" />} />
            <StatCard label="التقييم" value={user.rating.toFixed(1)} icon={<Star className="w-5 h-5 text-amber-500" />} />
            <StatCard label="الجودة" value="ممتاز" icon={<Award className="w-5 h-5 text-emerald-600" />} />
          </div>
        </>
      )}

      <div className="px-4 mt-6 mb-4">
        <button
          onClick={logout}
          className="w-full bg-white shadow-card text-red-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-3 text-center">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-1 text-base font-extrabold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}
