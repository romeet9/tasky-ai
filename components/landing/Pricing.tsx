"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    key: "starter",
    name: "Starter",
    priceLabel: "$9",
    periodLabel: "/month",
    monthlyEquiv: null,
    badge: null,
    highlight: false,
    description: "50 tasks per month, standard AI model, core features.",
    included: [
      "Up to 50 tasks per month",
      "Standard AI model",
      "7-day chat history",
      "5 file uploads per month",
      "Smart categorization & priority",
      "Subtask breakdown",
    ],
    notIncluded: [
      "Custom integrations",
      "Priority support",
      "Early access to new features",
      "Custom categories",
      "Export tasks (PDF / CSV)",
      "Priority AI responses",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    priceLabel: "$22",
    periodLabel: "/3 months",
    monthlyEquiv: "$7.33/mo",
    badge: "Most Popular",
    highlight: true,
    description: "Unlimited tasks, advanced AI model, unlimited history, and priority support.",
    included: [
      "Unlimited tasks",
      "Advanced AI model",
      "Unlimited chat history",
      "Unlimited file uploads",
      "Smart categorization & priority",
      "Subtask breakdown",
      "Custom integrations",
      "Priority support",
    ],
    notIncluded: [
      "Early access to new features",
      "Custom categories",
      "Export tasks (PDF / CSV)",
      "Priority AI responses",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    priceLabel: "$79",
    periodLabel: "/year",
    monthlyEquiv: "$6.58/mo",
    badge: "Best Value",
    highlight: false,
    description: "Everything in Pro plus custom categories, exports, and priority AI responses.",
    included: [
      "Unlimited tasks",
      "Advanced AI model",
      "Unlimited chat history",
      "Unlimited file uploads",
      "Smart categorization & priority",
      "Subtask breakdown",
      "Custom integrations",
      "Priority support",
      "Early access to new features",
      "Custom categories",
      "Export tasks (PDF / CSV)",
      "Priority AI responses",
    ],
    notIncluded: [],
  },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
      <path d="M2 6L5 9L10 3" stroke="#5fc992" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
      <path d="M3 3L9 9M9 3L3 9" stroke="#434345" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <section className="py-24 sm:py-32 relative" id="pricing">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[13px] font-medium text-[#FF6363] uppercase tracking-[0.1em]">
            Pricing
          </span>
          <h2
            className="mt-4 text-[32px] sm:text-[40px] font-semibold leading-tight text-[#f9f9f9]"
            style={{ letterSpacing: "0.2px" }}
          >
            AI task planner pricing
            <br />
            plans and features
          </h2>
          <p
            className="mt-4 text-[17px] text-[#9c9c9d] max-w-xl mx-auto"
            style={{ letterSpacing: "0.2px", lineHeight: "1.60" }}
          >
            Choose the plan that fits your workflow. All plans include AI task breakdown, categorization, and priority detection.
          </p>
        </motion.div>

        {/* ── Pricing Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.07 }}
              className="relative flex flex-col rounded-[16px] overflow-hidden"
              style={{
                background: "var(--raycast-surface)",
                border: plan.highlight
                  ? "1px solid rgba(255,99,99,0.25)"
                  : "1px solid rgba(255,255,255,0.06)",
                boxShadow: plan.highlight
                  ? "0 0 30px rgba(255,99,99,0.08), rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset"
                  : "rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset",
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, #FF6363, transparent)" }}
                />
              )}

              {/* Card header */}
              <div className="p-8 pb-0">
                <div className="min-h-[24px] mb-3">
                  {plan.badge && (
                    <span
                      className="inline-flex items-center rounded-[86px] px-2.5 py-0.5 text-[12px] font-semibold"
                      style={{
                        background: plan.highlight ? "rgba(255,99,99,0.10)" : "rgba(95,201,146,0.08)",
                        border: plan.highlight ? "1px solid rgba(255,99,99,0.20)" : "1px solid rgba(95,201,146,0.15)",
                        color: plan.highlight ? "#FF6363" : "#5fc992",
                        letterSpacing: "0px",
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-[22px] font-normal text-[#f9f9f9] mb-2" style={{ letterSpacing: "0.2px" }}>
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-1">
                  <span className="text-[40px] font-semibold text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
                    {plan.priceLabel}
                  </span>
                  <span className="text-[15px] text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
                    {plan.periodLabel}
                  </span>
                </div>

                {plan.monthlyEquiv ? (
                  <p className="mt-1 text-[12px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
                    Billed as {plan.priceLabel}{plan.periodLabel}{" "}
                    <span style={{ color: plan.highlight ? "#FF6363" : "#5fc992" }}>
                      ({plan.monthlyEquiv})
                    </span>
                  </p>
                ) : (
                  <div className="mt-1 min-h-[20px]" />
                )}

                <p className="mt-3 text-[14px] text-[#9c9c9d]" style={{ letterSpacing: "0.2px", lineHeight: "1.60" }}>
                  {plan.description}
                </p>
              </div>

              {/* Features list */}
              <div className="mt-6 px-8">
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                <ul className="py-4 space-y-3">
                  {plan.included.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <CheckIcon />
                      </div>
                      <span className="text-[14px] font-medium text-[#cecece]" style={{ letterSpacing: "0.2px" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <XIcon />
                      </div>
                      <span className="text-[14px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="mt-auto p-8 pt-2">
                <Link href="/login" className="block">
                  <motion.button
                    className="w-full py-3 rounded-[86px] text-[16px] font-semibold"
                    style={{
                      background: plan.highlight
                        ? "hsla(0, 0%, 100%, 0.815)"
                        : "rgba(255,255,255,0.08)",
                      color: plan.highlight ? "#18191a" : "#f9f9f9",
                      boxShadow: plan.highlight
                        ? "rgba(255,255,255,0.05) 0px 1px 0px 0px inset, rgba(255,255,255,0.25) 0px 0px 0px 1px, rgba(0,0,0,0.2) 0px -1px 0px 0px inset"
                        : "none",
                      border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.10)",
                      letterSpacing: "0.3px",
                    }}
                    whileHover={
                      plan.highlight
                        ? { scale: 1.02, background: "hsl(0, 0%, 100%)" }
                        : { scale: 1.01, background: "rgba(255,255,255,0.12)" }
                    }
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Start Free Trial
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <p
          className="mt-8 text-center text-[12px] text-[#6a6b6c]"
          style={{ letterSpacing: "0.4px" }}
        >
          No credit card required · 14-day free trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}