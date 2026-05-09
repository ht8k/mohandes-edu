import { GraduationCap, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MobileFrame } from "../components/MobileFrame";
import { useAuth } from "../lib/auth";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ full_name: fullName, email, password, role });
      navigate("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileFrame>
      <div className="bg-gradient-to-b from-brand-800 to-brand-700 text-white p-6 pt-10 pb-20 relative">
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white text-brand-700 flex items-center justify-center shadow-soft">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold">إنشاء حساب جديد</h1>
          <p className="text-white/80 text-sm">انضم إلى منصة المهندس التعليمية</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-4 -mt-12 bg-white rounded-3xl shadow-soft p-5 space-y-3 relative"
      >
        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">الاسم الكامل</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-400"
            placeholder="محمد علي"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-400"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-400"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">نوع الحساب</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`py-2 rounded-xl text-sm font-bold transition-colors ${
                role === "student" ? "bg-brand-700 text-white" : "bg-slate-50 text-slate-700"
              }`}
            >
              طالب
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`py-2 rounded-xl text-sm font-bold transition-colors ${
                role === "teacher" ? "bg-brand-700 text-white" : "bg-slate-50 text-slate-700"
              }`}
            >
              أستاذ
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 text-right">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="text-brand-700 font-bold">
            سجّل الدخول
          </Link>
        </p>
      </form>
    </MobileFrame>
  );
}
