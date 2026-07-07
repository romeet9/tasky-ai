"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { resendVerificationEmail } from "@/lib/auth";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(true);
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user) {
      setDismissed(sessionStorage.getItem(`verify-dismissed-${user.uid}`) === "1");
    }
  }, [user]);

  const isUnverifiedEmailUser =
    !!user &&
    !user.emailVerified &&
    user.providerData.some((p) => p.providerId === "password");

  if (!isUnverifiedEmailUser || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(`verify-dismissed-${user.uid}`, "1");
    setDismissed(true);
  };

  const handleResend = async () => {
    setIsSending(true);
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch (e) {
      console.warn("Failed to resend verification email:", e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 bg-[#1a1206] border-b border-[#3a2a10] px-4 py-2 text-[13px] text-[#e8b45a]">
      <span>
        Please verify your email address — check your inbox for a verification link.
      </span>
      {sent ? (
        <span className="text-[#7ed49a]">Email sent</span>
      ) : (
        <button
          onClick={handleResend}
          disabled={isSending}
          className="font-medium underline underline-offset-2 hover:text-[#f9f9f9] transition-colors disabled:opacity-60"
        >
          {isSending ? "Sending…" : "Resend email"}
        </button>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="ml-2 text-[#e8b45a]/70 hover:text-[#f9f9f9] transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
