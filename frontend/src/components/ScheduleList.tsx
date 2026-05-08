import { MoreHorizontal } from "lucide-react";
import type { ScheduleItem } from "../lib/api";
import { formatTime } from "../lib/format";

export function ScheduleList({ items }: { items: ScheduleItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-5 text-center text-sm text-slate-500">
        لا توجد محاضرات قادمة
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ScheduleRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function ScheduleRow({ item }: { item: ScheduleItem }) {
  const start = new Date(item.starts_at);
  const end = new Date(item.ends_at);
  return (
    <div className="bg-white rounded-2xl shadow-card p-3 flex items-center gap-3">
      <button className="w-8 h-8 rounded-full text-slate-400 flex items-center justify-center" aria-label="المزيد">
        <MoreHorizontal className="w-5 h-5" />
      </button>
      <div className="flex-1 text-right">
        <p className="text-sm font-bold text-slate-900 leading-tight">{item.title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {formatTime(start)} - {formatTime(end)} : {item.teacher_name}
        </p>
      </div>
      <img
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher"
        alt={item.teacher_name}
        className="w-11 h-11 rounded-full object-cover bg-slate-100"
      />
    </div>
  );
}
