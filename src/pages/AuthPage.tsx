import { useState } from 'react'
import { Baby, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup' | 'forgot'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Check your email for a confirmation link, then come back to sign in.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setInfo('Password reset email sent — check your inbox.')
        setMode('login')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 shadow-lg mb-3">
            <Baby size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary-700">Little Bites</h1>
          <p className="text-sm text-gray-500 mt-0.5">Toddler meal planning made easy</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            {mode === 'login'
              ? 'Sign in to access your meal plans.'
              : mode === 'signup'
              ? 'Start planning nutritious meals for your toddler.'
              : 'Enter your email and we\'ll send a reset link.'}
          </p>

          {info && (
            <div className="mb-4 bg-sage-50 border border-sage-200 rounded-xl px-3 py-2.5 text-sm text-sage-700">
              {info}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-10 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === 'login' ? (
                'Sign In'
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Mode switchers */}
          <div className="mt-4 space-y-2 text-center">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('forgot'); setError('') }}
                  className="block w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Forgot password?
                </button>
                <p className="text-sm text-gray-500">
                  No account?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError('') }}
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    Sign up free
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError('') }}
                  className="text-primary-600 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => { setMode('login'); setError('') }}
                className="text-sm text-primary-600 font-semibold hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
