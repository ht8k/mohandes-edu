import { BookOpen, FolderOpen, Home, MessageCircleQuestion, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { ComponentType } from "react";

type Tab = {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  end?: boolean;
};

const TABS: Tab[] = [
  { to: "/profile", label: "البروفايل", Icon: User },
  { to: "/sessions", label: "الجلسات", Icon: BookOpen },
  { to: "/questions", label: "الأسئلة", Icon: MessageCircleQuestion },
  { to: "/materials", label: "المواد", Icon: FolderOpen },
  { to: "/", label: "الرئيسية", Icon: Home, end: true },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-2 pt-2 pb-3">
      <ul className="grid grid-cols-5 gap-1">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 rounded-xl no-tap-highlight ${
                  isActive ? "text-brand-700" : "text-slate-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  <span className="text-[11px] font-semibold">{label}</span>
                  <span
                    className={`h-1 w-6 rounded-full ${isActive ? "bg-brand-700" : "bg-transparent"}`}
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
