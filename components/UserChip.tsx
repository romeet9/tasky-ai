"use client";

import { getAvatarColor, getInitials } from "@/lib/avatar";

interface UserChipProps {
  name: string;
  size?: "sm" | "md";
  // Optional prefix label, e.g. "Assigned to" / "by".
  label?: string;
  className?: string;
}

// Small initials avatar + name, used for "assigned to / by" chips and the
// manager view's per-assignee group headers.
export default function UserChip({ name, size = "sm", label, className = "" }: UserChipProps) {
  const dim = size === "sm" ? "h-4 w-4 text-[8px]" : "h-6 w-6 text-[10px]";
  const text = size === "sm" ? "text-[11px]" : "text-[13px]";
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {label && <span className="text-[11px] text-[#6a6b6c]">{label}</span>}
      <span
        className={`flex ${dim} shrink-0 items-center justify-center rounded-full font-semibold text-white`}
        style={{ background: getAvatarColor(name) }}
      >
        {getInitials(name)}
      </span>
      <span className={`${text} text-[#cecece] truncate`}>{name}</span>
    </span>
  );
}
