import { useMemo, useRef, useState } from 'react'
import { angleDistance, normalizeAngle, randInt } from '../../lib/puzzles'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }

const CENTER = 150
const TOLERANCE = 7
const ORBIT = 66

const glyphPositions = [0, 120, 240].map((deg) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return {
    deg,
    x: CENTER + ORBIT * Math.cos(rad),
    y: CENTER + ORBIT * Math.sin(rad),
  }
})

function Glyph({ index, x, y, fitted }: { index: number; x: number; y: number; fitted: boolean }) {
  const fill = fitted ? '#c9f75d' : '#f4f4ef'
  if (index === 0) return <circle cx={x} cy={y} r={9} fill={fill} />
  if (index === 1) return <rect x={x - 9} y={y - 9} width={18} height={18} rx={4} fill={fill} />
  return <path d={`M${x} ${y - 11}l10 19h-20z`} fill={fill} />
}

export function RotateKey({ onSolved }: Props) {
  const target = useMemo(() => randInt(360), [])
  const [angle, setAngle] = useState(() => {
    let start = randInt(360)
    let guard = 0
    while (angleDistance(start, target) < 45 && guard < 60) {
      start = randInt(360)
      guard++
    }
    return start
  })
  const [dragging, setDragging] = useState(false)
  const [done, setDone] = useState(false)
  const [hint, setHint] = useState(true)

  const angleRef = useRef(angle)
  angleRef.current = angle
  const lastAngle = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const doneRef = useRef(false)

  const offset = angleDistance(angle, target)
  const near = offset < 22
  const fitted = done || angleDistance(normalizeAngle(angle), normalizeAngle(target)) < 0.5

  const win = () => {
    if (doneRef.current) return
    doneRef.current = true
    setDone(true)
    setDragging(false)
    setAngle(target)
    window.setTimeout(onSolved, 480)
  }

  const toAngle = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return 0
    const rect = svg.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 300
    const y = ((clientY - rect.top) / rect.height) * 300
    return (Math.atan2(y - CENTER, x - CENTER) * 180) / Math.PI
  }

  const update = (next: number) => {
    setAngle(next)
    if (angleDistance(next, target) <= TOLERANCE) win()
  }

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (doneRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    lastAngle.current = toAngle(e.clientX, e.clientY)
    setDragging(true)
    setHint(false)
  }

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || doneRef.current) return
    const current = toAngle(e.clientX, e.clientY)
    const last = lastAngle.current ?? current
    let delta = current - last
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    lastAngle.current = current
    update(angleRef.current + delta)
  }

  const onUp = () => {
    if (doneRef.current) return
    setDragging(false)
    if (angleDistance(angleRef.current, target) <= TOLERANCE) win()
  }

  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (doneRef.current) return
    const step = e.shiftKey ? 1 : 3
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setHint(false)
      update(angleRef.current - step)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setHint(false)
      update(angleRef.current + step)
    }
  }

  return (
    <div className="rotateWrap">
      <div className="rotateStatus">
        {done ? 'fitted' : dragging ? 'rotating' : 'drag to rotate · arrows also work'}
      </div>
      <svg
        ref={svgRef}
        className={`rotateSvg ${dragging ? 'is-dragging' : ''} ${done ? 'is-done' : ''} ${near ? 'is-near' : ''}`}
        viewBox="0 0 300 300"
        role="application"
        aria-label="Rotate the dial to fit the symbols into their slots"
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        onKeyDown={onKeyDown}
      >
        <circle cx={CENTER} cy={CENTER} r={132} fill="none" stroke="#0a0b0d" strokeOpacity="0.08" strokeWidth="1" />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={132}
          fill="none"
          stroke="#8fce1b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(1 - offset / 180) * 2 * Math.PI * 132} 999`}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          opacity={0.75}
        />

        {Array.from({ length: 36 }, (_, i) => (
          <line
            key={i}
            x1={CENTER}
            y1={18}
            x2={CENTER}
            y2={i % 3 === 0 ? 30 : 24}
            stroke="#0a0b0d"
            strokeOpacity={i % 3 === 0 ? 0.28 : 0.12}
            strokeWidth={i % 3 === 0 ? 2 : 1.2}
            transform={`rotate(${i * 10} ${CENTER} ${CENTER})`}
          />
        ))}

        <circle cx={CENTER} cy={CENTER} r={104} fill="none" stroke="#0a0b0d" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="2 8" />

        <g transform={`rotate(${target} ${CENTER} ${CENTER})`} className="rotateGhost">
          {glyphPositions.map((pos, i) => (
            <g key={i} opacity={0.4}>
              <Glyph index={i} x={pos.x} y={pos.y} fitted={false} />
            </g>
          ))}
        </g>

        <g
          transform={`rotate(${angle} ${CENTER} ${CENTER})`}
          style={{ transition: dragging ? 'none' : 'transform 0.5s cubic-bezier(0.22,1,0.36,1)' }}
          className="rotateDial"
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={92}
            fill="none"
            stroke="#0b0c0e"
            strokeWidth="16"
            strokeDasharray="484 999"
            strokeLinecap="round"
            opacity="0.9"
          />
          {glyphPositions.map((pos, i) => (
            <Glyph key={i} index={i} x={pos.x} y={pos.y} fitted={fitted} />
          ))}
        </g>

        <circle cx={CENTER} cy={CENTER} r={46} fill="#0b0c0e" />
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER - 34}
            x2={CENTER}
            y2={CENTER - 26}
            stroke="#c9f75d"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${i * 45} ${CENTER} ${CENTER})`}
          />
        ))}
        <circle cx={CENTER} cy={CENTER} r={7} fill="#c9f75d" />

        {hint && (
          <text
            x={CENTER}
            y={262}
            textAnchor="middle"
            fontSize="9.5"
            letterSpacing="2"
            fill="#0a0b0d"
            fillOpacity="0.4"
            fontFamily="inherit"
          >
            DRAG AROUND THE DIAL
          </text>
        )}
      </svg>
    </div>
  )
}
