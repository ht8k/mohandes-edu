import { Star } from "lucide-react";
import type { User } from "../lib/api";
import { formatCount } from "../lib/format";

interface Props {
  teacher: User;
  subjectLabel?: string;
}

export function FeaturedTeacherCard({ teacher, subjectLabel }: Props) {
  return (
    <div className="bg-gradient-to-l from-accent-600 to-accent-800 text-white rounded-3xl shadow-soft overflow-hidden relative">
      <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -top-10 right-10 w-36 h-36 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-stretch gap-3 p-4">
        <div className="flex-1 text-right space-y-2 relative py-1">
          <h3 className="text-xl font-extrabold leading-tight">{teacher.full_name}</h3>
          <p className="text-sm text-white/90 leading-snug">
            {subjectLabel || teacher.bio || "أستاذ متميز على المنصة"}
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 text-sm font-bold">
            <span className="text-white/90">({formatCount(teacher.students_count)}+ طالب)</span>
            <span className="text-white/60">-</span>
            <span className="flex items-center gap-1">
              <span>{teacher.rating.toFixed(1)}</span>
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            </span>
          </div>
        </div>
        <div className="shrink-0 self-end -mb-1">
          <img
            src={teacher.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher"}
            alt={teacher.full_name}
            className="w-32 h-36 object-cover rounded-2xl bg-white/20 ring-1 ring-white/20"
          />
        </div>
      </div>
    </div>
  );
}
