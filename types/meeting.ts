export interface Meeting {
  id: string;
  userId: string;
  title: string;
  description?: string;
  meetingUrl?: string;
  durationMinutes?: number;
  status: "scheduled" | "in-progress" | "completed";
  audioUrl?: string;
  createdAt: string;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  name: string;
  email?: string;
}

export interface ActionItem {
  task: string;
  owner: string;
  deadline: string;
}

export interface RoadmapPhase {
  phase: string;
  items: string[];
}

export interface MeetingMinutes {
  id: string;
  meetingId: string;
  userId: string;
  transcript?: string;
  summary?: string;
  actionItems: ActionItem[];
  decisions: string[];
  roadmap: RoadmapPhase[];
  createdAt: string;
}

export interface CreateMeetingInput {
  title: string;
  description?: string;
  meetingUrl?: string;
  durationMinutes?: number;
  participants?: { name: string; email?: string }[];
}

export interface TranscribeMeetingInput {
  meetingId: string;
  audioFile: File;
  language?: string;
}

export interface MOMGenerationResult {
  summary: string;
  action_items: ActionItem[];
  decisions: string[];
  roadmap: RoadmapPhase[];
}
