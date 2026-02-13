import { createOpenAI } from "@ai-sdk/openai";

export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const textModel = openrouter("deepseek/deepseek-chat-v3-0324");
export const visionModel = openrouter("qwen/qwen2.5-vl-72b-instruct");
