"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="inline-flex items-center justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(255,99,99,0.1)" }}>
              <svg width="32" height="32" viewBox="0 0 480 480" fill="none">
                <path d="M240 0v120A120 120 0 0 1 120 0H0a240 240 0 0 0 240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 120-120v120a240 240 0 1 0 0-480Z" fill="#FF6363" />
              </svg>
            </div>
          </div>

          <h2 className="text-[32px] sm:text-[44px] font-semibold leading-tight text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
            Start planning your day
            <br />
            with AI in 30 seconds
          </h2>

          <p className="mt-4 text-[17px] text-[#9c9c9d] max-w-lg mx-auto" style={{ letterSpacing: "0.2px", lineHeight: "1.60" }}>
            Stop planning, start doing. Tasky turns your brief into structured, prioritized tasks so you can focus on execution.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <motion.button
                className="px-8 py-3.5 rounded-[86px] text-[16px] font-semibold"
                style={{
                  background: "hsla(0, 0%, 100%, 0.815)",
                  color: "#18191a",
                  letterSpacing: "0.3px",
                  boxShadow: "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.25) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
                }}
                whileHover={{ scale: 1.02, background: "hsl(0, 0%, 100%)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Start Free Trial
              </motion.button>
            </Link>
            <span className="text-[12px] text-[#6a6b6c]" style={{ letterSpacing: "0.4px" }}>
              No credit card required
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}