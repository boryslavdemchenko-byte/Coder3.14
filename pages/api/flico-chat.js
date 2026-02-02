import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages || [],
    });

    return res.status(200).json({ reply: response.choices[0].message });
  } catch (error) {
    console.error('OpenAI Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
