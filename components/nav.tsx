'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z" />
    </svg>
  )
}
function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function TrophyIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v4a5 5 0 01-10 0V4z" />
      <path d="M7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3" />
      <path d="M9 16h6v3H9zM8 21h8" />
    </svg>
  )
}
function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </svg>
  )
}
function CalIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}

const MOBILE_TABS = [
  { href: '/home',        label: 'Today',   Icon: HomeIcon },
  { href: '/log',         label: 'Log',     Icon: ListIcon },
  { href: '/add',         label: '',        primary: true },
  { href: '/leaderboard', label: 'Friends', Icon: TrophyIcon },
  { href: '/profile',     label: 'Me',      Icon: UserIcon },
] as const

const DESKTOP_NAV = [
  { href: '/home',        label: 'Today',    Icon: HomeIcon },
  { href: '/log',         label: 'Log',      Icon: ListIcon },
  { href: '/add',         label: 'Add',      Icon: PlusIcon, primary: true },
  { href: '/streak',      label: 'Streak',   Icon: CalIcon },
  { href: '/leaderboard', label: 'Friends',  Icon: TrophyIcon },
  { href: '/profile',     label: 'Profile',  Icon: UserIcon },
] as const

export default function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 z-30 border-r"
             style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--line)' }}>
        <div className="px-6 py-5">
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800,
            letterSpacing: '-0.04em', color: 'var(--ink)',
          }}>
            just<span style={{ color: 'var(--accent)' }}>Move</span>
          </span>
        </div>
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {DESKTOP_NAV.map(item => {
            const active = pathname === item.href
            const isPrimary = 'primary' in item && item.primary
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isPrimary
                    ? active ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 12%, transparent)'
                    : active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                  color: isPrimary
                    ? active ? 'var(--accent-ink)' : 'var(--accent)'
                    : active ? 'var(--accent)' : 'var(--ink-muted)',
                }}
              >
                <item.Icon active={active} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile floating pill tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30"
           style={{ paddingBottom: 28, paddingTop: 8, pointerEvents: 'none' }}>
        <div style={{
          margin: '0 12px',
          background: 'var(--bg-raised)',
          border: '1px solid var(--line)',
          borderRadius: 22,
          padding: '8px 6px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          pointerEvents: 'auto',
        }}>
          {MOBILE_TABS.map(tab => {
            if ('primary' in tab && tab.primary) {
              return (
                <Link key={tab.href} href={tab.href} style={{ flex: '0 0 auto' }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: 'var(--accent)', color: 'var(--accent-ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: -22,
                    boxShadow: `0 8px 22px -6px color-mix(in srgb, var(--accent) 60%, transparent), 0 0 0 4px var(--bg-raised)`,
                  }}>
                    <PlusIcon />
                  </div>
                </Link>
              )
            }
            const active = pathname === tab.href
            if (!('Icon' in tab)) return null
            const Icon = tab.Icon as React.ComponentType<{ active: boolean }>
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '6px 0', color: active ? 'var(--accent)' : 'var(--ink-dim)',
                }}
              >
                <Icon active={active} />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700,
                }}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
