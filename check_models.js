require("dotenv").config({ path: ".env.local" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("hi");
      console.log(`Model ${modelName}: SUCCESS`);
    } catch (e) {
      console.log(`Model ${modelName}: FAILED - ${e.message}`);
    }
  }
}

listModels();
