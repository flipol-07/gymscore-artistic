import { APPARATUS_ICONS, APPARATUS_NAMES } from '../types'
import type { Apparatus } from '../types'

interface Props {
  apparatus: Apparatus
  size?: number
  /** Hex color to tint the icon. Defaults to currentColor via CSS. */
  tintColor?: string
}

export function ApparatusIcon({ apparatus, size = 24, tintColor }: Props) {
  const src = APPARATUS_ICONS[apparatus]
  const label = APPARATUS_NAMES[apparatus]

  // Use CSS mask-image so the icon takes the exact color we want.
  // The PNG must have a white/opaque silhouette on transparent background.
  const style: React.CSSProperties = {
    display: 'block',
    width: size,
    height: size,
    flexShrink: 0,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    backgroundColor: tintColor ?? 'currentColor',
  }

  return <span role="img" aria-label={label} style={style} />
}
