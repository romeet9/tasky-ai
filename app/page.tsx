"use client";

import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { Features as HowItWorks } from "@/components/landing/HowItWorks";
import LiveDemo from "@/components/landing/LiveDemo";
import { Features } from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Testimonials2 from "@/components/landing/Testimonials2";
import FAQs from "@/components/landing/FAQs";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TaskyAI",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  description: "AI task planner that turns your brief into structured, prioritized tasks with subtasks and categories.",
  offers: [
{ "@type": "Offer", name: "Starter", price: "9", priceCurrency: "USD", description: "50 tasks/month, standard AI, 7-day history" },
  { "@type": "Offer", name: "Pro", price: "22", priceCurrency: "USD", description: "Unlimited tasks, advanced AI, unlimited history, priority support", billingIncrement: "P3M" },
  { "@type": "Offer", name: "Premium", price: "79", priceCurrency: "USD", description: "Everything in Pro plus custom categories, exports, priority AI", billingIncrement: "P1Y" },
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "147" },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is TaskyAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An AI task planner that turns your brief into structured tasks with subtasks, categories, and priorities — automatically.",
      },
    },
    {
      "@type": "Question",
      name: "How does AI task planning work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Type your brief in plain language. Tasky reads it, detects categories and priorities, and generates structured tasks with subtasks in about 30 seconds.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free trial for TaskyAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "14-day free trial on all plans, no credit card required. Starter $9/mo, Pro $22/3mo, Premium $79/yr.",
      },
    },
    {
      "@type": "Question",
      name: "What features are included in the free trial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All Pro features during the trial: unlimited tasks, advanced AI, unlimited history, priority support.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel my TaskyAI subscription anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Cancel anytime, no long-term commitment, no cancellation fees.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--raycast-bg)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Header />

      <main>
        <HeroSection />
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <HowItWorks />
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <LiveDemo />
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Features />
        </div>
        <div id="pricing" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Pricing />
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Testimonials2 />
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <FAQs />
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <FinalCTA />
        </div>
      </main>

      <Footer />
    </div>
  );
}