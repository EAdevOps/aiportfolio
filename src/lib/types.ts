export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  role: Role;
  content: string;
  id?: string; // used to key tool results to a specific assistant message
}
