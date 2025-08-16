import type { ChatMessage } from "./types";

// ---- Conversation messages (dev in-memory)
const store = new Map<string, ChatMessage[]>();

export function loadConversation(id: string): ChatMessage[] {
  return store.get(id) ?? [];
}

export function saveConversation(id: string, messages: ChatMessage[]) {
  const MAX = 20;
  store.set(id, messages.slice(-MAX));
}

// ---- Simple per-conversation meta
type Meta = { offTopicStreak: number };
const metaStore = new Map<string, Meta>();

export function getMeta(id: string): Meta {
  return metaStore.get(id) ?? { offTopicStreak: 0 };
}

export function setMeta(id: string, meta: Meta) {
  metaStore.set(id, meta);
}

export function bumpOffTopic(id: string) {
  const m = getMeta(id);
  setMeta(id, { offTopicStreak: m.offTopicStreak + 1 });
}

export function resetOffTopic(id: string) {
  setMeta(id, { offTopicStreak: 0 });
}
