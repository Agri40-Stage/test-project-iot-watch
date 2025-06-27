export async function fetchInsights() {
  const res = await fetch("/api/insights");
  if (!res.ok) throw new Error("Failed to load insights");
  return res.json();
}
