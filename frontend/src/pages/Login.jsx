// src/pages/Login.jsx
import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, GraduationCap, Sparkles, Shield, Users, BookOpen, ArrowRight } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Sign in with Firebase
      const res = await signInWithEmailAndPassword(auth, email, password)
      const user = res.user

      // Check email verification
      if (!user.emailVerified) {
        setError('Please verify your email before logging in.')
        setLoading(false)
        return
      }

      // Get token and fetch profile from backend
      const token = await user.getIdToken()
      const profileRes = await fetch(`${API_BASE}/api/users/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const token1 = await auth.currentUser.getIdToken();
      console.log("TOKEN:", token1);

      if (!profileRes.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const profileData = await profileRes.json()

      // Navigate based on role
     navigate('/home')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -left-32 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{
            background: 'rgba(102, 126, 234, 0.4)',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute -bottom-40 -right-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-2000"
          style={{
            background: 'rgba(30, 60, 114, 0.4)',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite 2s'
          }}
        ></div>
      </div>

      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Features */}
        <div className="text-white space-y-8">
          <div>
            <div className="glass-effect inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6">
              <GraduationCap size={40} />
            </div>
            <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Continue your journey with our alumni community. Access exclusive resources and connect with your network.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="glass-effect flex items-start space-x-4 rounded-2xl p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Network Growth</h3>
                <p className="text-gray-300">Connect with 10,000+ alumni worldwide</p>
              </div>
            </div>
            
            <div className="glass-effect flex items-start space-x-4 rounded-2xl p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <BookOpen size={24} className="text-green-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Career Resources</h3>
                <p className="text-gray-300">Access job opportunities and mentorship programs</p>
              </div>
            </div>
            
            <div className="glass-effect flex items-start space-x-4 rounded-2xl p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Shield size={24} className="text-purple-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Secure Access</h3>
                <p className="text-gray-300">Your data is protected with enterprise-grade security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="glass-effect rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-300">Access your alumni account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 bg-white/5 border border-gray-300 rounded focus:ring-white/50 text-purple-600" />
                <span className="ml-2 text-gray-300 text-sm">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-gray-300 hover:text-white text-sm transition-all">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <span>Sign In to Your Account</span>
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-300/20">
            <div className="text-center">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <a href="/signup" className="text-white font-semibold hover:underline">
                  Join our community
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}