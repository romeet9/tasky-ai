export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl sm:mb-6 sm:h-16 sm:w-16"
        style={{
          background: "var(--raycast-surface)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="sm:w-8 sm:h-8">
          <rect x="4" y="6" width="24" height="22" rx="3" stroke="#9c9c9d" strokeWidth="1.5" fill="none"/>
          <line x1="10" y1="13" x2="22" y2="13" stroke="#9c9c9d" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="18" x2="18" y2="18" stroke="#9c9c9d" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="23" x2="15" y2="23" stroke="#9c9c9d" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="text-[18px] font-medium leading-tight text-raycast-white sm:text-[22px]" style={{ letterSpacing: "0px" }}>
        No tasks yet
      </h3>
      <p className="mt-2 max-w-sm px-4 text-[14px] leading-relaxed text-raycast-medium-gray" style={{ letterSpacing: "0.2px" }}>
        Share your morning brief above to get started.
      </p>
    </div>
  );
}
