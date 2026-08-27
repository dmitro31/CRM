import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'


export interface AiTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) { }

  async generateJson<T>(
    prompt: string,
    schema: Record<string, unknown>,
  ): Promise<T> {
    const apiKey = this.config.getOrThrow<string>('ai.apiKey')
    const model = this.config.getOrThrow<string>('ai.model')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.text()
      throw new InternalServerErrorException(
        `AI generation failed: ${errorBody}`,
      )
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new InternalServerErrorException(
        'AI returned an empty response',
      )
    }

    return JSON.parse(text) as T
  }



  async chatWithTools(
    prompt: string,
    tools: AiTool[],
    executeTool: (name: string, args: any) => Promise<unknown>,
  ): Promise<string> {
    const apiKey = this.config.getOrThrow<string>('ai.apiKey')
    const model = this.config.getOrThrow<string>('ai.model')

    const contents: any[] = [
      { role: 'user', parts: [{ text: prompt }] },
    ]

    const maxSteps = 8

    for (let step = 0; step < maxSteps; step++) {
      const response = await fetch(
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
                functionDeclarations: tools.map(tool => ({
                  name: tool.name,
                  description: tool.description,
                  parameters: tool.parameters,
                })),
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        const errorBody = await response.text()
        throw new InternalServerErrorException(
          `AI generation failed: ${errorBody}`,
        )
      }

      const data = await response.json()
      const parts = data.candidates?.[0]?.content?.parts ?? []

      console.log(`[AI step ${step}] parts:`, JSON.stringify(parts, null, 2))

      const functionCallPart = parts.find(
        (part: any) => part.functionCall,
      )

      if (!functionCallPart) {
        const textPart = parts.find((part: any) => part.text)
        return textPart?.text ?? 'Не вдалося сформувати відповідь'
      }

      contents.push({
        role: 'model',
        parts: [functionCallPart],
      })

      const { name, args } = functionCallPart.functionCall

      console.log(`[AI step ${step}] calling tool "${name}" with args:`, args)

      const result = await executeTool(name, args)

      console.log(`[AI step ${step}] tool result:`, JSON.stringify(result))

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
      })
    }

    throw new InternalServerErrorException(
      'AI assistant exceeded maximum tool call steps',
    )
  }

}

