"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Finally, a todo app that actually understands what I need. I stopped manually breaking down tasks — AI does it better than I ever could.",
    name: "Rohit M.",
    role: "Product Designer",
    avatar: "RM",
  },
  {
    quote: "I used to spend 30 minutes planning my day. Now it takes 30 seconds. The subtask breakdown alone is worth it.",
    name: "Priya S.",
    role: "Software Engineer",
    avatar: "PS",
  },
  {
    quote: "Game changer for busy founders. I just dump my brain dump and get perfectly organized tasks. Highly recommend.",
    name: "Arjun K.",
    role: "Startup Founder",
    avatar: "AK",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[13px] font-medium text-[#ffbc33] uppercase tracking-[0.1em]">
            Testimonials
          </span>
          <h2 className="mt-4 text-[32px] sm:text-[40px] font-semibold leading-tight text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
            People love TaskyAI
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 }}
              className="rounded-[16px] p-6 sm:p-8"
              style={{
                background: "var(--raycast-surface)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
              }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 16 16" fill="#ffbc33">
                    <path d="M8 1L10.236 5.372L15 6.13L11.5 9.646L12.328 14.488L8 12.12L3.672 14.488L4.5 9.646L1 6.13L5.764 5.372L8 1Z" />
                  </svg>
                ))}
              </div>
              <p className="text-[16px] leading-[1.60] text-[#cecece] mb-6" style={{ letterSpacing: "0.2px" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #FF6363, #ff8080)" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#f9f9f9]" style={{ letterSpacing: "0px" }}>
                    {t.name}
                  </div>
                  <div className="text-[12px] font-semibold text-[#6a6b6c]" style={{ letterSpacing: "0px" }}>
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}