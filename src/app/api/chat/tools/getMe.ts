// src/app/api/chat/tools/getMe.ts
import { tool } from "ai";
import { z } from "zod";
export const getMe = tool({
  description: "Show the 'About Me' section",
  inputSchema: z.object({}),
  execute: async () => ({ ok: true }),
});
