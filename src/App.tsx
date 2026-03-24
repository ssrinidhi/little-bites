import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Still loading auth state
  if (session === undefined) return null

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
