// src/app/api/chat/tools/getSkills.ts
import { tool } from "ai";
import { z } from "zod";

export const getProjects = tool({
  description: "Show the 'Projects' section",
  inputSchema: z.object({}),
  execute: async () => ({ ok: true }),
});
