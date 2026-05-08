import { BarChart3, HelpCircle, Upload, Video } from "lucide-react";
import { Link } from "react-router-dom";
import type { ComponentType } from "react";

type Action = {
  key: string;
  label: string;
  to: string;
  Icon: ComponentType<{ className?: string }>;
  bgClass: string;
  iconClass: string;
};

const ACTIONS: Action[] = [
  {
    key: "results",
    label: "نتائج الطلاب",
    to: "/profile",
    Icon: BarChart3,
    bgClass: "bg-emerald-50",
    iconClass: "text-emerald-600",
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
    key: "lectures",
    label: "محاضراتي المنشورة",
    to: "/materials",
    Icon: Video,
    bgClass: "bg-brand-50",
    iconClass: "text-brand-700",
  },
  {
    key: "upload",
    label: "رفع المحاضرات",
    to: "/upload",
    Icon: Upload,
    bgClass: "bg-sky-50",
    iconClass: "text-sky-600",
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
            <Icon className={`w-6 h-6 ${iconClass}`} />
          </div>
          <p className="text-xs font-semibold text-slate-700 leading-tight">{label}</p>
        </Link>
      ))}
    </div>
  );
}
