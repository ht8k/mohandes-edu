import { GraduationCap, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MobileFrame } from "../components/MobileFrame";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role: "student" | "teacher") {
    setEmail(role === "teacher" ? "ahmed@mohandes.edu" : "student@mohandes.edu");
    setPassword("password123");
  }

  return (
    <MobileFrame>
      <div className="bg-gradient-to-b from-brand-800 to-brand-700 text-white p-6 pt-10 pb-20 relative">
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-10 w-48 h-48 bg-brand-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white text-brand-700 flex items-center justify-center shadow-soft">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold">منصة المهندس التعليمية</h1>
          <p className="text-white/80 text-sm">سجل دخولك للوصول إلى دوراتك</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-4 -mt-12 bg-white rounded-3xl shadow-soft p-5 space-y-3 relative"
      >
        <h2 className="text-lg font-extrabold text-slate-900 text-right">تسجيل الدخول</h2>

        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-400"
            placeholder="example@mohandes.edu"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 block mb-1 text-right">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-400"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-xs text-red-600 text-right">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => fillDemo("student")}
            className="bg-slate-50 text-slate-700 text-xs font-bold py-2 rounded-xl"
          >
            تجربة كطالب
          </button>
          <button
            type="button"
            onClick={() => fillDemo("teacher")}
            className="bg-slate-50 text-slate-700 text-xs font-bold py-2 rounded-xl"
          >
            تجربة كأستاذ
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 pt-2">
          ليس لديك حساب؟{" "}
          <Link to="/register" className="text-brand-700 font-bold">
            أنشئ حساباً
          </Link>
        </p>
      </form>
    </MobileFrame>
  );
}
