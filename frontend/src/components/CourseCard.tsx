import { ClipboardList, Eye, MessageSquare, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "../lib/api";
import { formatCount } from "../lib/format";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="block bg-white rounded-3xl shadow-card no-tap-highlight active:scale-[0.99] transition-transform overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">{course.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{course.teacher.full_name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {course.lessons_count} دروس • {course.hours_count} ساعة
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-sm font-bold text-slate-900">{course.rating.toFixed(1)}</span>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          <div className="shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              {course.cover_url ? (
                <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <ClipboardList className="w-8 h-8 text-slate-400" />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 text-center">
        <Stat icon={<Users className="w-4 h-4 text-slate-500" />} value={formatCount(course.views_count > 100 ? course.views_count / 4 : course.views_count)} label="حاضناً" />
        <Stat icon={<Eye className="w-4 h-4 text-slate-500" />} value={formatCount(course.views_count)} label="مشاهدة" />
        <Stat icon={<MessageSquare className="w-4 h-4 text-slate-500" />} value={String(course.questions_answered)} label="أسئلة تم الإجابة عليها" />
      </div>
    </Link>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="py-3 px-2">
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-base font-extrabold text-slate-900">{value}</span>
        {icon}
      </div>
      <p className="text-[11px] text-slate-500 mt-1 leading-tight">{label}</p>
    </div>
  );
}
