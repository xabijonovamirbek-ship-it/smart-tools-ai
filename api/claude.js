export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { messages, system } = req.body;
  const prompt = (system ? system + "\n\n" : "") + messages[messages.length - 1].content;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      res.status(200).json({ content: [{ type: "text", text: "GEMINI_ERROR: " + JSON.stringify(data.error) }] });
      return;
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      res.status(200).json({ content: [{ type: "text", text: "EMPTY_RESPONSE: " + JSON.stringify(data) }] });
      return;
    }

    res.status(200).json({ content: [{ type: "text", text }] });
  } catch (e) {
    res.status(200).json({ content: [{ type: "text", text: "SERVER_ERROR: " + e.message }] });
  }
}
