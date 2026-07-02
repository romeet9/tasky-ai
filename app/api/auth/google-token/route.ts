import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing accessToken" },
        { status: 400 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    await adminDb.collection("users").doc(uid).set(
      {
        googleAccessToken: accessToken,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google token storage error:", error);
    return NextResponse.json(
      { error: "Failed to store Google token" },
      { status: 500 }
    );
  }
}