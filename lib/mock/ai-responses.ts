// Mock AI therapy responses (CBT-aligned and empathetic)
export const mockAIResponses: Record<string, string[]> = {
  greeting: [
    "Hello! I'm here to support you today. Take all the time you need to share what's on your mind. What would you like to talk about?",
    "Welcome! It's great that you're taking this step. I'm here to listen without judgment. How are you feeling right now?",
    "Hi there! I'm glad you're here. This is a safe space for you to express yourself. What brings you here today?",
  ],

  anxiety: [
    "It sounds like you're experiencing some anxiety. That's a completely valid feeling. Let's explore what might be triggering these feelings. Can you tell me more about when you first noticed this?",
    "Anxiety can feel overwhelming, but remember that feelings are temporary. Let's try to identify the thoughts behind these feelings. What's going through your mind right now?",
    "I hear that you're feeling anxious. Let's work together to understand this better. Sometimes our thoughts can amplify anxiety. What specific thoughts are you having?",
  ],

  sadness: [
    "I can sense that you're going through a difficult time. It's okay to feel sad, and I'm here to support you. Would you like to talk about what's contributing to these feelings?",
    "Feeling sad is a natural response to challenging situations. Let's explore these feelings together. What do you think is at the root of this sadness?",
    "Thank you for sharing how you're feeling. Sadness often carries important messages. What has been weighing on your mind lately?",
  ],

  stress: [
    "Stress can be really challenging to manage. Let's break down what's causing this stress so we can address it one step at a time. What feels most overwhelming right now?",
    "It sounds like you have a lot on your plate. Remember, it's okay to feel stressed, but we can work on strategies to help you cope. What areas of your life feel most stressful?",
    "I understand that stress can make everything feel harder. Let's identify what you can control and what you might need to let go of. What's the biggest source of stress for you right now?",
  ],

  positive: [
    "That's wonderful to hear! It's important to acknowledge and celebrate these positive moments. What do you think contributed to feeling this way?",
    "I'm so glad you're experiencing something positive. Let's explore what's working well for you so we can build on it. What made today better than others?",
    "It's great that you're noticing these positive feelings. Recognizing what brings us joy is an important part of wellness. What else has been going well?",
  ],

  challenge: [
    "Facing challenges is never easy, but it shows strength that you're confronting this. Let's think about how you've overcome difficulties in the past. What strategies have helped you before?",
    "Challenges can feel overwhelming, but they're also opportunities for growth. Let's break this down into smaller, manageable steps. What feels like the first thing you could address?",
    "I hear that you're dealing with something difficult. Remember, you don't have to have all the answers right now. What support do you think would be most helpful?",
  ],

  thoughts: [
    "Our thoughts have a powerful impact on how we feel. Let's examine this thought together. Is there evidence that supports or challenges this way of thinking?",
    "That's an interesting thought. Sometimes our minds can jump to conclusions. Let's explore whether this thought is based on facts or assumptions. What evidence do you have?",
    "It sounds like you're having some challenging thoughts. Let's practice thought reframing. Is there another way to look at this situation?",
  ],

  default: [
    "Thank you for sharing that with me. I want to make sure I understand correctly. Can you tell me more about how this makes you feel?",
    "I appreciate you opening up about this. Let's explore this further together. What would you like to focus on?",
    "That's important information. Let's take a moment to reflect on what you've shared. What aspect of this would you like to explore more deeply?",
    "I hear you, and I want to support you in the best way possible. How are you feeling about this right now?",
  ],
}

// Analyze message and return appropriate response category
export function getResponseCategory(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.match(/\b(hello|hi|hey|greet)\b/)) return "greeting"
  if (lowerMessage.match(/\b(anxious|anxiety|worried|nervous|panic)\b/)) return "anxiety"
  if (lowerMessage.match(/\b(sad|depressed|down|unhappy|lonely)\b/)) return "sadness"
  if (lowerMessage.match(/\b(stress|stressed|overwhelm|pressure)\b/)) return "stress"
  if (lowerMessage.match(/\b(happy|good|great|better|positive|joy)\b/)) return "positive"
  if (lowerMessage.match(/\b(difficult|hard|challenge|struggle|problem)\b/)) return "challenge"
  if (lowerMessage.match(/\b(think|thought|believe|feel like)\b/)) return "thoughts"

  return "default"
}

// Get a random response from the appropriate category
export function getMockAIResponse(message: string): string {
  const category = getResponseCategory(message)
  const responses = mockAIResponses[category] || mockAIResponses.default
  return responses[Math.floor(Math.random() * responses.length)]
}
