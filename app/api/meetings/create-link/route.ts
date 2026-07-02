import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/server";

const GOOGLE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

async function getGoogleAccessToken(uid: string): Promise<string | null> {
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) return null;
  return userDoc.data()?.googleAccessToken || null;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const { title, description, startTime, endTime, attendees } = await request.json();

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields: startTime, endTime" },
        { status: 400 }
      );
    }

    // Use default title if not provided
    const meetingTitle = title || "Quick Meeting";

    const accessToken = await getGoogleAccessToken(uid);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Google not connected. Please sign in with Google again." },
        { status: 401 }
      );
    }

    const event = {
      summary: meetingTitle,
      description: description || "",
      start: { dateTime: startTime, timeZone: "Asia/Kolkata" },
      end: { dateTime: endTime, timeZone: "Asia/Kolkata" },
      attendees: attendees || [],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await fetch(`${GOOGLE_CALENDAR_URL}?conferenceDataVersion=1`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to create Google Meet event");
    }

    const data = await response.json();

    const meetUrl =
      data.hangoutLink ||
      data.conferenceData?.entryPoints?.[0]?.uri ||
      data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video")?.uri;

    return NextResponse.json({
      meetUrl: meetUrl || "",
      eventId: data.id,
      calendarUrl: data.htmlLink,
      success: true,
    });
  } catch (error: any) {
    console.error("Error creating Meet link:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to create Google Meet link" },
      { status: 500 }
    );
  }
}