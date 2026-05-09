import { TrendingUp, HelpCircle, Upload, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type Action = {
  key: string;
  label: string;
  to: string;
  Icon: LucideIcon;
  bgClass: string;
  iconClass: string;
};

// Cards are flex items inside a row with `dir="rtl"` on the document — first
// item appears on the right (matches the target screenshot).
const ACTIONS: Action[] = [
  {
    key: "upload",
    label: "رفع المحاضرات",
    to: "/upload",
    Icon: Upload,
    bgClass: "bg-brand-50",
    iconClass: "text-brand-700",
  },
  {
    key: "lectures",
    label: "محاضراتي المنشورة",
    to: "/materials",
    Icon: Video,
    bgClass: "bg-brand-50",
    iconClass: "text-brand-700",
  },
  {
    key: "questions",
    label: "أسئلة الطلاب",
    to: "/questions",
    Icon: HelpCircle,
    bgClass: "bg-rose-50",
    iconClass: "text-rose-600",
  },
  {
    key: "results",
    label: "نتائج الطلاب",
    to: "/profile",
    Icon: TrendingUp,
    bgClass: "bg-accent-50",
    iconClass: "text-accent-700",
  },
];

export function QuickActions() {
  return (
    <div className="px-4 mt-4 grid grid-cols-4 gap-3">
      {ACTIONS.map(({ key, label, to, Icon, bgClass, iconClass }) => (
        <Link
          key={key}
          to={to}
          className="bg-white rounded-2xl shadow-card flex flex-col items-center justify-center gap-2 px-2 py-3 text-center no-tap-highlight active:scale-95 transition-transform"
        >
          <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconClass}`} strokeWidth={2.4} />
          </div>
          <p className="text-[11px] font-bold text-slate-700 leading-tight">{label}</p>
        </Link>
      ))}
    </div>
  );
}
