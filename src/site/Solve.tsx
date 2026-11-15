import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Mark } from '@/components/Mark'
import { PuzzleStage } from '@/components/PuzzleStage'
import { ArrowRight, Check, Cross } from '@/components/Icons'
import { PUZZLE_META, formatMs, pickPuzzleKind, sessionId, type PuzzleKind } from '@/lib/puzzles'

type Status = 'playing' | 'verified' | 'rejected'
type LogLine = { id: number; text: string }

const MAX_STRIKES = 3

export default function Solve() {
  const [sid] = useState(() => sessionId())
  const [kind, setKind] = useState<PuzzleKind>(() => pickPuzzleKind())
  const [seed, setSeed] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [status, setStatus] = useState<Status>('playing')
  const [elapsed, setElapsed] = useState(0)
  const [log, setLog] = useState<LogLine[]>([{ id: 0, text: `session #${sid} opened` }])
  const startedRef = useRef(Date.now())
  const logId = useRef(1)

  useEffect(() => {
    if (status !== 'playing') return
    const timer = window.setInterval(() => setElapsed(Date.now() - startedRef.current), 100)
    return () => window.clearInterval(timer)
  }, [status])

  const pushLog = (text: string) => {
    setLog((prev) => [...prev.slice(-6), { id: logId.current++, text }])
  }

  const meta = PUZZLE_META[kind]

  const handleSolved = () => {
    if (status !== 'playing') return
    setElapsed(Date.now() - startedRef.current)
    setStatus('verified')
    pushLog(`${meta.name.toLowerCase()} cleared`)
    pushLog('human token issued')
  }

  const handleFailed = (reason: string) => {
    if (status !== 'playing') return
    const next = strikes + 1
    setStrikes(next)
    pushLog(`strike ${next} · ${reason}`)
    if (next >= MAX_STRIKES) {
      setElapsed(Date.now() - startedRef.current)
      setStatus('rejected')
      pushLog('session locked')
    }
  }

  const restart = () => {
    startedRef.current = Date.now()
    logId.current = 1
    setStrikes(0)
    setStatus('playing')
    setKind(pickPuzzleKind())
    setSeed((s) => s + 1)
    setElapsed(0)
    setLog([{ id: 0, text: `session #${sessionId()} opened` }])
  }

  const reshuffle = () => {
    if (status !== 'playing') return
    setKind((k) => pickPuzzleKind(k))
    setSeed((s) => s + 1)
    pushLog('puzzle reshuffled')
  }

  const score =
    status === 'verified' ? 100 : status === 'rejected' ? Math.max(4, 22 - strikes * 2) : Math.max(12, 88 - strikes * 16)

  return (
    <div className="solvePage">
      <header className="siteHeader siteHeader--solve">
        <div className="wrap nav">
          <Link to="/" className="brand" aria-label="minicaptcha home">
            <Mark />
            <span className="brandText">
              mini<span>captcha</span>
            </span>
          </Link>
          <div className="navRight">
            <span className="liveChip">
              <i />
              sandbox · no data stored
            </span>
            <Link className="btn btn--ghost btn--sm" to="/">
              Back to site
            </Link>
          </div>
        </div>
      </header>

      <main className="wrap solveMain">
        <div className="solveLeft">
          <div className="solveIntro">
            <span className="kicker">live challenge</span>
            <h1>Prove you're a person.</h1>
            <p>
              One puzzle per session, three strikes before it locks. Every attempt is generated fresh — the shapes, the
              corridor and the sequence all change.
            </p>
            <div className="solveStats">
              <span>
                <strong>1</strong> challenge
              </span>
              <span>
                <strong>{formatMs(elapsed)}</strong> elapsed
              </span>
              <span>
                <strong>{strikes}</strong> strikes
              </span>
            </div>
          </div>

          <section className={`challengeCard ${status !== 'playing' ? 'is-done' : ''}`}>
            <div className="challengeTop">
              <div className="challengeRound">
                <span className="challengeRoundNum">01</span>
                <span className="challengeRoundLabel">
                  {meta.name} · {meta.tag}
                </span>
              </div>
              <div className="challengeMeters">
                <span className="timer">
                  <i />
                  {formatMs(elapsed)}
                </span>
                <button className="iconBtn" type="button" onClick={reshuffle} aria-label="Generate a new puzzle">
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M15.5 8.5A6 6 0 103.6 6.4M15.5 3.5v5h-5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="challengeBody">
              <div className="challengeTask">
                <span className="taskDot" />
                {meta.task}
              </div>

              <div className="stageHost">
                <div key={`${kind}-${seed}`} className="puzzleMount">
                  <PuzzleStage kind={kind} onSolved={handleSolved} onFailed={handleFailed} />
                </div>

                {status === 'verified' && (
                  <div className="verdict verdict--pass">
                    <div className="verdictBurst" aria-hidden="true">
                      {Array.from({ length: 14 }, (_, i) => (
                        <i key={i} style={{ '--a': `${i * 26}deg`, '--d': `${i * 34}ms` } as React.CSSProperties} />
                      ))}
                    </div>
                    <div className="verdictBadge">
                      <svg viewBox="0 0 52 52" aria-hidden="true">
                        <circle className="verdictCircle" cx="26" cy="26" r="23" fill="none" />
                        <path className="verdictTick" d="M15 27l8 8 15-17" fill="none" />
                      </svg>
                    </div>
                    <h2>You're human.</h2>
                    <p>
                      Cleared the {meta.name} challenge in {formatMs(elapsed)}.
                    </p>
                    <div className="verdictActions">
                      <button className="btn btn--primary" type="button" onClick={restart}>
                        Run it again
                      </button>
                      <Link className="btn btn--ghost" to="/">
                        Back to site
                      </Link>
                    </div>
                    <span className="verdictTiny">token {sid}…c1 · expires in 120s</span>
                  </div>
                )}

                {status === 'rejected' && (
                  <div className="verdict verdict--fail">
                    <div className="verdictBadge">
                      <svg viewBox="0 0 52 52" aria-hidden="true">
                        <circle className="verdictCircle" cx="26" cy="26" r="23" fill="none" />
                        <path className="verdictTick" d="M18 18l16 16M34 18L18 34" fill="none" />
                      </svg>
                    </div>
                    <h2>Session locked.</h2>
                    <p>Three strikes. Captchas are strict — that is the point. Start a fresh session to try again.</p>
                    <div className="verdictActions">
                      <button className="btn btn--primary" type="button" onClick={restart}>
                        New session
                      </button>
                      <Link className="btn btn--ghost" to="/">
                        Back to site
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="challengeFoot">
              <span className="challengeKind">
                <i />
                one challenge · three strikes
              </span>
              <div className="strikes" aria-label={`${strikes} of ${MAX_STRIKES} strikes`}>
                <span>strikes</span>
                {Array.from({ length: MAX_STRIKES }, (_, i) => (
                  <i key={i} className={i < strikes ? 'is-on' : ''} />
                ))}
              </div>
            </div>
          </section>

          <p className="solveNote">
            This demo runs entirely in your browser. No images, no cookies, no third-party scripts beyond the typeface.
          </p>
        </div>

        <aside className="solveSide">
          <div className="sideCard">
            <div className="sideHead">
              <span>session</span>
              <span className="sideId">#{sid}</span>
            </div>
            <div className="sideRows">
              <div className="sideRow">
                <span>challenge</span>
                <strong>{meta.name}</strong>
              </div>
              <div className="sideRow">
                <span>strikes</span>
                <strong>
                  {strikes} / {MAX_STRIKES}
                </strong>
              </div>
              <div className="sideRow">
                <span>elapsed</span>
                <strong>{formatMs(elapsed)}</strong>
              </div>
            </div>
            <div className="humanMeter">
              <div className="humanMeterTop">
                <span>human score</span>
                <span>{score}%</span>
              </div>
              <div className="humanMeterBar">
                <span style={{ width: `${score}%` }} />
              </div>
            </div>
          </div>

          <div className="sideCard">
            <div className="sideHead">
              <span>signals</span>
              <i className="livePip" />
            </div>
            <ul className="log">
              {log.map((line) => (
                <li key={line.id}>
                  <span className="logTick" />
                  {line.text}
                </li>
              ))}
            </ul>
            <div className="sideFoot">
              <span>
                <Check /> client-side only
              </span>
              <span>
                <Cross /> no training set
              </span>
            </div>
          </div>

          <div className="sideCard sideCard--quiet">
            <h3>Why puzzles?</h3>
            <p>
              A script can copy a cursor path, but it cannot plan a corridor or hold a pattern in mind. Spatial puzzles
              demand visual reasoning, motor control and time — the three things bots are worst at.
            </p>
            <Link to="/" hash="how" className="sideLink">
              How verification works <ArrowRight />
            </Link>
          </div>
        </aside>
      </main>

      <footer className="solveFooter">
        <div className="wrap solveFooterInner">
          <span>© 2026 minicaptcha labs</span>
          <span>built for humans</span>
        </div>
      </footer>
    </div>
  )
}
