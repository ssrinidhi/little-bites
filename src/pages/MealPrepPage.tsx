import { useAppStore } from '../store/useAppStore'
import { RECIPES } from '../data/recipes'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Clock, Calendar } from 'lucide-react'
import type { Meal, DayPlan, GroceryCategory } from '../types'

function getDayMeals(day: DayPlan): Meal[] {
  return [day.breakfast, day.lunch, day.dinner, ...day.snacks].filter(Boolean) as Meal[]
}

// Categories worth actual prep work (exclude pantry staples and condiments)
const PREP_CATEGORIES: GroceryCategory[] = ['produce', 'protein', 'grains', 'dairy', 'frozen']

function getPrepAction(ingredient: string, category: GroceryCategory): string {
  const i = ingredient.toLowerCase()
  if (i.includes('rice') || i.includes('quinoa') || i.includes('pasta') || i.includes('oat')) return `Cook ${ingredient} in bulk`
  if (i.includes('sweet potato') || i.includes('squash') || i.includes('carrot') || i.includes('beet')) return `Roast ${ingredient}`
  if (i.includes('chicken') || i.includes('turkey') || i.includes('beef') || i.includes('pork') || i.includes('salmon') || i.includes('tuna')) return `Cook and portion ${ingredient}`
  if (i.includes('egg')) return `Hard-boil a batch of eggs`
  if (i.includes('lentil') || i.includes('bean') || i.includes('chickpea') || i.includes('edamame')) return `Cook ${ingredient} from scratch (or drain canned)`
  if (category === 'frozen') return `Portion ${ingredient} into daily servings`
  if (category === 'produce') return `Wash, peel & chop ${ingredient}`
  if (category === 'dairy') return `Portion ${ingredient} into small containers`
  return `Prep ${ingredient} in advance`
}

export default function MealPrepPage() {
  const navigate = useNavigate()
  const { currentWeekPlan } = useAppStore()

  if (!currentWeekPlan) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Meal Prep</h1>
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <ChefHat size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-600 mb-2">No plan yet</h3>
          <p className="text-gray-400 text-sm mb-5">Generate a meal plan first to see prep suggestions.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-600 transition-colors"
          >
            Go Generate a Plan
          </button>
        </div>
      </div>
    )
  }

  const allMeals = currentWeekPlan.days.flatMap(getDayMeals)
  const uniqueMeals = Array.from(new Map(allMeals.map((m) => [m.id, m])).values())

  const makeAheadMeals = uniqueMeals.filter((meal) => {
    const recipe = RECIPES[meal.recipeId]
    return recipe?.storageNote && /refrigerate|freeze|fridge|\d+ days/i.test(recipe.storageNote)
  })

  const freshMeals = uniqueMeals.filter((meal) => {
    const recipe = RECIPES[meal.recipeId]
    return recipe?.storageNote && /immediately|best served fresh/i.test(recipe.storageNote)
  })

  // Batch prep opportunities: non-pantry ingredients appearing in 2+ meals
  type IngInfo = { meals: string[]; category: GroceryCategory }
  const ingredientMap = new Map<string, IngInfo>()
  for (const meal of uniqueMeals) {
    const recipe = RECIPES[meal.recipeId]
    if (!recipe) continue
    for (const ing of recipe.ingredients.filter((i) => !i.isOptional)) {
      if (!PREP_CATEGORIES.includes(ing.category)) continue
      const key = ing.name.toLowerCase().trim()
      if (!ingredientMap.has(key)) ingredientMap.set(key, { meals: [], category: ing.category })
      const entry = ingredientMap.get(key)!
      if (!entry.meals.includes(meal.name)) entry.meals.push(meal.name)
    }
  }
  const batchTasks = Array.from(ingredientMap.entries())
    .filter(([, { meals }]) => meals.length >= 2)
    .sort((a, b) => b[1].meals.length - a[1].meals.length)
    .slice(0, 6)

  const totalPrepTime = uniqueMeals.reduce((sum, meal) => {
    const recipe = RECIPES[meal.recipeId]
    return sum + (recipe ? recipe.prepTime_min : 0)
  }, 0)

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Meal Prep Helper</h1>

      {/* Summary banner */}
      <div className="bg-primary-500 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} />
          <span className="font-bold text-sm">This Week at a Glance</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold">{uniqueMeals.length}</p>
            <p className="text-xs opacity-80">Unique meals</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{makeAheadMeals.length}</p>
            <p className="text-xs opacity-80">Make ahead</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalPrepTime}m</p>
            <p className="text-xs opacity-80">Total active prep</p>
          </div>
        </div>
      </div>

      {/* Weekend Batch Prep Plan */}
      {batchTasks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">🗓️ Weekend Prep Plan</h2>
            <p className="text-xs text-gray-400 mt-0.5">Do these once — saves time every day this week</p>
          </div>
          <div className="divide-y divide-gray-50">
            {batchTasks.map(([ingredient, { meals, category }]) => (
              <div key={ingredient} className="px-4 py-3 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-primary-300 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{getPrepAction(ingredient, category)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Used in {meals.length} meals: {meals.slice(0, 3).join(', ')}{meals.length > 3 ? ` +${meals.length - 3} more` : ''}
                  </p>
                </div>
                <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  ×{meals.length}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
            <p className="text-xs text-amber-700">💡 <strong>Tip:</strong> Store prepped food in labeled containers. Most cooked grains and roasted veg keep 4–5 days in the fridge.</p>
          </div>
        </div>
      )}

      {/* Make Ahead meals */}
      {makeAheadMeals.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">📦 Can Be Made Ahead</h2>
            <p className="text-xs text-gray-400 mt-0.5">Cook in advance and refrigerate or freeze</p>
          </div>
          <div className="divide-y divide-gray-50">
            {makeAheadMeals.map((meal) => {
              const recipe = RECIPES[meal.recipeId]
              const totalTime = recipe ? recipe.prepTime_min + recipe.cookTime_min : 0
              return (
                <div key={meal.id} className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl">{meal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800">{meal.name}</p>
                      {recipe?.storageNote && (
                        <p className="text-xs text-gray-400 mt-0.5">{recipe.storageNote}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                      <Clock size={11} />
                      <span>{totalTime}m</span>
                    </div>
                  </div>
                  {recipe?.toddlerAdaptation && (
                    <div className="mt-2 bg-amber-50 rounded-lg px-2.5 py-1.5">
                      <p className="text-xs text-amber-700">👶 {recipe.toddlerAdaptation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Day-Of Only */}
      {freshMeals.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">⚡ Make Fresh Each Time</h2>
            <p className="text-xs text-gray-400 mt-0.5">Best served right away — keep ingredients on hand</p>
          </div>
          <div className="divide-y divide-gray-50">
            {freshMeals.map((meal) => {
              const recipe = RECIPES[meal.recipeId]
              const totalTime = recipe ? recipe.prepTime_min + recipe.cookTime_min : 0
              return (
                <div key={meal.id} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">{meal.emoji}</span>
                  <p className="flex-1 font-semibold text-sm text-gray-800">{meal.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    <span>{totalTime}m</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Supplement reminder */}
      <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-sage-800 mb-1.5">💊 Daily Supplement Reminders</p>
        <div className="space-y-1.5">
          <p className="text-xs text-sage-700 leading-relaxed">
            ☀️ <strong>Vitamin D:</strong> 400–600 IU daily (AAP recommendation for all toddlers)
          </p>
          <p className="text-xs text-sage-700 leading-relaxed">
            🐟 <strong>Omega-3 / DHA:</strong> Consider if fish isn't eaten 2×/week
          </p>
          <p className="text-xs text-sage-700 leading-relaxed">
            🩸 <strong>Iron absorption tip:</strong> Pair iron-rich foods with vitamin C (citrus, tomatoes) at the same meal
          </p>
        </div>
      </div>
    </div>
  )
}
