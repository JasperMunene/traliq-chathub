import { LoginForm, SignupForm, ForgotPasswordForm } from "./auth-schemas"
import { config } from "./config"

// Base API configuration
const API_BASE_URL = config.API_URL

// Backend response types matching FastAPI Users
export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  phone?: string
  preferences?: Record<string, unknown>
  last_login_at?: string
  login_count: number
  created_at: string
  is_verified: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: UserProfile
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: unknown
}

export interface VerificationCodeResponse {
  success: boolean
  message: string
}

// Authentication API functions
export class AuthAPI {
  private static getAuthHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    } else {
      const storedToken = this.getToken()
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`
      }
    }

    return headers
  }

  private static async handleResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type')

    // Check if response is HTML (error page) instead of JSON
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML response instead of JSON. API endpoint may not exist or server error occurred.')
      console.error('Response URL:', response.url)
      console.error('Response Status:', response.status, response.statusText)

      if (response.status === 404) {
        throw new Error('API endpoint not found. Please check if the backend server is running and the URL is correct.')
      } else if (response.status >= 500) {
        throw new Error('Server error occurred. Please try again later.')
      } else {
        throw new Error('Unexpected server response. Please check your network connection and try again.')
      }
    }

    // Try to parse JSON response
    try {
      return await response.json()
    } catch (err) {
      console.error('Failed to parse JSON response:', err)
      console.error('Response text:', await response.text())
      throw new Error('Invalid response format from server')
    }
  }

  static async login(data: LoginForm): Promise<LoginResponse> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`)

      // Use the custom login endpoint that accepts email/password directly
      const loginData = {
        email: data.email,
        password: data.password
      }
      console.log('Login data:', loginData)

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })
      console.log('Login response status:', response.status, response.statusText)
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Login error response:', errorText)

        let errorMessage = 'Login failed'
        try {
          const errorData = JSON.parse(errorText) as { detail?: string }
          if (errorData.detail === 'LOGIN_BAD_CREDENTIALS') {
            errorMessage = 'Invalid email or password'
          } else if (errorData.detail === 'LOGIN_USER_NOT_VERIFIED') {
            errorMessage = 'Please verify your email before logging in'
          } else {
            errorMessage = errorData.detail || errorMessage
          }
        } catch {
          // If not JSON, use the raw text
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const raw = await this.handleResponse(response)
      const result = raw as LoginResponse

      // Store token and user info
      if (result.access_token) {
        localStorage.setItem("auth_token", result.access_token)
        localStorage.setItem("user_profile", JSON.stringify(result.user))
        console.log('Login successful, token stored')
      }

      return result
    } catch (err) {
      console.error("Login error:", err)
      console.error("API_BASE_URL:", API_BASE_URL)
      throw err
    }
  }

  static async signup(data: SignupForm): Promise<UserProfile> {
    try {
      console.log('Attempting signup to:', `${API_BASE_URL}/auth/register/register`)

      // Convert to backend expected format
      const signupData = {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`.trim(),
        is_active: true,
        is_verified: false
      }

      const response = await fetch(`${API_BASE_URL}/auth/register/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      })

      console.log('Signup response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await this.handleResponse(response)
        const errObj = (errorData as { detail?: string }) || {}
        throw new Error(errObj.detail || "Registration failed")
      }

      const raw = await this.handleResponse(response)
      const result = raw as UserProfile
      console.log('Signup successful')
      return result
    } catch (err) {
      console.error("Signup error:", err)
      console.error("API_BASE_URL:", API_BASE_URL)
      throw err
    }
  }

  static async forgotPassword(data: ForgotPasswordForm): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error((errorData as { detail?: string }).detail || "Failed to send reset email")
      }

      return { success: true, message: "Password reset email sent successfully" }
    } catch (err) {
      console.error("Forgot password error:", err)
      throw err
    }
  }

  static async sendVerificationCode(email: string): Promise<VerificationCodeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error((errorData as { detail?: string }).detail || "Failed to send verification code")
      }

      const result = await response.json()
      return result as VerificationCodeResponse
    } catch (err) {
      console.error("Send verification code error:", err)
      throw err
    }
  }

  static async verifyCode(email: string, code: string): Promise<VerificationCodeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error((errorData as { detail?: string }).detail || "Code verification failed")
      }

      const result = await response.json()
      return result as VerificationCodeResponse
    } catch (err) {
      console.error("Verify code error:", err)
      throw err
    }
  }

  static async resetPassword(token: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error((errorData as { detail?: string }).detail || "Password reset failed")
      }

      return { success: true, message: "Password reset successfully" }
    } catch (err) {
      console.error("Reset password error:", err)
      throw err
    }
  }

  static async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error((errorData as { detail?: string }).detail || "Failed to get user profile")
      }

      const result = await response.json()
      localStorage.setItem("user_profile", JSON.stringify(result))
      return result as UserProfile
    } catch (err) {
      console.error("Get current user error:", err)
      throw err
    }
  }

  static async validateToken(): Promise<boolean> {
    try {
      const token = this.getToken()
      if (!token) {
        console.log('No token available for validation')
        return false
      }

      const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (response.ok) {
        console.log('Token validation successful')
        return true
      } else {
        console.log('Token validation failed with status:', response.status)
        return false
      }
    } catch (err) {
      console.error("Token validation error:", err)
      // Return false only for actual auth errors, not network errors
      if (err instanceof TypeError && (err as Error).message.includes('fetch')) {
        console.warn('Network error during token validation, assuming token is still valid')
        return true // Assume token is valid if we can't reach the server
      }
      return false
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = this.getToken()

      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: this.getAuthHeaders(),
        })
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      // Always remove tokens and user data from localStorage
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_profile")
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        console.log('Token retrieved from localStorage')
      }
      return token
    }
    return null
  }

  static getUserProfile(): UserProfile | null {
    if (typeof window !== "undefined") {
      const profile = localStorage.getItem("user_profile")
      if (profile) {
        try {
          const parsed = JSON.parse(profile)
          console.log('User profile retrieved from localStorage:', parsed.email)
          return parsed as UserProfile
        } catch (err) {
          console.error('Failed to parse user profile from localStorage:', err)
          localStorage.removeItem("user_profile")
          return null
        }
      }
    }
    return null
  }

  static isAuthenticated(): boolean {
    const hasToken = !!this.getToken()
    const hasProfile = !!this.getUserProfile()
    console.log('Auth check - hasToken:', hasToken, 'hasProfile:', hasProfile)
    return hasToken && hasProfile
  }

  static async refreshToken(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Token refresh failed")
      }

      const result = await response.json()

      if (result.access_token) {
        localStorage.setItem("auth_token", result.access_token)
        return result.access_token
      }

      throw new Error("No token received")
    } catch (err) {
      console.error("Token refresh error:", err)
      // If refresh fails, logout user
      this.logout()
      throw err
    }
  }
}
