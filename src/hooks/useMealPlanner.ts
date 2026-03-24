import { useCallback } from 'react'
import { MEALS } from '../data/meals'
import { RECIPES } from '../data/recipes'
import { filterMeals, filterByCuisine } from '../utils/mealFilter'
import { aggregateGroceries } from '../utils/groceryAggregator'
import { useAppStore } from '../store/useAppStore'
import type { Meal, DayPlan, WeekPlan, MealSlot, EffortLevel } from '../types'

function getMealEffortLevel(meal: Meal): EffortLevel {
  const recipe = RECIPES[meal.recipeId]
  if (!recipe) return 3
  const total = recipe.prepTime_min + recipe.cookTime_min
  if (total <= 5) return 1
  if (total <= 15) return 2
  if (total <= 30) return 3
  if (total <= 45) return 4
  return 5
}

function scoreMeal(
  meal: Meal,
  usedThisWeek: Meal[],
  usedToday: Meal[],
  preferredCuisines: string[],
  slot: MealSlot,
  maxEffort: EffortLevel,
): number {
  let score = Math.random() * 0.15

  const effortLevel = getMealEffortLevel(meal)
  if (effortLevel > maxEffort) score -= 0.8 * (effortLevel - maxEffort)
  else score += 0.1

  if (meal.cuisines.some((c) => preferredCuisines.includes(c))) score += 0.2

  const todayCuisines = new Set(usedToday.flatMap((m) => m.cuisines))
  if (meal.cuisines.some((c) => todayCuisines.has(c))) score -= 0.15

  const todayTextures = new Set(usedToday.flatMap((m) => m.textures))
  if (meal.textures.some((t) => todayTextures.has(t))) score -= 0.1

  if (usedThisWeek.some((m) => m.id === meal.id)) score -= 0.5

  if ((slot === 'lunch' || slot === 'dinner') && meal.isFamilyFriendly) score += 0.1

  return score
}

function pickBest(
  candidates: Meal[],
  usedThisWeek: Meal[],
  usedToday: Meal[],
  cuisines: string[],
  slot: MealSlot,
  maxEffort: EffortLevel,
): Meal {
  if (candidates.length === 0) throw new Error(`No meals available for slot: ${slot}`)
  const scored = candidates.map((m) => ({
    meal: m,
    score: scoreMeal(m, usedThisWeek, usedToday, cuisines, slot, maxEffort),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored[0].meal
}

export function useMealPlanner() {
  const { children, preferences, setWeekPlan } = useAppStore()

  const generatePlan = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1)

    const { mealsPerDay = 3, snacksPerDay = 1, effortLevels, familyMealSlot, cuisineMix } = preferences
    const effort = effortLevels ?? { breakfast: 2, lunch: 3, dinner: 3, snack: 1 }

    const usedThisWeek: Meal[] = []
    const days: DayPlan[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      const usedToday: Meal[] = []

      let breakfast: Meal | undefined = undefined
      if (mealsPerDay === 3) {
        const bfCandidates = filterByCuisine(
          filterMeals(MEALS, children, preferences, 'breakfast'),
          cuisineMix,
        )
        breakfast = pickBest(bfCandidates, usedThisWeek, usedToday, cuisineMix, 'breakfast', effort.breakfast)
        usedToday.push(breakfast)
        usedThisWeek.push(breakfast)
      }

      const snacks: Meal[] = []
      for (let s = 0; s < snacksPerDay; s++) {
        const snackCandidates = filterByCuisine(
          filterMeals(MEALS, children, preferences, 'snack'),
          cuisineMix,
        )
        const snack = pickBest(snackCandidates, usedThisWeek, usedToday, cuisineMix, 'snack', effort.snack)
        usedToday.push(snack)
        usedThisWeek.push(snack)
        snacks.push(snack)
      }

      const regularSlot: MealSlot = familyMealSlot === 'dinner' ? 'lunch' : 'dinner'
      const regularCandidates = filterByCuisine(
        filterMeals(MEALS, children, preferences, regularSlot),
        cuisineMix,
      )
      const regularMeal = pickBest(
        regularCandidates, usedThisWeek, usedToday, cuisineMix, regularSlot, effort[regularSlot],
      )
      usedToday.push(regularMeal)
      usedThisWeek.push(regularMeal)

      const familyCandidates = filterByCuisine(
        filterMeals(MEALS, children, preferences, familyMealSlot, true),
        cuisineMix,
      )
      const familyMeal = pickBest(
        familyCandidates, usedThisWeek, usedToday, cuisineMix, familyMealSlot, effort[familyMealSlot],
      )
      usedToday.push(familyMeal)
      usedThisWeek.push(familyMeal)

      days.push({
        date: dateStr,
        breakfast,
        lunch: familyMealSlot === 'lunch' ? familyMeal : regularMeal,
        dinner: familyMealSlot === 'dinner' ? familyMeal : regularMeal,
        snacks,
        familyMealId: familyMeal.id,
      })
    }

    const weekPlan: WeekPlan = { weekStartDate: weekStart.toISOString().split('T')[0], days }
    setWeekPlan(weekPlan, aggregateGroceries(days))
  }, [children, preferences, setWeekPlan])

  return { generatePlan }
}
