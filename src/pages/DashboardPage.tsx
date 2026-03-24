import { useNavigate } from 'react-router-dom'
import { Sparkles, CalendarDays, ShoppingCart, TrendingUp, Baby } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useMealPlanner } from '../hooks/useMealPlanner'
import { scoreDay, weeklyNutrientTotals } from '../hooks/useNutritionScore'
import type { Meal } from '../types'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function NutritionBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-16 text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8">{value}%</span>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { children, currentWeekPlan, planGeneratedAt } = useAppStore()
  const { generatePlan } = useMealPlanner()

  const child = children[0]
  const firstName = child?.name.split(' ')[0] ?? 'there'

  const todayStr = new Date().toISOString().split('T')[0]
  const todayPlan = currentWeekPlan?.days.find((d) => d.date === todayStr)
  const nutritionScore = todayPlan && child ? scoreDay(todayPlan, child) : null
  const weekTotals = currentWeekPlan && child ? weeklyNutrientTotals(currentWeekPlan, child) : null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const planAge = planGeneratedAt
    ? Math.round((Date.now() - new Date(planGeneratedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const todayMeals: { slot: string; meal: Meal }[] = []
  if (todayPlan) {
    if (todayPlan.breakfast) todayMeals.push({ slot: 'Breakfast', meal: todayPlan.breakfast })
    todayMeals.push({ slot: 'Lunch', meal: todayPlan.lunch })
    todayMeals.push({ slot: 'Dinner', meal: todayPlan.dinner })
    todayPlan.snacks.forEach((s, i) => todayMeals.push({ slot: i === 0 ? 'Snack' : 'Snack 2', meal: s }))
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-gray-500 text-sm">{greeting},</p>
          <h1 className="text-2xl font-bold text-gray-800">{firstName}'s Menu</h1>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-100">
          <Baby size={22} className="text-primary-600" />
        </div>
      </div>

      {planAge !== null && planAge > 6 && (
        <div className="bg-amber-100 border border-amber-200 rounded-2xl p-3 mb-4 text-sm text-amber-800">
          Your plan is {planAge} days old. Time to regenerate!
        </div>
      )}

      <button
        onClick={generatePlan}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-base shadow-lg shadow-primary-200 transition-all active:scale-95 mb-5"
      >
        <Sparkles size={20} />
        {currentWeekPlan ? 'Regenerate This Week' : "Generate This Week's Plan"}
      </button>

      {currentWeekPlan ? (
        <>
          {/* Today's Nutrition */}
          {nutritionScore && (
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800 flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-sage-500" />
                  Today's Nutrition
                </h2>
                <span className="text-lg font-bold text-sage-600">{nutritionScore.overall}%</span>
              </div>
              <div className="space-y-2">
                <NutritionBar label="Calories" value={nutritionScore.calories} color="bg-amber-400" />
                <NutritionBar label="Protein" value={nutritionScore.protein} color="bg-sage-400" />
                <NutritionBar label="Fiber" value={nutritionScore.fiber} color="bg-green-400" />
                <NutritionBar label="Iron" value={nutritionScore.iron} color="bg-red-400" />
                <NutritionBar label="Calcium" value={nutritionScore.calcium} color="bg-blue-400" />
              </div>
            </div>
          )}

          {/* Today's meals */}
          {todayPlan && (
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <h2 className="font-bold text-gray-800 mb-3">Today's Meals</h2>
              <div className="grid grid-cols-2 gap-2">
                {todayMeals.map(({ slot, meal }) => (
                  <div key={slot} className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{slot}</p>
                    <div className="text-lg mb-0.5">{meal.emoji}</div>
                    <p className="text-xs font-semibold text-gray-700 leading-tight">{meal.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Week overview */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <CalendarDays size={16} className="text-primary-500" />
              This Week
            </h2>
            <div className="space-y-1.5">
              {currentWeekPlan.days.map((day, i) => {
                const isToday = day.date === todayStr
                return (
                  <div
                    key={day.date}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                      isToday ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-xs font-bold w-7 ${isToday ? 'text-primary-600' : 'text-gray-400'}`}>
                      {DAY_NAMES[i]}
                    </span>
                    <div className="flex gap-1.5 flex-1">
                      {day.breakfast && <span title={day.breakfast.name}>{day.breakfast.emoji}</span>}
                      <span title={day.lunch.name}>{day.lunch.emoji}</span>
                      <span title={day.dinner.name}>{day.dinner.emoji}</span>
                      {day.snacks.map((s) => <span key={s.id} title={s.name}>{s.emoji}</span>)}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-medium truncate max-w-[100px]">{day.dinner.name}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Weekly Key Nutrients */}
          {weekTotals && (
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <h2 className="font-bold text-gray-800 mb-1">🧬 Weekly Nutrients</h2>
              <p className="text-xs text-gray-400 mb-3">Iron, calcium & fiber vs. daily targets × 7</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20">🩸 Iron</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full transition-all duration-700" style={{ width: `${weekTotals.iron_pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-16 text-right">{weekTotals.iron_mg}mg ({weekTotals.iron_pct}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20">🦷 Calcium</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all duration-700" style={{ width: `${weekTotals.calcium_pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-16 text-right">{weekTotals.calcium_mg}mg ({weekTotals.calcium_pct}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20">🌾 Fiber</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full transition-all duration-700" style={{ width: `${weekTotals.fiber_pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-16 text-right">{weekTotals.fiber_g}g ({weekTotals.fiber_pct}%)</span>
                </div>
              </div>
              <div className="mt-3 bg-amber-50 rounded-xl p-2.5 flex items-start gap-2">
                <span className="text-base flex-shrink-0">☀️</span>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Vitamin D:</strong> AAP recommends 400–600 IU daily supplement for most toddlers regardless of diet.
                </p>
              </div>
            </div>
          )}

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/plan')}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border-2 border-primary-200 text-primary-700 font-semibold hover:bg-primary-50 transition-colors"
            >
              <CalendarDays size={17} />
              Full Plan
            </button>
            <button
              onClick={() => navigate('/grocery')}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border-2 border-sage-200 text-sage-700 font-semibold hover:bg-sage-50 transition-colors"
            >
              <ShoppingCart size={17} />
              Grocery List
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="font-bold text-gray-700 text-lg mb-2">No plan yet</h3>
          <p className="text-gray-500 text-sm mb-5">
            Tap the button above to generate a personalized week of meals for {firstName}!
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {['🥣', '🥗', '🍛'].map((e, i) => (
              <div key={i} className="bg-amber-50 rounded-xl p-3">
                <div className="text-2xl mb-1">{e}</div>
                <p className="text-xs text-gray-400">{['Breakfast', 'Lunch', 'Dinner'][i]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
