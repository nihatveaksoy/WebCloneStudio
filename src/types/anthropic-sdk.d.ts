declare module "@anthropic-ai/sdk" {
  interface MessageCreateParams {
    model: string
    max_tokens: number
    system: string
    messages: Array<{ role: string; content: string }>
  }

  interface ContentBlock {
    type: string
    text?: string
  }

  interface MessageResponse {
    content: ContentBlock[]
  }

  interface Messages {
    create(params: MessageCreateParams): Promise<MessageResponse>
  }

  export default class Anthropic {
    messages: Messages
    constructor(config?: { apiKey?: string })
  }
}
