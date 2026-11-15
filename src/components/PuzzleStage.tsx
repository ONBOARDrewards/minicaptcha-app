import type { PuzzleKind } from '../lib/puzzles'
import { MazeTrace } from './puzzles/MazeTrace'
import { ScaleSort } from './puzzles/ScaleSort'
import { RotateKey } from './puzzles/RotateKey'
import { RecallGrid } from './puzzles/RecallGrid'
import { LinkDots } from './puzzles/LinkDots'
import { ParkCar } from './puzzles/ParkCar'
import { DodgeCoins } from './puzzles/DodgeCoins'
import { StackTower } from './puzzles/StackTower'
import { PourGlass } from './puzzles/PourGlass'
import { WeighScale } from './puzzles/WeighScale'
import { PuttGreen } from './puzzles/PuttGreen'
import { SnipCables } from './puzzles/SnipCables'

type Props = {
  kind: PuzzleKind
  onSolved: () => void
  onFailed: (reason: string) => void
}

export function PuzzleStage({ kind, onSolved, onFailed }: Props) {
  switch (kind) {
    case 'maze':
      return <MazeTrace onSolved={onSolved} onFailed={onFailed} />
    case 'sort':
      return <ScaleSort onSolved={onSolved} onFailed={onFailed} />
    case 'rotate':
      return <RotateKey onSolved={onSolved} onFailed={onFailed} />
    case 'recall':
      return <RecallGrid onSolved={onSolved} onFailed={onFailed} />
    case 'link':
      return <LinkDots onSolved={onSolved} onFailed={onFailed} />
    case 'park':
      return <ParkCar onSolved={onSolved} onFailed={onFailed} />
    case 'dodge':
      return <DodgeCoins onSolved={onSolved} onFailed={onFailed} />
    case 'stack':
      return <StackTower onSolved={onSolved} onFailed={onFailed} />
    case 'pour':
      return <PourGlass onSolved={onSolved} onFailed={onFailed} />
    case 'weigh':
      return <WeighScale onSolved={onSolved} onFailed={onFailed} />
    case 'putt':
      return <PuttGreen onSolved={onSolved} onFailed={onFailed} />
    case 'snip':
      return <SnipCables onSolved={onSolved} onFailed={onFailed} />
    default:
      return null
  }
}
