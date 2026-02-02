import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Flico, a movie expert.
Write a clear and concise actor profile that includes the following information: 
- Full name and birth details (date and place). 
- Brief overview of their career (acting, other professions if relevant). 
- Key achievements and notable roles. 
- Any important awards or recognitions. 
- Interesting personal or professional facts that make them unique. 

Use simple, easy-to-understand language. 
Organize the information in short paragraphs or bullet points for readability. 
Keep the tone neutral and informative.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { actor } = req.body;

    if (!actor) {
        return res.status(400).json({ message: 'Actor data is required' });
    }

    const userPrompt = `Generate a profile for the following actor based on the available data:
    Name: ${actor.name}
    Birth: ${actor.birthday} (${actor.place_of_birth})
    Known For: ${actor.notable_works?.map(w => w.title).join(', ')}
    Biography (TMDB): ${actor.biography || 'Not available'}
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
    });

    return res.status(200).json({ profile: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
