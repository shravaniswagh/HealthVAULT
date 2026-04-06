require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAllModels() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key);
  
  try {
    // In newer versions of @google/generative-ai, listModels might be different.
    // Let's try to use the GenAI client's internal methods if needed or a simple fetch.
    const axios = require('axios');
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    console.log('Available Models:');
    response.data.models.forEach(m => {
      console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch (err) {
    console.error('Error listing models:', err.response ? err.response.data : err.message);
  }
}

listAllModels();
