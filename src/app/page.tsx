"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Loader2, MessageCircle, Brain, Zap, ArrowRight, Sparkles, Bot } from "lucide-react"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    setIsVisible(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-white" />
              <div className="absolute inset-0 h-12 w-12 border-2 border-white/20 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-400 text-lg">Initializing AI...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`
              }}
          />
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${2 + Math.random() * 3}s`
                    }}
                />
            ))}
          </div>
        </div>

        <div className={`relative z-10 min-h-screen flex items-center justify-center p-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-6xl mx-auto text-center space-y-16">
            {/* Logo and Brand */}
            <div className={`space-y-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative">
                <div className="text-5xl md:text-6xl font-thin tracking-wider text-white">
                  Traliq
                  <span className="font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">.ai</span>
                </div>
                <div className="absolute -top-4 -right-4">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-lg text-gray-400 tracking-[0.3em] uppercase font-light">
                Next-Gen AI Conversations
              </div>
            </div>

            {/* Hero Section */}
            <div className={`space-y-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="block text-white mb-4">Revolutionize</span>
                <span className="block bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Customer Engagement
              </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Deploy intelligent AI agents that understand, learn, and respond with human-like precision.
                Transform every conversation into an opportunity.
              </p>
            </div>

            {/* CTA Section */}
            <div className={`space-y-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                    asChild
                    size="lg"
                    className="group h-16 px-12 font-medium bg-white text-black hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <Link href="/auth/signup" className="flex items-center gap-3">
                    Launch Your AI
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="group h-16 px-12 font-medium border-white/30 text-white hover:bg-white transition-all duration-300 hover:scale-105"
                >
                  <Link href="/auth/login" className="flex items-center gap-3">
                    <Bot className="w-5 h-5" />
                    Sign In
                  </Link>
                </Button>
              </div>
              <div className=" text-xs text-gray-500">
              <span className="px-3 py-1 border border-gray-800 rounded-full">
                ✨ No credit card required • Start in 30 seconds
              </span>
              </div>
            </div>

            {/* Enhanced Features Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="group relative p-8 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-gray-600 transition-all duration-500 hover:scale-105 hover:bg-gray-900/70">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Neural Processing
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Advanced AI models that understand context, emotion, and intent with unprecedented accuracy.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-gray-600 transition-all duration-500 hover:scale-105 hover:bg-gray-900/70">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Conversational AI
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Natural, flowing conversations that adapt to your customers&apos; communication style and preferences.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-gray-600 transition-all duration-500 hover:scale-105 hover:bg-gray-900/70">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Lightning Fast
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Instant responses powered by optimized infrastructure. Your customers never wait.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-t border-b border-gray-800 transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-white">99.9%</div>
                <div className="text-gray-400 text-lg">Uptime Guarantee</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-white">&lt;100ms</div>
                <div className="text-gray-400 text-lg">Average Response</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-white">24/7</div>
                <div className="text-gray-400 text-lg">AI Support</div>
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className={`pt-12 transition-all duration-1000 delay-1300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-sm text-gray-500">
                  © 2025 Traliq.ai • Pioneering the future of AI communication
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                  <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                  <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
