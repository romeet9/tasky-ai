import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const { subtaskId } = await params;
    const body = await request.json();
    const { completed, taskId } = body;

    if (completed === undefined || !taskId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const taskRef = adminDb.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const taskData = taskDoc.data();
    if (taskData?.userId !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedSubtasks = (taskData?.subtasks || []).map((st: any) =>
      st.id === subtaskId ? { ...st, completed } : st
    );

    await taskRef.update({ subtasks: updatedSubtasks });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 }
    );
  }
}