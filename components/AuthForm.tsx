"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { getSignInMethods } from "@/lib/auth";

interface AuthFormProps {
  type: "login" | "signup";
}

type Mode = "login" | "signup" | "reset";

function mapAuthError(code: string | undefined): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in — if you previously used Google, use the Google button.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

const inputClassName =
  "w-full rounded-xl bg-[#121316] border border-[#26272a] px-4 py-3 text-[14px] text-[#f9f9f9] placeholder-[#6a6b6c] outline-none focus:border-[#FF6363]/60 transition-colors";

export default function AuthForm({ type }: AuthFormProps) {
  const { signIn, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>(type);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const busy = isLoading || isGoogleLoading;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    setInfo(null);
    try {
      await signIn();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "reset") {
        await resetPassword(email);
        setInfo("Check your email for a reset link.");
        setIsLoading(false);
        return;
      }
      if (mode === "signup") {
        await signUpWithEmail(email, password, displayName.trim() || undefined);
      } else {
        await signInWithEmail(email, password);
      }
      // Hard navigation: soft router.push gets aborted by post-auth re-renders
      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/chat";
      window.location.href = redirect;
    } catch (err: any) {
      const code: string | undefined = err?.code;
      if (code === "auth/invalid-credential") {
        const methods = await getSignInMethods(email);
        if (methods.length && methods.every((m) => m === "google.com")) {
          setError("This email is registered with Google — use the Google button.");
          setIsLoading(false);
          return;
        }
      }
      setError(mapAuthError(code) || err.message);
      setIsLoading(false);
    }
  };

  const submitLabel =
    mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in";

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-[13px] text-[#FF6363] text-center">{error}</div>
      )}
      {info && (
        <div className="text-[13px] text-[#7ed49a] text-center">{info}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Name"
            autoComplete="name"
            className={inputClassName}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
          className={inputClassName}
        />
        {mode !== "reset" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
            className={inputClassName}
          />
        )}
        {mode === "login" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => switchMode("reset")}
              className="text-[13px] text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors"
            >
              Forgot password?
            </button>
          </div>
        )}
        <motion.button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center rounded-xl py-3 text-[14px] font-medium bg-[#FF6363] text-white disabled:opacity-60"
          whileHover={{ opacity: 0.85 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            submitLabel
          )}
        </motion.button>
        {mode === "reset" && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-[13px] text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors"
            >
              Back to sign in
            </button>
          </div>
        )}
      </form>

      {mode !== "reset" && (
        <>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#26272a]" />
            <span className="text-[12px] text-[#6a6b6c]">or</span>
            <div className="h-px flex-1 bg-[#26272a]" />
          </div>

          <motion.button
            onClick={handleGoogleSignIn}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 text-[14px] font-medium disabled:opacity-60"
            style={{
              background: "#fff",
              color: "#18191a",
            }}
            whileHover={{ opacity: 0.85 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGoogleLoading ? (
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

          <p className="text-[13px] text-[#6a6b6c] text-center">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[#f9f9f9] hover:text-[#FF6363] transition-colors font-medium"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-[#f9f9f9] hover:text-[#FF6363] transition-colors font-medium"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
