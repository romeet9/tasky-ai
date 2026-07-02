"use client";

import { motion } from "framer-motion";
import { MessageSquare, Sparkles, ListChecks } from "lucide-react";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Type your brief",
    description: "Say what you need to do in plain language. No templates or formatting required.",
    color: "#55b3ff",
  },
  {
    icon: Sparkles,
    title: "AI organizes it",
    description: "Tasky reads your brief, detects categories, assigns priorities, and generates subtasks — automatically.",
    color: "#FF6363",
  },
  {
    icon: ListChecks,
    title: "Get structured tasks",
    description: "Walk away with a prioritized, categorized task list with subtasks. Ready to execute immediately.",
    color: "#5fc992",
  },
];

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export function Features() {
  return (
    <section className="py-24 sm:py-32" style={{ background: "var(--raycast-bg)" }}>
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[13px] font-medium text-[#FF6363] uppercase tracking-[0.1em]">
            How it works
          </span>
          <h2
            className="mt-4 text-[32px] sm:text-[40px] font-semibold leading-tight text-[#f9f9f9]"
            style={{ letterSpacing: "0.2px" }}
          >
            How to plan your day with AI in three steps
          </h2>
          <p
            className="mt-4 text-[17px] text-[#9c9c9d] max-w-xl mx-auto"
            style={{ letterSpacing: "0.2px", lineHeight: "1.60" }}
          >
            Type a brief — Tasky breaks it into prioritized tasks with subtasks and categories.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 border-t border-l border-dashed border-white/[0.06]"
        >
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="group border-b border-r border-dashed border-white/[0.06] p-8 transition-colors duration-200 hover:bg-white/[0.02]"
              >
                <div
                  className="flex items-center justify-center size-10 rounded-xl mb-5"
                  style={{
                    background: `${step.color}10`,
                    border: `1px solid ${step.color}20`,
                  }}
                >
                  <Icon className="size-5" style={{ color: step.color }} />
                </div>
                <h3
                  className="text-[17px] font-semibold text-[#f9f9f9] mb-2"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed text-[#9c9c9d]"
                  style={{ letterSpacing: "0.2px" }}
                >
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Features;