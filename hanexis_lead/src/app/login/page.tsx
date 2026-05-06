'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FDF0F5 0%, #FFF0F9 50%, #FDF2F8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            color: '#831843',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}>
            Hane<span style={{ color: '#EC4899' }}>x</span>is
          </h1>
          <p style={{ fontSize: '12px', color: '#F9A8D4', marginTop: '6px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Lead Generation Platform
          </p>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '36px',
          border: '1px solid #FCE7F3',
          boxShadow: '0 8px 40px rgba(236,72,153,0.08)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Sign in</h2>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '24px' }}>Welcome back — let's grow your leads</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px', fontWeight: 500 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  width: '100%', background: '#FAFAFA', border: '1px solid #FCE7F3',
                  borderRadius: '10px', padding: '11px 14px', fontSize: '13px',
                  color: '#374151', outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#F9A8D4'}
                onBlur={e => e.target.style.borderColor = '#FCE7F3'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px', fontWeight: 500 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', background: '#FAFAFA', border: '1px solid #FCE7F3',
                  borderRadius: '10px', padding: '11px 14px', fontSize: '13px',
                  color: '#374151', outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#F9A8D4'}
                onBlur={e => e.target.style.borderColor = '#FCE7F3'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#FCE7F3' : 'linear-gradient(135deg, #F472B6, #EC4899)',
                color: loading ? '#F9A8D4' : '#fff',
                border: 'none', borderRadius: '10px', padding: '12px',
                fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s', letterSpacing: '0.3px',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '20px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#EC4899', textDecoration: 'none', fontWeight: 500 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
