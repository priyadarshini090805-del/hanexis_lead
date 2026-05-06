'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/types'
import { formatDate, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'
import LeadModal from '@/components/leads/LeadModal'

const statusStyle: Record<string, { background: string; color: string }> = {
  new: { background: '#FDF2F8', color: '#DB2777' },
  contacted: { background: '#FFF7ED', color: '#EA580C' },
  converted: { background: '#F0FDF4', color: '#16A34A' },
  lost: { background: '#FEF2F2', color: '#DC2626' },
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filtered, setFiltered] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  const fetchLeads = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) toast.error('Failed to load leads')
    else setLeads(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])
  useEffect(() => {
    let result = leads
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l => l.name.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter)
    setFiltered(result)
  }, [leads, search, statusFilter])

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
    else { toast.success('Lead deleted'); setLeads(prev => prev.filter(l => l.id !== id)) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#831843', fontWeight: 600 }}>Leads</h1>
          <p style={{ fontSize: '13px', color: '#F9A8D4', marginTop: '4px' }}>{leads.length} contacts in your pipeline</p>
        </div>
        <button onClick={() => { setEditingLead(null); setShowModal(true) }} style={{
          background: 'linear-gradient(135deg, #F472B6, #EC4899)', color: '#fff',
          border: 'none', borderRadius: '12px', padding: '10px 18px',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          + Add Lead
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#F9A8D4', fontSize: '13px' }}>⊙</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '14px', paddingTop: '9px', paddingBottom: '9px',
              border: '1px solid #FCE7F3', borderRadius: '10px', fontSize: '13px', color: '#374151',
              background: '#fff', outline: 'none', fontFamily: "'Inter', sans-serif",
            }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
          border: '1px solid #FCE7F3', borderRadius: '10px', padding: '9px 14px',
          fontSize: '13px', color: '#374151', background: '#fff', outline: 'none',
          fontFamily: "'Inter', sans-serif", cursor: 'pointer',
        }}>
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #FCE7F3', overflow: 'hidden', boxShadow: '0 2px 12px rgba(236,72,153,0.05)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#F9A8D4', fontSize: '13px' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', marginBottom: '8px' }}>✦</p>
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>{search || statusFilter !== 'all' ? 'No leads match your filters.' : 'No leads yet. Add your first one!'}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FDF2F8' }}>
                {['Contact', 'Company', 'Source', 'Status', 'Added', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '10px', color: '#F9A8D4', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr key={lead.id} style={{ borderTop: '1px solid #FDF2F8' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FBCFE8, #F9A8D4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', color: '#9D174D', fontWeight: 600, flexShrink: 0,
                      }}>{getInitials(lead.name)}</div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{lead.name}</p>
                        {lead.email && <p style={{ fontSize: '11px', color: '#D1D5DB', marginTop: '1px' }}>{lead.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6B7280' }}>{lead.company ?? '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#9CA3AF' }}>{lead.source}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500, ...statusStyle[lead.status] }}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#D1D5DB' }}>{formatDate(lead.created_at)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <Link href={`/ai-messages?leadId=${lead.id}`} title="AI message" style={{
                        padding: '6px 8px', borderRadius: '8px', fontSize: '12px',
                        color: '#F9A8D4', textDecoration: 'none', background: 'transparent',
                        border: '1px solid transparent', transition: 'all 0.15s',
                      }}
                        onMouseOver={e => { (e.target as HTMLElement).style.background = '#FDF2F8'; (e.target as HTMLElement).style.color = '#EC4899' }}
                        onMouseOut={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = '#F9A8D4' }}
                      >✦</Link>
                      <button onClick={() => { setEditingLead(lead); setShowModal(true) }} style={{
                        padding: '6px 8px', borderRadius: '8px', fontSize: '12px',
                        color: '#9CA3AF', background: 'transparent', border: 'none', cursor: 'pointer',
                      }}>✎</button>
                      <button onClick={() => deleteLead(lead.id)} style={{
                        padding: '6px 8px', borderRadius: '8px', fontSize: '12px',
                        color: '#FCA5A5', background: 'transparent', border: 'none', cursor: 'pointer',
                      }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <LeadModal lead={editingLead} onClose={() => { setShowModal(false); setEditingLead(null) }}
          onSaved={() => { setShowModal(false); setEditingLead(null); fetchLeads() }} />
      )}
    </div>
  )
}
