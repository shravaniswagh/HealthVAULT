require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const KEY1 = "AIzaSyAlsK2Q87zlp5O4vNdWGFwKT26JzDoI9qg";
const KEY2 = "AIzaSyACz1HSLlsmAs1_zfoLMUMi4FoGNVEc00s";

async function testOCR(key, name) {
  if (!key) {
    console.log(`[${name}] Skip: Key is missing`);
    return;
  }
  console.log(`Testing key [${name}] starts with ${key.slice(0, 8)}... with model: gemini-1.5-flash`);
  
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say "OCR Test Successful"');
    console.log(`[${name}] Response:`, result.response.text());
  } catch (err) {
    console.error(`[${name}] Error:`, err.message);
  }
}

async function main() {
  await testOCR(process.env.GEMINI_API_KEY, 'ENV_KEY');
  await testOCR(KEY1, 'KEY1');
  await testOCR(KEY2, 'KEY2');
}

main();
