"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07080a]">
        <div className="h-6 w-6 rounded-full border-2 border-[#55b3ff] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return <>{children}</>;
}