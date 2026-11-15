import { useMemo, useState } from 'react'
import { randInt, shuffle } from '../../lib/puzzles'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }

const COUNT = 7

export function ScaleSort({ onSolved, onFailed }: Props) {
  const { items, order } = useMemo(() => {
    const sized = Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      size: 26 + i * 7 + randInt(5),
    }))
    return {
      items: shuffle(sized),
      order: [...sized].sort((a, b) => a.size - b.size).map((s) => s.id),
    }
  }, [])

  const [progress, setProgress] = useState(0)
  const [wrong, setWrong] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  const chosen = order.slice(0, progress)

  const handleClick = (id: number) => {
    if (locked) return
    if (chosen.includes(id)) return
    if (id === order[progress]) {
      const next = progress + 1
      setProgress(next)
      if (next === COUNT) {
        setLocked(true)
        window.setTimeout(onSolved, 460)
      }
      return
    }
    setWrong(id)
    onFailed('out of order')
    window.setTimeout(() => {
      setWrong(null)
      setProgress(0)
    }, 520)
  }

  return (
    <div className="sortWrap">
      <div className="sortPrompt">
        <span>smallest</span>
        <span className="sortPromptLine" />
        <span>largest</span>
      </div>
      <div className="sortStage">
        {items.map((item) => {
          const picked = chosen.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`shape ${item.id + 1}`}
              aria-pressed={picked}
              className={`sortShape ${picked ? 'is-picked' : ''} ${wrong === item.id ? 'is-wrong' : ''}`}
              style={{ width: item.size, height: item.size, borderRadius: Math.round(item.size * 0.32) }}
              onClick={() => handleClick(item.id)}
            />
          )
        })}
      </div>
      <div className="sortPips">
        {Array.from({ length: COUNT }, (_, i) => (
          <span key={i} className={i < progress ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  )
}
