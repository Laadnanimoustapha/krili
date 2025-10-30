const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://krili-backend.vercel.app/api"

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  [key: string]: any
}

interface ApiError {
  success: false
  message: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    return headers
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()

// Auth endpoints
export const authApi = {
  register: (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone_number?: string
  }) => apiClient.post("/auth/register", data),

  login: (email: string, password: string) => apiClient.post("/auth/login", { email, password }),

  verifyToken: () => apiClient.get("/auth/verify-token"),

  getProfile: () => apiClient.get("/auth/profile"),
}

// Items endpoints
export const itemsApi = {
  getItems: (params?: {
    category_id?: number
    city?: string
    min_price?: number
    max_price?: number
    search?: string
    page?: number
    limit?: number
  }) => {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value))
        }
      })
    }
    return apiClient.get(`/items?${query.toString()}`)
  },

  getItem: (itemId: number) => apiClient.get(`/items/${itemId}`),

  createItem: (data: {
    title: string
    category_id: number
    daily_rental_price: number
    description: string
    weekly_rental_price?: number
    monthly_rental_price?: number
    security_deposit?: number
    location?: string
    city?: string
    country?: string
    condition?: string
    quantity_available?: number
  }) => apiClient.post("/items", data),
}

// Categories endpoints
export const categoriesApi = {
  getCategories: () => apiClient.get("/categories"),

  getCategory: (categoryId: number) => apiClient.get(`/categories/${categoryId}`),
}

// Rentals endpoints
export const rentalsApi = {
  createRental: (data: {
    item_id: number
    rental_start_date: string
    rental_end_date: string
    pickup_location?: string
    delivery_location?: string
    insurance_price?: number
    delivery_price?: number
    notes?: string
  }) => apiClient.post("/rentals", data),

  getUserRentals: (params?: { type?: "renter" | "owner" | "all"; status?: string }) => {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value))
        }
      })
    }
    return apiClient.get(`/rentals/user?${query.toString()}`)
  },
}

// Users endpoints
export const usersApi = {
  getProfile: (userId: number) => apiClient.get(`/users/${userId}`),

  updateProfile: (userId: number, data: any) => apiClient.put(`/users/${userId}`, data),

  getUserListings: (userId: number) => apiClient.get(`/users/${userId}/listings`),
}
