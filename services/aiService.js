const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-2.0-flash";

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = String(text).match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("AI returned invalid JSON: " + text);
    }

    return JSON.parse(match[0]);
  }
}

async function generateText(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt
  });

  const text =
    response.text ||
    response.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") ||
    "";

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  return text;
}

async function generateAISummaryAndTags(title, content) {
  const prompt = `
You are an AI note assistant.

Return ONLY valid JSON. Do not use markdown. Do not use code fences.

Analyze this note and return:
{
  "summary": "short summary under 60 words",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- Tags must be short lowercase words.
- Return 3 to 6 tags.
- No markdown.
- No extra text.

Title: ${title}

Content:
${content}
`;

  const text = await generateText(prompt);
  const parsed = safeParseJSON(text);

  return {
    summary: parsed.summary || "",
    tags: Array.isArray(parsed.tags) ? parsed.tags : []
  };
}

async function answerQuestionFromNotes(question, notes) {
  const context = notes
    .map((note, index) => {
      return `
Note ${index + 1}
Title: ${note.title}
Content: ${note.content}
Summary: ${note.summary || "No summary"}
Tags: ${(note.tags || []).join(", ")}
`;
    })
    .join("\n");

  const prompt = `
You are an AI assistant inside a private notes app.

Answer the user's question using ONLY the saved notes context below.
If the answer is not found in the notes, say:
"I could not find this in your saved notes."

Keep the answer clear, useful, and concise.

Question:
${question}

Saved notes:
${context}
`;

  return await generateText(prompt);
}

async function generateNoteFromTopic(topic) {
  const prompt = `
Create a useful note about this topic:

${topic}

Return ONLY valid JSON. Do not use markdown. Do not use code fences.

{
  "title": "clear note title",
  "content": "well structured note content",
  "summary": "short summary under 60 words",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- Content should be practical and beginner-friendly.
- Use clear sections.
- Tags must be lowercase.
- No markdown fences.
- No extra text.
`;

  const text = await generateText(prompt);
  const parsed = safeParseJSON(text);

  return {
    title: parsed.title || topic,
    content: parsed.content || "",
    summary: parsed.summary || "",
    tags: Array.isArray(parsed.tags) ? parsed.tags : []
  };
}

module.exports = {
  generateAISummaryAndTags,
  answerQuestionFromNotes,
  generateNoteFromTopic
};