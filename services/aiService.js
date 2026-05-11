const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI returned invalid JSON");
    }
    return JSON.parse(match[0]);
  }
}

async function generateAISummaryAndTags(title, content) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are an AI note assistant.

Return ONLY valid JSON:
{
  "summary": "short summary under 60 words",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- Tags must be short lowercase words.
- Return 3 to 6 tags.
- Do not include markdown.
- Do not include extra text.

Title: ${title}

Content:
${content}
`
  });

  const result = safeParseJSON(response.output_text);

  return {
    summary: result.summary || "",
    tags: Array.isArray(result.tags) ? result.tags : []
  };
}

async function answerQuestionFromNotes(question, notes) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

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

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are an AI assistant inside a private notes app.

Answer the user's question using ONLY the saved notes context below.
If the answer is not found in the notes, say:
"I could not find this in your saved notes."

Keep the answer clear and useful.

Question:
${question}

Saved notes:
${context}
`
  });

  return response.output_text;
}

async function generateNoteFromTopic(topic) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
Create a useful note about this topic:

"${topic}"

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
- Do not include markdown fences.
- Do not include extra text.
`
  });

  const result = safeParseJSON(response.output_text);

  return {
    title: result.title || topic,
    content: result.content || "",
    summary: result.summary || "",
    tags: Array.isArray(result.tags) ? result.tags : []
  };
}

module.exports = {
  generateAISummaryAndTags,
  answerQuestionFromNotes,
  generateNoteFromTopic
};