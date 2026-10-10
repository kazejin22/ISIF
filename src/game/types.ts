// Deepfake Detective — content model.
// A mission is a sequence of stages; each stage awards up to `maxPoints`.

export interface HuntSegment {
  id: string;
  text: string;
  /** True when this segment is a red flag the player should click. */
  flag: boolean;
  explain: string;
}

export interface HuntStage {
  kind: "hunt";
  title: string;
  brief: string;
  maxPoints: number;
  /** Rendered as an email: header fields + body paragraphs, all clickable. */
  email: {
    from: HuntSegment;
    subject: HuntSegment;
    body: HuntSegment[];
    attachment?: HuntSegment;
  };
}

export interface ObserveItem {
  id: string;
  text: string;
  suspicious: boolean;
  explain: string;
}

export interface ObserveStage {
  kind: "observe";
  title: string;
  brief: string;
  maxPoints: number;
  scene: "video-call" | "social-post";
  /** Scene-specific script lines shown above the checklist. */
  transcript: { speaker: string; line: string }[];
  items: ObserveItem[];
}

export interface ChoiceOption {
  id: string;
  text: string;
  points: number;
  feedback: string;
}

export interface ChoiceStage {
  kind: "choice";
  title: string;
  brief: string;
  maxPoints: number;
  options: ChoiceOption[];
}

export interface OrderStage {
  kind: "order";
  title: string;
  brief: string;
  maxPoints: number;
  /** Listed in the CORRECT order; the UI shuffles them. */
  steps: { id: string; text: string; why: string }[];
}

export interface ImageRound {
  id: string;
  src: string;
  answer: "real" | "ai";
  explain: string;
  credit: string;
}

export interface RealOrFakeStage {
  kind: "real-or-fake";
  title: string;
  brief: string;
  maxPoints: number;
  secondsPerRound: number;
  rounds: ImageRound[];
}

export interface DialogueChoice {
  text: string;
  next: string;
  points: number;
  feedback: string;
}

export interface DialogueNode {
  id: string;
  lines: { speaker: "caller" | "voice" | "daughter" | "narrator"; text: string }[];
  /** No choices = ending. */
  choices?: DialogueChoice[];
  ending?: { title: string; good: boolean };
}

export interface DialogueStage {
  kind: "dialogue";
  title: string;
  brief: string;
  maxPoints: number;
  secondsPerChoice: number;
  /** Used when the timer runs out. */
  timeoutChoice: DialogueChoice;
  start: string;
  nodes: Record<string, DialogueNode>;
}

export type Stage = HuntStage | ObserveStage | ChoiceStage | OrderStage | RealOrFakeStage | DialogueStage;

export interface Mission {
  id: string;
  number: number;
  codename: string;
  title: string;
  tagline: string;
  location: string;
  year: number;
  /** id of the real incident in src/data/crimeData.ts that inspired the mission. */
  caseId?: string;
  skill: string;
  briefing: string[];
  stages: Stage[];
  lessons: string[];
}

/** One line of feedback collected while playing, shown in the debrief. */
export interface FeedbackEntry {
  good: boolean;
  text: string;
}

export interface StageResult {
  points: number;
  maxPoints: number;
  feedback: FeedbackEntry[];
}
