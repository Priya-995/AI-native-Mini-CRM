const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function generateCopilotResponse(
  userMessage: string,
  history: { role: string; content: string }[]
): Promise<string> {
  // Get customer stats to give AI context
  let customerStats = {};
  try {
    const statsRes = await fetch(`${API}/stats`);
    customerStats = await statsRes.json();
  } catch {}

  const res = await fetch(`${API}/ai/copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history, customerStats }),
  });
  const data = await res.json();
  return data.reply;
}

export async function generateMessage(segment: string, channel: string): Promise<string> {
  const res = await fetch(`${API}/ai/generate-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segment, channel }),
  });
  const data = await res.json();
  return data.message;
}

export async function buildSegment(query: string) {
  const res = await fetch(`${API}/ai/segment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}