"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to login')
      setIsRedirecting(true)
      router.push('/auth/login')
    } else if (!isLoading && isAuthenticated) {
      console.log('ProtectedRoute: User authenticated, allowing access')
      setIsRedirecting(false)
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state during auth initialization or redirect
  if (isLoading || isRedirecting) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">
              {isRedirecting ? 'Redirecting...' : 'Loading...'}
            </p>
          </div>
        </div>
      )
    )
  }

  // Double-check authentication state
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Final auth check failed')
    return null // This should trigger the redirect useEffect
  }

  console.log('ProtectedRoute: Rendering protected content for user:', user.email)
  return <>{children}</>
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
