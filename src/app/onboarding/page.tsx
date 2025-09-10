"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Building2, Clock, Globe, Briefcase, ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import { businessAPI } from "@/lib/business-api"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

// Business registration schema
const businessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  industry: z.string().min(1, "Please select an industry"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tone: z.string().default("friendly"),
})

type BusinessFormData = z.infer<typeof businessSchema>

interface BusinessHours {
  [key: string]: {
    open: string
    close: string
    isOpen: boolean
  }
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Food & Beverage",
  "Transportation",
  "Entertainment",
  "Consulting",
  "Other"
]


const daysOfWeek = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" }
]

const Onboarding = () => {
  const router = useRouter()
  useAuth() // keep hook call in case you need auth effects later; don't destructure unused value
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: "09:00", close: "17:00", isOpen: true },
    tuesday: { open: "09:00", close: "17:00", isOpen: true },
    wednesday: { open: "09:00", close: "17:00", isOpen: true },
    thursday: { open: "09:00", close: "17:00", isOpen: true },
    friday: { open: "09:00", close: "17:00", isOpen: true },
    saturday: { open: "10:00", close: "16:00", isOpen: false },
    sunday: { open: "10:00", close: "16:00", isOpen: false }
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema) as Resolver<BusinessFormData>, // <- fixed type assertion
    mode: "onChange",
    defaultValues: {
      tone: "friendly"
    }
  })

  const watchedName = watch("name")

  // Auto-generate slug from business name
  useEffect(() => {
    if (watchedName) {
      const slug = watchedName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .trim()
      setValue("slug", slug)
    }
  }, [watchedName, setValue])

  const handleBusinessHoursChange = (day: string, field: string, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const onSubmit = async (data: BusinessFormData) => {
    setIsLoading(true)

    try {
      // Prepare the complete business data
      const businessData = {
        name: data.name,
        slug: data.slug,
        industry: data.industry,
        description: data.description,
        tone: data.tone,
        timezone: "UTC",
        business_hours: businessHours,
        settings: {
          notifications_enabled: true,
          auto_responses: true,
          theme: "dark"
        }
      }

      console.log('Submitting business data:', businessData)

      // Create business using the API
      const response = await businessAPI.createBusiness(businessData)

      if (response.success) {
        toast.success('Business registered successfully!', {
          description: 'Welcome to Traliq.ai! Redirecting to your dashboard...'
        })

        // Redirect to dashboard after successful registration
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        throw new Error(response.message || 'Failed to create business')
      }

    } catch (error) {
      console.error('Business registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error('Registration failed', {
        description: errorMessage.includes('401') || errorMessage.includes('403')
            ? 'Please log in again to continue.'
            : 'Please try again or contact support if the issue persists.'
      })

      // If authentication error, redirect to login
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Building2 className="h-10 w-10 text-white" />
              <h1 className="text-4xl font-light">
                Traliq<span className="font-bold text-white">.ai</span>
              </h1>
            </div>
            <h2 className="text-2xl font-light mb-3 tracking-wide">Welcome to your AI-powered chat platform</h2>
            <p className="text-gray-400 text-lg">Let&apos;s set up your business profile to get started</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                ${currentStep >= step
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-black text-white border-2 border-white/20'
                  }
              `}>
                    {currentStep > step ? <Check className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                      <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                          currentStep > step ? 'bg-white' : 'bg-white/20'
                      }`} />
                  )}
                </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
                <Card className="bg-black border-white/20 text-white shadow-2xl">
                  <CardHeader className="pb-8">
                    <CardTitle className="flex items-center gap-3 text-2xl font-light">
                      <Briefcase className="h-6 w-6" />
                      Business Information
                    </CardTitle>
                    <CardDescription className="text-white/60 text-lg">
                      Tell us about your business
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-white font-medium text-base">Business Name *</Label>
                      <Input
                          id="name"
                          {...register("name")}
                          placeholder="Enter your business name"
                          className="bg-black border-white/30 text-white placeholder-white/40 focus:border-white focus:ring-2 focus:ring-white/20 h-12 text-base"
                      />
                      {errors.name && (
                          <p className="text-red-400 text-sm mt-2">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="slug" className="text-white font-medium text-base">Business Slug *</Label>
                      <div className="flex items-center gap-3">
                        <span className="text-white/60 text-base font-medium">traliq.ai/</span>
                        <Input
                            id="slug"
                            {...register("slug")}
                            placeholder="business-slug"
                            className="bg-black border-white/30 text-white placeholder-white/40 focus:border-white focus:ring-2 focus:ring-white/20 h-12 text-base"
                        />
                      </div>
                      {errors.slug && (
                          <p className="text-red-400 text-sm mt-2">{errors.slug.message}</p>
                      )}
                      <p className="text-white/50 text-sm">This will be your unique URL identifier</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="industry" className="text-white font-medium text-base">Industry *</Label>
                      <Select onValueChange={(value) => setValue("industry", value)}>
                        <SelectTrigger className="bg-black border-white/30 text-white h-12 text-base focus:border-white focus:ring-2 focus:ring-white/20">
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/30">
                          {industries.map((industry) => (
                              <SelectItem key={industry} value={industry} className="text-white hover:bg-white/10 focus:bg-white/10">
                                {industry}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.industry && (
                          <p className="text-red-400 text-sm mt-2">{errors.industry.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-white font-medium text-base">Business Description *</Label>
                      <Textarea
                          id="description"
                          {...register("description")}
                          placeholder="Describe what your business does..."
                          rows={5}
                          className="bg-black border-white/30 text-white placeholder-white/40 focus:border-white focus:ring-2 focus:ring-white/20 resize-none text-base"
                      />
                      {errors.description && (
                          <p className="text-red-400 text-sm mt-2">{errors.description.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
            )}

            {/* Step 2: Preferences */}
            {currentStep === 2 && (
                <Card className="bg-black border-white/20 text-white shadow-2xl">
                  <CardHeader className="pb-8">
                    <CardTitle className="flex items-center gap-3 text-2xl font-light">
                      <Globe className="h-6 w-6" />
                      Preferences
                    </CardTitle>
                    <CardDescription className="text-white/60 text-lg">
                      Configure your business preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-white font-medium text-base">Communication Tone</Label>
                      <Select onValueChange={(value) => setValue("tone", value)} defaultValue="friendly">
                        <SelectTrigger className="bg-black border-white/30 text-white h-12 text-base focus:border-white focus:ring-2 focus:ring-white/20">
                          <SelectValue placeholder="Select communication tone" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/30">
                          <SelectItem value="friendly" className="text-white hover:bg-white/10 focus:bg-white/10">Friendly</SelectItem>
                          <SelectItem value="professional" className="text-white hover:bg-white/10 focus:bg-white/10">Professional</SelectItem>
                          <SelectItem value="casual" className="text-white hover:bg-white/10 focus:bg-white/10">Casual</SelectItem>
                          <SelectItem value="formal" className="text-white hover:bg-white/10 focus:bg-white/10">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
            )}

            {/* Step 3: Business Hours */}
            {currentStep === 3 && (
                <Card className="bg-black border-white/20 text-white shadow-2xl">
                  <CardHeader className="pb-8">
                    <CardTitle className="flex items-center gap-3 text-2xl font-light">
                      <Clock className="h-6 w-6" />
                      Business Hours
                    </CardTitle>
                    <CardDescription className="text-white/60 text-lg">
                      Set your operating hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {daysOfWeek.map((day) => (
                        <div key={day.key} className="flex items-center gap-6 p-4 rounded-lg bg-black border border-white/20 hover:border-white/40 transition-all duration-200">
                          <div className="flex items-center space-x-3 min-w-[140px]">
                            <Checkbox
                                id={day.key}
                                checked={businessHours[day.key]?.isOpen}
                                onCheckedChange={(checked) =>
                                    handleBusinessHoursChange(day.key, 'isOpen', checked as boolean)
                                }
                                className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                            />
                            <Label htmlFor={day.key} className="font-medium text-base">
                              {day.label}
                            </Label>
                          </div>

                          {businessHours[day.key]?.isOpen && (
                              <div className="flex items-center gap-4 flex-1">
                                <Input
                                    type="time"
                                    value={businessHours[day.key]?.open}
                                    onChange={(e) => handleBusinessHoursChange(day.key, 'open', e.target.value)}
                                    className="bg-black border-white/30 text-white w-36 h-10 focus:border-white focus:ring-2 focus:ring-white/20"
                                />
                                <span className="text-white/60 font-medium">to</span>
                                <Input
                                    type="time"
                                    value={businessHours[day.key]?.close}
                                    onChange={(e) => handleBusinessHoursChange(day.key, 'close', e.target.value)}
                                    className="bg-black border-white/30 text-white w-36 h-10 focus:border-white focus:ring-2 focus:ring-white/20"
                                />
                              </div>
                          )}

                          {!businessHours[day.key]?.isOpen && (
                              <Badge variant="secondary" className="bg-white/10 text-white/60 border-white/20">
                                Closed
                              </Badge>
                          )}
                        </div>
                    ))}
                  </CardContent>
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white disabled:opacity-50 h-12 px-8 text-base"
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                  <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-white text-black hover:bg-white/90 h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Next
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
              ) : (
                  <Button
                      type="submit"
                      disabled={!isValid || isLoading}
                      className="bg-white text-black hover:bg-white/90 disabled:opacity-50 h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? 'Setting up...' : 'Complete Setup'}
                  </Button>
              )}
            </div>
          </form>
        </div>
      </div>
  )
}

const ProtectedOnboarding = () => {
  return (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
  )
}

export default ProtectedOnboarding
