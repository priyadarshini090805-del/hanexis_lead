import OpenAI from 'openai'

// lazy init so it doesn't blow up on frontend builds
let _client: OpenAI | null = null

export function getOpenAI() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return _client
}

export type MessageType = 'connection' | 'followup' | 'pitch'

function buildPrompt(type: MessageType, lead: {
  name: string
  company?: string
  position?: string
  source: string
}): string {
  const context = `Name: ${lead.name}${lead.company ? `, Company: ${lead.company}` : ''}${lead.position ? `, Position: ${lead.position}` : ''}, Platform: ${lead.source}`

  const prompts: Record<MessageType, string> = {
    connection: `Write a short, personalized LinkedIn connection request message for this lead. Keep it under 300 characters, casual but professional. Don't be salesy. Lead info: ${context}`,
    followup: `Write a short follow-up message for a lead who hasn't responded yet. Be warm, add value, don't be pushy. 2-3 sentences max. Lead info: ${context}`,
    pitch: `Write a concise sales pitch message tailored to this lead. Focus on how we can help their business. Keep it under 150 words, conversational tone. Lead info: ${context}`,
  }

  return prompts[type]
}

export async function generateMessage(
  type: MessageType,
  lead: { name: string; company?: string; position?: string; source: string }
): Promise<string> {
  const openai = getOpenAI()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful sales assistant that writes personalized outreach messages. Write naturally, like a real person would. Avoid buzzwords and corporate speak.',
      },
      {
        role: 'user',
        content: buildPrompt(type, lead),
      },
    ],
    temperature: 0.85, // slight variation so messages feel human
    max_tokens: 300,
  })

  return completion.choices[0].message.content ?? ''
}
