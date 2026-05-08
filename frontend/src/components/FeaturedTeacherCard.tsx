import { Star } from "lucide-react";
import type { User } from "../lib/api";
import { formatCount } from "../lib/format";

interface Props {
  teacher: User;
  subjectLabel?: string;
}

export function FeaturedTeacherCard({ teacher, subjectLabel }: Props) {
  return (
    <div className="bg-gradient-to-l from-accent-600 to-accent-700 text-white rounded-3xl shadow-soft p-5 flex items-stretch gap-4 overflow-hidden relative">
      <div className="absolute -bottom-10 -left-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex-1 text-right space-y-2 relative">
        <h3 className="text-xl font-extrabold leading-tight">{teacher.full_name}</h3>
        <p className="text-sm text-white/90 leading-snug">
          {subjectLabel || teacher.bio || "أستاذ متميز على المنصة"}
        </p>
        <div className="flex items-center justify-end gap-2 pt-1">
          <span className="bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1">
            <span>({formatCount(teacher.students_count)}+ طلاب)</span>
            <span>-</span>
            <span className="flex items-center gap-1">
              {teacher.rating.toFixed(1)}
              <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
            </span>
          </span>
        </div>
      </div>
      <div className="shrink-0 self-end">
        <img
          src={teacher.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher"}
          alt={teacher.full_name}
          className="w-28 h-32 object-cover rounded-2xl bg-white/20"
        />
      </div>
    </div>
  );
}
