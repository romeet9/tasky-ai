"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./AuthProvider";

interface AuthFormProps {
  type: "login" | "signup";
}

export default function AuthForm({ type }: AuthFormProps) {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-[13px] text-[#FF6363] text-center">{error}</div>
      )}
      <motion.button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 rounded-xl py-3 text-[14px] font-medium"
        style={{
          background: "#fff",
          color: "#18191a",
        }}
        whileHover={{ opacity: 0.85 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <div className="h-5 w-5 rounded-full border-2 border-[#FF6363] border-t-transparent animate-spin" />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M16.5 9.20455C16.5 8.45455 16.4318 7.77273 16.2955 7.09091H9V10.0682H13.2273C13.0682 10.9773 12.5909 11.75 11.7955 12.2955V14.2955H14.25C15.6818 12.9545 16.5 11.2727 16.5 9.20455Z"
                fill="#4285F4"
              />
              <path
                d="M9 16.5C11.0455 16.5 12.75 15.8409 14.25 14.2955L11.7955 12.2955C11.0455 12.7955 10.1136 13.0909 9 13.0909C7.02273 13.0909 5.34091 11.75 4.75 9.95455H2.22727V12.0227C3.7159 14.7727 6.56818 16.5 9 16.5Z"
                fill="#34A853"
              />
              <path
                d="M4.75 9.95455C4.59091 9.45455 4.5 8.93182 4.5 8.38636C4.5 7.84091 4.59091 7.31818 4.75 6.81818V4.75H2.22727C1.5 6.22727 1.091 7.75 1.091 9.25C1.091 10.75 1.5 12.2727 2.22727 13.4773L4.75 9.95455Z"
                fill="#FBBC05"
              />
              <path
                d="M9 4.40909C10.2273 4.40909 11.3182 4.81818 12.1818 5.61364L14.2955 3.5C12.75 2.15909 11.0455 1.5 9 1.5C6.56818 1.5 3.7159 3.22727 2.22727 5.97727L4.75 8.04545C5.34091 6.25 7.02273 4.40909 9 4.40909Z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </>
        )}
      </motion.button>
    </div>
  );
}