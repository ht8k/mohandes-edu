import { Bell, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Notification } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Header() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    api.listNotifications().then(setNotifications).catch(() => undefined);
  }, [user]);

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="bg-brand-800 text-white px-4 pt-5 pb-9 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-700 via-brand-800 to-brand-900 pointer-events-none" />
      <div className="absolute -top-16 -left-16 w-52 h-52 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-3">
        <Link to="/profile" className="flex items-center gap-2 no-tap-highlight">
          <img
            src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"}
            alt={user?.full_name || "ضيف"}
            className="w-10 h-10 rounded-full ring-2 ring-white/40 object-cover bg-white"
          />
          <button
            className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center ring-2 ring-brand-800">
                {unread}
              </span>
            )}
          </button>
        </Link>

        <Link to="/" className="flex items-center gap-3 no-tap-highlight">
          <div className="text-right leading-tight">
            <h1 className="text-xl font-extrabold tracking-tight">منصة المهندس</h1>
            <p className="text-xs text-white/85">التعليمية</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-700 shadow-soft">
            <GraduationCap className="w-7 h-7" strokeWidth={2.4} />
          </div>
        </Link>
      </div>
    </header>
  );
}
