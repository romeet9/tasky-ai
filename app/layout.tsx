import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SWRegister from "@/components/SWRegister";
import { AuthProvider } from "@/components/AuthProvider";
import { WorkspaceProvider } from "@/components/WorkspaceProvider";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { MotionConfig } from "framer-motion";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#07080a",
};

export const metadata: Metadata = {
  title: "TaskyAI — AI Task Planner | Turn Briefs Into Structured, Prioritized Tasks",
  description: "TaskyAI is an AI task planner that converts your morning brief into structured, prioritized tasks with subtasks and categories — reducing planning time by up to 90%. Try free for 14 days.",
  keywords: ["AI task planner", "task planning", "AI task management", "morning brief planner", "task breakdown with AI", "subtask generator", "priority detection", "task categorization", "productivity tool", "AI planner", "TaskyAI"],
  manifest: "/manifest.json",
  openGraph: {
    title: "TaskyAI — AI Task Planner That Plans Your Day in 30 Seconds",
    description: "Type your morning brief. Get organized tasks with AI subtask generation, priority detection, and smart categorization. Reduce planning time by up to 90%.",
    url: "https://tasky.ai",
    siteName: "TaskyAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskyAI — AI Task Planner | Plan Your Day in 30 Seconds",
    description: "Type a brief, get structured tasks. AI-powered subtask generation, priority detection, and smart categorization. Free 14-day trial.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TaskyAI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <EmailVerificationBanner />
            <WorkspaceProvider>{children}</WorkspaceProvider>
          </AuthProvider>
        </MotionConfig>
        <SWRegister />
      </body>
    </html>
  );
}