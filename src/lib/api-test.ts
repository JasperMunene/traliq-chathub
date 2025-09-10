// Simple API connectivity test
import { config } from "./config"

export class APITest {
  static async testConnection(): Promise<void> {
    const baseUrl = config.API_URL
    console.log('Testing API connection to:', baseUrl)
    
    // Test different possible endpoints and ports
    const testUrls = [
      `${baseUrl}/health`,
      `${baseUrl}/docs`,
      `${baseUrl}/`,
      `http://localhost:8000/health`,
      `http://localhost:8000/docs`,
      `http://localhost:8000/`,
      `http://localhost:3001/health`,
      `http://localhost:3001/docs`,
      `http://localhost:3001/`,
    ]
    
    for (const url of testUrls) {
      try {
        console.log(`Testing: ${url}`)
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        
        console.log(`${url} - Status: ${response.status} ${response.statusText}`)
        console.log(`${url} - Content-Type: ${response.headers.get('content-type')}`)
        
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            const data = await response.json()
            console.log(`${url} - JSON Response:`, data)
          } else {
            const text = await response.text()
            console.log(`${url} - Text Response (first 200 chars):`, text.substring(0, 200))
          }
        }
      } catch (error) {
        console.error(`${url} - Error:`, error)
      }
    }
  }
  
  static async testAuthEndpoints(): Promise<void> {
    const baseUrl = config.API_URL
    console.log('Testing auth endpoints...')
    
    const authEndpoints = [
      '/auth',
      '/auth/jwt/login',
      '/auth/register',
      '/auth/me',
    ]
    
    for (const endpoint of authEndpoints) {
      const url = `${baseUrl}${endpoint}`
      try {
        console.log(`Testing auth endpoint: ${url}`)
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        
        console.log(`${url} - Status: ${response.status} ${response.statusText}`)
        console.log(`${url} - Content-Type: ${response.headers.get('content-type')}`)
        
        // Don't try to parse response body for auth endpoints without proper auth
        // Just check if we get proper HTTP responses vs HTML error pages
        
      } catch (error) {
        console.error(`${url} - Error:`, error)
      }
    }
  }
}

// Auto-run test in development (disabled to prevent console errors)
// if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
//   console.log('Running API connectivity test...')
//   APITest.testConnection().then(() => {
//     APITest.testAuthEndpoints()
//   })
// }
