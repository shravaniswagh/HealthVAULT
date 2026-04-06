require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function diagnose() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes('YOUR_GEMINI_API_KEY')) {
    console.error('ERROR: GEMINI_API_KEY is not set in backend/.env');
    return;
  }

  console.log(`Diagnosing key starting with: ${key.substring(0, 10)}...`);
  const genAI = new GoogleGenerativeAI(key);

  try {
    console.log('Testing gemini-2.5-flash (2026 Standard)...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    // Note: listModels is not on genAI directly in some versions, 
    // but we can try to find it or just try common models.
    // In newer versions it might be via a separate client or not exposed.
    // Let's try to just guess some names or use the most common ones.
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.0-pro',
      'gemini-2.0-flash-exp'
    ];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent('test');
        console.log(`SUCCESS: ${m} is available!`);
      } catch (e) {
        console.log(`FAILED: ${m} - ${e.message.substring(0, 50)}...`);
      }
    }
  } catch (err) {
    console.error('Error listing models:', err.message);
  }
}

diagnose();
