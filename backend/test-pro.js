require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testPro() {
  const keys = [
    "AIzaSyAlsK2Q87zlp5O4vNdWGFwKT26JzDoI9qg",
    "AIzaSyACz1HSLlsmAs1_zfoLMUMi4FoGNVEc00s"
  ];
  
  for (const key of keys) {
    console.log(`Testing key starts with ${key.slice(0, 8)}... with model: gemini-1.5-pro`);
    const genAI = new GoogleGenerativeAI(key);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent('test');
      console.log('Success with gemini-1.5-pro');
      return;
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}

testPro();
