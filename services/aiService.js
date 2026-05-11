const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateAISummaryAndTags(title, content) {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are an AI note assistant.

Analyze this note and return ONLY valid JSON in this format:
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

  return JSON.parse(response.output_text);
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

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are an AI assistant inside a private notes app.

Answer the user's question using ONLY the notes context below.
If the answer is not found in the notes, say:
"I could not find this in your saved notes."

Keep the answer clear, helpful, and concise.

User question:
${question}

Saved notes context:
${context}
`
  });

  return response.output_text;
}

async function generateNoteFromTopic(topic) {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
Create a useful study note about this topic:

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
- Use short sections.
- Tags must be lowercase.
- Do not include markdown fences.
`
  });

  return JSON.parse(response.output_text);
}

module.exports = {
  generateAISummaryAndTags,
  answerQuestionFromNotes,
  generateNoteFromTopic
};