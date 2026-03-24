import type { AllergenKey } from '../types'

export const ALLERGEN_LABELS: Record<AllergenKey, string> = {
  milk: 'Milk / Dairy',
  eggs: 'Eggs',
  fish: 'Fish',
  shellfish: 'Shellfish',
  tree_nuts: 'Tree Nuts',
  peanuts: 'Peanuts',
  wheat: 'Wheat / Gluten',
  soybeans: 'Soy',
  sesame: 'Sesame',
}

export const ALLERGEN_EMOJIS: Record<AllergenKey, string> = {
  milk: '🥛',
  eggs: '🥚',
  fish: '🐟',
  shellfish: '🦐',
  tree_nuts: '🌰',
  peanuts: '🥜',
  wheat: '🌾',
  soybeans: '🫘',
  sesame: '🌿',
}

export const ALL_ALLERGENS: AllergenKey[] = [
  'milk', 'eggs', 'fish', 'shellfish', 'tree_nuts',
  'peanuts', 'wheat', 'soybeans', 'sesame',
]
