import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await adminDb.collection("users").doc(uid).get();
    const accessToken = userDoc.exists
      ? userDoc.data()?.googleAccessToken
      : null;

    return NextResponse.json({
      connected: !!accessToken,
      email: userDoc.exists ? userDoc.data()?.googleEmail : null,
    });
  } catch (error) {
    console.error("Error checking Google status:", error);
    return NextResponse.json({ connected: false });
  }
}