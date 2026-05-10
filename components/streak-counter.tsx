interface Props {
  streak: number
  size?: 'lg' | 'md' | 'sm'
}

const SIZES = {
  lg: { fs: 88,  iconSize: 28, labelFs: 11 },
  md: { fs: 56,  iconSize: 22, labelFs: 10 },
  sm: { fs: 36,  iconSize: 18, labelFs: 10 },
}

export default function StreakCounter({ streak, size = 'lg' }: Props) {
  const { fs, iconSize, labelFs } = SIZES[size]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: fs,
        fontWeight: 800, lineHeight: 0.9, color: 'var(--ink)', letterSpacing: '-0.04em',
      }}>{streak}</span>
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        paddingBottom: fs * 0.08,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
            stroke="var(--flame)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 1-4 1 2 3 1 3-4z" />
          </svg>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: labelFs, color: 'var(--flame)',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>day streak</span>
        </div>
      </div>
    </div>
  )
}
