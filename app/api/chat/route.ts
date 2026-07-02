import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/server";
import { GroqProvider, OllamaProvider } from "@/lib/llm-providers";
import { getWorkspace, getMembership, listMembers } from "@/lib/workspace/server";
import { can } from "@/lib/rbac/permissions";
import type { WorkspaceMember } from "@/types/workspace";

const DETAIL_PROMPTS: Record<string, string> = {
  brief: "Generate minimal tasks — just titles and 1-2 very short subtasks. No descriptions. Keep it extremely concise.",
  standard: "Generate clear tasks with titles, short descriptions, and 3-4 practical subtasks. Keep descriptions to one sentence.",
  detailed: "Generate comprehensive tasks with full descriptions, 4-5 detailed subtasks, estimated effort (e.g., 30min, 1hr), and note any dependencies between subtasks.",
  comprehensive: "Generate thorough tasks with detailed descriptions, 4-5 subtasks with estimated effort and dependencies, success criteria for each task, potential blockers to watch for, and suggested priority levels (high/medium/low).",
};

async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { user: null, error: new Error("No token") };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { user: { uid: decodedToken.uid }, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, detailLevel, fileContext, model: selectedModel, workspaceId } =
      await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing 'messages' array" },
        { status: 400 }
      );
    }

    const detail = detailLevel || "standard";
    const detailPrompt = DETAIL_PROMPTS[detail] || DETAIL_PROMPTS.standard;
    const fileContextText = fileContext
      ? `\n\nAdditional context from uploaded files:\n${fileContext}`
      : "";

    // Assignment context: only when the caller is a manager (tasks:assign) in a
    // real (non-personal) team workspace. Otherwise the AI never assigns.
    let members: WorkspaceMember[] = [];
    let canAssign = false;
    if (workspaceId) {
      try {
        const ws = await getWorkspace(workspaceId);
        const membership = await getMembership(workspaceId, user.uid);
        if (ws && !ws.personal && membership && can(membership.role, "tasks:assign")) {
          members = await listMembers(workspaceId);
          canAssign = members.length > 0;
        }
      } catch {
        // No assignment context on error — fall back to normal behavior.
      }
    }

    const rosterText = canAssign
      ? `\n\nYou can assign tasks to these team members (use the EXACT name):\n${members
          .map((m) => `- ${m.displayName || m.email}`)
          .join("\n")}`
      : "";
    const assigneeField = canAssign
      ? `\n      "assignee": "Exact team member name from the list below, or null",`
      : "";
    const assignmentRules = canAssign
      ? `\n- Set "assignee" ONLY to a name from the team member list below. If the user names someone not on the list, or doesn't specify, use null and say so in your response.${rosterText}`
      : "";

    const systemPrompt = {
      role: "system" as const,
      content: `You are Tasky AI, a task planning assistant. When a user shares their plans for the day, break them into structured tasks with specific subtasks.

Detail level: ${detail}
${detailPrompt}

Respond ONLY with a JSON object in this exact format — no markdown, no code blocks, no extra text:

{
  "response": "A friendly, conversational summary of what you've created. Keep it brief (1-2 sentences).",
  "tasks": [
    {
      "title": "Clear task title",
      "description": "One sentence description",
      "category": "Work | Personal | Learning | Health | Meetings",
      "priority": "high | medium | low",
      "scheduledDate": "YYYY-MM-DD or null",${assigneeField}
      "subtasks": [
        { "label": "Specific, actionable subtask" }
      ]
    }
  ]
}

Rules:
- Follow the detail level specified above strictly
- Subtask labels must clearly describe what that subtask is about
- Detect the correct category from context
- Assign priority based on urgency and importance
- Extract scheduled dates if user mentions specific days
- Keep titles concise (under 80 chars)
- Maximum 6 tasks total
- If the user is adding to existing tasks, only generate NEW tasks, not duplicates
- Use any uploaded file context to make tasks more relevant and specific${assignmentRules}${fileContextText}`,
    };

    const llmMessages = [systemPrompt, ...messages];

    let result;
    let providerName: string;
    if (selectedModel === "ollama") {
      const provider = new OllamaProvider();
      result = await provider.chat(llmMessages, {
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      });
      providerName = "Gemma 4";
    } else {
      const provider = new GroqProvider();
      result = await provider.chat(llmMessages, {
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      });
      providerName = "Groq";
    }

    const parsed = (() => {
      let raw = result.content.trim();
      if (raw.startsWith("```")) {
        raw = raw
          .replace(/^```(?:json)?\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
      }
      return JSON.parse(raw);
    })();

    // Resolve an AI-provided assignee name to a real member uid. Never trust a
    // raw id from the model — match against the roster (exact, then loose).
    const resolveAssignee = (raw: unknown): { assigneeId: string | null; assigneeName: string | null } => {
      if (!canAssign || !raw) return { assigneeId: null, assigneeName: null };
      const needle = String(raw).trim().toLowerCase();
      if (!needle || needle === "null" || needle === "unassigned") {
        return { assigneeId: null, assigneeName: null };
      }
      const exact = members.find(
        (m) =>
          m.displayName?.toLowerCase() === needle ||
          m.email?.toLowerCase() === needle
      );
      const loose =
        exact ||
        members.find(
          (m) =>
            m.displayName?.toLowerCase().includes(needle) ||
            m.email?.toLowerCase().split("@")[0] === needle
        );
      return loose
        ? { assigneeId: loose.uid, assigneeName: loose.displayName || loose.email }
        : { assigneeId: null, assigneeName: null };
    };

    const rawTasks = parsed.tasks || [];
    const tasks = rawTasks.map((t: any) => {
      const title = (t.title || t.task || "Untitled").toString();
      const subtasks = (t.subtasks || []).map((st: any) => ({
        id: crypto.randomUUID(),
        label: typeof st === "string" ? st : st.label || st.task || "",
      }));

      return {
        id: crypto.randomUUID(),
        title: title.length > 80 ? title.substring(0, 80) + "..." : title,
        description: t.description || "",
        category: ["Work", "Personal", "Learning", "Health", "Meetings"].includes(
          t.category
        )
          ? t.category
          : "Personal",
        priority: ["high", "medium", "low"].includes(t.priority)
          ? t.priority
          : "medium",
        scheduledDate: t.scheduledDate || null,
        ...resolveAssignee(t.assignee),
        subtasks,
      };
    });

    return NextResponse.json({
      response:
        parsed.response ||
        `I've organized your brief into ${tasks.length} tasks. Review them below.`,
      tasks,
      success: true,
      provider: providerName,
    });
  } catch (error: any) {
    console.error("Chat API error:", error?.message || JSON.stringify(error));
    return NextResponse.json(
      { error: error?.message || "Failed to process chat message" },
      { status: 500 }
    );
  }
}