'use client'

import { useState } from 'react'

interface InputScreenProps {
  onGenerate: (portfolioText: string) => void
}

const DEFAULT_PORTFOLIO = "I have \u20B980K in Reliance, \u20B950K HDFCBANK, \u20B940K TCS, \u20B930K Infy. Saving \u20B910K/month toward a car \u2014 \u20B93L in 3 years."

export default function InputScreen({ onGenerate }: InputScreenProps) {
  const [text, setText] = useState(DEFAULT_PORTFOLIO)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={{ maxWidth: 480 }}>
        <h1
          className="font-serif font-bold text-center mb-2"
          style={{
            color: 'var(--text)',
            fontSize: '2.75rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            textTransform: 'uppercase',
          }}
        >
          The Monday Briefing
        </h1>
        <p
          className="text-center mb-3 font-mono text-xs uppercase"
          style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}
        >
          Your weekly portfolio intelligence report
        </p>

        {/* Gold accent rule */}
        <div className="flex justify-center mb-10">
          <div style={{ width: 80, height: 1, background: 'var(--accent)' }} />
        </div>

        <div className="p-6" style={{ border: '1px solid var(--rule)' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full font-sans text-sm leading-relaxed px-4 py-3 resize-none"
            style={{
              background: 'var(--input-bg)',
              color: 'var(--text)',
              border: '1px solid var(--input-border)',
              borderRadius: 4,
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--input-border)' }}
            placeholder="Describe your portfolio and financial goals..."
          />

          <button
            onClick={() => {
              if (text.trim()) onGenerate(text.trim())
            }}
            disabled={!text.trim()}
            className="mt-4 w-full font-sans text-sm font-semibold py-3 px-6 transition-colors disabled:opacity-40"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg)',
              borderRadius: 4,
              border: 'none',
            }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            Generate this week&apos;s briefing
          </button>
        </div>

        <p className="text-center mt-4 font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
          AI-generated analysis. Not financial advice.
        </p>
      </div>
    </div>
  )
}
