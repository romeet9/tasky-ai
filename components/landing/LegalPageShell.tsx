"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type LegalPageShellProps = {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
};

export default function LegalPageShell({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--raycast-bg)" }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[14px] text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors mb-8"
          style={{ letterSpacing: "0.2px" }}
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>

        <h1
          className="text-[32px] sm:text-[40px] font-semibold leading-tight text-[#f9f9f9]"
          style={{ letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mt-4 text-[17px] text-[#9c9c9d] max-w-xl"
            style={{ letterSpacing: "0.1px" }}
          >
            {subtitle}
          </p>
        )}

        {lastUpdated && (
          <p
            className="mt-3 text-[13px] text-[#6a6b6c]"
            style={{ letterSpacing: "0.2px" }}
          >
            Last updated: {lastUpdated}
          </p>
        )}

        <div
          className="mt-10 rounded-xl overflow-hidden"
          style={{
            background: "var(--raycast-surface)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow:
              "rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset, 0 16px 40px -8px rgba(0,0,0,0.4)",
          }}
        >
          <div className="px-6 sm:px-10 py-8 sm:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}