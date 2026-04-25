'use client'

import React, { useState, useCallback } from 'react'
import InputScreen from './sections/InputScreen'
import NewsroomScreen from './sections/NewsroomScreen'
import BriefingScreen from './sections/BriefingScreen'

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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
          <div className="text-center p-8" style={{ maxWidth: 480 }}>
            <h2 className="text-xl font-serif font-bold mb-2">Something went wrong</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="text-sm font-sans font-semibold px-6 py-3"
              style={{ background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 4 }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

type Screen = 'input' | 'newsroom' | 'briefing'

export default function Page() {
  const [screen, setScreen] = useState<Screen>('input')
  const [portfolioText, setPortfolioText] = useState('')
  const [briefingData, setBriefingData] = useState<BriefingResponse | null>(null)

  const handleGenerate = useCallback((text: string) => {
    setPortfolioText(text)
    setScreen('newsroom')
  }, [])

  const handleComplete = useCallback((data: BriefingResponse) => {
    setBriefingData(data)
    setScreen('briefing')
  }, [])

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Input Screen */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: screen === 'input' ? 1 : 0,
            pointerEvents: screen === 'input' ? 'auto' : 'none',
            zIndex: screen === 'input' ? 10 : 1,
          }}
        >
          <InputScreen onGenerate={handleGenerate} />
        </div>

        {/* Newsroom Screen */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: screen === 'newsroom' ? 1 : 0,
            pointerEvents: screen === 'newsroom' ? 'auto' : 'none',
            zIndex: screen === 'newsroom' ? 10 : 1,
          }}
        >
          {screen === 'newsroom' && (
            <NewsroomScreen portfolioText={portfolioText} onComplete={handleComplete} />
          )}
        </div>

        {/* Briefing Screen */}
        <div
          className="absolute inset-0 overflow-y-auto transition-opacity duration-700"
          style={{
            opacity: screen === 'briefing' ? 1 : 0,
            pointerEvents: screen === 'briefing' ? 'auto' : 'none',
            zIndex: screen === 'briefing' ? 10 : 1,
          }}
        >
          {screen === 'briefing' && briefingData && (
            <BriefingScreen briefing={briefingData} />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
