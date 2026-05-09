import { CalendarDays, FolderOpen, Home, MessageCircleQuestion, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

type Tab = {
  to: string;
  label: string;
  Icon: LucideIcon;
  end?: boolean;
};

// Order is right-to-left in RTL: first item visually appears on the right
// (matches the target screenshot where "الرئيسية" is on the far right).
const TABS: Tab[] = [
  { to: "/", label: "الرئيسية", Icon: Home, end: true },
  { to: "/materials", label: "المواد", Icon: FolderOpen },
  { to: "/questions", label: "الأسئلة", Icon: MessageCircleQuestion },
  { to: "/sessions", label: "الجلسات", Icon: CalendarDays },
  { to: "/profile", label: "البروفايل", Icon: User },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-slate-200 px-2 pt-2 pb-3 shadow-[0_-4px_14px_-4px_rgba(0,0,0,0.08)]">
      <ul className="grid grid-cols-5 gap-1">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 rounded-xl no-tap-highlight ${
                  isActive ? "text-brand-700" : "text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.6 : 2} />
                  <span className={`text-[11px] ${isActive ? "font-extrabold" : "font-semibold"}`}>
                    {label}
                  </span>
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
