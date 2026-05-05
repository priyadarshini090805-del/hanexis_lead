import { createServerClient } from '@/lib/supabase-server'
import { formatDate } from '@/lib/utils'

async function getStats(userId: string) {
  const supabase = await createServerClient()
  const { data: leads } = await supabase.from('leads').select('status').eq('user_id', userId)
  if (!leads) return { total: 0, newL: 0, contacted: 0, converted: 0, rate: 0 }
  const total = leads.length
  const newL = leads.filter(l => l.status === 'new').length
  const contacted = leads.filter(l => l.status === 'contacted').length
  const converted = leads.filter(l => l.status === 'converted').length
  return { total, newL, contacted, converted, rate: total > 0 ? Math.round((converted / total) * 100) : 0 }
}

async function getRecentLeads(userId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase.from('leads').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(5)
  return data ?? []
}

const statusStyle: Record<string, { background: string; color: string }> = {
  new: { background: '#FDF2F8', color: '#DB2777' },
  contacted: { background: '#FFF7ED', color: '#EA580C' },
  converted: { background: '#F0FDF4', color: '#16A34A' },
  lost: { background: '#FEF2F2', color: '#DC2626' },
}

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session!.user.id
  const displayName = session!.user.user_metadata?.full_name?.split(' ')[0] ?? 'there'

  const [stats, recentLeads] = await Promise.all([getStats(userId), getRecentLeads(userId)])

  const cards = [
    { label: 'Total Leads', value: stats.total, icon: '◈', bg: '#FDF2F8', color: '#EC4899' },
    { label: 'New', value: stats.newL, icon: '✦', bg: '#FFF0F9', color: '#F472B6' },
    { label: 'Contacted', value: stats.contacted, icon: '◉', bg: '#FFF1F2', color: '#FB7185' },
    { label: 'Converted', value: `${stats.rate}%`, icon: '❋', bg: '#FDF4FF', color: '#E879F9' },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#831843', fontWeight: 600 }}>
          Good morning, {displayName} ✦
        </h1>
        <p style={{ fontSize: '13px', color: '#F9A8D4', marginTop: '5px' }}>
          Here&apos;s what&apos;s happening with your leads today
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '16px', padding: '20px',
            border: '1px solid #FCE7F3', boxShadow: '0 2px 12px rgba(236,72,153,0.05)',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', background: card.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: card.color, marginBottom: '12px',
            }}>
              {card.icon}
            </div>
            <p style={{ fontSize: '30px', fontWeight: 600, color: '#831843', lineHeight: 1 }}>{card.value}</p>
            <p style={{ fontSize: '11px', color: '#F9A8D4', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Conversion bar */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '20px',
        border: '1px solid #FCE7F3', marginBottom: '24px',
        boxShadow: '0 2px 12px rgba(236,72,153,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#9CA3AF', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Conversion Rate</span>
          <span style={{ fontSize: '12px', color: '#F9A8D4' }}>{stats.converted}/{stats.total} leads</span>
        </div>
        <div style={{ background: '#FCE7F3', borderRadius: '10px', height: '6px' }}>
          <div style={{
            background: 'linear-gradient(90deg, #F472B6, #EC4899)',
            height: '6px', borderRadius: '10px',
            width: `${stats.rate}%`, transition: 'width 0.6s ease',
          }} />
        </div>
        <p style={{ textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#DB2777', marginTop: '6px' }}>{stats.rate}%</p>
      </div>

      {/* Recent leads */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #FCE7F3', boxShadow: '0 2px 12px rgba(236,72,153,0.05)',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#F9A8D4', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500 }}>
            Recent Leads
          </span>
          <a href="/leads" style={{ fontSize: '11px', color: '#EC4899', textDecoration: 'none' }}>View all →</a>
        </div>
        {recentLeads.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', marginBottom: '8px' }}>✦</p>
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No leads yet.</p>
            <a href="/leads" style={{ fontSize: '13px', color: '#EC4899', textDecoration: 'none' }}>Add your first lead →</a>
          </div>
        ) : (
          <div>
            {recentLeads.map((lead, i) => (
              <div key={lead.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: i < recentLeads.length - 1 ? '1px solid #FDF2F8' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FBCFE8, #F9A8D4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', color: '#9D174D', fontWeight: 600, flexShrink: 0,
                  }}>
                    {lead.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{lead.name}</p>
                    <p style={{ fontSize: '11px', color: '#D1D5DB', marginTop: '2px' }}>{lead.company ?? 'No company'} · {formatDate(lead.created_at)}</p>
                  </div>
                </div>
                <span style={{
                  fontSize: '10px', padding: '3px 10px', borderRadius: '20px',
                  fontWeight: 500, letterSpacing: '0.5px',
                  ...statusStyle[lead.status],
                }}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
