import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, ChildProfile, FamilyPreferences, WeekPlan, GroceryListItem } from '../types'
import { saveUserData } from '../lib/syncStore'

interface AppStore extends AppState {
  completeOnboarding: (children: ChildProfile[], preferences: FamilyPreferences) => void
  updateChildren: (children: ChildProfile[]) => void
  updatePreferences: (preferences: FamilyPreferences) => void
  setWeekPlan: (plan: WeekPlan, groceryList: GroceryListItem[]) => void
  toggleGroceryItem: (itemId: string) => void
  resetGroceryChecks: () => void
  resetApp: () => void
  loadFromCloud: (data: Partial<AppState>) => void
}

const defaultPreferences: FamilyPreferences = {
  familyMealSlot: 'dinner',
  cuisineMix: ['american', 'italian', 'asian', 'indian'],
  servingSize: { adults: 2, children: 1 },
  mealsPerDay: 3,
  snacksPerDay: 1,
  effortLevels: {
    breakfast: 2,
    lunch: 3,
    dinner: 3,
    snack: 1,
  },
}

const initialState: AppState = {
  isOnboarded: false,
  children: [],
  preferences: defaultPreferences,
  currentWeekPlan: null,
  groceryList: [],
  checkedGroceryItems: [],
  planGeneratedAt: null,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeOnboarding: (children, preferences) => {
        set({ isOnboarded: true, children, preferences })
        saveUserData({ ...get(), isOnboarded: true, children, preferences })
      },

      updateChildren: (children) => {
        set({ children })
        saveUserData({ ...get(), children })
      },

      updatePreferences: (preferences) => {
        set({ preferences })
        saveUserData({ ...get(), preferences })
      },

      setWeekPlan: (plan, groceryList) => {
        const planGeneratedAt = new Date().toISOString()
        set({ currentWeekPlan: plan, groceryList, checkedGroceryItems: [], planGeneratedAt })
        saveUserData({ ...get(), currentWeekPlan: plan, groceryList, checkedGroceryItems: [], planGeneratedAt })
      },

      toggleGroceryItem: (itemId) => {
        set((state) => {
          const checkedGroceryItems = state.checkedGroceryItems.includes(itemId)
            ? state.checkedGroceryItems.filter((id) => id !== itemId)
            : [...state.checkedGroceryItems, itemId]
          return { checkedGroceryItems }
        })
        saveUserData({ ...get() })
      },

      resetGroceryChecks: () => {
        set({ checkedGroceryItems: [] })
        saveUserData({ ...get(), checkedGroceryItems: [] })
      },

      resetApp: () => {
        set(initialState)
        saveUserData(initialState)
      },

      loadFromCloud: (data) => {
        set((state) => ({
          ...state,
          ...data,
          // merge preferences carefully so defaults fill any missing keys
          preferences: data.preferences
            ? { ...state.preferences, ...data.preferences }
            : state.preferences,
        }))
      },
    }),
    {
      name: 'little-bites-v2',
    }
  )
)
