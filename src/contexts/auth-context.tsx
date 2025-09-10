"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthAPI, UserProfile, LoginResponse } from '@/lib/auth-api'
import { LoginForm, SignupForm } from '@/lib/auth-schemas'
import { toast } from 'sonner'
import { APITest } from '@/lib/api-test'
import { businessAPI } from '@/lib/business-api'

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginForm) => Promise<void>
  signup: (data: SignupForm) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  checkBusinessRegistrationAndRedirect: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!AuthAPI.getToken()

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Run API connectivity test in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Running API connectivity test...')
          try {
            await APITest.testConnection()
            await APITest.testAuthEndpoints()
          } catch (testError) {
            console.warn('API test failed, but continuing with auth initialization:', testError)
          }
        }
        
        const token = AuthAPI.getToken()
        if (!token) {
          console.log('No token found, user not authenticated')
          setIsLoading(false)
          return
        }

        console.log('Token found, initializing user session')
        
        // Get user profile from localStorage first (for immediate UI update)
        const cachedProfile = AuthAPI.getUserProfile()
        if (cachedProfile) {
          console.log('Loading cached user profile')
          setUser(cachedProfile)
        }

        // Validate token with backend (non-blocking for better UX)
        try {
          const isValid = await AuthAPI.validateToken()
          if (!isValid) {
            console.log('Token validation failed, logging out')
            await AuthAPI.logout()
            setUser(null)
            setIsLoading(false)
            return
          }
          console.log('Token validation successful')
        } catch (validationError) {
          console.warn('Token validation request failed, keeping cached session:', validationError)
          // If validation fails due to network issues, keep the cached session
          // The user will be logged out when they try to make authenticated requests
        }

        // Try to refresh user profile from backend
        try {
          const currentUser = await AuthAPI.getCurrentUser()
          setUser(currentUser)
          console.log('User profile refreshed from backend')
          
          // For existing authenticated users, check if they need to complete business registration
          // Only redirect if we're on the root path or auth pages (avoid interrupting other flows)
          const currentPath = window.location.pathname
          const shouldCheckBusinessRegistration = 
            currentPath === '/' || 
            currentPath.startsWith('/auth') || 
            currentPath === '/dashboard'
          
          if (shouldCheckBusinessRegistration) {
            console.log('Checking business registration status for existing user')
            try {
              const hasBusiness = await businessAPI.hasRegisteredBusiness()
              
              if (!hasBusiness && currentPath !== '/onboarding') {
                console.log('Existing user has no business registered, redirecting to onboarding')
                router.push('/onboarding')
              } else if (hasBusiness && (currentPath === '/' || currentPath.startsWith('/auth'))) {
                console.log('Existing user has business registered, redirecting to dashboard')
                router.push('/dashboard')
              }
            } catch (businessCheckError) {
              console.warn('Failed to check business registration status:', businessCheckError)
              // Don't interrupt the user flow if business check fails
            }
          }
        } catch (error) {
          console.warn('Failed to refresh user profile from backend:', error)
          // If we can't get fresh user profile but have cached profile, keep it
          if (!cachedProfile) {
            console.log('No cached profile available, logging out')
            await AuthAPI.logout()
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Only logout if we're sure there's an auth problem
        const token = AuthAPI.getToken()
        if (!token) {
          await AuthAPI.logout()
          setUser(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [router])

  // Listen for storage changes to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (e.newValue === null) {
          // Token was removed, logout user
          console.log('Token removed in another tab, logging out')
          setUser(null)
        } else if (e.newValue && !user) {
          // Token was added, try to restore user session
          console.log('Token added in another tab, restoring session')
          const cachedProfile = AuthAPI.getUserProfile()
          if (cachedProfile) {
            setUser(cachedProfile)
          }
        }
      } else if (e.key === 'user_profile') {
        if (e.newValue === null) {
          // User profile was removed
          console.log('User profile removed in another tab')
          setUser(null)
        } else if (e.newValue) {
          // User profile was updated
          try {
            const updatedProfile = JSON.parse(e.newValue)
            console.log('User profile updated in another tab')
            setUser(updatedProfile)
          } catch (error) {
            console.error('Failed to parse updated user profile:', error)
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user])

  const checkBusinessRegistrationAndRedirect = async () => {
    try {
      const hasBusiness = await businessAPI.hasRegisteredBusiness()
      
      if (hasBusiness) {
        console.log('User has registered business, redirecting to dashboard')
        router.push('/dashboard')
      } else {
        console.log('User has no registered business, redirecting to onboarding')
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Error checking business registration status:', error)
      // Default to dashboard if check fails
      router.push('/dashboard')
    }
  }

  const login = async (data: LoginForm) => {
    try {
      setIsLoading(true)
      const response: LoginResponse = await AuthAPI.login(data)
      
      setUser(response.user)
      toast.success('Welcome back!', {
        description: `Logged in as ${response.user.email}`,
      })
      
      // Check business registration status and redirect accordingly
      await checkBusinessRegistrationAndRedirect()
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: SignupForm) => {
    try {
      setIsLoading(true)
      const newUser = await AuthAPI.signup(data)
      
      toast.success('Account created successfully!', {
        description: 'Please check your email to verify your account.',
      })
      
      // Redirect to email verification page
      router.push('/auth/verify-email?email=' + encodeURIComponent(newUser.email))
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('Registration failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await AuthAPI.logout()
      setUser(null)
      
      toast.success('Logged out successfully')
      
      // Redirect to auth page
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed', {
        description: 'Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await AuthAPI.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // If refresh fails, user might need to re-authenticate
      await logout()
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
    checkBusinessRegistrationAndRedirect,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  return { isAuthenticated, isLoading }
}
