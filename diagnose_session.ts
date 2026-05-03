require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const ChatSession = require("./models/ChatSession").default;
const User = require("./models/User").default;

async function diagnose() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const sessionId = "69f120debb53ceaa40e51306";
  const session = await ChatSession.findById(sessionId);

  if (!session) {
    console.log("Session not found in DB");
  } else {
    console.log("Session found:");
    console.log(" - ID:", session._id);
    console.log(" - UserID:", session.userId);
    console.log(" - Status:", session.status);
    
    const user = await User.findById(session.userId);
    if (user) {
      console.log(" - Owner Email:", user.email);
    } else {
      console.log(" - Owner not found in Users collection");
    }
  }

  const allSessions = await ChatSession.find().limit(5);
  console.log("\nRecent Sessions:");
  allSessions.forEach(s => console.log(` - ${s._id} (${s.userId})`));

  process.exit(0);
}

diagnose().catch(console.error);
