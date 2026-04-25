'use client'

import { useState } from 'react'

interface BriefingResponse {
  masthead: { date: string; briefing_number: string; user_name: string }
  headline: string
  stat_strip: { portfolio_value: string; week_return: string; vs_nifty: string; goal_status: string }
  opening: string
  stories: Array<{ title: string; body: string; action: { text: string; confidence: number; classification: string } }>
  pull_quote: string
  the_other_side: string
  goal_check: string
  calendar: Array<{ ticker: string; event: string; date: string }>
  sign_off: string
  agent_transcripts: { analyst: string; strategist: string; bull: string; bear: string; judge: string }
}

interface BriefingScreenProps {
  briefing: BriefingResponse
}

function detectColor(value: string): string {
  if (!value) return 'var(--text)'
  if (value.includes('+') || value.toLowerCase().includes('gain') || value.toLowerCase().includes('up') || value.toLowerCase().includes('ahead')) return 'var(--gain)'
  if (value.includes('-') || value.toLowerCase().includes('loss') || value.toLowerCase().includes('down') || value.toLowerCase().includes('behind')) return 'var(--loss)'
  return 'var(--text)'
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1" style={{ color: 'var(--text)' }}>{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1" style={{ color: 'var(--text)' }}>{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2" style={{ color: 'var(--text)' }}>{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm" style={{ color: 'var(--text-dim)' }}>{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm" style={{ color: 'var(--text-dim)' }}>{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm" style={{ color: 'var(--text-dim)', lineHeight: 1.7 }}>{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold" style={{ color: 'var(--text)' }}>{part}</strong> : part)
}

export default function BriefingScreen({ briefing }: BriefingScreenProps) {
  const [showTranscripts, setShowTranscripts] = useState(false)

  const statItems = [
    { label: 'PORTFOLIO', value: briefing?.stat_strip?.portfolio_value ?? '--' },
    { label: 'THIS WEEK', value: briefing?.stat_strip?.week_return ?? '--' },
    { label: 'VS NIFTY', value: briefing?.stat_strip?.vs_nifty ?? '--' },
    { label: 'GOAL', value: briefing?.stat_strip?.goal_status ?? '--' },
  ]

  const stories = Array.isArray(briefing?.stories) ? briefing.stories : []
  const calendar = Array.isArray(briefing?.calendar) ? briefing.calendar : []
  const transcripts = briefing?.agent_transcripts

  const sectionDelay = (i: number) => ({ animationDelay: `${i * 80}ms` })

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'var(--bg)' }}>
      <div
        className="mx-auto"
        style={{ maxWidth: 700 }}
      >

        {/* 1. Masthead */}
        <div className="briefing-fade-in" style={sectionDelay(0)}>
          <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            {briefing?.masthead?.date ?? ''} &middot; {briefing?.masthead?.briefing_number ?? ''} &middot; {briefing?.masthead?.user_name ?? ''}
          </div>
        </div>

        {/* 2. Divider */}
        <div className="briefing-fade-in my-6" style={{ ...sectionDelay(1), height: 1, background: 'var(--rule)' }} />

        {/* 3. Headline */}
        <div className="briefing-fade-in" style={sectionDelay(2)}>
          <h1
            className="font-serif font-bold mb-8"
            style={{
              fontSize: '3.5rem',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            {briefing?.headline ?? 'Briefing'}
          </h1>
        </div>

        {/* 4. Stat strip */}
        <div className="briefing-fade-in flex flex-wrap gap-3 mb-12" style={sectionDelay(3)}>
          {statItems.map((s) => (
            <div
              key={s.label}
              className="font-mono text-xs px-3 py-2 flex-1 min-w-0"
              style={{ border: '1px solid var(--rule)', borderRadius: 4 }}
            >
              <div style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              <div className="mt-1 font-medium" style={{ color: detectColor(s.value) }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* 5. Opening */}
        <div className="briefing-fade-in mb-12" style={sectionDelay(4)}>
          <p className="font-sans" style={{ color: 'var(--text-dim)', lineHeight: 1.7, fontSize: '1rem' }}>
            {briefing?.opening ?? ''}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--rule)', marginBottom: '3rem' }} />

        {/* 6. Stories */}
        <div className="briefing-fade-in mb-12" style={sectionDelay(5)}>
          <h2 className="font-serif font-bold text-xl mb-6" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            What Moved Your Portfolio
          </h2>
          {stories.map((story, i) => (
            <div key={i} className="mb-8">
              <h3 className="font-serif font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>
                {i + 1}. {story?.title ?? 'Untitled'}
              </h3>
              <div className="font-sans mb-3" style={{ color: 'var(--text-dim)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {renderMarkdown(story?.body ?? '')}
              </div>
              {story?.action && (
                <div
                  className="font-mono text-xs pl-4 py-2"
                  style={{ borderLeft: '2px solid var(--accent)', color: 'var(--accent)' }}
                >
                  &rarr; ACTION: {story.action.text ?? ''}{' '}
                  [{typeof story.action.confidence === 'number' ? `${story.action.confidence}%` : '--'} &middot; {story.action.classification ?? ''}]
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 7. Pull quote */}
        {briefing?.pull_quote && (
          <div className="briefing-fade-in mb-12" style={sectionDelay(6)}>
            <blockquote
              className="font-serif italic text-lg pl-5 py-2"
              style={{
                borderLeft: '3px solid var(--accent)',
                color: 'var(--text-dim)',
                lineHeight: 1.6,
              }}
            >
              {briefing.pull_quote}
            </blockquote>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--rule)', marginBottom: '3rem' }} />

        {/* 8. The Other Side */}
        {briefing?.the_other_side && (
          <div className="briefing-fade-in mb-12" style={sectionDelay(7)}>
            <h2 className="font-serif font-bold text-xl mb-4" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
              The Other Side
            </h2>
            <div className="font-sans" style={{ color: 'var(--text-dim)', lineHeight: 1.7 }}>
              {renderMarkdown(briefing.the_other_side)}
            </div>
          </div>
        )}

        {/* 9. Goal Check */}
        {briefing?.goal_check && (
          <div className="briefing-fade-in mb-12" style={sectionDelay(8)}>
            <h2 className="font-serif font-bold text-xl mb-4" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Your Goal, Checked
            </h2>
            <div className="font-sans" style={{ color: 'var(--text-dim)', lineHeight: 1.7 }}>
              {renderMarkdown(briefing.goal_check)}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--rule)', marginBottom: '3rem' }} />

        {/* 10. Calendar */}
        {calendar.length > 0 && (
          <div className="briefing-fade-in mb-12" style={sectionDelay(9)}>
            <h2 className="font-serif font-bold text-xl mb-4" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
              On the Calendar
            </h2>
            <div className="space-y-2">
              {calendar.map((item, i) => (
                <div key={i} className="font-mono text-xs flex gap-4 py-1" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <span style={{ color: 'var(--accent)', minWidth: 70 }}>{item?.ticker ?? '--'}</span>
                  <span style={{ color: 'var(--text-dim)', flex: 1 }}>{item?.event ?? ''}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item?.date ?? ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. Sign off */}
        {briefing?.sign_off && (
          <div className="briefing-fade-in mb-12" style={sectionDelay(10)}>
            <div style={{ height: 1, background: 'var(--rule)', marginBottom: '1.5rem' }} />
            <p className="font-sans italic text-sm" style={{ color: 'var(--text-muted)' }}>
              {briefing.sign_off}
            </p>
          </div>
        )}

        {/* 12. Agent Transcripts */}
        <div className="briefing-fade-in mt-16" style={sectionDelay(11)}>
          <button
            onClick={() => setShowTranscripts(!showTranscripts)}
            className="text-sm font-sans font-medium flex items-center gap-2 py-2 px-0 bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--accent)' }}
          >
            <span style={{ display: 'inline-block', transform: showTranscripts ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: 10 }}>
              &#9654;
            </span>
            View agent transcripts
          </button>
          {showTranscripts && transcripts && (
            <div className="mt-4 space-y-4">
              {(['analyst', 'strategist', 'bull', 'bear', 'judge'] as const).map((agent) => (
                <div key={agent}>
                  <div className="font-mono text-xs uppercase mb-1 font-medium" style={{ color: 'var(--accent)' }}>
                    {agent}
                  </div>
                  <pre
                    className="font-mono text-xs p-4 overflow-x-auto whitespace-pre-wrap"
                    style={{
                      background: 'var(--surface)',
                      color: 'var(--text-dim)',
                      border: '1px solid var(--rule)',
                      borderRadius: 4,
                      maxHeight: 300,
                      overflowY: 'auto',
                    }}
                  >
                    {transcripts[agent] ?? 'No transcript available.'}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes briefingFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .briefing-fade-in {
          opacity: 0;
          animation: briefingFadeIn 0.2s ease forwards;
        }
      `}</style>
    </div>
  )
}
