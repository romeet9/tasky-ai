import LegalPageShell from "@/components/landing/LegalPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — TaskyAI",
  description: "TaskyAI's refund and cancellation policy. 14-day free trial, cancel anytime.",
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

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[14px] leading-[1.7] text-[#9c9c9d]"
      style={{ letterSpacing: "0.2px" }}
    >
      {children}
    </p>
  );
}

export default function RefundPage() {
  return (
    <LegalPageShell
      title="Refund & Cancellation Policy"
      subtitle="We want you to love TaskyAI. If you don't, we make it easy to part ways."
      lastUpdated="January 15, 2025"
    >
      <Section>
        <SectionHeading>Free Trial</SectionHeading>
        <P>
          Every new user gets a 14-day free trial with full access to all
          features. No credit card is required to start. You can explore
          TaskyAI, create tasks, and experience the full product before deciding
          to subscribe.
        </P>
        <P>
          If you cancel during the free trial, you will not be charged. Your
          account and task data will be retained for 30 days after the trial
          ends, after which it will be permanently deleted.
        </P>
      </Section>

      <Section>
        <SectionHeading>Cancellation</SectionHeading>
        <SubHeadingInline text="How to cancel" />
        <P>
          You can cancel your subscription at any time from your account
          settings. Click on your profile, select &quot;Billing,&quot; and then
          &quot;Cancel subscription.&quot; No phone calls, no emails, no hoops
          to jump through.
        </P>
        <SubHeadingInline text="What happens when you cancel" />
        <P>
          When you cancel, your subscription remains active until the end of
          your current billing period. For example, if you cancel on day 5 of a
          monthly plan, you still have access through day 30. No partial-month
          charges are applied after cancellation.
        </P>
        <SubHeadingInline text="After cancellation" />
        <P>
          Once your paid period ends, your account reverts to the free tier (if
          available). Your task data is preserved for 30 days. After that, it is
          permanently deleted unless you reactivate your subscription.
        </P>
      </Section>

      <Section>
        <SectionHeading>Refund Eligibility</SectionHeading>
        <div className="space-y-4">
          {[
            {
              scenario: "Within 14-day trial",
              outcome: "No charge — nothing to refund.",
              color: "#5fc992",
            },
            {
              scenario: "Within 7 days of first paid charge",
              outcome: "Full refund, no questions asked.",
              color: "#5fc992",
            },
            {
              scenario: "After 7 days but within current billing period",
              outcome: "Refund reviewed on a case-by-case basis. Contact support.",
              color: "#FF6363",
            },
            {
              scenario: "After current billing period",
              outcome: "No refund — already had full access until period end.",
              color: "#6a6b6c",
            },
          ].map((item) => (
            <div
              key={item.scenario}
              className="flex items-start gap-3"
            >
              <div
                className="mt-1.5 shrink-0 h-2 w-2 rounded-full"
                style={{ background: item.color }}
              />
              <div>
                <p
                  className="text-[14px] font-medium text-[#f9f9f9]"
                  style={{ letterSpacing: "0.2px" }}
                >
                  {item.scenario}
                </p>
                <p
                  className="text-[13px] text-[#6a6b6c]"
                  style={{ letterSpacing: "0.2px" }}
                >
                  {item.outcome}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading>How to Request a Refund</SectionHeading>
        <P>
          To request a refund, send an email to{" "}
          <a
            href="mailto:support@tasky.ai"
            className="text-[#FF6363] hover:underline underline-offset-2"
          >
            support@tasky.ai
          </a>{" "}
          with the subject line &quot;Refund Request&quot; and include your account
          email and reason for the request. We aim to respond within 1 business
          day and process eligible refunds within 5-7 business days.
        </P>
        <P>
          Refunds are processed using the original payment method. Depending on
          your bank or payment provider, it may take an additional 5-10 business
          days for the refund to appear in your account.
        </P>
      </Section>

      <Section>
        <SectionHeading>Exceptions</SectionHeading>
        <P>
          We reserve the right to deny refund requests in cases of: (a) account
          abuse or violation of our{" "}
          <a href="/terms" className="text-[#FF6363] hover:underline underline-offset-2">
            Terms of Service
          </a>
          ; (b) repeated refund requests across multiple accounts; or (c)
          fraudulent or suspicious activity. In such cases, we will provide a
          written explanation for the denial.
        </P>
      </Section>

      <Section last>
        <SectionHeading>Questions?</SectionHeading>
        <P>
          If you have any questions about this policy, please reach out to us at{" "}
          <a
            href="mailto:support@tasky.ai"
            className="text-[#FF6363] hover:underline underline-offset-2"
          >
            support@tasky.ai
          </a>
          . We&apos;re here to help.
        </P>
      </Section>
    </LegalPageShell>
  );
}

function SubHeadingInline({ text }: { text: string }) {
  return (
    <p
      className="text-[14px] font-semibold text-[#cecece] mb-1.5 mt-4"
      style={{ letterSpacing: "0.2px" }}
    >
      {text}
    </p>
  );
}