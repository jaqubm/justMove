import type { ActivityType } from '@/lib/types'

const PATHS: Record<ActivityType, React.ReactNode> = {
  walk:  <><circle cx="14" cy="4.5" r="2"/><path d="M14 7.5l-3 5 2.5 3v5"/><path d="M11 12.5l-4 2"/><path d="M13.5 15.5l3-1 2 4"/></>,
  run:   <><circle cx="15" cy="4" r="2"/><path d="M15 7l-4 4 1 4 4 4"/><path d="M11 11l-4 1"/><path d="M16 15l3-2 3 1"/><path d="M9 19l-3 1"/></>,
  cycle: <><circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/><circle cx="14" cy="5" r="1.6"/><path d="M6 17l4-7h6l2 7M10 10l4 7"/></>,
  gym:   <><path d="M3 9v6M21 9v6M5 7v10M19 7v10M5 12h14"/></>,
  yoga:  <><circle cx="12" cy="5" r="2"/><path d="M12 7v6M5 19h14M8 19l4-6 4 6M9 13h6"/></>,
  sport: <><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4v16M6 6c3 3 9 9 12 12M18 6c-3 3-9 9-12 12"/></>,
  dance: <><circle cx="13" cy="4" r="2"/><path d="M13 6l-3 4 4 3-2 4 4 3"/><path d="M10 10l-4-1M14 13l4-2"/></>,
  hike:  <><circle cx="9" cy="4" r="2"/><path d="M9 6l-2 5 4 2v6"/><path d="M11 13l4-2 3 7"/><path d="M3 21l5-9 4 4 4-7 5 12"/></>,
  move:  <><circle cx="12" cy="12" r="8"/><path d="M9 9l6 6M15 9l-6 6"/></>,
}

interface Props {
  type: ActivityType
  size?: number
  color?: string
}

export default function ActivityGlyph({ type, size = 22, color = 'currentColor' }: Props) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g {...p}>{PATHS[type]}</g>
    </svg>
  )
}
