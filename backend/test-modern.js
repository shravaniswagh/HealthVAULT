require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModernModels() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key);
  
  const modernModels = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest'
  ];

  for (const m of modernModels) {
    console.log(`Testing ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('Say hello');
      console.log(`SUCCESS: ${m} works!`);
      console.log('Response:', result.response.text());
      return; // Stop if we find one
    } catch (err) {
      console.error(`FAILED: ${m} - ${err.message}`);
    }
  }
}

testModernModels();
