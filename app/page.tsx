import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignInButton from './sign-in-button'

export default async function SignInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/home')

  return (
    <>
      {/* ── Mobile ── */}
      <div className="md:hidden">
        <main style={{
          minHeight: '100dvh', position: 'relative', overflow: 'hidden',
          background: `radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, var(--bg) 60%), var(--bg)`,
          color: 'var(--ink)',
        }}>
          {/* accent halo */}
          <div style={{
            position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 70%)',
            filter: 'blur(8px)', pointerEvents: 'none',
          }} />

          <div style={{ padding: '120px 24px 0', position: 'relative' }}>
            {/* logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 80 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" fill="var(--accent-ink)" stroke="none" />
                </svg>
              </div>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                letterSpacing: '-0.04em', color: 'var(--ink)',
              }}>justMove</span>
            </div>

            {/* headline */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 14vw, 56px)',
              fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.05em',
              color: 'var(--ink)', marginBottom: 18,
            }}>
              Show up.<br />
              <span style={{ color: 'var(--accent)' }}>Move.</span><br />
              Repeat.
            </h1>

            <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.45, maxWidth: 280 }}>
              30 minutes a day keeps the streak alive. Photo-proof your sweat. Level up the human.
            </p>
          </div>

          {/* bottom CTA */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '0 24px 48px' }}>
            <SignInButton />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>By continuing you agree to</span>
              <span style={{ fontSize: 12, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 2 }}>terms</span>
              <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>·</span>
              <span style={{ fontSize: 12, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 2 }}>privacy</span>
            </div>
          </div>
        </main>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:flex" style={{
        minHeight: '100dvh', background: 'var(--bg)', color: 'var(--ink)',
      }}>
        {/* Left panel */}
        <div style={{
          flex: '1.1', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 72px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" fill="var(--accent-ink)" stroke="none" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
              letterSpacing: '-0.04em', color: 'var(--ink)',
            }}>justMove</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 800,
            lineHeight: 0.9, letterSpacing: '-0.05em', color: 'var(--ink)',
            marginBottom: 24,
          }}>
            Show up.<br />
            <span style={{ color: 'var(--accent)' }}>Move.</span><br />
            Repeat.
          </h1>

          <p style={{
            fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5,
            maxWidth: 360, marginBottom: 40,
          }}>
            30 minutes a day keeps the streak alive. Photo-proof your sweat. Level up the human.
          </p>

          <div style={{ marginBottom: 40 }}>
            <SignInButton inline />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { val: '187k', lab: 'movers' },
              { val: '4.2M', lab: 'minutes logged' },
              { val: '28d',  lab: 'avg streak' },
            ].map(s => (
              <div key={s.lab}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                  color: 'var(--ink)', letterSpacing: '-0.03em',
                }}>{s.val}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{s.lab}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — decorative */}
        <div style={{
          flex: '0.9', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(160deg, oklch(0.26 0.06 90) 0%, var(--bg) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Big decorative number */}
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 260, fontWeight: 800,
            lineHeight: 1, letterSpacing: '-0.06em',
            color: 'color-mix(in srgb, var(--accent) 8%, transparent)',
            userSelect: 'none', pointerEvents: 'none',
            position: 'absolute',
          }}>30</div>

          {/* Floating activity cards */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14, padding: 40 }}>
            {[
              { type: 'Run', mins: 42, xp: '+42xp', hue: 16 },
              { type: 'Yoga', mins: 35, xp: '+35xp', hue: 320 },
            ].map(card => (
              <div key={card.type} style={{
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 18, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14, minWidth: 260,
                boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `oklch(0.26 0.08 ${card.hue})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: `oklch(0.78 0.16 ${card.hue})`, textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>{card.type[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{card.type}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>{card.mins}m today</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                }}>{card.xp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
