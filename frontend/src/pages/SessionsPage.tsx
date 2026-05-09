import { useEffect, useState } from "react";
import { ScheduleList } from "../components/ScheduleList";
import { SectionTitle } from "../components/PageContainer";
import { api } from "../lib/api";
import type { ScheduleItem } from "../lib/api";

export function SessionsPage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    api.listSchedule().then(setItems).catch(() => undefined);
  }, []);

  const today = new Date();
  const todayItems = items.filter((i) => isSameDay(new Date(i.starts_at), today));
  const futureItems = items.filter((i) => !isSameDay(new Date(i.starts_at), today) && new Date(i.starts_at) > today);

  return (
    <div>
      <SectionTitle title="جلسات اليوم" />
      <div className="px-4">
        <ScheduleList items={todayItems} />
      </div>

      <SectionTitle title="الجلسات القادمة" />
      <div className="px-4">
        <ScheduleList items={futureItems} />
      </div>
    </div>
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
