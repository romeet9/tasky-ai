"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function redirectIfAuthenticated() {
      if (!isLoading && user) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const redirect = searchParams.get("redirect") || "/chat";
        router.push(redirect);
      }
    }

    redirectIfAuthenticated();
  }, [user, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07080a]">
        <div className="h-6 w-6 rounded-full border-2 border-[#55b3ff] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Video Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#000000]">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/ascii-art.mp4" type="video/mp4" />
        </video>

        {/* Minimal overlay */}
        <div className="relative z-10 flex flex-col justify-between w-full px-10 py-10">
          {/* Top - Logo */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: "rgba(255,99,99,0.1)" }}
              >
                <svg width="14" height="14" viewBox="0 0 480 480" fill="none">
                  <path
                    d="M240 0v120A120 120 0 0 1 120 0H0a240 240 0 0 0 240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 120-120v120a240 240 0 1 0 0-480Z"
                    fill="#FF6363"
                  />
                </svg>
              </div>
              <span
                className="text-[13px] font-medium text-[#f9f9f9]"
                style={{ letterSpacing: "0.2px" }}
              >
                Tasky AI
              </span>
            </div>
          </motion.div>

          {/* Bottom Left - Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
          >
            <h1
              className="text-[28px] font-medium text-[#f9f9f9] leading-tight"
              style={{ letterSpacing: "-0.3px" }}
            >
              Organize your day
              <br />
              with AI
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[#07080a] px-6 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "rgba(255,99,99,0.1)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 480 480" fill="none">
                <path
                  d="M240 0v120A120 120 0 0 1 120 0H0a240 240 0 0 0 240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 120-120v120a240 240 0 1 0 0-480Z"
                  fill="#FF6363"
                />
              </svg>
            </div>
          </div>

          <h2
            className="text-[24px] font-semibold text-[#f9f9f9] mb-1"
            style={{ letterSpacing: "-0.3px" }}
          >
            Welcome
          </h2>
          <p
            className="text-[14px] text-[#6a6b6c] mb-8"
            style={{ letterSpacing: "0.2px" }}
          >
            Sign in with Google to continue to Tasky AI
          </p>

          <AuthForm type="login" />
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#07080a]">
          <div className="h-6 w-6 rounded-full border-2 border-[#55b3ff] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}