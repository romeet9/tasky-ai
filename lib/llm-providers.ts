import Groq from "groq-sdk";

interface LLMResponse {
  content: string;
  usage?: { total_tokens: number };
}

interface LLMProvider {
  name: string;
  chat(
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: "json_object" | "text" };
    }
  ): Promise<LLMResponse>;
}

export class GroqProvider implements LLMProvider {
  name = "Groq";
  private client: Groq;
  private model = "llama-3.3-70b-versatile";

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: "json_object" | "text" };
    }
  ): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as any,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 3000,
      response_format: options.response_format as { type: "json_object" } | undefined,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Groq");

    return {
      content,
      usage: response.usage
        ? { total_tokens: response.usage.total_tokens }
        : undefined,
    };
  }
}

export class OllamaProvider implements LLMProvider {
  name = "Ollama";
  private model = "gemma4:31b-cloud";

  async chat(
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: string };
    }
  ): Promise<LLMResponse> {
    const baseUrl = process.env.OLLAMA_BASE_URL || "https://ollama.com";
    const apiKey = process.env.OLLAMA_API_KEY;

    if (!apiKey) throw new Error("Ollama API key not configured");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.max_tokens ?? 3000,
        },
        format: options.response_format?.type === "json_object" ? "json" : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.message?.content;
    if (!content) throw new Error("No response from Ollama");

    return {
      content,
      usage: data.prompt_eval_count
        ? { total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0) }
        : undefined,
    };
  }
}

export class TogetherProvider implements LLMProvider {
  name = "Together AI";
  private model = "meta-llama/Llama-3.3-70B-Instruct-Turbo";

  async chat(
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: string };
    }
  ): Promise<LLMResponse> {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) throw new Error("Together AI API key not configured");

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 3000,
        response_format: options.response_format,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Together AI request failed");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Together AI");

    return {
      content,
      usage: data.usage
        ? { total_tokens: data.usage.total_tokens }
        : undefined,
    };
  }
}

export class OpenRouterProvider implements LLMProvider {
  name = "OpenRouter";
  private model = "google/gemma-4-31b-it";

  async chat(
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: string };
    }
  ): Promise<LLMResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OpenRouter API key not configured");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://task-planner-seven-zeta.vercel.app",
        "X-Title": "Tasky AI",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 3000,
        response_format: options.response_format,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenRouter request failed");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenRouter");

    return {
      content,
      usage: data.usage
        ? { total_tokens: data.usage.total_tokens }
        : undefined,
    };
  }
}

export async function chatWithFallback(
  messages: Array<{ role: string; content: string }>,
  options: {
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" | "text" };
  }
): Promise<{ content: string; usage?: { total_tokens: number }; provider: string }> {
  const providers = [
    new GroqProvider(),
    new OllamaProvider(),
    new TogetherProvider(),
    new OpenRouterProvider(),
  ];

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const result = await provider.chat(messages, options);
      return { ...result, provider: provider.name };
    } catch (error: any) {
      console.warn(`${provider.name} failed:`, error.message);
      errors.push(`${provider.name}: ${error.message}`);
    }
  }

  throw new Error(
    `All AI providers failed. Errors: ${errors.join(" | ")}`
  );
}
