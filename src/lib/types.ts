export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  role: Role;
  content: string;
}

export type TabKey = "me" | "projects" | "skills" | "contact";
