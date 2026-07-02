"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I type my brief and get organized tasks — priorities, subtasks, and categories all assigned automatically.",
    name: "Rohit M.",
    role: "Product Designer at TechFlow",
    initials: "RM",
  },
  {
    quote: "Planning my day used to take 30 minutes. With Tasky, it takes 30 seconds. The subtask breakdown saves me hours each week.",
    name: "Priya S.",
    role: "Software Engineer at ScaleOS",
    initials: "PS",
  },
  {
    quote: "The AI priority detection means I always start with what matters most. No more second-guessing my to-do list.",
    name: "Arjun K.",
    role: "Startup Founder, DevLaunch",
    initials: "AK",
  },
  {
    quote: "The categorization is the most accurate I've seen. Every task lands in the right category without manual tagging.",
    name: "Mei L.",
    role: "Project Manager at DataBridge",
    initials: "ML",
  },
  {
    quote: "I've tried Todoist, Notion, and Linear. Tasky is the first where I actually stick with it — zero setup friction.",
    name: "David R.",
    role: "Freelance Developer",
    initials: "DR",
  },
  {
    quote: "The priority detection is what sold me. I always know which task to tackle first after entering my brief.",
    name: "Aisha N.",
    role: "Content Strategist at BrightPath",
    initials: "AN",
  },
  {
    quote: "Uploading meeting notes as a PDF and getting instant, actionable tasks back — that's when I knew this was different.",
    name: "Tomás G.",
    role: "Operations Lead, CloudPeak",
    initials: "TG",
  },
  {
    quote: "Getting structured, prioritized tasks from a meeting transcript was the moment I knew this was built different.",
    name: "Sarah W.",
    role: "Executive Assistant, Nexus VC",
    initials: "SW",
  },
  {
    quote: "Replaced three apps in my workflow — planner, notes, and task manager. Everything in one place now.",
    name: "Kevin P.",
    role: "Indie Hacker, ShipFast",
    initials: "KP",
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

export default function Testimonials2() {
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
          <span className="text-[13px] font-medium text-[#ffbc33] uppercase tracking-[0.1em]">
            Testimonials
          </span>
          <h2
            className="mt-4 text-[32px] sm:text-[40px] font-semibold leading-tight text-[#f9f9f9]"
            style={{ letterSpacing: "0.2px" }}
          >
            What users say about
            <br />
            TaskyAI task planner
          </h2>
          <p
            className="mt-4 text-[17px] text-[#9c9c9d] max-w-xl mx-auto"
            style={{ letterSpacing: "0.2px", lineHeight: "1.60" }}
          >
            Real workflows from professionals who plan their day with AI.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-dashed border-white/[0.06]"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              className="border-b border-r border-dashed border-white/[0.06] p-8 transition-colors duration-200 hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #FF6363, #ff8080)" }}
                >
                  {t.initials}
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
              <p
                className="text-[14px] leading-relaxed text-[#cecece]"
                style={{ letterSpacing: "0.2px" }}
              >
                {t.quote}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}