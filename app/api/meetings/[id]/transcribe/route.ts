import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/server";
import Groq from "groq-sdk";
import { transcribeAudio } from "@/lib/sarvam";
import type { MOMGenerationResult } from "@/types/meeting";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const { id: meetingId } = await params;

    // Verify meeting belongs to user
    const meetingDoc = await adminDb.collection("meetings").doc(meetingId).get();
    if (!meetingDoc.exists || meetingDoc.data()?.userId !== uid) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const language = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json(
        { error: "Missing 'audio' file in request body" },
        { status: 400 }
      );
    }

    // Step 1: Transcribe audio via Sarvam AI
    const audioBuffer = await audioFile.arrayBuffer();
    const transcription = await transcribeAudio(audioBuffer, language);

    // Step 2: Generate MOM via LLM
    const systemPrompt = {
      role: "system" as const,
      content: `You are a meeting minutes assistant. Analyze this meeting transcript and generate structured meeting minutes in English.

Respond ONLY with valid JSON in this exact format — no markdown, no code blocks, no extra text:

{
  "summary": "Brief 2-3 sentence summary of the meeting",
  "action_items": [
    { "task": "Action item description", "owner": "Person name or 'Unassigned'", "deadline": "Date or 'TBD'" }
  ],
  "decisions": ["Decision 1", "Decision 2"],
  "roadmap": [
    { "phase": "Week 1", "items": ["Item 1", "Item 2"] }
  ]
}

Rules:
- Output must be in English regardless of meeting language
- Action items should be specific and actionable
- Extract owner names from the transcript when mentioned
- Include all key decisions made
- Generate a roadmap if project timelines were discussed
- Maximum 10 action items
- If no roadmap can be inferred, return an empty array`,
    };

    const userMessage = {
      role: "user" as const,
      content: `Meeting transcript:\n\n${transcription.transcript}`,
    };

    const groqResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [systemPrompt, userMessage],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const momContent = groqResponse.choices[0]?.message?.content;
    if (!momContent) throw new Error("No response from LLM");

    const mom: MOMGenerationResult = JSON.parse(momContent);

    // Step 3: Save MOM to Firestore
    const momRef = await adminDb.collection("meeting_minutes").add({
      meetingId,
      userId: uid,
      transcript: transcription.transcript,
      summary: mom.summary,
      actionItems: mom.action_items,
      decisions: mom.decisions,
      roadmap: mom.roadmap,
      createdAt: new Date(),
    });

    // Step 4: Extract action items as tasks
    const createdTasks: any[] = [];
    for (const item of mom.action_items) {
      const taskRef = await adminDb.collection("tasks").add({
        userId: uid,
        title: item.task,
        description: `Action item from meeting`,
        category: "Work",
        status: "pending",
        createdAt: new Date(),
        subtasks: [],
      });

      createdTasks.push({
        id: taskRef.id,
        title: item.task,
        description: `Action item from meeting`,
        category: "Work",
        status: "pending",
      });
    }

    return NextResponse.json({
      mom: {
        id: momRef.id,
        summary: mom.summary,
        actionItems: mom.action_items,
        decisions: mom.decisions,
        roadmap: mom.roadmap,
        createdAt: new Date().toISOString(),
      },
      tasks: createdTasks,
      success: true,
    });
  } catch (error: any) {
    console.error("Error transcribing meeting:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to transcribe meeting" },
      { status: 500 }
    );
  }
}