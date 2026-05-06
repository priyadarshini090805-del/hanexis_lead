import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hanexis — Lead Generation',
  description: 'AI-driven social media lead generation platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#fff',
              color: '#374151',
              border: '1px solid #FCE7F3',
              fontSize: '13px',
              boxShadow: '0 4px 20px rgba(236,72,153,0.1)',
            },
            success: { iconTheme: { primary: '#EC4899', secondary: '#fff' } },
            error: { iconTheme: { primary: '#FB7185', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
