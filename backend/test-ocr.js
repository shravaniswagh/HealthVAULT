require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

async function testOCR() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say "OCR Test Successful"');
    console.log('Gemini Response:', result.response.text());
  } catch (err) {
    console.error('Gemini API Error:', err.message);
  }
}

testOCR();
