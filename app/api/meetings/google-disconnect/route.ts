import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    await adminDb.collection("users").doc(uid).set(
      {
        googleAccessToken: null,
        googleEmail: null,
        googleDisconnectedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Google:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google" },
      { status: 500 }
    );
  }
}