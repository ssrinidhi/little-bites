import { useState } from 'react'
import { RefreshCw, ChevronDown, ChevronUp, Users, Clock, Utensils } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useMealPlanner } from '../hooks/useMealPlanner'
import { RECIPES } from '../data/recipes'
import type { Meal, MealSlot } from '../types'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

const SLOT_COLORS: Record<MealSlot, string> = {
  breakfast: 'bg-amber-50 border-amber-200',
  lunch: 'bg-green-50 border-green-200',
  dinner: 'bg-indigo-50 border-indigo-200',
  snack: 'bg-pink-50 border-pink-200',
}

const SLOT_HEADER_COLORS: Record<MealSlot, string> = {
  breakfast: 'text-amber-700',
  lunch: 'text-green-700',
  dinner: 'text-indigo-700',
  snack: 'text-pink-700',
}

function MealCard({
  meal,
  slot,
  isFamily,
}: {
  meal: Meal
  slot: MealSlot
  isFamily: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const recipe = RECIPES[meal.recipeId]

  return (
    <div className={`rounded-2xl border ${SLOT_COLORS[slot]} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{meal.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${SLOT_HEADER_COLORS[slot]}`}>
                  {SLOT_LABELS[slot]}
                </p>
                <h3 className="font-bold text-gray-800 mt-0.5 leading-tight">{meal.name}</h3>
              </div>
              {isFamily && (
                <span className="flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
                  <Users size={11} />
                  Family
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{meal.description}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {meal.cuisines.slice(0, 2).map((c) => (
            <span key={c} className="text-xs bg-white/80 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
              {c}
            </span>
          ))}
          {meal.textures.slice(0, 2).map((t) => (
            <span key={t} className="text-xs bg-white/80 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
              {t}
            </span>
          ))}
        </div>

        {/* Nutrition row */}
        <div className="flex gap-3 mt-3 pt-3 border-t border-white/60">
          <div className="text-center">
            <p className="text-xs font-bold text-gray-700">{meal.nutrition.calories}</p>
            <p className="text-xs text-gray-400">cal</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-700">{meal.nutrition.protein_g}g</p>
            <p className="text-xs text-gray-400">protein</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-700">{meal.nutrition.carbs_g}g</p>
            <p className="text-xs text-gray-400">carbs</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-700">{meal.nutrition.fat_g}g</p>
            <p className="text-xs text-gray-400">fat</p>
          </div>
          <div className="ml-auto">
            <p className="text-xs font-bold text-gray-700">${meal.estimatedCostUSD.toFixed(2)}</p>
            <p className="text-xs text-gray-400">est.</p>
          </div>
        </div>

        {recipe && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors py-1"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} /> Hide Recipe
              </>
            ) : (
              <>
                <ChevronDown size={14} /> Show Recipe
              </>
            )}
          </button>
        )}
      </div>

      {/* Recipe Panel */}
      {expanded && recipe && (
        <div className="border-t border-white/60 bg-white/60 p-4 space-y-4">
          {/* Time info */}
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock size={13} className="text-gray-400" />
              <span>Prep: <strong>{recipe.prepTime_min}min</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Utensils size={13} className="text-gray-400" />
              <span>Cook: <strong>{recipe.cookTime_min}min</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Users size={13} className="text-gray-400" />
              <span>Serves: <strong>{recipe.servings.toddler}T / {recipe.servings.adult}A</strong></span>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Ingredients</h4>
            <div className="space-y-1">
              {recipe.ingredients
                .filter((ing) => !ing.isOptional)
                .map((ing) => (
                  <div key={ing.id} className="flex items-center gap-2 text-xs text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-600">
                      {ing.quantity} {ing.unit}
                    </span>
                    <span>{ing.name}</span>
                  </div>
                ))}
              {recipe.ingredients.filter((ing) => ing.isOptional).length > 0 && (
                <>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Optional:</p>
                  {recipe.ingredients
                    .filter((ing) => ing.isOptional)
                    .map((ing) => (
                      <div key={ing.id} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        <span>{ing.quantity} {ing.unit} {ing.name}</span>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Instructions</h4>
            <div className="space-y-2">
              {recipe.steps.map((step) => (
                <div key={step.order} className="flex gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                    {step.order}
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed pt-0.5">{step.instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Toddler adaptation */}
          {recipe.toddlerAdaptation && (
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-700 mb-1">👶 Toddler Tips</p>
              <p className="text-xs text-amber-700 leading-relaxed">{recipe.toddlerAdaptation}</p>
            </div>
          )}

          {/* Storage note */}
          {recipe.storageNote && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-500 mb-1">📦 Storage</p>
              <p className="text-xs text-gray-500 leading-relaxed">{recipe.storageNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MealPlanPage() {
  const { currentWeekPlan } = useAppStore()
  const { generatePlan } = useMealPlanner()

  const todayStr = new Date().toISOString().split('T')[0]
  const todayIndex = currentWeekPlan?.days.findIndex((d) => d.date === todayStr) ?? 0
  const [selectedDay, setSelectedDay] = useState(Math.max(0, todayIndex))

  if (!currentWeekPlan) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Plan Yet</h2>
          <p className="text-gray-500 text-sm mb-6">Generate a week plan from the home screen.</p>
          <button
            onClick={generatePlan}
            className="bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-600 transition-colors"
          >
            Generate Plan
          </button>
        </div>
      </div>
    )
  }

  const day = currentWeekPlan.days[selectedDay]
  const weekStart = new Date(currentWeekPlan.weekStartDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Meal Plan</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(weekStart)} – {formatDate(weekEnd)}
          </p>
        </div>
        <button
          onClick={generatePlan}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-100 text-primary-700 font-semibold text-sm hover:bg-primary-200 transition-colors"
        >
          <RefreshCw size={14} />
          Regenerate
        </button>
      </div>

      {/* Day selector */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm mb-5 overflow-x-auto">
        {currentWeekPlan.days.map((d, i) => {
          const isToday = d.date === todayStr
          const isSelected = i === selectedDay
          return (
            <button
              key={d.date}
              onClick={() => setSelectedDay(i)}
              className={`flex-1 min-w-[38px] flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                isSelected
                  ? 'bg-primary-500 text-white shadow-sm'
                  : isToday
                  ? 'text-primary-600 font-bold'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-semibold">{DAY_LABELS[i]}</span>
              <span className="text-xs opacity-70 mt-0.5">
                {new Date(d.date + 'T00:00:00').getDate()}
              </span>
              {isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-primary-400 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Day header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">{DAY_FULL[selectedDay]}</h2>
        <p className="text-xs text-gray-400">
          {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Meal cards */}
      <div className="space-y-3 pb-4">
        {day.breakfast && (
          <MealCard meal={day.breakfast} slot="breakfast" isFamily={day.familyMealId === day.breakfast.id} />
        )}
        <MealCard meal={day.lunch} slot="lunch" isFamily={day.familyMealId === day.lunch.id} />
        <MealCard meal={day.dinner} slot="dinner" isFamily={day.familyMealId === day.dinner.id} />
        {day.snacks.map((snack) => (
          <MealCard key={snack.id} meal={snack} slot="snack" isFamily={false} />
        ))}
      </div>
    </div>
  )
}
