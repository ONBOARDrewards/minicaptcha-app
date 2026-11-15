import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Mark } from '@/components/Mark'
import { PuzzleStage } from '@/components/PuzzleStage'
import { Check } from '@/components/Icons'
import { PUZZLE_KINDS, PUZZLE_META, pickPuzzleKind, type PuzzleKind } from '@/lib/puzzles'

type Phase = 'idle' | 'open' | 'pass' | 'verified' | 'locked' | 'blocked'

const MAX_STRIKES = 3

type IssueResult = { token: string } | { error: 'quota_exceeded' | 'unknown_sitekey' | 'offline' }

async function issueToken(sitekey: string, host: string): Promise<IssueResult> {
  try {
    const res = await fetch('/api/issue', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sitekey, host }),
    })
    const data = (await res.json().catch(() => null)) as { token?: string; error?: string } | null
    if (res.ok && data && typeof data.token === 'string') return { token: data.token }
    if (res.status === 429) return { error: 'quota_exceeded' }
    if (data && data.error === 'unknown_sitekey') return { error: 'unknown_sitekey' }
  } catch {
    /* offline / local preview without the worker */
  }
  if (sitekey === 'demo') {
    return { token: `demo-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}` }
  }
  return { error: 'offline' }
}

export default function Widget() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const sitekey = params.get('sitekey') || 'demo'
  const host = params.get('host') || ''
  const forced = (params.get('puzzle') || '').toLowerCase()
  const forcedKind =
    PUZZLE_KINDS.find((k) => k === forced) ??
    PUZZLE_KINDS.find((k) => PUZZLE_META[k].name.toLowerCase() === forced)

  const [phase, setPhase] = useState<Phase>('idle')
  const [kind, setKind] = useState<PuzzleKind>(() => forcedKind ?? pickPuzzleKind())
  const [seed, setSeed] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [token, setToken] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef(host)
  hostRef.current = host

  const post = useCallback((message: Record<string, unknown>) => {
    const target = hostRef.current
    if (!target || window.parent === window) return
    try {
      window.parent.postMessage({ source: 'minicaptcha-widget', ...message }, target)
    } catch {
      /* ignore malformed host origin */
    }
  }, [])

  useEffect(() => {
    document.body.classList.add('widgetBody')
    return () => document.body.classList.remove('widgetBody')
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const send = () => post({ type: 'resize', height: Math.ceil(el.getBoundingClientRect().height) })
    send()
    const observer = new ResizeObserver(send)
    observer.observe(el)
    window.addEventListener('resize', send)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', send)
    }
  }, [post])

  useEffect(() => {
    post({ type: 'ready' })
    const onMessage = (event: MessageEvent) => {
      if (hostRef.current && event.origin !== hostRef.current) return
      const data = event.data as { source?: string; type?: string } | null
      if (!data || data.source !== 'minicaptcha-host') return
      if (data.type === 'reset') {
        setPhase('idle')
        setStrikes(0)
        setToken('')
        setSeed((s) => s + 1)
        setKind(pickPuzzleKind())
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [post])

  const handleSolved = async () => {
    if (phase !== 'open') return
    const issued = await issueToken(sitekey, host)
    if ('error' in issued) {
      setPhase('blocked')
      post({ type: 'error', reason: issued.error })
      return
    }
    setPhase('pass')
    setToken(issued.token)
    post({ type: 'success', token: issued.token })
    window.setTimeout(() => setPhase('verified'), 1250)
  }

  const handleFailed = (reason: string) => {
    if (phase !== 'open') return
    const next = strikes + 1
    setStrikes(next)
    if (next >= MAX_STRIKES) setPhase('locked')
    else post({ type: 'log', message: reason })
  }

  const reshuffle = () => {
    setKind((k) => pickPuzzleKind(k))
    setSeed((s) => s + 1)
  }

  const meta = PUZZLE_META[kind]

  return (
    <div className="mcRoot" ref={rootRef}>
      {phase === 'idle' && (
        <button type="button" className="mcPill" onClick={() => setPhase('open')}>
          <span className="mcCheck" />
          <span className="mcPillText">I&apos;m human</span>
          <span className="mcBrand">
            <Mark size={14} />
            minicaptcha
          </span>
        </button>
      )}

      {(phase === 'open' || phase === 'pass' || phase === 'locked' || phase === 'blocked') && (
        <div className="mcCard">
          <div className="mcTop">
            <span className="mcTopTitle">
              <Mark size={15} />
              minicaptcha
            </span>
            <span className="mcTopTag">{meta.tag}</span>
          </div>

          {phase === 'open' && (
            <>
              <div className="mcTask">{meta.task}</div>
              <div className="mcStage">
                <PuzzleStage
                  key={`${kind}-${seed}`}
                  kind={kind}
                  onSolved={handleSolved}
                  onFailed={handleFailed}
                />
              </div>
              <div className="mcFoot">
                <span className="mcStrikes" aria-label={`${strikes} of ${MAX_STRIKES} strikes`}>
                  {Array.from({ length: MAX_STRIKES }, (_, i) => (
                    <i key={i} className={i < strikes ? 'is-on' : ''} />
                  ))}
                </span>
                <button type="button" className="mcLink" onClick={reshuffle}>
                  new puzzle
                </button>
              </div>
            </>
          )}

          {phase === 'pass' && (
            <div className="mcPass">
              <span className="mcPassIcon">
                <Check />
              </span>
              <strong>Verified</strong>
              <span className="mcPassSub">token handed to the page</span>
              {token && <span className="mcPassToken">{token.slice(0, 24)}…</span>}
            </div>
          )}

          {phase === 'blocked' && (
            <div className="mcPass">
              <span className="mcPassIcon is-fail">!</span>
              <strong>Site over quota</strong>
              <span className="mcPassSub">
                The owner needs to upgrade this site key before it can issue tokens.
              </span>
            </div>
          )}

          {phase === 'locked' && (
            <div className="mcPass">
              <span className="mcPassIcon is-fail">×</span>
              <strong>Too many strikes</strong>
              <span className="mcPassSub">this session is closed</span>
              <button
                type="button"
                className="mcLink"
                onClick={() => {
                  setStrikes(0)
                  setPhase('open')
                  setSeed((s) => s + 1)
                  setKind(pickPuzzleKind())
                }}
              >
                start over
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'verified' && (
        <div className="mcPill is-verified" role="status">
          <span className="mcCheck is-on">
            <Check />
          </span>
          <span className="mcPillText">Verified</span>
          <span className="mcBrand">
            <Mark size={14} />
            minicaptcha
          </span>
        </div>
      )}
    </div>
  )
}
