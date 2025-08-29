// src/app/api/chat/tools/getMe.ts
import { tool } from "ai";
import { z } from "zod";

export const getContact = tool({
  description: "Show the 'Contact' section",
  inputSchema: z.object({}),
  execute: async () => ({ ok: true }),
});
