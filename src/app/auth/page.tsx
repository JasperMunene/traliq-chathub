import Link from "next/link"
import { LogIn, UserPlus, Mail, Lock } from "lucide-react"

import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthPage() {
  const authOptions = [
    {
      title: "Sign In",
      description: "Access your existing account",
      icon: LogIn,
      href: "/auth/login",
      primary: true,
    },
    {
      title: "Create Account",
      description: "Join thousands of businesses",
      icon: UserPlus,
      href: "/auth/signup",
      primary: false,
    },
    {
      title: "Forgot Password",
      description: "Reset your account password",
      icon: Lock,
      href: "/auth/forgot-password",
      primary: false,
    },
    {
      title: "Verify Email",
      description: "Complete email verification",
      icon: Mail,
      href: "/auth/verify-email",
      primary: false,
    },
  ]

  return (
    <AuthLayout
      title="Welcome to Traliq.ai"
      subtitle="Choose how you'd like to continue"
    >
      <div className="space-y-4">
        {authOptions.map((option) => {
          const Icon = option.icon
          return (
            <Card
              key={option.title}
              className={`transition-all duration-200 hover:shadow-lg hover:shadow-black/10 cursor-pointer group ${
                option.primary 
                  ? 'border-primary/20 bg-primary/5 hover:bg-primary/10' 
                  : 'border-border hover:border-border/80'
              }`}
            >
              <Link href={option.href}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      option.primary 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground group-hover:text-foreground'
                    } transition-colors`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${
                        option.primary ? 'text-primary' : 'text-card-foreground'
                      }`}>
                        {option.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {option.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1 h-12">
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 h-12">
            <Link href="/auth/signup">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Preview */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="text-center space-y-4">
          <h3 className="text-sm font-medium text-card-foreground">
            Why choose Traliq.ai?
          </h3>
          <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span>AI-powered intelligent chat platform</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span>Advanced document processing & analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span>Seamless integrations & customization</span>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
