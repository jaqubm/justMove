import { getRankInfo } from '@/lib/game'

interface Props {
  level: number
  size?: 'sm' | 'md' | 'lg'
}

export default function RankBadge({ level, size = 'md' }: Props) {
  const rank = getRankInfo(level)
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-mono font-semibold ${padding}`}
      style={{ backgroundColor: rank.color, color: rank.ink }}
    >
      {rank.name}
      <span className="opacity-70">{rank.roman}</span>
    </span>
  )
}
