'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    })
    if (error) { toast.error(error.message) }
    else { toast.success('Account created! Check your email.'); router.push('/login') }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: '#FAFAFA', border: '1px solid #FCE7F3',
    borderRadius: '10px', padding: '11px 14px', fontSize: '13px',
    color: '#374151', outline: 'none', transition: 'border-color 0.2s',
  }
  const labelStyle = { display: 'block' as const, fontSize: '12px', color: '#6B7280', marginBottom: '6px', fontWeight: 500 as const }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FDF0F5 0%, #FFF0F9 50%, #FDF2F8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#831843', fontWeight: 600 }}>
            Hane<span style={{ color: '#EC4899' }}>x</span>is
          </h1>
          <p style={{ fontSize: '12px', color: '#F9A8D4', marginTop: '6px', letterSpacing: '2px', textTransform: 'uppercase' as const }}>
            Lead Generation Platform
          </p>
        </div>

        <div style={{
          background: '#fff', borderRadius: '20px', padding: '36px',
          border: '1px solid #FCE7F3', boxShadow: '0 8px 40px rgba(236,72,153,0.08)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Create account</h2>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '24px' }}>Start generating leads with AI</p>

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Full name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#F9A8D4'}
                onBlur={e => e.target.style.borderColor = '#FCE7F3'} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#F9A8D4'}
                onBlur={e => e.target.style.borderColor = '#FCE7F3'} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="min. 6 characters" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#F9A8D4'}
                onBlur={e => e.target.style.borderColor = '#FCE7F3'} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? '#FCE7F3' : 'linear-gradient(135deg, #F472B6, #EC4899)',
              color: loading ? '#F9A8D4' : '#fff',
              border: 'none', borderRadius: '10px', padding: '12px',
              fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#EC4899', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
