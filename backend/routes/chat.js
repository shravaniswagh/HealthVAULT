const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

// POST /api/chat
router.post('/', authMiddleware, async (req, res) => {
  const { messages, userHealthContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

<<<<<<< HEAD
=======
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

>>>>>>> f346220b8367c7f770d8d6b55a1e314826d9ffdf
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build health context from DB if not provided
    let healthContext = userHealthContext;
    if (!healthContext) {
      const { rows: metrics } = await db.query(`
        SELECT m.* FROM metrics m
        INNER JOIN (
          SELECT name, MAX(recorded_at) as max_date FROM metrics WHERE user_id = $1 GROUP BY name
        ) latest ON m.name = latest.name AND m.recorded_at = latest.max_date
        WHERE m.user_id = $2
      `, [req.user.id, req.user.id]);

      if (metrics.length > 0) {
        healthContext = metrics.map(m =>
          `${m.name}: ${m.value} ${m.unit} (${m.status}, normal: ${m.normal_min ?? '?'}–${m.normal_max ?? '?'})`
        ).join('\n');
      }
    }

<<<<<<< HEAD
    const systemPrompt = `You are a knowledgeable, empathetic AI Health Assistant for the HealthVault platform. 
You help users understand their health metrics, lab reports, and provide evidence-based lifestyle recommendations.
=======
    const systemPromptText = `You are a knowledgeable, empathetic AI Health Assistant for the HealthVault platform. You help users understand their health metrics, lab reports, and provide evidence-based lifestyle recommendations.
>>>>>>> f346220b8367c7f770d8d6b55a1e314826d9ffdf

${healthContext ? `The user's current health metrics:\n${healthContext}\n` : 'The user has no health metrics recorded yet.'}

Guidelines:
- Be warm, supportive, and professional
- Always recommend consulting a doctor for medical decisions
- Use markdown formatting for clarity (bold, bullets, etc.)
- Keep responses concise but complete
- Reference the user's actual data when relevant`;

<<<<<<< HEAD
    // Convert messages to Gemini format
    let startIndex = 0;
    while (startIndex < messages.length - 1 && messages[startIndex].role === 'assistant') {
      startIndex++;
    }
    
    const history = messages.slice(startIndex, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1];
    
    // Check missing API Key
    if (!process.env.GEMINI_API_KEY) {
       return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }
    
    const chat = model.startChat({
      history,
      systemInstruction: systemPrompt,
    });

=======
    // Convert frontend messages to Gemini history format.
    // Inject system prompt as the very first user/model exchange so Gemini
    // understands context without echoing the prompt back.
    const userMessages = messages.slice(0, -1).filter(m => m.role === 'user' || m.role === 'assistant');

    const history = [
      { role: 'user', parts: [{ text: systemPromptText }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to assist as a HealthVault AI Health Assistant.' }] },
      ...userMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
>>>>>>> f346220b8367c7f770d8d6b55a1e314826d9ffdf
    const result = await chat.sendMessage(lastMessage.content);
    const responseText = result.response.text();

    res.json({ content: responseText });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Chat failed: ' + err.message });
  }
});

module.exports = router;
<<<<<<< HEAD
=======

>>>>>>> f346220b8367c7f770d8d6b55a1e314826d9ffdf
