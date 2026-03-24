import { supabase } from './supabase'
import type { AppState } from '../types'

export async function loadUserData(): Promise<Partial<AppState> | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null

  return {
    isOnboarded: data.is_onboarded ?? false,
    children: data.children ?? [],
    preferences: data.preferences ?? {},
    currentWeekPlan: data.current_week_plan ?? null,
    groceryList: data.grocery_list ?? [],
    checkedGroceryItems: data.checked_grocery_items ?? [],
    planGeneratedAt: data.plan_generated_at ?? null,
  }
}

export async function saveUserData(state: Partial<AppState>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('user_data').upsert({
    user_id: user.id,
    is_onboarded: state.isOnboarded,
    children: state.children,
    preferences: state.preferences,
    current_week_plan: state.currentWeekPlan ?? null,
    grocery_list: state.groceryList,
    checked_grocery_items: state.checkedGroceryItems,
    plan_generated_at: state.planGeneratedAt ?? null,
    updated_at: new Date().toISOString(),
  })
}
