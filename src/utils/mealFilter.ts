import type { Meal, ChildProfile, FamilyPreferences, MealSlot } from '../types'
import { RECIPES } from '../data/recipes'

export function filterMeals(
  meals: Meal[],
  children: ChildProfile[],
  _preferences: FamilyPreferences,
  slot: MealSlot,
  familyMealOnly = false,
): Meal[] {
  const allergens = new Set(children.flatMap((c) => c.allergies))
  const restrictions = new Set(children.flatMap((c) => c.dietaryRestrictions))
  const avoidFoods = children.flatMap((c) => (c.avoidFoods ?? []).map((f) => f.toLowerCase().trim())).filter(Boolean)

  return meals.filter((meal) => {
    if (!meal.slots.includes(slot)) return false
    if (familyMealOnly && !meal.isFamilyFriendly) return false
    if (meal.allergens.some((a) => allergens.has(a))) return false
    for (const r of restrictions) {
      // ovo_vegetarian = vegetarian but eggs OK — map to vegetarian tag check
      const tagToCheck = r === 'ovo_vegetarian' ? 'vegetarian' : r
      if (!meal.dietaryTags.includes(tagToCheck)) return false
    }
    if (avoidFoods.length > 0) {
      const recipe = RECIPES[meal.recipeId]
      if (recipe) {
        const ingNames = recipe.ingredients.map((i) => i.name.toLowerCase())
        if (avoidFoods.some((food) => ingNames.some((ing) => ing.includes(food)))) return false
      }
    }
    return true
  })
}

export function filterByCuisine(meals: Meal[], cuisineMix: string[]): Meal[] {
  if (!cuisineMix.length) return meals
  return meals.filter((m) => m.cuisines.some((c) => cuisineMix.includes(c) || c === 'any'))
}
