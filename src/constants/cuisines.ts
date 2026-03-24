import type { CuisineTag } from '../types'

export const CUISINE_LABELS: Record<CuisineTag, string> = {
  american: 'American',
  italian: 'Italian',
  mexican: 'Mexican',
  indian: 'Indian',
  asian: 'Asian',
  mediterranean: 'Mediterranean',
  middleeastern: 'Middle Eastern',
  any: 'Any / Fusion',
}

export const CUISINE_EMOJIS: Record<CuisineTag, string> = {
  american: '🇺🇸',
  italian: '🇮🇹',
  mexican: '🇲🇽',
  indian: '🇮🇳',
  asian: '🥢',
  mediterranean: '🫒',
  middleeastern: '🌙',
  any: '🌍',
}

export const ALL_CUISINES: CuisineTag[] = [
  'american', 'italian', 'mexican', 'indian', 'asian', 'mediterranean', 'middleeastern',
]
