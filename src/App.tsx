import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { loadUserData } from './lib/syncStore'
import { useAppStore } from './store/useAppStore'
import AppShell from './components/layout/AppShell'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import MealPlanPage from './pages/MealPlanPage'
import GroceryListPage from './pages/GroceryListPage'
import SettingsPage from './pages/SettingsPage'
import MealPrepPage from './pages/MealPrepPage'

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const isOnboarded = useAppStore((s) => s.isOnboarded)
  const loadFromCloud = useAppStore((s) => s.loadFromCloud)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // When user logs in, load their data from Supabase
  useEffect(() => {
    if (!session) return
    loadUserData().then((data) => {
      if (data) loadFromCloud(data)
    })
  }, [session?.user?.id])

  // Still loading auth state — show nothing to avoid flash
  if (session === undefined) return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-amber-600 text-lg font-medium animate-pulse">Loading…</div>
    </div>
  )

  // Not logged in — show auth screen
  if (!session) return <AuthPage />

  return (
    <BrowserRouter>
      <Routes>
        {!isOnboarded ? (
          <>
            <Route path="/onboard" element={<OnboardingPage />} />
            <Route path="*" element={<Navigate to="/onboard" replace />} />
          </>
        ) : (
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/plan" element={<MealPlanPage />} />
            <Route path="/prep" element={<MealPrepPage />} />
            <Route path="/grocery" element={<GroceryListPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}
