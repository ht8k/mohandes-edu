import { useEffect, useState } from "react";
import { CourseCard } from "../components/CourseCard";
import { SearchBar } from "../components/SearchBar";
import { SectionTitle } from "../components/PageContainer";
import { api } from "../lib/api";
import type { Course } from "../lib/api";

export function MaterialsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listCourses().then(setCourses).catch(() => undefined);
  }, []);

  const filtered = search
    ? courses.filter((c) => c.title.includes(search) || c.subject.includes(search))
    : courses;

  return (
    <div>
      <SearchBar onChange={setSearch} placeholder="ابحث عن مواد..." />
      <SectionTitle title="جميع المواد" />
      <div className="px-4 space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6 text-center text-sm text-slate-500">
            لا توجد مواد متاحة حالياً
          </div>
        )}
        {filtered.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
}
