import type { Apparatus } from '../types'

interface Props {
  apparatus: Apparatus
  size?: number
}

export function ApparatusIcon({ apparatus, size = 24 }: Props) {
  const s = { width: size, height: size, display: 'block' as const }

  switch (apparatus) {
    case 'vault':
      return (
        <svg viewBox="0 0 28 28" fill="none" style={s}>
          {/* Horse body */}
          <rect x="5" y="12" width="18" height="7" rx="2" fill="currentColor" />
          {/* Legs */}
          <rect x="7" y="19" width="3" height="6" rx="1.5" fill="currentColor" />
          <rect x="18" y="19" width="3" height="6" rx="1.5" fill="currentColor" />
          {/* Jump arc */}
          <path d="M2 19 C5 19 7 7 14 7 C21 7 23 12 26 9"
            stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      )

    case 'bars':
      return (
        <svg viewBox="0 0 28 28" fill="none" style={s}>
          {/* High bar */}
          <rect x="1" y="4" width="26" height="2.5" rx="1.25" fill="currentColor" />
          {/* Low bar */}
          <rect x="1" y="14" width="26" height="2.5" rx="1.25" fill="currentColor" />
          {/* Uprights */}
          <rect x="2" y="6.5" width="2.5" height="7.5" fill="currentColor" />
          <rect x="23.5" y="6.5" width="2.5" height="7.5" fill="currentColor" />
          {/* Bases */}
          <rect x="1" y="21" width="7" height="2" rx="1" fill="currentColor" />
          <rect x="20" y="21" width="7" height="2" rx="1" fill="currentColor" />
        </svg>
      )

    case 'beam':
      return (
        <svg viewBox="0 0 28 28" fill="none" style={s}>
          {/* Beam */}
          <rect x="1" y="11" width="26" height="3.5" rx="1.5" fill="currentColor" />
          {/* Legs */}
          <rect x="4" y="14.5" width="2.5" height="8" rx="1.25" fill="currentColor" />
          <rect x="21.5" y="14.5" width="2.5" height="8" rx="1.25" fill="currentColor" />
          {/* Feet */}
          <rect x="2" y="22" width="7" height="2" rx="1" fill="currentColor" />
          <rect x="19" y="22" width="7" height="2" rx="1" fill="currentColor" />
          {/* Gymnast silhouette */}
          <circle cx="14" cy="6" r="2.5" fill="currentColor" />
          <path d="M14 8.5 L14 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )

    case 'floor':
      return (
        <svg viewBox="0 0 28 28" fill="none" style={s}>
          {/* Floor mat border */}
          <rect x="2" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
          {/* Inner line */}
          <rect x="5" y="9" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="3 2" />
          {/* Gymnast doing cartwheel */}
          <circle cx="14" cy="12" r="2" fill="currentColor" />
          <path d="M11 15 Q14 18 17 15" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      )

    case 'pommel':
      return (
        <svg viewBox="0 0 28 28" fill="none" style={s}>
          {/* Horse body */}
          <ellipse cx="14" cy="13" rx="10" ry="5.5" fill="currentColor" />
          {/* Left pommel */}
          <rect x="8" y="8.5" width="3" height="5" rx="1.5" fill="white" />
          {/* Right pommel */}
          <rect x="17" y="8.5" width="3" height="5" rx="1.5" fill="white" />
          {/* Legs */}
          <rect x="6" y="18.5" width="2.5" height="7" rx="1.25" fill="currentColor" />
          <rect x="19.5" y="18.5" width="2.5" height="7" rx="1.25" fill="currentColor" />
        </svg>
      )

    case 'rings':
      return (
        <svg viewBox="0 0 28 28" fill="none" style={s}>
          {/* Top bar */}
          <rect x="3" y="2" width="22" height="2.5" rx="1.25" fill="currentColor" />
          {/* Left strap */}
          <line x1="8" y1="4.5" x2="8" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          {/* Right strap */}
          <line x1="20" y1="4.5" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          {/* Left ring */}
          <circle cx="8" cy="18" r="5.5" stroke="currentColor" strokeWidth="2.5" fill="none" />
          {/* Right ring */}
          <circle cx="20" cy="18" r="5.5" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
      )

    case 'p_bars':
      return (
        <svg viewBox="0 0 28 28" fill="none" style={s}>
          {/* Left bar */}
          <rect x="1" y="10" width="10" height="2.5" rx="1.25" fill="currentColor" />
          {/* Right bar */}
          <rect x="17" y="10" width="10" height="2.5" rx="1.25" fill="currentColor" />
          {/* Left uprights */}
          <rect x="2.5" y="12.5" width="2" height="11" rx="1" fill="currentColor" />
          <rect x="7.5" y="12.5" width="2" height="11" rx="1" fill="currentColor" />
          {/* Right uprights */}
          <rect x="18.5" y="12.5" width="2" height="11" rx="1" fill="currentColor" />
          <rect x="23.5" y="12.5" width="2" height="11" rx="1" fill="currentColor" />
          {/* Center piece connecting them */}
          <line x1="11" y1="11.25" x2="17" y2="11.25" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      )

    case 'h_bar':
      return (
        <svg viewBox="0 0 28 28" fill="none" style={s}>
          {/* Horizontal bar */}
          <rect x="2" y="7" width="24" height="3" rx="1.5" fill="currentColor" />
          {/* Left upright */}
          <rect x="4" y="10" width="2.5" height="14" rx="1.25" fill="currentColor" />
          {/* Right upright */}
          <rect x="21.5" y="10" width="2.5" height="14" rx="1.25" fill="currentColor" />
          {/* Left base */}
          <rect x="1.5" y="23" width="8" height="2.5" rx="1.25" fill="currentColor" />
          {/* Right base */}
          <rect x="18.5" y="23" width="8" height="2.5" rx="1.25" fill="currentColor" />
          {/* Gymnast hanging */}
          <circle cx="14" cy="12" r="2" fill="currentColor" />
          <path d="M14 14 L11 18 M14 14 L17 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )

    default:
      return null
  }
}
