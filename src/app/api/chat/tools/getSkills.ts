// src/app/api/chat/tools/getContact.ts
import { tool } from "ai";
import { z } from "zod";

export const getSkills = tool({
  description: "Show the 'Skills' section",
  inputSchema: z.object({}),
  execute: async () => ({ ok: true }),
});
