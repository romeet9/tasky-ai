import LegalPageShell from "@/components/landing/LegalPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TaskyAI — AI-Powered Task Planning",
  description:
    "Learn about TaskyAI, our mission to reclaim your planning time, and the values that guide us.",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[20px] font-semibold text-[#f9f9f9] mb-3"
      style={{ letterSpacing: "-0.01em" }}
    >
      {children}
    </h2>
  );
}

function Section({
  children,
  last = false,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`py-8 ${last ? "" : "border-b border-white/[0.06]"}`}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <LegalPageShell
      title="About TaskyAI"
      subtitle="We believe your morning shouldn't start with a puzzle."
      lastUpdated="January 2025"
    >
      <Section>
        <SectionHeading>Our Mission</SectionHeading>
        <p
          className="text-[15px] leading-[1.7] text-[#9c9c9d]"
          style={{ letterSpacing: "0.2px" }}
        >
          TaskyAI exists to give busy professionals their planning time back.
          Instead of spending your first 30 minutes each day deciding what to do,
          you share a brief and Tasky turns it into structured, prioritized tasks
          — with subtasks, categories, and deadlines — in seconds.
        </p>
        <p
          className="mt-4 text-[15px] leading-[1.7] text-[#9c9c9d]"
          style={{ letterSpacing: "0.2px" }}
        >
          We built TaskyAI because we were tired of starting every day the same
          way: staring at a blank to-do list, trying to remember everything from
          yesterday, and re-prioritizing from scratch. There had to be a better
          way. Now there is.
        </p>
      </Section>

      <Section>
        <SectionHeading>How It Works</SectionHeading>
        <div className="space-y-4">
          {[
            {
              step: "01",
              heading: "Share your brief",
              description:
                "Type or paste your morning brain-dump — meetings, deadlines, errands, ideas. However messy, Tasky understands it.",
            },
            {
              step: "02",
              heading: "Tasky organizes it",
              description:
                "Our AI parses your brief, identifies tasks, breaks them into subtasks, assigns categories and priorities, and presents a structured plan.",
            },
            {
              step: "03",
              heading: "Execute with clarity",
              description:
                "Start your day with a clear, actionable plan. Check off subtasks, update statuses, and stay focused on what matters.",
            },
          ].map((item) => (
            <div key={item.step}>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[13px] font-semibold text-[#FF6363]"
                  style={{ letterSpacing: "0.1px" }}
                >
                  {item.step}
                </span>
                <span
                  className="text-[15px] font-medium text-[#f9f9f9]"
                  style={{ letterSpacing: "0.2px" }}
                >
                  {item.heading}
                </span>
              </div>
              <p
                className="mt-1 ml-7 text-[14px] leading-[1.65] text-[#6a6b6c]"
                style={{ letterSpacing: "0.2px" }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading>Our Values</SectionHeading>
        <div className="space-y-5">
          {[
            {
              heading: "Simplicity first",
              description:
                "No complex setup, no steep learning curve. Open TaskyAI, type your brief, get organized. That's the whole product.",
            },
            {
              heading: "Privacy by design",
              description:
                "Your task data stays yours. We don't sell personal data, we don't train models on your briefs, and we don't share anything with third parties.",
            },
            {
              heading: "Speed over perfection",
              description:
                "A plan that arrives in 2 seconds beats a perfect plan that takes 10 minutes. TaskyAI is fast because your morning wait is over.",
            },
          ].map((item) => (
            <div key={item.heading}>
              <p
                className="text-[15px] font-medium text-[#f9f9f9]"
                style={{ letterSpacing: "0.2px" }}
              >
                {item.heading}
              </p>
              <p
                className="mt-1 text-[14px] leading-[1.65] text-[#6a6b6c]"
                style={{ letterSpacing: "0.2px" }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section last>
        <SectionHeading>Built for Busy People</SectionHeading>
        <p
          className="text-[15px] leading-[1.7] text-[#9c9c9d]"
          style={{ letterSpacing: "0.2px" }}
        >
          Whether you're a founder juggling product sprints and investor calls,
          a manager balancing team deliverables and cross-functional meetings,
          or a freelancer switching between client projects — TaskyAI turns the
          noise of a busy morning into a calm, structured plan.
        </p>
        <p
          className="mt-4 text-[15px] leading-[1.7] text-[#9c9c9d]"
          style={{ letterSpacing: "0.2px" }}
        >
          We're a small team that ships fast and listens closely. If you have
          feedback, ideas, or just want to say hello —{" "}
          <a
            href="/contact"
            className="text-[#FF6363] hover:underline underline-offset-2"
          >
            we'd love to hear from you
          </a>
          .
        </p>
      </Section>
    </LegalPageShell>
  );
}