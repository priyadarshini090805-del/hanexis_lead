'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Lead, AIMessage } from '@/types'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

type MsgType = 'connection' | 'followup' | 'pitch'

const typeStyle: Record<MsgType, { background: string; color: string; label: string }> = {
  connection: { background: '#EFF6FF', color: '#2563EB', label: 'Connection Request' },
  followup: { background: '#FDF4FF', color: '#9333EA', label: 'Follow-up' },
  pitch: { background: '#F0FDF4', color: '#16A34A', label: 'Sales Pitch' },
}

function AIContent() {
  const searchParams = useSearchParams()
  const preselectedLeadId = searchParams.get('leadId')
  const [leads, setLeads] = useState<Lead[]>([])
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [selectedLead, setSelectedLead] = useState(preselectedLeadId ?? '')
  const [msgType, setMsgType] = useState<MsgType>('connection')
  const [generating, setGenerating] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: leadsData }, { data: msgsData }] = await Promise.all([
        supabase.from('leads').select('*').eq('user_id', user.id).order('name'),
        supabase.from('ai_messages').select('*, lead:leads(name, company)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ])
      setLeads(leadsData ?? [])
      setMessages((msgsData as AIMessage[]) ?? [])
      setLoadingHistory(false)
    }
    load()
  }, [])

  const generate = async () => {
    if (!selectedLead) { toast.error('Select a lead first'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLead, type: msgType }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Generation failed'); return }
      setMessages(prev => [data.message, ...prev])
      toast.success('Message generated!')
    } catch { toast.error('Something went wrong') }
    finally { setGenerating(false) }
  }

  const copyMsg = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    toast.success('Copied!')
  }

  const deleteMsg = async (id: string) => {
    await supabase.from('ai_messages').delete().eq('id', id)
    setMessages(prev => prev.filter(m => m.id !== id))
    toast.success('Deleted')
  }

  const selectStyle = {
    width: '100%', border: '1px solid #FCE7F3', borderRadius: '10px',
    padding: '10px 12px', fontSize: '13px', color: '#374151',
    background: '#fff', outline: 'none', fontFamily: "'Inter', sans-serif", cursor: 'pointer',
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '800px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#831843', fontWeight: 600 }}>
          AI Messages ✦
        </h1>
        <p style={{ fontSize: '13px', color: '#F9A8D4', marginTop: '4px' }}>Generate personalized outreach for your leads</p>
      </div>

      {/* Generator */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #FCE7F3', marginBottom: '24px', boxShadow: '0 2px 12px rgba(236,72,153,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <span style={{ fontSize: '18px' }}>✦</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>Generate Message</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '6px', fontWeight: 500 }}>Select Lead</label>
            <select value={selectedLead} onChange={e => setSelectedLead(e.target.value)} style={selectStyle}>
              <option value="">Choose a lead...</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name}{l.company ? ` — ${l.company}` : ''}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '6px', fontWeight: 500 }}>Message Type</label>
            <select value={msgType} onChange={e => setMsgType(e.target.value as MsgType)} style={selectStyle}>
              <option value="connection">Connection Request</option>
              <option value="followup">Follow-up</option>
              <option value="pitch">Sales Pitch</option>
            </select>
          </div>
        </div>
        <button onClick={generate} disabled={generating || !selectedLead} style={{
          background: generating || !selectedLead ? '#FCE7F3' : 'linear-gradient(135deg, #F472B6, #EC4899)',
          color: generating || !selectedLead ? '#F9A8D4' : '#fff',
          border: 'none', borderRadius: '10px', padding: '11px 20px',
          fontSize: '13px', fontWeight: 600, cursor: generating || !selectedLead ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Inter', sans-serif",
        }}>
          <span style={{ fontSize: '14px' }}>{generating ? '◌' : '✦'}</span>
          {generating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* History */}
      <div>
        <p style={{ fontSize: '11px', color: '#F9A8D4', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 500 }}>
          Message History
        </p>
        {loadingHistory ? (
          <p style={{ fontSize: '13px', color: '#F9A8D4' }}>Loading...</p>
        ) : messages.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #FCE7F3' }}>
            <p style={{ fontSize: '24px', marginBottom: '8px' }}>✦</p>
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No messages yet. Generate your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #FCE7F3', boxShadow: '0 2px 8px rgba(236,72,153,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500, ...typeStyle[msg.type as MsgType] }}>
                      {typeStyle[msg.type as MsgType]?.label}
                    </span>
                    {msg.lead && (
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        for {(msg.lead as { name: string }).name}
                        {(msg.lead as { company?: string }).company ? ` · ${(msg.lead as { company: string }).company}` : ''}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#D1D5DB' }}>{formatDate(msg.created_at)}</span>
                </div>

                <div style={{ background: '#FDF2F8', borderRadius: '10px', padding: '14px', marginBottom: '12px', borderLeft: '3px solid #F9A8D4' }}>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => copyMsg(msg.id, msg.content)} style={{
                    fontSize: '11px', padding: '6px 14px', borderRadius: '8px',
                    border: '1px solid #FCE7F3', background: copied === msg.id ? '#FDF2F8' : '#fff',
                    color: copied === msg.id ? '#EC4899' : '#9CA3AF', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {copied === msg.id ? '✓ Copied' : '⊙ Copy'}
                  </button>
                  <button onClick={() => deleteMsg(msg.id)} style={{
                    fontSize: '11px', padding: '6px 14px', borderRadius: '8px',
                    border: '1px solid #FEE2E2', background: '#fff',
                    color: '#FCA5A5', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  }}>
                    ✕ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIMessagesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: '#F9A8D4', fontSize: '13px' }}>Loading...</div>}>
      <AIContent />
    </Suspense>
  )
}
