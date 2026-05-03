require("dotenv").config({ path: ".env.local" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // The SDK doesn't have a direct listModels, but we can try a few known ones
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent("test");
      console.log(`✅ ${modelName} is available`);
    } catch (e) {
      console.log(`❌ ${modelName} failed: ${e.message}`);
    }
  }
}

listModels().catch(console.error);
