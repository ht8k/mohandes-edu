import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface Props {
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function SearchBar({ placeholder = "ابحث عن محاضرات، دروس، أساتذة...", onChange }: Props) {
  const [value, setValue] = useState("");
  return (
    <div className="px-4 -mt-7 relative z-10">
      <div className="bg-white rounded-2xl shadow-soft flex items-center gap-2 p-2 pl-3">
        <button
          type="button"
          className="w-11 h-11 rounded-xl bg-accent-500 text-white flex items-center justify-center shrink-0 shadow-card"
          aria-label="فلتر البحث"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              onChange?.(e.target.value);
            }}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 text-right"
          />
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );
}
