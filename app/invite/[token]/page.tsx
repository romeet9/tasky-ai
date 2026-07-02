"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { acceptInvite } from "@/lib/workspace/client";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();
  const { user, isLoading, signIn } = useAuth();
  const { refresh, setActiveWorkspaceId } = useWorkspace();

  const [status, setStatus] = useState<"idle" | "accepting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isLoading || !user || !token || status !== "idle") return;
    setStatus("accepting");
    acceptInvite(token)
      .then(async ({ workspaceId }) => {
        await refresh();
        setActiveWorkspaceId(workspaceId);
        setStatus("done");
        setTimeout(() => router.push("/chat"), 900);
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Could not accept invite");
      });
  }, [isLoading, user, token, status, refresh, setActiveWorkspaceId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07080a] px-6 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <h1 className="text-lg font-semibold">Workspace invite</h1>

        {isLoading && (
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        )}

        {!isLoading && !user && (
          <>
            <p className="mt-3 text-sm text-neutral-400">
              Sign in to accept this invitation. It must be the account the invite was sent to.
            </p>
            <button
              onClick={() => signIn()}
              className="mt-5 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black"
            >
              Continue with Google
            </button>
          </>
        )}

        {!isLoading && user && status === "accepting" && (
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Accepting invite…
          </p>
        )}

        {status === "done" && (
          <p className="mt-3 text-sm text-emerald-400">You&apos;re in. Taking you to the workspace…</p>
        )}

        {status === "error" && (
          <>
            <p className="mt-3 text-sm text-red-400">{message}</p>
            <button
              onClick={() => router.push("/chat")}
              className="mt-5 w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5"
            >
              Go to app
            </button>
          </>
        )}
      </div>
    </div>
  );
}
