import { useEffect, useRef, useState } from 'react'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }

/** Height of each target mark, in percent of the glass. */
const BAND = 14
/** Drift amplitude and the tolerance a release needs to count. */
const DRIFT = 4.5
const MAX_MISSES = 3

type Band = { base: number; phase: number; speed: number }

function randomBand(min: number, max: number): Band {
  return {
    base: min + Math.random() * (max - min),
    phase: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 0.45,
  }
}

function freshBands() {
  return { a: randomBand(28, 40), b: randomBand(70, 82) }
}

function positionOf(band: Band, seconds: number) {
  return band.base + DRIFT * Math.sin(seconds * band.speed + band.phase)
}

export function PourGlass({ onSolved, onFailed }: Props) {
  // One frame of rendered state: the water line and both mark positions.
  const [view, setView] = useState({ level: 0, a: 34, b: 76 })
  const [stage, setStage] = useState(0) // 0 = lower mark, 1 = upper mark, 2 = cleared
  const [misses, setMisses] = useState(0)
  const [pouring, setPouring] = useState(false)
  const [done, setDone] = useState(false)
  const [dead, setDead] = useState(false)

  const levelRef = useRef(0)
  const holdingRef = useRef(false)
  const stageRef = useRef(0)
  const lockedRef = useRef<number | null>(null)
  const missesRef = useRef(0)
  const doneRef = useRef(false)
  const bandsRef = useRef(freshBands())
  const startedRef = useRef(performance.now())
  const cb = useRef({ onSolved, onFailed })
  cb.current = { onSolved, onFailed }

  const miss = (reason: string) => {
    if (doneRef.current) return
    holdingRef.current = false
    levelRef.current = 0
    stageRef.current = 0
    lockedRef.current = null
    bandsRef.current = freshBands()
    missesRef.current += 1
    setStage(0)
    setPouring(false)
    setMisses(missesRef.current)
    if (missesRef.current >= MAX_MISSES) {
      doneRef.current = true
      setDead(true)
      cb.current.onFailed(reason)
    }
  }

  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = Math.min(2.6, (now - last) / 16.667)
      last = now
      const seconds = (now - startedRef.current) / 1000
      const bands = bandsRef.current
      const a = lockedRef.current ?? positionOf(bands.a, seconds)
      const b = positionOf(bands.b, seconds)

      if (holdingRef.current && !doneRef.current) {
        // Deliberately uneven flow: a fixed hold time lands somewhere different
        // every attempt, so timing scripts cannot open-loop this.
        const rate = 0.45 + 0.2 * Math.sin(seconds * 2.6) + 0.1 * Math.sin(seconds * 5.3 + 1.2)
        const next = levelRef.current + Math.max(0.14, rate) * dt
        if (next >= 100) {
          levelRef.current = 100
          setView({ level: 100, a, b })
          miss('overflowed the glass')
        } else {
          levelRef.current = next
          setView({ level: next, a, b })
        }
      } else {
        setView({ level: levelRef.current, a, b })
      }
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const start = () => {
    if (doneRef.current) return
    holdingRef.current = true
    setPouring(true)
  }

  const stop = () => {
    if (!holdingRef.current || doneRef.current) return
    holdingRef.current = false
    setPouring(false)

    const seconds = (performance.now() - startedRef.current) / 1000
    const bands = bandsRef.current
    const a = lockedRef.current ?? positionOf(bands.a, seconds)
    const b = positionOf(bands.b, seconds)
    const target = stageRef.current === 0 ? a : b

    if (Math.abs(levelRef.current - target) > BAND / 2) {
      miss(levelRef.current > target ? 'released above the mark' : 'released below the mark')
      return
    }

    if (stageRef.current === 0) {
      stageRef.current = 1
      lockedRef.current = a
      setStage(1)
      return
    }

    doneRef.current = true
    setStage(2)
    setDone(true)
    window.setTimeout(() => cb.current.onSolved(), 620)
  }

  const emptyGlass = () => {
    if (doneRef.current) return
    holdingRef.current = false
    levelRef.current = 0
    stageRef.current = 0
    lockedRef.current = null
    bandsRef.current = freshBands()
    setStage(0)
    setPouring(false)
  }

  const water = Math.min(100, view.level)
  const hint = dead
    ? 'out of pours'
    : done
      ? 'both marks, dead on'
      : stage === 0
        ? 'hit the lower mark first'
        : 'now the upper mark'

  return (
    <div className={`pourWrap ${done ? 'is-done' : ''}`}>
      <div className="pourStage">
        <div className={`pourBottle ${pouring ? 'is-pouring' : ''}`} aria-hidden="true">
          <span className="pourBottleBody" />
          <span className="pourBottleCap" />
        </div>

        <div className="pourGlassCol">
          <span className={`pourStream ${pouring ? 'is-on' : ''}`} aria-hidden="true" />
          <div
            className="pourGlass"
            role="img"
            aria-label={`Water glass, roughly ${Math.round(water / 10) * 10} percent full, two target marks shown`}
          >
            <span className="pourWater" style={{ height: `${water}%` }}>
              <i className="pourSurface" />
            </span>
            <span
              className={`pourBand ${stage === 0 ? 'is-next' : ''} ${stage > 0 ? 'is-locked' : ''}`}
              style={{ bottom: `${view.a - BAND / 2}%`, height: `${BAND}%` }}
            />
            <span
              className={`pourBand pourBand--b ${stage === 1 ? 'is-next' : ''}`}
              style={{ bottom: `${view.b - BAND / 2}%`, height: `${BAND}%` }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`pourBtn ${pouring ? 'is-on' : ''}`}
        disabled={dead || done}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          start()
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
        onBlur={stop}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            start()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') stop()
        }}
      >
        {done ? 'poured' : dead ? 'locked' : 'hold to pour'}
      </button>

      <div className="pourFoot">
        <span className="pourHint">{hint}</span>
        <span className="pourMarks" aria-hidden="true">
          <i className={stage > 0 ? 'is-on' : ''} />
          <i className={stage > 1 ? 'is-on' : ''} />
        </span>
        {!done && !dead && (
          <button className="pourLink" type="button" onClick={emptyGlass}>
            empty glass
          </button>
        )}
        {misses > 0 && !done && !dead && <span className="pourHint">miss {misses} of {MAX_MISSES}</span>}
      </div>

    </div>
  )
}
