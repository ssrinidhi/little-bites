import { useState } from 'react'
import { User, Utensils, RefreshCw, ChevronDown, ChevronUp, Check, AlertTriangle, Info, Plus, X, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { ALL_ALLERGENS, ALLERGEN_LABELS, ALLERGEN_EMOJIS } from '../constants/allergens'
import { ALL_CUISINES, CUISINE_LABELS, CUISINE_EMOJIS } from '../constants/cuisines'
import { computeAgeGroup, AGE_GROUP_LABELS } from '../constants/nutrition'
import type { AllergenKey, DietaryRestriction, CuisineTag, EffortLevel } from '../types'

const DIETARY_OPTIONS: { value: DietaryRestriction; label: string; emoji: string; hint?: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦', hint: 'No meat or fish' },
  { value: 'ovo_vegetarian', label: 'Veggie + Eggs', emoji: '🥚', hint: 'No meat, eggs OK' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'gluten_free', label: 'Gluten Free', emoji: '🌾' },
  { value: 'dairy_free', label: 'Dairy Free', emoji: '🥛' },
  { value: 'nut_free', label: 'Nut Free', emoji: '🚫' },
  { value: 'halal', label: 'Halal', emoji: '☪️' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' },
]

const COMMON_AVOID_FOODS = ['Strawberry', 'Citrus', 'Corn', 'Honey', 'Kiwi', 'Mango', 'Shellfish', 'Avocado']

function SectionHeader({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
        <Icon size={14} className="text-primary-600" />
      </div>
      <h2 className="font-bold text-gray-800">{title}</h2>
    </div>
  )
}

export default function SettingsPage() {
  const { children, preferences, updateChildren, updatePreferences, resetApp } = useAppStore()

  const child = children[0]

  // Child form state
  const [childName, setChildName] = useState(child?.name ?? '')
  const [birthDate, setBirthDate] = useState(child?.birthDate ?? '')
  const [allergies, setAllergies] = useState<AllergenKey[]>(child?.allergies ?? [])
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>(
    child?.dietaryRestrictions ?? [],
  )
  const [avoidFoods, setAvoidFoods] = useState<string[]>(child?.avoidFoods ?? [])
  const [avoidInput, setAvoidInput] = useState('')
  const [showAvoid, setShowAvoid] = useState(false)

  // Preferences state
  const [familyMealSlot, setFamilyMealSlot] = useState<'lunch' | 'dinner'>(preferences.familyMealSlot)
  const [cuisineMix, setCuisineMix] = useState<CuisineTag[]>(preferences.cuisineMix)
  const [adults, setAdults] = useState(preferences.servingSize.adults)
  const [mealsPerDay, setMealsPerDay] = useState<2 | 3>(preferences.mealsPerDay ?? 3)
  const [snacksPerDay, setSnacksPerDay] = useState<0 | 1 | 2>(preferences.snacksPerDay ?? 1)
  const [effortBreakfast, setEffortBreakfast] = useState(preferences.effortLevels?.breakfast ?? 2)
  const [effortLunch, setEffortLunch] = useState(preferences.effortLevels?.lunch ?? 3)
  const [effortDinner, setEffortDinner] = useState(preferences.effortLevels?.dinner ?? 3)

  // UI state
  const [showReset, setShowReset] = useState(false)
  const [childExpanded, setChildExpanded] = useState(true)
  const [prefsExpanded, setPrefsExpanded] = useState(true)
  const [savedFeedback, setSavedFeedback] = useState(false)

  const toggleItem = <T,>(list: T[], setList: (v: T[]) => void, item: T) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])
  }

  const handleSave = () => {
    if (!child) return
    updateChildren([
      {
        ...child,
        name: childName.trim(),
        birthDate,
        ageGroup: computeAgeGroup(birthDate),
        allergies,
        dietaryRestrictions,
        avoidFoods,
      },
    ])
    updatePreferences({
      familyMealSlot,
      cuisineMix: cuisineMix.length > 0 ? cuisineMix : ['american'],
      servingSize: { adults, children: 1 },
      mealsPerDay,
      snacksPerDay,
      effortLevels: {
        breakfast: effortBreakfast as EffortLevel,
        lunch: effortLunch as EffortLevel,
        dinner: effortDinner as EffortLevel,
        snack: 1 as EffortLevel,
      },
    })
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2500)
  }

  const computedAgeGroup = birthDate ? computeAgeGroup(birthDate) : child?.ageGroup

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-gray-800">Settings</h1>
      </div>

      {/* Child Profile */}
      <div className="bg-white rounded-2xl shadow-sm">
        <button
          onClick={() => setChildExpanded(!childExpanded)}
          className="w-full flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
              <User size={14} className="text-primary-600" />
            </div>
            <h2 className="font-bold text-gray-800">Child Profile</h2>
          </div>
          {childExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {childExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-50">
            {/* Name */}
            <div className="pt-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Child's name</label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            {/* Birth date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date of birth</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-primary-400 transition-colors"
              />
              {computedAgeGroup && (
                <p className="mt-1.5 text-xs text-primary-600 font-medium">
                  Age group: {AGE_GROUP_LABELS[computedAgeGroup]}
                </p>
              )}
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Allergies</label>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_ALLERGENS.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleItem(allergies, setAllergies, a)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                      allergies.includes(a)
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span>{ALLERGEN_EMOJIS[a]}</span>
                    <span className="truncate">{ALLERGEN_LABELS[a]}</span>
                    {allergies.includes(a) && <Check size={11} className="ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary restrictions */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Dietary restrictions</label>
              <div className="grid grid-cols-2 gap-1.5">
                {DIETARY_OPTIONS.map(({ value, label, emoji, hint }) => (
                  <button
                    key={value}
                    onClick={() => toggleItem(dietaryRestrictions, setDietaryRestrictions, value)}
                    className={`flex items-start gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                      dietaryRestrictions.includes(value)
                        ? 'border-sage-300 bg-sage-50 text-sage-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="mt-0.5">{emoji}</span>
                    <span className="flex flex-col text-left">
                      <span>{label}</span>
                      {hint && <span className="font-normal opacity-60">{hint}</span>}
                    </span>
                    {dietaryRestrictions.includes(value) && <Check size={11} className="ml-auto mt-0.5 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Avoid specific foods */}
            <div>
              <button
                onClick={() => setShowAvoid(!showAvoid)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 hover:border-gray-300 transition-colors"
              >
                <span>🚫 Foods to avoid (not allergens)</span>
                <ChevronDown size={12} className={`transition-transform ${showAvoid ? 'rotate-180' : ''}`} />
              </button>
              {showAvoid && (
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_AVOID_FOODS.map((food) => (
                      <button
                        key={food}
                        onClick={() => toggleItem(avoidFoods, setAvoidFoods, food)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                          avoidFoods.includes(food)
                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {avoidFoods.includes(food) ? '✕ ' : '+ '}{food}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={avoidInput}
                      onChange={(e) => setAvoidInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && avoidInput.trim()) {
                          const val = avoidInput.trim()
                          if (!avoidFoods.includes(val)) setAvoidFoods([...avoidFoods, val])
                          setAvoidInput('')
                        }
                      }}
                      placeholder="Type food + Enter…"
                      className="flex-1 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary-400"
                    />
                    <button
                      onClick={() => {
                        const val = avoidInput.trim()
                        if (val && !avoidFoods.includes(val)) setAvoidFoods([...avoidFoods, val])
                        setAvoidInput('')
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-primary-500 text-white"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  {avoidFoods.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {avoidFoods.map((food) => (
                        <span key={food} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">
                          {food}
                          <button onClick={() => setAvoidFoods(avoidFoods.filter((f) => f !== food))}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Family Preferences */}
      <div className="bg-white rounded-2xl shadow-sm">
        <button
          onClick={() => setPrefsExpanded(!prefsExpanded)}
          className="w-full flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
              <Utensils size={14} className="text-primary-600" />
            </div>
            <h2 className="font-bold text-gray-800">Family Preferences</h2>
          </div>
          {prefsExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {prefsExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-50">
            {/* Family meal slot */}
            <div className="pt-3">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Family meal time</label>
              <div className="grid grid-cols-2 gap-2">
                {(['lunch', 'dinner'] as const).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setFamilyMealSlot(slot)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                      familyMealSlot === slot
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {slot === 'lunch' ? '🍽️ Lunch' : '🌙 Dinner'}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine mix */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Cuisine preferences</label>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_CUISINES.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleItem(cuisineMix, setCuisineMix, c)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                      cuisineMix.includes(c)
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span>{CUISINE_EMOJIS[c]}</span>
                    <span>{CUISINE_LABELS[c]}</span>
                    {cuisineMix.includes(c) && <Check size={11} className="ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Adults */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Number of adults</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-600 text-lg font-bold hover:border-primary-300 transition-colors"
                >
                  −
                </button>
                <span className="text-xl font-bold text-gray-800 w-6 text-center">{adults}</span>
                <button
                  onClick={() => setAdults(Math.min(8, adults + 1))}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-600 text-lg font-bold hover:border-primary-300 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Meals per day */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Main meals per day</label>
              <div className="grid grid-cols-2 gap-2">
                {([3, 2] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setMealsPerDay(n)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                      mealsPerDay === n
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {n === 3 ? '🍽️ 3 meals' : '🥣 2 meals'}
                  </button>
                ))}
              </div>
            </div>

            {/* Snacks per day */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Snacks per day</label>
              <div className="grid grid-cols-3 gap-1.5">
                {([0, 1, 2] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setSnacksPerDay(n)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                      snacksPerDay === n
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {n === 0 ? 'None' : `${n} snack${n > 1 ? 's' : ''}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Effort levels */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Effort per meal (1–5)</label>
              {[
                mealsPerDay === 3 ? { label: '🌅 Breakfast', value: effortBreakfast, set: setEffortBreakfast } : null,
                { label: '🍱 Lunch', value: effortLunch, set: setEffortLunch },
                { label: '🌙 Dinner', value: effortDinner, set: setEffortDinner },
              ].filter(Boolean).map((row) => {
                const { label, value, set } = row!
                return (
                  <div key={label} className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-semibold text-primary-600">
                        {['', '⚡', '🍳', '🥘', '👩‍🍳', '🎩'][value]}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => set(level as EffortLevel)}
                          className={`flex-1 h-7 rounded-lg text-xs font-bold transition-all ${
                            value >= level ? 'bg-primary-400 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-2xl font-bold text-white transition-all ${
          savedFeedback
            ? 'bg-sage-500'
            : 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-100'
        }`}
      >
        {savedFeedback ? '✓ Saved!' : 'Save Changes'}
      </button>

      {/* App info */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <SectionHeader title="About" icon={Info} />
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>App</span>
            <span className="font-medium">Little Bites</span>
          </div>
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-medium">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span>Meal database</span>
            <span className="font-medium">40+ meals</span>
          </div>
          <div className="flex justify-between">
            <span>Nutrition data</span>
            <span className="font-medium">Based on DRI guidelines</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          Nutrition information is approximate and based on typical toddler serving sizes. Always consult your pediatrician for personalized dietary advice.
        </p>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={14} className="text-red-500" />
          </div>
          <h2 className="font-bold text-gray-800">Danger Zone</h2>
        </div>

        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} />
            Reset All Data
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-sm text-red-700 font-semibold">Are you sure?</p>
              <p className="text-xs text-red-600 mt-1">
                This will delete all your child profiles, preferences, meal plans, and grocery lists. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetApp}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-red-200 hover:text-red-500 transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
