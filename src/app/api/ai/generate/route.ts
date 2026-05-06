import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { generateMessage } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { leadId, type } = body

    if (!leadId || !type) {
      return NextResponse.json({ error: 'leadId and type are required' }, { status: 400 })
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('name, company, position, source')
      .eq('id', leadId)
      .eq('user_id', session.user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const content = await generateMessage(type, lead)

    const { data: message, error: saveError } = await supabase
      .from('ai_messages')
      .insert({
        user_id: session.user.id,
        lead_id: leadId,
        type,
        content,
      })
      .select('*, lead:leads(name, company)')
      .single()

    if (saveError) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({ message })
  } catch (err) {
    console.error('AI generate error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
