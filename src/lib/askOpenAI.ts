export async function askOpenAI(q: string): Promise<string> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return (data?.answer as string) ?? "Sorry, I couldn’t find an answer.";
}
