// src/pages/Signup.jsx
import React, { useState } from 'react'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, GraduationCap, Building2, Calendar, Hash, Sparkles, Users, ArrowRight } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    batch: '',
    regNo: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create Firebase user
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = res.user

      // Send verification email
      await sendEmailVerification(user)

      // Get token
      const token = await user.getIdToken()

      // Prepare backend data
      const backendData = {
        name: formData.name,
        department: formData.role === 'admin' ? 'Administration' : formData.department,
        graduationYear: formData.role === 'admin' ? 'N/A' : (formData.role === 'alumni' ? formData.batch : formData.regNo),
        role: formData.role
      }

      // Create backend profile
      const backendRes = await fetch(`${API_BASE}/api/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backendData),
      })

      if (!backendRes.ok) {
        throw new Error('Failed to create backend profile')
      }

      // Show success message and navigate to login
      alert('Account created successfully! Please check your email to verify your account before logging in.')
      navigate('/login')
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-purple flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -right-32 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{
            background: 'rgba(102, 126, 234, 0.4)',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-2000"
          style={{
            background: 'rgba(118, 75, 162, 0.4)',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite 2s'
          }}
        ></div>
      </div>

      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="text-white text-center md:text-left space-y-8">
          <div>
            <div className="glass-effect inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6">
              <Users size={40} />
            </div>
            <h1 className="text-5xl font-bold mb-4">Join Our Community</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Connect with fellow alumni, discover opportunities, and grow your professional network.
            </p>
          </div>

          <div className="space-y-4">
            <div className="glass-effect flex items-center text-white rounded-2xl p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                <Sparkles size={24} className="text-purple-300" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white text-lg">Access exclusive events</h3>
                <p className="text-gray-300 text-sm">Webinars, workshops, and networking events</p>
              </div>
            </div>

            <div className="glass-effect flex items-center text-white rounded-2xl p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                <Users size={24} className="text-blue-300" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white text-lg">Connect with professionals</h3>
                <p className="text-gray-300 text-sm">Build your professional network</p>
              </div>
            </div>

            <div className="glass-effect flex items-center text-white rounded-2xl p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                <Sparkles size={24} className="text-green-300" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white text-lg">Discover opportunities</h3>
                <p className="text-gray-300 text-sm">Jobs, internships, and collaborations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="glass-effect rounded-3xl shadow-xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-300">Join our alumni network today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="form-input pl-10"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="form-input pl-10"
                    placeholder="enter mail id"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="form-input pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Role</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 z-10" size={20} />
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="form-select pl-10"
                  >
                    <option value="student" className="text-gray-900">Student</option>
                    <option value="alumni" className="text-gray-900">Alumni</option>
                  </select>
                </div>
              </div>

              {formData.role !== 'admin' && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className="form-input pl-10"
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {formData.role === 'alumni' && (
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Graduation Year</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => handleChange('batch', e.target.value)}
                    className="form-input pl-10"
                    placeholder="2023"
                    required
                  />
                </div>
              </div>
            )}

            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Graduation Year</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="text"
                    value={formData.regNo}
                    onChange={(e) => handleChange('regNo', e.target.value)}
                    className="form-input pl-10"
                    placeholder="Enter Graduation Year"
                    required
                  />
                </div>
              </div>
            )}

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
                  <span>Create Account</span>
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?{' '}
              <a href="/login" className="text-white font-semibold hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}