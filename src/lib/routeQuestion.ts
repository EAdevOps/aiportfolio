import type { TabKey } from "./types";

const rules: [TabKey, RegExp][] = [
  ["about", /(about|bio|who|yourself|intro|background|experience)/i],
  ["projects", /(project|portfolio|built|made|repo|github|demo|case\s*study)/i],
  [
    "skills",
    /(skill|stack|tech|tools|language|framework|experience with|expertise)/i,
  ],
  ["contact", /(contact|email|reach|hire|connect|linkedin|github|phone)/i],
];

export function routeQuestion(text: string): TabKey | null {
  const s = text.trim().toLowerCase();
  for (const [tab, re] of rules) if (re.test(s)) return tab;
  return null;
}
