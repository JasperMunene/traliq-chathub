"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthAPI } from "@/lib/auth-api"
import { forgotPasswordSchema, ForgotPasswordForm } from "@/lib/auth-schemas"


export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await AuthAPI.forgotPassword(data)
      
      if (result.success) {
        setIsSuccess(true)
        toast.success('Password reset email sent!', {
          description: 'Check your email for reset instructions.'
        })
      } else {
        setError(result.message || "Failed to send reset email")
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(errorMessage)
      toast.error('Failed to send reset email', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent password reset instructions to your email"
        showBackToLogin={true}
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">
              We&apos;ve sent a password reset link to:
            </p>
            <p className="font-medium text-card-foreground">
              {getValues("email")}
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="mb-2">Didn&apos;t receive the email? Check your spam folder or</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSuccess(false)}
              className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
            >
              try again with a different email
            </Button>
          </div>

          <Button asChild className="w-full h-12">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a reset link"
      showBackToLogin={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert className="border-destructive/50 text-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className="pl-10 h-12 bg-input border-border focus:border-ring"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>

        {/* Additional Help */}
        <div className="text-center space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="mb-2">Remember your password?</p>
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
