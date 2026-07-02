import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/server";
import type { Meeting, CreateMeetingInput } from "@/types/meeting";

async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { user: null, error: new Error("No token") };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      user: { uid: decodedToken.uid, email: decodedToken.email },
      error: null,
    };
  } catch (error) {
    return { user: null, error };
  }
}

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("meetings")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const meetings: (Meeting & { participants?: { name: string; email?: string }[] })[] = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      const participantsSnapshot = await adminDb
        .collection("meetings")
        .doc(doc.id)
        .collection("participants")
        .get();
      
      const participants = participantsSnapshot.docs.map((p) => {
        const pData = p.data();
        return {
          name: pData.name || '',
          email: pData.email || '',
        };
      });

      meetings.push({
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        meetingUrl: data.meetingUrl,
        durationMinutes: data.durationMinutes,
        status: data.status,
        audioUrl: data.audioUrl,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        participants: participants.length > 0 ? participants : undefined,
      });
    }

    return NextResponse.json({ meetings, success: true });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateMeetingInput = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "Missing 'title' in request body" },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection("meetings").add({
      userId: user.uid,
      title: body.title,
      description: body.description || "",
      meetingUrl: body.meetingUrl || "",
      durationMinutes: body.durationMinutes || 30,
      status: "scheduled",
      createdAt: new Date(),
    });

    if (body.participants && body.participants.length > 0) {
      const participantRefs = body.participants.map((p) =>
        adminDb.collection("meetings").doc(docRef.id).collection("participants").add({
          name: p.name,
          email: p.email,
        })
      );
      await Promise.all(participantRefs);
    }

    const meeting: Meeting = {
      id: docRef.id,
      userId: user.uid,
      title: body.title,
      description: body.description,
      meetingUrl: body.meetingUrl,
      durationMinutes: body.durationMinutes,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ meeting, success: true });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}