import { createOpenAI } from "@ai-sdk/openai";

const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const qwen = createOpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.QWEN_API_KEY,
});

// Text → flashcard JSON (cheap, high quality)
export const textModel = deepseek("deepseek-chat");

// Image → OCR only (cheaper vision model, just extract text)
export const ocrModel = qwen("qwen-vl-plus");
