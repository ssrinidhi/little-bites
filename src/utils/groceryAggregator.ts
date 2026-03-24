import type { GroceryListItem, DayPlan, Ingredient, Meal } from '../types'
import { RECIPES } from '../data/recipes'

// Canonical ingredient names — maps any variant to one name so duplicates merge correctly
const INGREDIENT_ALIASES: Record<string, string> = {
  // Bread
  'thick-cut whole wheat bread': 'whole grain bread',
  'whole wheat bread': 'whole grain bread',
  'whole-wheat bread': 'whole grain bread',
  'sourdough or whole grain bread': 'whole grain bread',
  // Frozen
  'frozen banana (chunks)': 'frozen banana',
  'frozen peas and carrots': 'frozen peas',
  'peas and carrots (frozen)': 'frozen peas',
  // Cheese — consolidate to 2 varieties
  'monterey jack cheese, shredded': 'shredded cheddar',
  'shredded monterey jack cheese': 'shredded cheddar',
  'sharp cheddar, shredded': 'shredded cheddar',
  'cheddar cheese, shredded': 'shredded cheddar',
  'cheddar cheese, sliced': 'cheddar cheese',
  'mild cheddar cheese, cubed': 'cheddar cheese',
  'parmesan cheese, grated': 'parmesan cheese',
  'parmesan (for serving)': 'parmesan cheese',
  'parmesan, grated': 'parmesan cheese',
}

function normalizeName(name: string): string {
  const lower = name.toLowerCase().trim()
  return INGREDIENT_ALIASES[lower] ?? lower
}

function normalizeUnit(qty: number, unit: string): { quantity: number; unit: string } {
  if (unit === 'tbsp') return { quantity: qty / 16, unit: 'cup' }
  if (unit === 'tsp') return { quantity: qty / 48, unit: 'cup' }
  return { quantity: qty, unit }
}

function getDayMeals(day: DayPlan): Meal[] {
  return [day.breakfast, day.lunch, day.dinner, ...day.snacks].filter(Boolean) as Meal[]
}

export function aggregateGroceries(days: DayPlan[]): GroceryListItem[] {
  const ingredientMap = new Map<string, { ingredient: Ingredient; totalQty: number; mealIds: string[] }>()

  for (const day of days) {
    for (const meal of getDayMeals(day)) {
      const recipe = RECIPES[meal.recipeId]
      if (!recipe) continue
      for (const ing of recipe.ingredients) {
        if (ing.isOptional) continue
        const key = normalizeName(ing.name)
        const { quantity, unit } = normalizeUnit(ing.quantity, ing.unit)
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!
          existing.totalQty += quantity
          if (!existing.mealIds.includes(meal.id)) existing.mealIds.push(meal.id)
        } else {
          ingredientMap.set(key, { ingredient: { ...ing, quantity, unit }, totalQty: quantity, mealIds: [meal.id] })
        }
      }
    }
  }

  return Array.from(ingredientMap.entries()).map(([, { ingredient, totalQty, mealIds }]) => ({
    id: ingredient.id,
    name: ingredient.name,
    totalQuantity: Math.round(totalQty * 10) / 10,
    unit: ingredient.unit,
    category: ingredient.category,
    mealIds,
    isChecked: false,
  }))
}
