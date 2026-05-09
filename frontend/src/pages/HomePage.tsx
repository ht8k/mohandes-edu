import { useEffect, useState } from "react";
import { CourseCard } from "../components/CourseCard";
import { FeaturedTeacherCard } from "../components/FeaturedTeacherCard";
import { QuickActions } from "../components/QuickActions";
import { ScheduleList } from "../components/ScheduleList";
import { SearchBar } from "../components/SearchBar";
import { SectionTitle } from "../components/PageContainer";
import { api } from "../lib/api";
import type { Course, ScheduleItem, User } from "../lib/api";

export function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredTeacher, setFeaturedTeacher] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listCourses().then(setCourses).catch(() => undefined);
    api
      .listTeachers()
      .then((teachers) => setFeaturedTeacher(teachers[0] || null))
      .catch(() => undefined);
    api.listSchedule().then(setSchedule).catch(() => undefined);
  }, []);

  const filteredCourses = search
    ? courses.filter(
        (c) =>
          c.title.includes(search) ||
          c.subject.includes(search) ||
          c.teacher.full_name.includes(search),
      )
    : courses;

  const featuredCourse = filteredCourses.find((c) => c.is_featured) || filteredCourses[0];

  return (
    <div className="space-y-6">
      <SearchBar onChange={setSearch} />
      <QuickActions />

      <div>
        <SectionTitle title="الأستاذ المتميز" />
        <div className="px-4">
          {featuredTeacher ? (
            <FeaturedTeacherCard teacher={featuredTeacher} subjectLabel={featuredTeacher.bio || undefined} />
          ) : (
            <div className="bg-white rounded-3xl shadow-card h-32 animate-pulse" />
          )}
        </div>
      </div>

      {featuredCourse && (
        <div className="px-4">
          <CourseCard course={featuredCourse} />
        </div>
      )}

      <div>
        <SectionTitle
          title="جدول المحاضرات القادمة"
          action={<span className="text-brand-600">التالية</span>}
        />
        <div className="px-4">
          <ScheduleList items={schedule.slice(0, 4)} />
        </div>
      </div>

      {filteredCourses.length > 1 && (
        <div>
          <SectionTitle title="جميع المواد" />
          <div className="px-4 space-y-3">
            {filteredCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
