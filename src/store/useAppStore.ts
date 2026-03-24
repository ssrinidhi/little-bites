import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, ChildProfile, FamilyPreferences, WeekPlan, GroceryListItem } from '../types'

interface AppStore extends AppState {
  completeOnboarding: (children: ChildProfile[], preferences: FamilyPreferences) => void
  updateChildren: (children: ChildProfile[]) => void
  updatePreferences: (preferences: FamilyPreferences) => void
  setWeekPlan: (plan: WeekPlan, groceryList: GroceryListItem[]) => void
  toggleGroceryItem: (itemId: string) => void
  resetGroceryChecks: () => void
  resetApp: () => void
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
    (set) => ({
      ...initialState,
      completeOnboarding: (children, preferences) =>
        set({ isOnboarded: true, children, preferences }),
      updateChildren: (children) => set({ children }),
      updatePreferences: (preferences) => set({ preferences }),
      setWeekPlan: (plan, groceryList) =>
        set({ currentWeekPlan: plan, groceryList, checkedGroceryItems: [], planGeneratedAt: new Date().toISOString() }),
      toggleGroceryItem: (itemId) =>
        set((state) => ({
          checkedGroceryItems: state.checkedGroceryItems.includes(itemId)
            ? state.checkedGroceryItems.filter((id) => id !== itemId)
            : [...state.checkedGroceryItems, itemId],
        })),
      resetGroceryChecks: () => set({ checkedGroceryItems: [] }),
      resetApp: () => set(initialState),
    }),
    {
      name: 'little-bites-v2',
    }
  )
)
