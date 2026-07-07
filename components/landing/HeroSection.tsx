"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-x-hidden overflow-y-visible pb-0">
      {/* ── Background ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* very subtle red radial from top-left */}
        <div
          className="absolute -left-40 -top-24 h-[500px] w-[500px] rounded-full opacity-[0.18] blur-[130px]"
          style={{ background: "#FF6363" }}
        />
        {/* very subtle blue from top-right */}
        <div
          className="absolute -right-40 top-0 h-[400px] w-[400px] rounded-full opacity-[0.12] blur-[110px]"
          style={{ background: "#55b3ff" }}
        />
        {/* glow halo that sits just above the app window border */}
        <div
          className="absolute bottom-[40px] left-1/2 h-[160px] w-[85%] max-w-[1200px] -translate-x-1/2 blur-[70px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(255,99,99,0.32) 0%, rgba(85,179,255,0.08) 60%, transparent 100%)",
            opacity: 0.9,
          }}
        />
      </div>

      {/* ── Hero copy ── */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-16 text-center sm:pt-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8 inline-flex"
        >
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5",
              "border border-white/[0.1] bg-white/[0.04]",
              "text-[12px] font-medium text-[#cecece]",
              "backdrop-blur-sm"
            )}
            style={{ letterSpacing: "0.2px" }}
          >
            <Sparkles className="size-3 text-[#FF6363]" />
            AI-powered task planning
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[42px] font-bold leading-[1.08] tracking-[-0.04em] text-[#f9f9f9] sm:text-[56px] lg:text-[68px]"
        >
          Your AI Task
          <br />
          Planning Assistant
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto mt-6 max-w-[480px] text-[17px] leading-[1.65] text-[#9c9c9d] sm:text-[18px]"
          style={{ letterSpacing: "0.1px" }}
        >
Tasky is an AI task planner that turns your brief into structured, prioritized tasks — automatically.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <Link href="/login">
            <Button
              size="lg"
              className={cn(
                "group h-12 gap-2 rounded-[86px] px-7 text-[15px] font-semibold",
                "bg-[hsla(0,0%,100%,0.815)] text-[#18191a] hover:bg-white hover:opacity-[0.85]",
                "shadow-[rgba(255,255,255,0.1)_0px_1px_0px_0px_inset,0_0_0_1px_rgba(255,255,255,0.15),0_4px_24px_rgba(0,0,0,0.4)]",
                "transition-all hover:shadow-[rgba(255,255,255,0.1)_0px_1px_0px_0px_inset,0_0_0_1px_rgba(255,255,255,0.25),0_4px_32px_rgba(255,255,255,0.08)]"
              )}
            >
              Get started free
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button
              variant="ghost"
              size="lg"
              className="group h-12 gap-2 rounded-[86px] px-6 text-[15px] font-medium text-[#6a6b6c] hover:text-[#f9f9f9]"
            >
              Try live demo
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.5 }}
          className="mt-8 flex items-center justify-center gap-6"
        >
          {[
            "No credit card required",
            "14-day free trial",
            "Cancel anytime",
          ].map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 text-[12px] text-[#6a6b6c]"
              style={{ letterSpacing: "0.1px" }}
            >
              <CheckCircle2 className="size-3 text-[#5fc992]" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── App window — flat bottom, bleeds off section ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.52, duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 mx-auto mt-12 w-full max-w-[1200px] px-4 sm:px-6 lg:px-10"
      >
        {/* top-edge glow halo — the light peeking behind the window */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[5%] -top-6 h-12 blur-[36px]"
          style={{ background: "rgba(255,99,99,0.22)" }}
        />

        {/* Browser chrome — only top corners rounded */}
        <div
          className="relative overflow-hidden rounded-t-[16px] rounded-b-none border border-b-0 border-white/[0.08]"
          style={{
            background: "var(--raycast-surface)",
            boxShadow:
              "0 -1px 0 0 rgba(255,255,255,0.06), 0 30px 80px -20px rgba(0,0,0,0.9)",
          }}
        >
          {/* Title bar — traffic lights only, no URL bar */}
          <div
            className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3"
            style={{ background: "rgba(7,8,10,0.95)" }}
          >
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ background: "rgba(255,99,99,0.55)" }} />
              <div className="h-3 w-3 rounded-full" style={{ background: "rgba(255,188,51,0.55)" }} />
              <div className="h-3 w-3 rounded-full" style={{ background: "rgba(95,201,146,0.55)" }} />
            </div>
          </div>

          {/* App body — demo preview image, no padding */}
          <div className="flex flex-col">
            <Image
              src="/demo-preview.png"
              alt="Tasky AI demo — morning brief to structured tasks"
              width={1920}
              height={1080}
              className="w-full"
              priority
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
