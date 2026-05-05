'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/leads', label: 'Leads', icon: '◈' },
  { href: '/ai-messages', label: 'AI Messages', icon: '✦' },
]

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = user.user_metadata?.full_name ?? user.email ?? 'User'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('See you soon!')
    router.push('/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <aside style={{
      width: '210px', minWidth: '210px', background: '#fff',
      borderRight: '1px solid #FCE7F3', display: 'flex', flexDirection: 'column',
      height: '100vh', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid #FCE7F3',
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '22px', color: '#831843', fontWeight: 600,
        }}>
          Hane<span style={{ color: '#EC4899' }}>x</span>is
        </h1>
        <p style={{ fontSize: '10px', color: '#F9A8D4', marginTop: '3px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Lead Platform
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <p style={{ fontSize: '9px', color: '#F9A8D4', letterSpacing: '2px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>
          Navigate
        </p>
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '12px', marginBottom: '4px',
                fontSize: '13px', fontWeight: active ? 500 : 400,
                color: active ? '#DB2777' : '#9CA3AF',
                background: active ? '#FDF2F8' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #FCE7F3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FBCFE8, #F9A8D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', color: '#9D174D', fontWeight: 600, flexShrink: 0,
          }}>
            {getInitials(displayName)}
          </div>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </span>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', background: 'none', border: '1px solid #FCE7F3',
          borderRadius: '8px', padding: '7px', fontSize: '11px', color: '#F9A8D4',
          cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
        }}
          onMouseOver={e => { (e.target as HTMLElement).style.background = '#FDF2F8'; (e.target as HTMLElement).style.color = '#EC4899' }}
          onMouseOut={e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = '#F9A8D4' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none', position: 'fixed', top: '12px', left: '12px', zIndex: 50,
          background: '#fff', border: '1px solid #FCE7F3', borderRadius: '8px',
          padding: '8px', cursor: 'pointer', fontSize: '16px',
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(236,72,153,0.1)',
          backdropFilter: 'blur(2px)', zIndex: 30,
        }} />
      )}

      <div style={{ display: 'flex' }}>
        <SidebarContent />
      </div>
    </>
  )
}
