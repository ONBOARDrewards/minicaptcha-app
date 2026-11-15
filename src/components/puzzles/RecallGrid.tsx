import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { shuffle } from '../../lib/puzzles'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }

const STEPS = 4
const CELLS = 9

export function RecallGrid({ onSolved, onFailed }: Props) {
  const sequence = useMemo(
    () => shuffle(Array.from({ length: CELLS }, (_, i) => i)).slice(0, STEPS),
    [],
  )
  const [phase, setPhase] = useState<'watch' | 'play' | 'done'>('watch')
  const [lit, setLit] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [wrong, setWrong] = useState<number | null>(null)
  const timers = useRef<number[]>([])
  const runId = useRef(0)

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const run = useCallback(() => {
    clearTimers()
    const id = ++runId.current
    setPhase('watch')
    setProgress(0)
    setLit(null)
    setWrong(null)
    let t = 520
    sequence.forEach((cell) => {
      timers.current.push(
        window.setTimeout(() => {
          if (runId.current === id) setLit(cell)
        }, t),
      )
      timers.current.push(
        window.setTimeout(() => {
          if (runId.current === id) setLit(null)
        }, t + 380),
      )
      t += 600
    })
    timers.current.push(
      window.setTimeout(() => {
        if (runId.current === id) setPhase('play')
      }, t + 200),
    )
  }, [sequence])

  useEffect(() => {
    run()
    return () => {
      runId.current++
      clearTimers()
    }
  }, [run])

  const click = (cell: number) => {
    if (phase !== 'play') return
    if (cell === sequence[progress]) {
      const next = progress + 1
      setProgress(next)
      setLit(cell)
      timers.current.push(window.setTimeout(() => setLit(null), 170))
      if (next === sequence.length) {
        setPhase('done')
        timers.current.push(window.setTimeout(onSolved, 480))
      }
      return
    }
    setWrong(cell)
    onFailed('pattern broken')
    timers.current.push(
      window.setTimeout(() => {
        setWrong(null)
        run()
      }, 700),
    )
  }

  return (
    <div className="recallWrap">
      <div className="recallStatus">
        {phase === 'watch' && <span className="recallWatch">watch the pattern</span>}
        {phase === 'play' && (
          <span>
            your turn · {progress} / {STEPS}
          </span>
        )}
        {phase === 'done' && <span className="recallDone">matched</span>}
      </div>

      <div className="recallGrid">
        {Array.from({ length: CELLS }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`cell ${i + 1}`}
            disabled={phase !== 'play'}
            className={`recallCell ${lit === i ? 'is-lit' : ''} ${wrong === i ? 'is-wrong' : ''}`}
            onClick={() => click(i)}
          />
        ))}
      </div>

      <div className="recallPips">
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className={i < progress ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  )
}
