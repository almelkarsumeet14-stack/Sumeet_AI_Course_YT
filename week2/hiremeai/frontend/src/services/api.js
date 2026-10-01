const API_BASE_URL = "http://127.0.0.1:8000";

export async function askHireMeAI(question) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question: question
    })
  });

  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status})`);
  }

  return await response.json();
}