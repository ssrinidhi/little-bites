import { DRI_BY_AGE_GROUP } from '../constants/nutrition'
import type { DayPlan, ChildProfile, WeekPlan, Meal } from '../types'

export interface NutritionScore {
  calories: number
  protein: number
  fiber: number
  iron: number
  calcium: number
  overall: number
}

export interface WeeklyNutrientTotals {
  iron_mg: number
  calcium_mg: number
  fiber_g: number
  iron_pct: number
  calcium_pct: number
  fiber_pct: number
}

function getDayMeals(day: DayPlan): Meal[] {
  return [day.breakfast, day.lunch, day.dinner, ...day.snacks].filter(Boolean) as Meal[]
}

export function scoreDay(day: DayPlan, child: ChildProfile): NutritionScore {
  const dri = DRI_BY_AGE_GROUP[child.ageGroup]
  const meals = getDayMeals(day)

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.nutrition.calories,
      protein_g: acc.protein_g + m.nutrition.protein_g,
      fiber_g: acc.fiber_g + m.nutrition.fiber_g,
      iron_mg: acc.iron_mg + m.nutrition.iron_mg,
      calcium_mg: acc.calcium_mg + m.nutrition.calcium_mg,
    }),
    { calories: 0, protein_g: 0, fiber_g: 0, iron_mg: 0, calcium_mg: 0 }
  )

  const clamp = (v: number) => Math.min(100, Math.round(v * 100))

  const calories = clamp(totals.calories / dri.calories.max)
  const protein = clamp(totals.protein_g / dri.protein_g)
  const fiber = dri.fiber_g > 0 ? clamp(totals.fiber_g / dri.fiber_g) : 100
  const iron = clamp(totals.iron_mg / dri.iron_mg)
  const calcium = clamp(totals.calcium_mg / dri.calcium_mg)
  const overall = Math.round((calories + protein + fiber + iron + calcium) / 5)

  return { calories, protein, fiber, iron, calcium, overall }
}

export function weeklyNutrientTotals(weekPlan: WeekPlan, child: ChildProfile): WeeklyNutrientTotals {
  const dri = DRI_BY_AGE_GROUP[child.ageGroup]
  const allMeals = weekPlan.days.flatMap(getDayMeals)

  const totals = allMeals.reduce(
    (acc, m) => ({
      iron_mg: acc.iron_mg + m.nutrition.iron_mg,
      calcium_mg: acc.calcium_mg + m.nutrition.calcium_mg,
      fiber_g: acc.fiber_g + m.nutrition.fiber_g,
    }),
    { iron_mg: 0, calcium_mg: 0, fiber_g: 0 }
  )

  const weeklyIronDRI = dri.iron_mg * 7
  const weeklyCaDRI = dri.calcium_mg * 7
  const weeklyFiberDRI = dri.fiber_g * 7

  return {
    iron_mg: Math.round(totals.iron_mg * 10) / 10,
    calcium_mg: Math.round(totals.calcium_mg),
    fiber_g: Math.round(totals.fiber_g * 10) / 10,
    iron_pct: Math.min(100, Math.round((totals.iron_mg / weeklyIronDRI) * 100)),
    calcium_pct: Math.min(100, Math.round((totals.calcium_mg / weeklyCaDRI) * 100)),
    fiber_pct: weeklyFiberDRI > 0 ? Math.min(100, Math.round((totals.fiber_g / weeklyFiberDRI) * 100)) : 100,
  }
}
