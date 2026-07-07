"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export function Header() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-[#07080a]/95 backdrop-blur-lg border-b border-white/[0.06]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,99,99,0.1)]">
                <svg width="16" height="16" viewBox="0 0 480 480" fill="none">
                  <path d="M240 0v120A120 120 0 0 1 120 0H0a240 240 0 0 0 240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 120-120v120a240 240 0 1 0 0-480Z" fill="#FF6363" />
                </svg>
              </div>
              <span className="text-[15px] font-semibold text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
                TaskyAI
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <a
                href="#features"
                className="px-3 py-1.5 text-[14px] text-[#9c9c9d] hover:text-[#f9f9f9] transition-all duration-200"
                style={{ letterSpacing: "0.2px", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="px-3 py-1.5 text-[14px] text-[#9c9c9d] hover:text-[#f9f9f9] transition-all duration-200"
                style={{ letterSpacing: "0.2px", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Pricing
              </a>
              <Link
                href="/demo"
                className="px-3 py-1.5 text-[14px] text-[#9c9c9d] hover:text-[#f9f9f9] transition-all duration-200"
                style={{ letterSpacing: "0.2px", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Live demo
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#6a6b6c]">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(!open)}
            className="md:hidden text-[#9c9c9d]"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </nav>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      id="mobile-menu"
      className="fixed inset-0 top-14 z-40 flex flex-col bg-[#07080a]/95 backdrop-blur-lg border-b border-white/[0.06] md:hidden"
    >
      <div className="flex flex-col gap-1 p-6">
        <a
          href="#features"
          onClick={onClose}
          className="py-3 text-[16px] font-medium text-[#f9f9f9]"
          style={{ letterSpacing: "0.2px" }}
        >
          Features
        </a>
        <a
          href="#pricing"
          onClick={onClose}
          className="py-3 text-[16px] font-medium text-[#f9f9f9]"
          style={{ letterSpacing: "0.2px" }}
        >
          Pricing
        </a>
        <Link
          href="/demo"
          onClick={onClose}
          className="py-3 text-[16px] font-medium text-[#f9f9f9]"
          style={{ letterSpacing: "0.2px" }}
        >
          Live demo
        </Link>

        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/[0.06]">
          <Link href="/login" onClick={onClose}>
            <Button variant="outline" className="w-full bg-transparent">
              Sign In
            </Button>
          </Link>
          <Link href="/login" onClick={onClose}>
            <Button className="w-full">Start Free Trial</Button>
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}