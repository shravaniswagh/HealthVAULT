require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const key1 = "AIzaSyAlsK2Q87zlp5O4vNdWGFwKT26JzDoI9qg";
  const genAI = new GoogleGenerativeAI(key1);
  try {
    // There isn't a direct listModels in the standard SDK easily, 
    // but we can try to call it via fetch if we want.
    // However, let's just try a different model name.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent('test');
    console.log('Success with gemini-1.5-flash-latest');
  } catch (err) {
    console.error('Error with gemini-1.5-flash-latest:', err.message);
  }
}

listModels();
