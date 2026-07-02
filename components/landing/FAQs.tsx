"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const questions = [
  {
    id: "item-1",
    title: "What is TaskyAI?",
    content:
      "An AI task planner that converts your morning brief into structured, prioritized tasks. It auto-generates subtasks, detects categories, and assigns priority levels.",
  },
  {
    id: "item-2",
    title: "How does AI task planning work?",
    content:
      "Type your brief in plain language — \"Finish auth module, review 3 PRs, go to the gym.\" Tasky reads it, detects categories and priorities, and generates structured tasks with subtasks in about 30 seconds.",
  },
  {
    id: "item-3",
    title: "Is there a free trial?",
    content:
      "Yes — 14 days, no credit card required. You get all Pro features during the trial, including unlimited tasks, advanced AI, and priority support.",
  },
  {
    id: "item-4",
    title: "What features are in each plan?",
    content:
      "Starter ($9/mo): 50 tasks, standard AI, 7-day history. Pro ($22/3mo): unlimited tasks, advanced AI, unlimited history & uploads, priority support. Premium ($79/yr): everything in Pro plus custom categories, PDF/CSV export, and priority AI responses.",
  },
  {
    id: "item-5",
    title: "Can I cancel anytime?",
    content:
      "Yes. All plans cancel anytime with no long-term commitment and no cancellation fees. Your data stays accessible until the end of your billing period.",
  },
  {
    id: "item-6",
    title: "How accurate is the AI categorization?",
    content:
      "Tasky uses natural language processing to detect categories (Work, Personal, Health, Learning) and priority levels based on urgency signals and context in your brief.",
  },
  {
    id: "item-7",
    title: "Can I upload files for context?",
    content:
      "Yes. Upload PDFs, DOCX, or spreadsheets and Tasky generates tasks from the content. Starter includes 5 uploads/month; Pro and Premium are unlimited.",
  },
];

export default function FAQs() {
  return (
    <section className="py-24 sm:py-32" style={{ background: "var(--raycast-bg)" }}>
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[13px] font-medium text-[#55b3ff] uppercase tracking-[0.1em]">
            FAQ
          </span>
          <h2
            className="mt-4 text-[32px] sm:text-[40px] font-semibold leading-tight text-[#f9f9f9]"
            style={{ letterSpacing: "0.2px" }}
          >
            Frequently asked questions
          </h2>
          <p
            className="mt-4 text-[17px] text-[#9c9c9d] max-w-xl mx-auto"
            style={{ letterSpacing: "0.2px", lineHeight: "1.60" }}
          >
            Got questions? Reach out to our support team if you need anything else.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Accordion
            type="single"
            collapsible
            defaultValue="item-1"
            className="w-full"
          >
            {questions.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-b border-white/[0.06]"
              >
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}