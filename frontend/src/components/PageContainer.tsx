import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="flex-1 pb-6 overflow-y-auto scrollbar-thin">{children}</div>;
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 mt-6 mb-3">
      <div className="text-sm text-brand-700 font-semibold cursor-pointer">{action}</div>
      <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
    </div>
  );
}
