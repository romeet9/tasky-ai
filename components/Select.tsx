"use client";

// Custom dropdown that replaces native <select> everywhere in the app. Native
// selects render their option list via the OS, so they can't match the Raycast
// dark theme (wrong colors, padding, and fonts). This renders the menu into a
// body portal positioned from the trigger's rect, so it's never clipped by a
// card's `overflow-hidden` and floats above everything with consistent styling.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  align?: "left" | "right";
  variant?: "pill" | "field";
  size?: "sm" | "md";
  placeholder?: string;
  ariaLabel?: string;
  // Extra classes for the trigger (e.g. a max-width).
  className?: string;
  // Custom trigger content (e.g. an avatar). When set, the default pill is
  // replaced but positioning/click behavior is preserved.
  renderTrigger?: (state: { selected?: SelectOption; open: boolean }) => ReactNode;
}

interface Coords {
  top: number;
  left: number | null;
  right: number | null;
  minWidth: number;
}

const TRIGGER: Record<string, string> = {
  "pill-sm":
    "rounded-[86px] bg-[#1b1c1e] px-2 py-1 text-[11px] font-medium text-[#cecece]",
  "pill-md":
    "rounded-[86px] bg-[#1b1c1e] px-2.5 py-1.5 text-[12px] font-medium text-[#e5e5e5]",
  "field-sm": "rounded-md bg-white/5 px-2 py-1 text-xs text-white",
  "field-md": "rounded-lg bg-white/5 px-3 py-2 text-sm text-white",
};

export default function Select({
  value,
  options,
  onChange,
  align = "left",
  variant = "pill",
  size = "md",
  placeholder = "Select",
  ariaLabel,
  className = "",
  renderTrigger,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const selected = options.find((o) => o.value === value);
  const chevronSize = size === "sm" ? 11 : 13;

  const measure = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      top: r.bottom + 6,
      left: align === "left" ? r.left : null,
      right: align === "right" ? window.innerWidth - r.right : null,
      minWidth: Math.max(r.width, 176),
    });
  }, [align]);

  const openMenu = useCallback(() => {
    measure();
    setOpen(true);
  }, [measure]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => measure();
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, measure]);

  const triggerKey = `${variant}-${size}`;
  const borderColor = variant === "field" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.08)";

  const openToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    open ? setOpen(false) : openMenu();
  };

  return (
    <>
      {renderTrigger ? (
        <button
          ref={triggerRef}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={openToggle}
          className={`cursor-pointer outline-none ${className}`}
        >
          {renderTrigger({ selected, open })}
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={openToggle}
          className={`flex items-center justify-between gap-1.5 outline-none transition-colors ${TRIGGER[triggerKey]} ${className}`}
          style={{ border: `1px solid ${borderColor}` }}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <motion.span
            className="shrink-0 text-[#8a8a8c]"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <ChevronDown size={chevronSize} strokeWidth={2} />
          </motion.span>
        </button>
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && coords && (
              <motion.div
                ref={menuRef}
                role="listbox"
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
                className="z-[100] max-h-64 overflow-y-auto rounded-lg py-1 scrollbar-hide"
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left ?? undefined,
                  right: coords.right ?? undefined,
                  minWidth: coords.minWidth,
                  background: "#101111",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow:
                    "0 12px 32px rgba(0,0,0,0.5), rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset",
                }}
              >
                {options.map((opt) => {
                  const isActive = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.06]"
                      style={{ color: isActive ? "#f9f9f9" : "#cecece" }}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isActive && <Check size={13} strokeWidth={2.5} className="shrink-0 text-[#55b3ff]" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
