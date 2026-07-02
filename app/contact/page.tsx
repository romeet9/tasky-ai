import LegalPageShell from "@/components/landing/LegalPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact TaskyAI",
  description: "Get in touch with the TaskyAI team. Support, feedback, and partnerships.",
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

function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex items-center gap-4 rounded-xl p-5 transition-colors"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: "rgba(255,99,99,0.08)" }}
      >
        {icon}
      </div>
      <div>
        <p
          className="text-[13px] text-[#6a6b6c]"
          style={{ letterSpacing: "0.2px" }}
        >
          {label}
        </p>
        <p
          className="text-[15px] text-[#f9f9f9] font-medium"
          style={{ letterSpacing: "0.2px" }}
        >
          {value}
        </p>
      </div>
    </a>
  );
}

export default function ContactPage() {
  return (
    <LegalPageShell
      title="Contact Us"
      subtitle="We read every message and typically respond within 24 hours."
    >
      <Section>
        <SectionHeading>Get in Touch</SectionHeading>
        <p
          className="text-[15px] leading-[1.7] text-[#9c9c9d] mb-6"
          style={{ letterSpacing: "0.2px" }}
        >
          Whether you have a question, feedback, or just want to say hello —
          we're here to help. Choose the channel that works best for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ContactCard
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF6363"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
            }
            label="Email"
            value="support@tasky.ai"
            href="mailto:support@tasky.ai"
          />

          <ContactCard
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-[#FF6363]"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            }
            label="Twitter / X"
            value="@taskyai"
            href="https://twitter.com/taskyai"
          />

          <ContactCard
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-[#FF6363]"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            }
            label="GitHub"
            value="Issues & source"
            href="https://github.com/taskyai"
          />
        </div>
      </Section>

      <Section>
        <SectionHeading>Common Questions</SectionHeading>
        <div className="space-y-5">
          {[
            {
              q: "How do I reset my password?",
              a: "Click \"Sign In\" on the homepage, then use the \"Forgot password\" link on the login page. You'll receive a reset email within a few minutes.",
            },
            {
              q: "Can I change my plan?",
              a: "Yes. Upgrade or downgrade from your account settings at any time. Changes take effect at the start of your next billing cycle.",
            },
            {
              q: "Is my data private?",
              a: "Absolutely. We never sell your data or train models on your briefs. See our Privacy Policy for full details.",
            },
          ].map((item) => (
            <div key={item.q}>
              <p
                className="text-[15px] font-medium text-[#f9f9f9]"
                style={{ letterSpacing: "0.2px" }}
              >
                {item.q}
              </p>
              <p
                className="mt-1 text-[14px] leading-[1.65] text-[#6a6b6c]"
                style={{ letterSpacing: "0.2px" }}
              >
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section last>
        <SectionHeading>Bug Reports & Feature Requests</SectionHeading>
        <p
          className="text-[15px] leading-[1.7] text-[#9c9c9d]"
          style={{ letterSpacing: "0.2px" }}
        >
          Found a bug or have an idea? The fastest way to let us know is through
          our{" "}
          <a
            href="https://github.com/taskyai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6363] hover:underline underline-offset-2"
          >
            GitHub repository
          </a>
          . Open an issue and we'll take a look. For urgent matters, email us
          directly at{" "}
          <a
            href="mailto:support@tasky.ai"
            className="text-[#FF6363] hover:underline underline-offset-2"
          >
            support@tasky.ai
          </a>
          .
        </p>
      </Section>
    </LegalPageShell>
  );
}