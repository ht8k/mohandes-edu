import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-slate-50 shadow-2xl shadow-slate-300/40 relative flex flex-col">
        {children}
      </div>
    </div>
  );
}
