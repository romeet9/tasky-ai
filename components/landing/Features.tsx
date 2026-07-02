"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  TagIcon,
  SignalIcon,
  ListChecksIcon,
  MessageSquareIcon,
  FileTextIcon,
} from "lucide-react";

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "AI-Powered Task Breakdown",
    description: "Turn any brief into structured tasks. AI generates subtasks, sets priorities, and assigns categories — no manual work.",
    color: "#FF6363",
  },
  {
    icon: TagIcon,
    title: "Smart Categorization",
    description: "AI detects categories — Work, Personal, Health, Learning — so every task lands in the right place automatically.",
    color: "#55b3ff",
  },
  {
    icon: SignalIcon,
    title: "Priority Detection",
    description: "AI assigns priority levels based on urgency signals in your brief. Always start with what matters most.",
    color: "#5fc992",
  },
  {
    icon: ListChecksIcon,
    title: "Subtask Generation",
    description: "Every task breaks into clear, actionable steps. Start executing instead of planning what to do.",
    color: "#ffbc33",
  },
  {
    icon: MessageSquareIcon,
    title: "Chat History",
    description: "Every conversation is saved. Revisit past briefs and refine your tasks with full context.",
    color: "#a78bfa",
  },
  {
    icon: FileTextIcon,
    title: "File Context",
    description: "Upload PDFs or spreadsheets — AI reads the content and creates tasks. Meeting notes become action items.",
    color: "#22d3ee",
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
    <section className="py-16 md:py-32" id="features">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[13px] font-medium text-[#5fc992] uppercase tracking-[0.1em]">
            Features
          </span>
          <h2
            className="mt-4 text-[32px] sm:text-[40px] font-semibold leading-tight text-[#f9f9f9]"
            style={{ letterSpacing: "0.2px" }}
          >
            AI task planning features
            <br />
            that replace your todo app
          </h2>
          <p
            className="mt-4 text-[17px] text-[#9c9c9d] max-w-xl mx-auto"
            style={{ letterSpacing: "0.2px" }}
          >
            From brief to structured tasks in seconds — categorization, priorities, subtasks, and file context.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-dashed border-white/[0.06]"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="group border-b border-r border-dashed border-white/[0.06] p-8 transition-colors duration-200 hover:bg-white/[0.02]"
            >
              <div
                className="flex items-center justify-center size-10 rounded-xl mb-5"
                style={{
                  background: `${feature.color}10`,
                  border: `1px solid ${feature.color}20`,
                }}
              >
                <feature.icon className="size-5" style={{ color: feature.color }} />
              </div>
              <h3
                className="text-[17px] font-semibold text-[#f9f9f9] mb-2"
                style={{ letterSpacing: "-0.01em" }}
              >
                {feature.title}
              </h3>
              <p
                className="text-[14px] leading-relaxed text-[#9c9c9d]"
                style={{ letterSpacing: "0.2px" }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}