import { useMemo, useState } from 'react'
import { randInt, shuffle } from '../../lib/puzzles'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }

const WEIGHTS = [1, 2, 3, 4, 5, 6]

export function WeighScale({ onSolved }: Props) {
  const [target] = useState(() => 4 + randInt(6))
  const [picked, setPicked] = useState<number[]>([])
  const [done, setDone] = useState(false)

  const weights = useMemo(() => shuffle(WEIGHTS), [])
  const total = picked.reduce((sum, w) => sum + w, 0)
  const diff = total - target
  const angle = Math.max(-12, Math.min(12, diff * 3))

  const toggle = (weight: number) => {
    if (done) return
    const next = picked.includes(weight) ? picked.filter((w) => w !== weight) : [...picked, weight]
    setPicked(next)
    const sum = next.reduce((acc, w) => acc + w, 0)
    if (sum === target) {
      setDone(true)
      window.setTimeout(onSolved, 620)
    }
  }

  return (
    <div className={`weighWrap ${done ? 'is-done' : ''}`}>
      <svg className="weighSvg" viewBox="0 0 340 200" role="img" aria-label={`Balance the scale at ${target} kilograms`}>
        <rect x="150" y="150" width="40" height="12" rx="5" fill="#0b0c0e" opacity="0.9" />
        <path d="M170 60 L190 150 H150 Z" fill="#0b0c0e" opacity="0.16" />

        <g className="weighBeam" style={{ transform: `rotate(${angle}deg)` }}>
          <rect x="52" y="56" width="236" height="7" rx="3.5" fill="#0b0c0e" />
          <circle cx="170" cy="59.5" r="9" fill="#0b0c0e" />
          <circle cx="170" cy="59.5" r="3.5" fill="#c9f75d" />

          {/* left pan: the target weight */}
          <g transform="translate(60 60)">
            <path d="M0 0v16" stroke="#0b0c0e" strokeWidth="2" opacity="0.45" />
            <path d="M-30 16h60l-9 22h-42z" fill="#0b0c0e" opacity="0.14" stroke="#0b0c0e" strokeWidth="1.6" />
            <text x="0" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0b0c0e" fontFamily="inherit">
              {target}
            </text>
          </g>

          {/* right pan: whatever you have added */}
          <g transform="translate(280 60)">
            <path d="M0 0v16" stroke="#0b0c0e" strokeWidth="2" opacity="0.45" />
            <path d="M-30 16h60l-9 22h-42z" fill="#c9f75d" fillOpacity="0.35" stroke="#0b0c0e" strokeWidth="1.6" />
            <text x="0" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0b0c0e" fontFamily="inherit">
              {total || '–'}
            </text>
          </g>
        </g>

        <text x="60" y="126" textAnchor="middle" fontSize="9" letterSpacing="1.4" fill="#0b0c0e" opacity="0.4" fontFamily="inherit">
          TARGET
        </text>
        <text x="280" y="126" textAnchor="middle" fontSize="9" letterSpacing="1.4" fill="#0b0c0e" opacity="0.4" fontFamily="inherit">
          YOURS
        </text>
        <text x="170" y="188" textAnchor="middle" fontSize="10" fill="#0b0c0e" opacity={done ? 0.75 : 0.35} fontFamily="inherit">
          {done ? 'balanced' : diff === 0 ? 'level · checking' : diff > 0 ? 'too heavy' : 'too light'}
        </text>
      </svg>

      <div className="weighChips">
        {weights.map((w) => (
          <button
            key={w}
            type="button"
            className={`weighChip ${picked.includes(w) ? 'is-on' : ''}`}
            aria-pressed={picked.includes(w)}
            aria-label={`${w} kilogram weight`}
            onClick={() => toggle(w)}
          >
            {w}
          </button>
        ))}
      </div>
      <span className="weighRead">
        {total} / {target} kg
      </span>
    </div>
  )
}
