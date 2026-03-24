import type { AgeGroup, DailyNutritionRequirement } from '../types'

export const DRI_BY_AGE_GROUP: Record<AgeGroup, DailyNutritionRequirement> = {
  '6-12mo': {
    ageGroup: '6-12mo',
    calories: { min: 700, max: 900 },
    protein_g: 11,
    fat_g: { min: 28, max: 35 },
    carbs_g: 95,
    fiber_g: 0,
    iron_mg: 11,
    calcium_mg: 260,
    vitD_iu: 400,
    zinc_mg: 3,
    sodium_mg: 370,
    addedSugar_g: 0,
  },
  '12-18mo': {
    ageGroup: '12-18mo',
    calories: { min: 900, max: 1100 },
    protein_g: 13,
    fat_g: { min: 30, max: 40 },
    carbs_g: 130,
    fiber_g: 14,
    iron_mg: 7,
    calcium_mg: 700,
    vitD_iu: 600,
    zinc_mg: 3,
    sodium_mg: 1000,
    addedSugar_g: 0,
  },
  '18-24mo': {
    ageGroup: '18-24mo',
    calories: { min: 1000, max: 1200 },
    protein_g: 13,
    fat_g: { min: 30, max: 40 },
    carbs_g: 130,
    fiber_g: 14,
    iron_mg: 7,
    calcium_mg: 700,
    vitD_iu: 600,
    zinc_mg: 3,
    sodium_mg: 1200,
    addedSugar_g: 0,
  },
  '2-3yr': {
    ageGroup: '2-3yr',
    calories: { min: 1000, max: 1400 },
    protein_g: 13,
    fat_g: { min: 30, max: 40 },
    carbs_g: 130,
    fiber_g: 14,
    iron_mg: 7,
    calcium_mg: 700,
    vitD_iu: 600,
    zinc_mg: 3,
    sodium_mg: 1500,
    addedSugar_g: 12,
  },
  '3-5yr': {
    ageGroup: '3-5yr',
    calories: { min: 1200, max: 1600 },
    protein_g: 19,
    fat_g: { min: 35, max: 55 },
    carbs_g: 130,
    fiber_g: 17,
    iron_mg: 10,
    calcium_mg: 1000,
    vitD_iu: 600,
    zinc_mg: 5,
    sodium_mg: 1900,
    addedSugar_g: 16,
  },
}

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  '6-12mo': '6–12 months',
  '12-18mo': '12–18 months',
  '18-24mo': '18–24 months',
  '2-3yr': '2–3 years',
  '3-5yr': '3–5 years',
}

export function computeAgeGroup(birthDate: string): AgeGroup {
  const birth = new Date(birthDate)
  const now = new Date()
  const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (ageMonths < 12) return '6-12mo'
  if (ageMonths < 18) return '12-18mo'
  if (ageMonths < 24) return '18-24mo'
  if (ageMonths < 36) return '2-3yr'
  return '3-5yr'
}
