export type AgeGroup = '6-12mo' | '12-18mo' | '18-24mo' | '2-3yr' | '3-5yr'
export type AllergenKey = 'milk' | 'eggs' | 'fish' | 'shellfish' | 'tree_nuts' | 'peanuts' | 'wheat' | 'soybeans' | 'sesame'
export type DietaryRestriction = 'vegetarian' | 'ovo_vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'nut_free' | 'halal' | 'kosher'
export type CuisineTag = 'american' | 'italian' | 'mexican' | 'indian' | 'asian' | 'mediterranean' | 'middleeastern' | 'any'
export type TextureTag = 'soft' | 'crunchy' | 'chewy' | 'smooth' | 'finger_food' | 'puree'
export type FlavorTag = 'mild' | 'savory' | 'sweet' | 'tangy' | 'umami'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type GroceryCategory = 'produce' | 'dairy' | 'protein' | 'grains' | 'pantry' | 'frozen' | 'condiments' | 'beverages' | 'bakery'
export type EffortLevel = 1 | 2 | 3 | 4 | 5

export interface ChildProfile {
  id: string
  name: string
  birthDate: string
  ageGroup: AgeGroup
  allergies: AllergenKey[]
  dietaryRestrictions: DietaryRestriction[]
  avoidFoods?: string[]
}

export interface DailyNutritionRequirement {
  ageGroup: AgeGroup
  calories: { min: number; max: number }
  protein_g: number
  fat_g: { min: number; max: number }
  carbs_g: number
  fiber_g: number
  iron_mg: number
  calcium_mg: number
  vitD_iu: number
  zinc_mg: number
  sodium_mg: number
  addedSugar_g: number
}

export interface MealNutrition {
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  fiber_g: number
  iron_mg: number
  calcium_mg: number
}

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  category: GroceryCategory
  isOptional?: boolean
}

export interface RecipeStep {
  order: number
  instruction: string
  duration_min?: number
}

export interface Recipe {
  id: string
  mealId: string
  servings: { toddler: number; adult: number }
  prepTime_min: number
  cookTime_min: number
  ingredients: Ingredient[]
  steps: RecipeStep[]
  toddlerAdaptation?: string
  storageNote?: string
}

export interface Meal {
  id: string
  name: string
  emoji: string
  slots: MealSlot[]
  cuisines: CuisineTag[]
  textures: TextureTag[]
  flavors: FlavorTag[]
  allergens: AllergenKey[]
  dietaryTags: DietaryRestriction[]
  nutrition: MealNutrition
  isFamilyFriendly: boolean
  estimatedCostUSD: number
  recipeId: string
  description: string
}

export interface FamilyPreferences {
  familyMealSlot: 'lunch' | 'dinner'
  cuisineMix: CuisineTag[]
  servingSize: { adults: number; children: number }
  mealsPerDay: 2 | 3
  snacksPerDay: 0 | 1 | 2
  effortLevels: {
    breakfast: EffortLevel
    lunch: EffortLevel
    dinner: EffortLevel
    snack: EffortLevel
  }
}

export interface DayPlan {
  date: string
  breakfast?: Meal
  lunch: Meal
  dinner: Meal
  snacks: Meal[]
  familyMealId: string
}

export interface WeekPlan {
  weekStartDate: string
  days: DayPlan[]
}

export interface GroceryListItem {
  id: string
  name: string
  totalQuantity: number
  unit: string
  category: GroceryCategory
  mealIds: string[]
  isChecked: boolean
}

export interface AppState {
  isOnboarded: boolean
  children: ChildProfile[]
  preferences: FamilyPreferences
  currentWeekPlan: WeekPlan | null
  groceryList: GroceryListItem[]
  checkedGroceryItems: string[]
  planGeneratedAt: string | null
}
