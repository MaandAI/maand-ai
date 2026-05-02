const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkMessages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  
  const Message = mongoose.models.Message || mongoose.model('Message', new mongoose.Schema({
    sessionId: String,
    content: String,
    sender: String,
  }, { timestamps: true }));

  const messages = await Message.find({}).sort({ createdAt: -1 }).limit(10);
  console.log("Recent messages:");
  messages.forEach(m => {
    console.log(`[${m.sender}] Session: ${m.sessionId} Content: ${m.content.substring(0, 50)}...`);
  });

  const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', new mongoose.Schema({
    userId: String,
    title: String,
  }, { timestamps: true }));

  const sessions = await ChatSession.find({}).sort({ createdAt: -1 }).limit(5);
  console.log("\nRecent sessions:");
  sessions.forEach(s => {
    console.log(`ID: ${s._id} Title: ${s.title} User: ${s.userId}`);
  });

  await mongoose.disconnect();
}

checkMessages().catch(console.error);
