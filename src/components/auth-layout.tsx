import { ReactNode } from "react"
import Link from "next/link"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  showBackToLogin?: boolean
}

export function AuthLayout({ children, title, subtitle, showBackToLogin = false }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Brand */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="text-4xl font-light text-foreground mb-2">
              Traliq<span className="font-bold text-white">.ai</span>
            </div>
            <div className="text-xs text-muted-foreground tracking-wide">
              INTELLIGENT CHAT PLATFORM
            </div>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-card-foreground mb-2">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {subtitle}
            </p>
          </div>

          {children}

          {showBackToLogin && (
            <div className="mt-6 text-center">
              <Link 
                href="/auth/login" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          © 2025 Traliq.ai • All rights reserved
        </div>
      </div>
    </div>
  )
}
