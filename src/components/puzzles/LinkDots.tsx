import { useMemo, useRef, useState } from 'react'
import { shuffle } from '../../lib/puzzles'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }
type Dot = { x: number; y: number }

const W = 340
const H = 250
const COUNT = 5
const HIT = 24

function makeDots(): Dot[] {
  const slots: Dot[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      slots.push({
        x: 50 + c * 80 + (Math.random() * 20 - 10),
        y: 46 + r * 78 + (Math.random() * 16 - 8),
      })
    }
  }
  return shuffle(slots).slice(0, COUNT)
}

export function LinkDots({ onSolved, onFailed }: Props) {
  const dots = useMemo(makeDots, [])
  const [progress, setProgress] = useState(0)
  const [cursor, setCursor] = useState<Dot | null>(null)
  const [shake, setShake] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const progressRef = useRef(0)
  const doneRef = useRef(false)

  const toLocal = (clientX: number, clientY: number): Dot => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    }
  }

  const reset = () => {
    dragging.current = false
    progressRef.current = 0
    setProgress(0)
    setCursor(null)
  }

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (doneRef.current) return
    const p = toLocal(e.clientX, e.clientY)
    if (Math.hypot(p.x - dots[0].x, p.y - dots[0].y) > HIT + 6) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
    progressRef.current = 1
    setProgress(1)
    setCursor(p)
  }

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || doneRef.current) return
    const p = toLocal(e.clientX, e.clientY)
    setCursor(p)

    const next = progressRef.current
    if (next >= dots.length) return

    if (Math.hypot(p.x - dots[next].x, p.y - dots[next].y) < HIT) {
      const updated = next + 1
      progressRef.current = updated
      setProgress(updated)
      if (updated === dots.length) {
        doneRef.current = true
        dragging.current = false
        setCursor(null)
        window.setTimeout(onSolved, 460)
      }
      return
    }

    for (let i = next + 1; i < dots.length; i++) {
      if (Math.hypot(p.x - dots[i].x, p.y - dots[i].y) < HIT - 2) {
        setShake(true)
        onFailed(`jumped to ${i + 1}`)
        window.setTimeout(() => setShake(false), 420)
        reset()
        return
      }
    }
  }

  const onUp = () => {
    if (doneRef.current) return
    reset()
  }

  const pathDots = dots.slice(0, progress)

  return (
    <div className={`linkWrap ${shake ? 'is-flash' : ''}`}>
      <svg
        ref={svgRef}
        className="linkSvg"
        viewBox={`0 0 ${W} ${H}`}
        role="application"
        aria-label="Drag from dot one to dot five in order"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
      >
        <rect x="0" y="0" width={W} height={H} fill="#0b0c0e" rx="14" />

        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={12 + (i % 9) * 40} cy={16 + Math.floor(i / 9) * 216} r="1" fill="#f4f4ef" opacity="0.08" />
        ))}

        {progress > 1 && (
          <polyline
            points={pathDots.map((d) => `${d.x},${d.y}`).join(' ')}
            fill="none"
            stroke="#c9f75d"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {dragging.current && cursor && progress >= 1 && (
          <line
            x1={dots[progress - 1].x}
            y1={dots[progress - 1].y}
            x2={cursor.x}
            y2={cursor.y}
            stroke="#c9f75d"
            strokeWidth="3"
            strokeDasharray="5 7"
            strokeLinecap="round"
            opacity="0.55"
          />
        )}

        {dots.map((dot, i) => {
          const linked = i < progress
          const isNext = i === progress
          return (
            <g key={i}>
              {isNext && !doneRef.current && (
                <circle cx={dot.x} cy={dot.y} r={22} fill="none" stroke="#c9f75d" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.7">
                  <animate attributeName="r" values="20;26;20" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={dot.x} cy={dot.y} r={17} fill={linked ? '#c9f75d' : '#f4f4ef'} />
              <text
                x={dot.x}
                y={dot.y + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontWeight="600"
                fill="#0b0c0e"
                fontFamily="inherit"
              >
                {i + 1}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mazeBadge">
        <span className="mazeBadgeDot" /> connect in order
      </div>
    </div>
  )
}
