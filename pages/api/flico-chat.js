import { PureChatAI } from '../../lib/pureChatAI';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    // Initialize Pure Chat AI
    const ai = new PureChatAI();
    
    // Get reply based on conversation history
    const replyContent = ai.reply(messages || []);

    // Simulate a short "thinking" delay for better UX
    await new Promise(resolve => setTimeout(resolve, 600));

    return res.status(200).json({ 
      reply: { 
        role: "assistant", 
        content: replyContent 
      } 
    });

  } catch (error) {
    console.error('PureChatAI Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
