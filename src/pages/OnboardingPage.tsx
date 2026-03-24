import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Baby, ChevronDown, Plus, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { ALL_ALLERGENS, ALLERGEN_LABELS, ALLERGEN_EMOJIS } from '../constants/allergens'
import { ALL_CUISINES, CUISINE_LABELS, CUISINE_EMOJIS } from '../constants/cuisines'
import { computeAgeGroup } from '../constants/nutrition'
import type { AllergenKey, DietaryRestriction, CuisineTag, ChildProfile, FamilyPreferences, EffortLevel } from '../types'

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

const TOTAL_STEPS = 6

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 justify-center mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < step ? 'bg-primary-500 w-8' : i === step - 1 ? 'bg-primary-400 w-8' : 'bg-gray-200 w-4'
          }`}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)
  const [step, setStep] = useState(1)

  // Step 1: Child info
  const [childName, setChildName] = useState('')
  const [birthDate, setBirthDate] = useState('')

  // Step 2: Allergies + avoid foods
  const [allergies, setAllergies] = useState<AllergenKey[]>([])
  const [avoidFoods, setAvoidFoods] = useState<string[]>([])
  const [avoidInput, setAvoidInput] = useState('')
  const [showAvoid, setShowAvoid] = useState(false)

  // Step 3: Dietary restrictions
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([])

  // Step 4: Cuisine preferences
  const [cuisineMix, setCuisineMix] = useState<CuisineTag[]>(['american', 'italian'])

  // Step 5: Family preferences
  const [familyMealSlot, setFamilyMealSlot] = useState<'lunch' | 'dinner'>('dinner')
  const [adults, setAdults] = useState(2)
  const [mealsPerDay, setMealsPerDay] = useState<2 | 3>(3)
  const [snacksPerDay, setSnacksPerDay] = useState<0 | 1 | 2>(1)
  const [effortBreakfast, setEffortBreakfast] = useState(2)
  const [effortLunch, setEffortLunch] = useState(3)
  const [effortDinner, setEffortDinner] = useState(3)

  const toggleItem = <T,>(list: T[], setList: (v: T[]) => void, item: T) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])
  }

  const canProceed = () => {
    if (step === 1) return childName.trim().length > 0 && birthDate.length > 0
    return true
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1)
    else handleComplete()
  }

  const handleComplete = () => {
    const child: ChildProfile = {
      id: crypto.randomUUID(),
      name: childName.trim(),
      birthDate,
      ageGroup: computeAgeGroup(birthDate),
      allergies,
      dietaryRestrictions,
      avoidFoods,
    }
    const prefs: FamilyPreferences = {
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
    }
    completeOnboarding([child], prefs)
  }

  const firstName = childName.trim().split(' ')[0] || 'your little one'

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 shadow-lg mb-3">
            <Baby size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary-700">Little Bites</h1>
          <p className="text-sm text-gray-500 mt-0.5">Toddler meal planning made easy</p>
        </div>

        <ProgressBar step={step} />

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome! Tell us about your child</h2>
              <p className="text-sm text-gray-500 mb-5">We'll use this to personalize the meal plan.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Child's first name</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Emma"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of birth</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>
                {birthDate && (
                  <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-700 font-medium">
                    Age group: <span className="font-bold">{computeAgeGroup(birthDate).replace(/-/g, '–').replace('mo', ' months').replace('yr', ' years')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Any food allergies?</h2>
              <p className="text-sm text-gray-500 mb-5">
                Select all that apply for {firstName}. We'll never suggest these.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_ALLERGENS.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleItem(allergies, setAllergies, a)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      allergies.includes(a)
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{ALLERGEN_EMOJIS[a]}</span>
                    <span className="leading-tight">{ALLERGEN_LABELS[a]}</span>
                    {allergies.includes(a) && <Check size={14} className="ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Avoid specific foods */}
              <button
                onClick={() => setShowAvoid(!showAvoid)}
                className="mt-4 w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-gray-300 transition-colors"
              >
                <span>🚫 Also avoid specific foods…</span>
                <ChevronDown size={14} className={`transition-transform ${showAvoid ? 'rotate-180' : ''}`} />
              </button>
              {showAvoid && (
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_AVOID_FOODS.map((food) => (
                      <button
                        key={food}
                        onClick={() => toggleItem(avoidFoods, setAvoidFoods, food)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          avoidFoods.includes(food)
                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {avoidFoods.includes(food) ? '✕ ' : '+ '}{food}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
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
                      placeholder="Type a food and press Enter…"
                      className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
                    />
                    <button
                      onClick={() => {
                        const val = avoidInput.trim()
                        if (val && !avoidFoods.includes(val)) setAvoidFoods([...avoidFoods, val])
                        setAvoidInput('')
                      }}
                      className="px-3 py-2 rounded-xl bg-primary-500 text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {avoidFoods.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {avoidFoods.map((food) => (
                        <span key={food} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          {food}
                          <button onClick={() => setAvoidFoods(avoidFoods.filter((f) => f !== food))}><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => { setAllergies([]); setAvoidFoods([]) }}
                className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                No allergies — skip
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Dietary preferences?</h2>
              <p className="text-sm text-gray-500 mb-5">
                Select any that apply to your family.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_OPTIONS.map(({ value, label, emoji, hint }) => (
                  <button
                    key={value}
                    onClick={() => toggleItem(dietaryRestrictions, setDietaryRestrictions, value)}
                    className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      dietaryRestrictions.includes(value)
                        ? 'border-sage-400 bg-sage-50 text-sage-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="mt-0.5">{emoji}</span>
                    <span className="flex flex-col text-left">
                      <span>{label}</span>
                      {hint && <span className="text-xs font-normal opacity-60">{hint}</span>}
                    </span>
                    {dietaryRestrictions.includes(value) && <Check size={14} className="ml-auto mt-0.5 flex-shrink-0" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setDietaryRestrictions([])}
                className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                No restrictions — skip
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Favorite cuisines?</h2>
              <p className="text-sm text-gray-500 mb-5">
                We'll mix these throughout the week.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_CUISINES.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleItem(cuisineMix, setCuisineMix, c)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      cuisineMix.includes(c)
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-base">{CUISINE_EMOJIS[c]}</span>
                    <span>{CUISINE_LABELS[c]}</span>
                    {cuisineMix.includes(c) && <Check size={14} className="ml-auto" />}
                  </button>
                ))}
              </div>
              {cuisineMix.length === 0 && (
                <p className="mt-2 text-xs text-red-500 text-center">Pick at least one cuisine</p>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Family meal time</h2>
              <p className="text-sm text-gray-500 mb-5">
                When does the whole family eat together? We'll plan a shared meal then.
              </p>

              <div className="space-y-3 mb-6">
                <label className="block text-sm font-semibold text-gray-700">Shared family meal</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['lunch', 'dinner'] as const).map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setFamilyMealSlot(slot)}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                        familyMealSlot === slot
                          ? 'border-primary-400 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {slot === 'lunch' ? '🍽️ Lunch' : '🌙 Dinner'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of adults</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 text-gray-600 text-xl font-bold hover:border-primary-400 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-gray-800 w-8 text-center">{adults}</span>
                  <button
                    onClick={() => setAdults(Math.min(6, adults + 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 text-gray-600 text-xl font-bold hover:border-primary-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Meal preferences</h2>
              <p className="text-sm text-gray-500 mb-5">How many meals and how much effort per day?</p>

              <div className="space-y-5">
                {/* Meals per day */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Main meals per day</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([3, 2] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => setMealsPerDay(n)}
                        className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          mealsPerDay === n
                            ? 'border-primary-400 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {n === 3 ? '🍽️ 3 meals' : '🥣 2 meals (no breakfast)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Snacks per day */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Snacks per day</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([0, 1, 2] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => setSnacksPerDay(n)}
                        className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          snacksPerDay === n
                            ? 'border-primary-400 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {n === 0 ? 'None' : n === 1 ? '1 snack' : '2 snacks'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Effort levels */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Effort level per meal</label>
                  <p className="text-xs text-gray-400 mb-3">1 = no-cook, 5 = elaborate</p>
                  {[
                    { label: mealsPerDay === 3 ? '🌅 Breakfast' : null, value: effortBreakfast, set: setEffortBreakfast },
                    { label: '🍱 Lunch', value: effortLunch, set: setEffortLunch },
                    { label: '🌙 Dinner', value: effortDinner, set: setEffortDinner },
                  ].filter((row) => row.label !== null).map(({ label, value, set }) => (
                    <div key={label} className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className="text-xs font-bold text-primary-600">
                          {['', '⚡ Quick', '🍳 Easy', '🥘 Normal', '👩‍🍳 Involved', '🎩 Chef'][value]}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => set(level)}
                            className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${
                              value >= level
                                ? 'bg-primary-400 text-white'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-colors"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all ${
              canProceed()
                ? 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === TOTAL_STEPS ? (
              <>
                <Check size={18} />
                Let's Go!
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>
    </div>
  )
}
