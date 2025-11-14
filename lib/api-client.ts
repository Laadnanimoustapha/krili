// Mock API client - Frontend only, no backend connections
// These are placeholder exports to satisfy imports throughout the app

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    // Mock login - stores in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.email === credentials.email && u.password === credentials.password)

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
      return { success: true, data: user }
    }

    return { success: false, message: "Invalid credentials" }
  },

  register: async (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone_number: string
  }) => {
    // Mock registration - stores in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    if (users.find((u: any) => u.email === data.email)) {
      return { success: false, message: "Email already exists" }
    }

    const newUser = {
      id: Date.now(),
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone_number,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    return { success: true, data: newUser }
  },

  logout: async () => {
    localStorage.removeItem("currentUser")
    return { success: true }
  },
}

export const itemsApi = {
  getAll: async () => {
    const items = JSON.parse(localStorage.getItem("items") || "[]")
    return { success: true, data: items }
  },

  getById: async (id: string) => {
    const items = JSON.parse(localStorage.getItem("items") || "[]")
    const item = items.find((i: any) => i.id === id)
    return { success: true, data: item }
  },

  search: async (query: string) => {
    const items = JSON.parse(localStorage.getItem("items") || "[]")
    return { success: true, data: items.filter((i: any) => i.name.toLowerCase().includes(query.toLowerCase())) }
  },
}

export const rentalsApi = {
  create: async (data: any) => {
    return { success: true, data }
  },

  getByUser: async (userId: string) => {
    const rentals = JSON.parse(localStorage.getItem("rentals") || "[]")
    return { success: true, data: rentals.filter((r: any) => r.userId === userId) }
  },

  getById: async (id: string) => {
    const rentals = JSON.parse(localStorage.getItem("rentals") || "[]")
    const rental = rentals.find((r: any) => r.id === id)
    return { success: true, data: rental }
  },
}

export const categoriesApi = {
  getAll: async () => {
    const categories = JSON.parse(localStorage.getItem("categories") || "[]")
    return { success: true, data: categories }
  },
}

export const apiClient = {
  authApi,
  itemsApi,
  rentalsApi,
  categoriesApi,
}
