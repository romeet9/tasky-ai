import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/server";

const GOOGLE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

async function getGoogleAccessToken(uid: string): Promise<string | null> {
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) return null;
  return userDoc.data()?.googleAccessToken || null;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const accessToken = await getGoogleAccessToken(uid);
    if (!accessToken) {
      return NextResponse.json({
        meetings: [],
        error: "Google not connected",
      });
    }

    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    const response = await fetch(`${GOOGLE_CALENDAR_URL}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch calendar events");
    }

    const data = await response.json();
    const events = data.items || [];

    const meetings = events.map((event: any) => {
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;

      let durationMinutes = 30;
      if (start && end) {
        const startMs = new Date(start).getTime();
        const endMs = new Date(end).getTime();
        durationMinutes = Math.round((endMs - startMs) / (1000 * 60));
      }

      const meetUrl =
        event.hangoutLink ||
        event.conferenceData?.entryPoints?.[0]?.uri ||
        event.conferenceData?.entryPoints?.find(
          (ep: any) => ep.entryPointType === "video"
        )?.uri;

      let status: "scheduled" | "in-progress" | "completed" = "scheduled";
      if (event.status === "cancelled") {
        status = "completed";
      } else if (start && new Date(start).getTime() < Date.now()) {
        status = "in-progress";
      }

      return {
        id: `gcal-${event.id}`,
        userId: uid,
        title: event.summary || "Untitled Event",
        description: event.description || "",
        meetingUrl: meetUrl || "",
        durationMinutes,
        status,
        createdAt: start || new Date().toISOString(),
        source: "google-calendar" as const,
        eventId: event.id,
        htmlLink: event.htmlLink,
      };
    });

    return NextResponse.json({ meetings, success: true });
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch Google Calendar events";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}