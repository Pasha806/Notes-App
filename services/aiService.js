const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  console.warn("WARNING: GROQ_API_KEY is missing");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = "llama-3.1-8b-instant";

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

async function generateText(messages) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.4,
    max_tokens: 1200
  });

  const text = response.choices?.[0]?.message?.content || "";

  if (!text) {
    throw new Error("Groq returned empty response");
  }

  return text;
}

async function generateAISummaryAndTags(title, content) {
  const text = await generateText([
    {
      role: "system",
      content: "You are an AI note assistant. Return only valid JSON. Do not use markdown or code fences."
    },
    {
      role: "user",
      content: `
Analyze this note and return ONLY valid JSON:

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
`
    }
  ]);

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

  return await generateText([
    {
      role: "system",
      content: `
You are an AI assistant inside a private notes app.
Answer using ONLY the user's saved notes.
If the answer is not found in the notes, say:
"I could not find this in your saved notes."
Keep the answer clear and useful.
`
    },
    {
      role: "user",
      content: `
Question:
${question}

Saved notes:
${context}
`
    }
  ]);
}

async function generateNoteFromTopic(topic) {
  const text = await generateText([
    {
      role: "system",
      content: "You create structured study notes. Return only valid JSON. Do not use markdown or code fences."
    },
    {
      role: "user",
      content: `
Create a useful note about this topic:

${topic}

Return ONLY valid JSON:

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
`
    }
  ]);

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