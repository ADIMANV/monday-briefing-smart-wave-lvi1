'use client'

import { useState, useEffect, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'

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

interface NewsroomScreenProps {
  portfolioText: string
  onComplete: (briefingData: BriefingResponse) => void
}

const TRACE_MESSAGES = [
  { time: '00:00', text: 'Layer 1 -- Fetching market data for portfolio holdings...' },
  { time: '00:02', text: 'Data Analyst: Retrieving price data, news, and events...' },
  { time: '00:05', text: 'Data Analyst: Market data compiled for holdings' },
  { time: '00:07', text: 'Portfolio Strategist: Parsing portfolio and computing goal trajectory...' },
  { time: '00:10', text: 'Portfolio Strategist: 3-5 candidate theses drafted and scored' },
  { time: '00:12', text: 'Layer 2 -- Selecting top thesis for debate...' },
  { time: '00:14', text: 'Bull Agent: Building case FOR the thesis...' },
  { time: '00:14', text: 'Bear Agent: Building case AGAINST the thesis...' },
  { time: '00:18', text: 'Bull Agent: Argument submitted with citations' },
  { time: '00:18', text: 'Bear Agent: Counterargument submitted with citations' },
  { time: '00:20', text: 'Judge Agent: Weighing debate arguments...' },
  { time: '00:22', text: 'Judge: Verdict rendered -- confidence score assigned' },
  { time: '00:24', text: 'Layer 3 -- Editor synthesizing all agent outputs...' },
  { time: '00:28', text: 'Editor: Drafting 12-section briefing...' },
  { time: '00:32', text: 'Editor: Self-audit complete. Briefing ready.' },
]

const SECTION_LABELS = [
  'MASTHEAD', 'HEADLINE', 'STAT STRIP', 'OPENING', 'STORIES',
  'PULL QUOTE', 'THE OTHER SIDE', 'GOAL CHECK', 'CALENDAR', 'SIGN OFF',
]

function safeParseBriefing(result: any): BriefingResponse | null {
  try {
    if (!result) return null
    let data = result.response?.result
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    if (data && data.headline && data.stat_strip && data.stories) {
      return data as BriefingResponse
    }
    if (data?.response?.result) {
      let nested = data.response.result
      if (typeof nested === 'string') nested = JSON.parse(nested)
      if (nested?.headline) return nested as BriefingResponse
    }
    return null
  } catch {
    return null
  }
}

export default function NewsroomScreen({ portfolioText, onComplete }: NewsroomScreenProps) {
  const [traces, setTraces] = useState<Array<{ time: string; text: string }>>([])
  const [briefingReady, setBriefingReady] = useState(false)
  const [tracesComplete, setTracesComplete] = useState(false)
  const [error, setError] = useState('')
  const briefingRef = useRef<BriefingResponse | null>(null)
  const calledRef = useRef(false)
  const traceContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    // Start trace messages
    TRACE_MESSAGES.forEach((msg, i) => {
      setTimeout(() => {
        setTraces(prev => [...prev, msg])
        if (traceContainerRef.current) {
          traceContainerRef.current.scrollTop = traceContainerRef.current.scrollHeight
        }
        if (i === TRACE_MESSAGES.length - 1) {
          setTracesComplete(true)
        }
      }, (i + 1) * 1800)
    })

    // Call agent in background
    const fetchBriefing = async () => {
      try {
        const result = await callAIAgent(portfolioText, '69ec5aa7f7d0c95f8d9bf095')
        const parsed = safeParseBriefing(result)
        if (parsed) {
          briefingRef.current = parsed
          setBriefingReady(true)
        } else {
          setError('Could not parse briefing response. Please try again.')
        }
      } catch (e: any) {
        setError(e?.message ?? 'Failed to generate briefing.')
      }
    }
    fetchBriefing()
  }, [portfolioText])

  // Transition to briefing screen when both traces and data are ready
  useEffect(() => {
    if (tracesComplete && briefingReady && briefingRef.current) {
      const timer = setTimeout(() => {
        onComplete(briefingRef.current!)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [tracesComplete, briefingReady, onComplete])

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel: Terminal trace */}
      <div
        className="h-screen overflow-hidden flex flex-col"
        style={{ width: '35%', borderRight: '1px solid var(--rule)' }}
      >
        <div
          className="px-4 py-3 font-mono text-xs uppercase font-medium"
          style={{ color: 'var(--accent)', borderBottom: '1px solid var(--rule)' }}
        >
          Agent Trace
        </div>
        <div ref={traceContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2" style={{ background: 'var(--surface)' }}>
          {traces.map((t, i) => (
            <div
              key={i}
              className="font-mono text-xs newsroom-fade-in"
              style={{ color: t.text.startsWith('Layer') ? 'var(--accent)' : 'var(--text-dim)' }}
            >
              <span style={{ color: 'var(--text-muted)' }}>[{t.time}]</span>{' '}
              {t.text}
            </div>
          ))}
          {error && (
            <div className="font-mono text-xs mt-4" style={{ color: 'var(--loss)' }}>
              [ERROR] {error}
            </div>
          )}
          {tracesComplete && briefingReady && (
            <div className="font-mono text-xs mt-4 newsroom-fade-in" style={{ color: 'var(--gain)' }}>
              [DONE] Briefing assembled. Transitioning...
            </div>
          )}
          {tracesComplete && !briefingReady && !error && (
            <div className="font-mono text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Waiting for agent response...
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Briefing skeleton */}
      <div className="h-screen overflow-y-auto p-8" style={{ width: '65%' }}>
        <div className="mx-auto" style={{ maxWidth: 540 }}>
          {SECTION_LABELS.map((label, i) => (
            <div key={label} className="mb-6">
              <div
                className="font-mono text-xs uppercase mb-2 font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {label}
              </div>
              <div className="space-y-2">
                <div
                  className={`h-0.5 ${briefingReady ? '' : 'newsroom-pulse'}`}
                  style={{
                    background: briefingReady ? 'var(--accent)' : 'var(--rule)',
                    width: i % 3 === 0 ? '100%' : i % 3 === 1 ? '80%' : '60%',
                    opacity: briefingReady ? 1 : 0.6,
                    transition: 'all 0.8s ease',
                    borderRadius: 0,
                  }}
                />
                <div
                  className={`h-0.5 ${briefingReady ? '' : 'newsroom-pulse'}`}
                  style={{
                    background: briefingReady ? 'var(--accent)' : 'var(--rule)',
                    width: i % 2 === 0 ? '70%' : '50%',
                    opacity: briefingReady ? 0.7 : 0.4,
                    transition: 'all 0.8s ease',
                    transitionDelay: '0.1s',
                    borderRadius: 0,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes newsroomFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .newsroom-fade-in {
          animation: newsroomFadeIn 0.4s ease forwards;
        }
        @keyframes newsroomPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        .newsroom-pulse {
          animation: newsroomPulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
