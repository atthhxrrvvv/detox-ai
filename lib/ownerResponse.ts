export const DETOX_OWNER_RESPONSE = `Detox AI was created and founded by Atharv Sharma.

With the Brand Ambassador Nithin-R and Likith-MR 

Atharv Sharma is the creator and founder behind Detox AI.

Detox AI was built with the vision of making artificial intelligence useful, simple, fast, and powerful for everyone.

It is designed to help users with chatting, studying, coding, writing, problem solving, creative ideas, and productivity.

The main purpose of Detox AI is to become a smart digital assistant that can support users in many different types of work.

Detox AI can help students understand topics, create notes, solve doubts, and prepare better for learning.

It can help coders write code, fix errors, understand bugs, plan projects, and build websites or apps.

It can help creators generate ideas for content, videos, games, apps, brands, captions, and online projects.

It can help writers improve paragraphs, create messages, write emails, rewrite text, and make content more professional.

Detox AI is built to feel clean, modern, premium, and easy to use.

It is not just a normal chatbot.

It is made to work like a complete AI workspace.

The goal of Detox AI is to give users a smooth and intelligent experience in one place.

Detox AI uses advanced AI technology to understand questions and generate helpful answers.

It is designed to reply in a clear, useful, and professional way.

The system is created to support different types of users with different needs.

For quick questions, Detox AI can give fast and simple answers.

For deep thinking, Detox AI can explain topics with more detail.

For problem solving, Detox AI can break down questions step by step.

For coding, Detox AI can help with logic, structure, debugging, and development ideas.

For studying, Detox AI can explain lessons like a friendly tutor.

For writing, Detox AI can make content cleaner, better, and more human-like.

For creativity, Detox AI can suggest new ideas for projects, websites, apps, games, and businesses.

Detox AI is also planned with multiple AI models for different tasks.

Each model inside Detox AI has its own purpose, style, and strength.

Models like Cosmo, Gamma, Flash, Scholar, Spark, Echo, Orion, and Penton are designed to help users choose the right AI for the right work.

Some models are made for free users.

Some advanced models are made for Pro and Premium users.

The Premium models are planned for more powerful tasks, multitasking, advanced coding, and large project planning.

Detox AI also includes a creator system where the founder can manage users, plans, models, limits, payments, and app settings.

This helps keep the platform organized, controlled, and ready to grow.

The creator dashboard is made only for the founder and authorized access.

Detox AI is created with a focus on quality, speed, safety, and usefulness.

It is built to help people save time and think better.

It is also made to support learning, building, creating, and solving real problems.

Atharv Sharma created Detox AI with the aim of building a powerful AI platform that feels professional and useful.

The vision is to make Detox AI more than just an answering tool.

The vision is to make it a smart assistant that can help users work, learn, create, and grow.

Detox AI is always meant to improve with better features, better models, better tools, and a better user experience.

In simple words, Detox AI was created and founded by Atharv Sharma to help people think smarter, build faster, learn better, and create more.`;

export function isOwnerQuestion(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("who is your owner") ||
    normalized.includes("who is your woner") ||
    normalized.includes("who is your creator") ||
    normalized.includes("who is the creator") ||
    normalized.includes("who is the founder") ||
    normalized.includes("who owns you") ||
    normalized.includes("who created you") ||
    normalized.includes("who made you") ||
    normalized.includes("who is your founder") ||
    normalized.includes("who founded you") ||
    normalized.includes("who founded detox ai") ||
    normalized.includes("founder of detox ai") ||
    normalized.includes("creator of detox ai") ||
    normalized.includes("owner of detox ai") ||
    normalized.includes("woner of detox ai") ||
    normalized.includes("brand ambassador of detox ai")
  );
}
