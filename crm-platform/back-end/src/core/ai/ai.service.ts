import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AiTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: { result: unknown } };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
    finishReason?: string;
  }[];
}

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    delay = 1000,
  ): Promise<Response> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const response = await fetch(url, options);

      if (response.ok) return response;

      if ((response.status === 503 || response.status === 429) && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
        continue;
      }

      const errorBody = await response.text();
      throw new InternalServerErrorException(
        `AI generation failed [${response.status}]: ${errorBody}`,
      );
    }

    throw new InternalServerErrorException('AI generation failed after retries');
  }

  async generateJson<T>(
    prompt: string,
    schema: Record<string, unknown>,
  ): Promise<T> {
    const apiKey = this.config.getOrThrow<string>('ai.apiKey');
    const model = this.config.getOrThrow<string>('ai.model');

    const response = await this.fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        }),
      },
    );

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new InternalServerErrorException('AI returned an empty response');
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new InternalServerErrorException('AI response is not valid JSON');
    }
  }

  async chatWithTools(
    prompt: string,
    tools: AiTool[],
    executeTool: (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<unknown>,
  ): Promise<string> {
    const apiKey = this.config.getOrThrow<string>('ai.apiKey');
    const model = this.config.getOrThrow<string>('ai.model');

    const contents: GeminiContent[] = [
      { role: 'user', parts: [{ text: prompt }] },
    ];

    const maxSteps = 8;

    for (let step = 0; step < maxSteps; step++) {
      const response = await this.fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents,
            tools: [
              {
                functionDeclarations: tools.map((tool) => ({
                  name: tool.name,
                  description: tool.description,
                  parameters: tool.parameters,
                })),
              },
            ],
          }),
        },
      );

      const data = (await response.json()) as GeminiResponse;
      const candidateContent = data.candidates?.[0]?.content;
      const parts = candidateContent?.parts ?? [];

      const functionCallPart = parts.find((part) => part.functionCall !== undefined);

      if (!functionCallPart) {
        const textPart = parts.find((part) => part.text !== undefined);
        return textPart?.text ?? 'Не вдалося сформувати відповідь';
      }

      contents.push({
        role: 'model',
        parts,
      });

      const { name, args } = functionCallPart.functionCall!;

      const result = await executeTool(name, args);

      contents.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name,
              response: { result },
            },
          },
        ],
      });
    }

    throw new InternalServerErrorException(
      'AI assistant exceeded maximum tool call steps',
    );
  }
}