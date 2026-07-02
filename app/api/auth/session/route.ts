import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/server";
import { ensurePersonalWorkspace } from "@/lib/workspace/server";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("session", idToken, {
      maxAge: 60 * 60 * 24 * 5,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Auto-provision the user's personal workspace on login. Non-fatal: a
    // provisioning hiccup must never block sign-in.
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      await ensurePersonalWorkspace(
        decoded.uid,
        decoded.email ?? null,
        (decoded.name as string | undefined) ?? decoded.email?.split("@")[0] ?? null
      );
    } catch (provisionError) {
      console.warn("Personal workspace provisioning skipped:", provisionError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return NextResponse.json({ success: true });
}