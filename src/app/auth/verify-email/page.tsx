"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, Loader2, CheckCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { AuthAPI } from "@/lib/auth-api"
import { verifyEmailSchema, VerifyEmailForm } from "@/lib/auth-schemas"


export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")

  // Read the email query param on the client — avoids useSearchParams SSR/Suspense issues.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      setEmail(params.get("email") || "")
    } catch (e) {
      console.error(e)
      setEmail("")
    }
  }, [])

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<VerifyEmailForm>({
    resolver: zodResolver(verifyEmailSchema),
  })

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Move callbacks above the effect that references them
  const onSubmit = useCallback(
      async (data: VerifyEmailForm) => {
        if (!email) {
          setError("Email address is required")
          return
        }

        setIsLoading(true)
        setError("")

        try {
          const result = await AuthAPI.verifyCode(email, data.code)

          if (result.success) {
            setIsSuccess(true)
            toast.success("Email verified successfully!", {
              description: "Your account is now active.",
            })
          } else {
            setError(result.message || "Verification failed")
          }
        } catch (err) {
          const errorMessage =
              err instanceof Error
                  ? err.message
                  : "Invalid verification code. Please try again."
          setError(errorMessage)
          toast.error("Verification failed", {
            description: errorMessage,
          })
        } finally {
          setIsLoading(false)
        }
      },
      [email]
  )

  const handleResendCode = useCallback(
      async () => {
        if (!email) {
          setError("Email address is required")
          return
        }

        setIsResending(true)
        setError("")

        try {
          const result = await AuthAPI.sendVerificationCode(email)

          if (result.success) {
            setResendCooldown(60) // 60 second cooldown
            toast.success("Verification code sent!", {
              description: "Check your email for the new code.",
            })
          } else {
            setError(result.message || "Failed to resend code")
          }
        } catch (err) {
          const errorMessage =
              err instanceof Error ? err.message : "Failed to resend code. Please try again."
          setError(errorMessage)
          toast.error("Failed to resend code", {
            description: errorMessage,
          })
        } finally {
          setIsResending(false)
        }
      },
      [email]
  )

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === 6) {
      setValue("code", code)
      trigger("code").then((isValid) => {
        if (isValid) {
          handleSubmit(onSubmit)()
        }
      })
    }
    // handleSubmit and onSubmit are stable (onSubmit is wrapped in useCallback)
  }, [code, setValue, trigger, handleSubmit, onSubmit])

  if (isSuccess) {
    return (
        <AuthLayout title="Email verified!" subtitle="Your account has been successfully verified">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground">
                Welcome to Traliq.ai! Your email has been verified and your account is now active.
              </p>
            </div>

            <Button asChild className="w-full h-12">
              <Link href="/auth/login">Continue to Sign In</Link>
            </Button>
          </div>
        </AuthLayout>
    )
  }

  return (
      <AuthLayout
          title="Verify your email"
          subtitle="Enter the 6-digit code sent to your email address"
          showBackToLogin={true}
      >
        <div className="space-y-6">
          {error && (
              <Alert className="border-destructive/50 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          {/* Email Display */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">We sent a verification code to:</p>
            <p className="font-medium text-card-foreground">{email || "your email address"}</p>
          </div>

          {/* Verification Code Input */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode} disabled={isLoading}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-12 text-lg border-border" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-lg border-border" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-lg border-border" />
                    <InputOTPSlot index={3} className="w-12 h-12 text-lg border-border" />
                    <InputOTPSlot index={4} className="w-12 h-12 text-lg border-border" />
                    <InputOTPSlot index={5} className="w-12 h-12 text-lg border-border" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {errors.code && (
                  <p className="text-sm text-destructive text-center">{errors.code.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium"
            >
              {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
              ) : (
                  "Verify email"
              )}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>

            <Button
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={isResending || resendCooldown > 0}
                className="text-primary hover:text-primary/80 transition-colors"
            >
              {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Sending...
                  </>
              ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend in {resendCooldown}s
                  </>
              ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend code
                  </>
              )}
            </Button>

            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
              <p>Check your spam folder if you don&apos;t see the email in your inbox.</p>
            </div>
          </div>
        </div>
      </AuthLayout>
  )
}
