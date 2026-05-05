'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/types'
import toast from 'react-hot-toast'

interface Props { lead: Lead | null; onClose: () => void; onSaved: () => void }

export default function LeadModal({ lead, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: lead?.name ?? '', email: lead?.email ?? '', phone: lead?.phone ?? '',
    company: lead?.company ?? '', position: lead?.position ?? '',
    source: lead?.source ?? 'manual', status: lead?.status ?? 'new',
    linkedin_url: lead?.linkedin_url ?? '', instagram_handle: lead?.instagram_handle ?? '',
    notes: lead?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = { ...form, user_id: user.id, tags: [] }
    let error
    if (lead) { ({ error } = await supabase.from('leads').update(payload).eq('id', lead.id)) }
    else { ({ error } = await supabase.from('leads').insert(payload)) }
    if (error) toast.error('Failed to save lead')
    else { toast.success(lead ? 'Lead updated' : 'Lead added!'); onSaved() }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: '#FAFAFA', border: '1px solid #FCE7F3',
    borderRadius: '10px', padding: '9px 12px', fontSize: '13px',
    color: '#374151', outline: 'none', fontFamily: "'Inter', sans-serif",
  }
  const labelStyle = { display: 'block' as const, fontSize: '11px', color: '#9CA3AF', marginBottom: '5px', fontWeight: 500 as const }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(236,72,153,0.08)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #FCE7F3', boxShadow: '0 20px 60px rgba(236,72,153,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #FCE7F3' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#831843', fontFamily: "'Playfair Display', serif" }}>
            {lead ? 'Edit Lead' : 'Add New Lead ✦'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#F9A8D4', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Name *</label>
              <input value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Jane Smith" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="jane@co.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+1 234 567" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Company</label>
              <input value={form.company} onChange={e => upd('company', e.target.value)} placeholder="Acme Inc." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Position</label>
              <input value={form.position} onChange={e => upd('position', e.target.value)} placeholder="CEO" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Source</label>
              <select value={form.source} onChange={e => upd('source', e.target.value)} style={inputStyle}>
                <option value="manual">Manual</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="import">Import</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => upd('status', e.target.value)} style={inputStyle}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>LinkedIn URL</label>
              <input value={form.linkedin_url} onChange={e => upd('linkedin_url', e.target.value)} placeholder="linkedin.com/in/..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Instagram</label>
              <input value={form.instagram_handle} onChange={e => upd('instagram_handle', e.target.value)} placeholder="@handle" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Any additional info..." rows={3}
                style={{ ...inputStyle, resize: 'none' as const }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, border: '1px solid #FCE7F3', background: '#fff', color: '#9CA3AF',
              borderRadius: '10px', padding: '10px', fontSize: '13px', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              flex: 1, background: 'linear-gradient(135deg, #F472B6, #EC4899)',
              color: '#fff', border: 'none', borderRadius: '10px', padding: '10px',
              fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: "'Inter', sans-serif",
            }}>
              {loading ? 'Saving...' : lead ? 'Update' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
