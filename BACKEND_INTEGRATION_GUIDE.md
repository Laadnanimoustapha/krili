# Backend Integration Guide

This document outlines the integration between the Krili frontend and the Python backend API.

## Backend URL
- **Production**: https://krili-backend.vercel.app/api
- **Environment Variable**: `NEXT_PUBLIC_API_URL`

## API Client Setup

The API client is located in `lib/api-client.ts` and provides:

- Automatic token management (JWT)
- Request/response handling
- Error management
- Typed API endpoints

### Authentication

\`\`\`typescript
import { authApi, apiClient } from "@/lib/api-client"

// Login
const response = await authApi.login(email, password)
if (response.success) {
  apiClient.setToken(response.access_token)
}

// Register
const response = await authApi.register({
  email,
  password,
  first_name,
  last_name,
  phone_number
})

// Verify Token
const response = await authApi.verifyToken()

// Get Profile
const response = await authApi.getProfile()
\`\`\`

### Items

\`\`\`typescript
import { itemsApi } from "@/lib/api-client"

// Get all items with filters
const response = await itemsApi.getItems({
  category_id: 1,
  city: "San Francisco",
  min_price: 100,
  max_price: 500,
  search: "camera",
  page: 1,
  limit: 20
})

// Get single item
const response = await itemsApi.getItem(itemId)

// Create item
const response = await itemsApi.createItem({
  title: "Camera",
  category_id: 1,
  daily_rental_price: 50,
  description: "Professional camera",
  // ... other fields
})
\`\`\`

### Categories

\`\`\`typescript
import { categoriesApi } from "@/lib/api-client"

// Get all categories
const response = await categoriesApi.getCategories()

// Get single category
const response = await categoriesApi.getCategory(categoryId)
\`\`\`

### Rentals

\`\`\`typescript
import { rentalsApi } from "@/lib/api-client"

// Create rental
const response = await rentalsApi.createRental({
  item_id: 1,
  rental_start_date: "2024-01-15",
  rental_end_date: "2024-01-20",
  pickup_location: "San Francisco",
  delivery_location: "Oakland",
  insurance_price: 50,
  delivery_price: 25,
  notes: "Please deliver in the morning"
})

// Get user rentals
const response = await rentalsApi.getUserRentals({
  type: "all", // "renter", "owner", or "all"
  status: "pending" // optional
})
\`\`\`

### Users

\`\`\`typescript
import { usersApi } from "@/lib/api-client"

// Get user profile
const response = await usersApi.getProfile(userId)

// Update user profile
const response = await usersApi.updateProfile(userId, {
  first_name: "John",
  last_name: "Doe",
  bio: "I love renting items"
})

// Get user listings
const response = await usersApi.getUserListings(userId)
\`\`\`

## Integrated Components

### Authentication
- ✅ `components/login-form.tsx` - Login with backend
- ✅ `components/register-form.tsx` - Registration with backend

### Browse & Items
- ✅ `components/search-results.tsx` - Fetch items from backend
- ✅ `components/item-details.tsx` - Fetch item details and create rentals

## Remaining Integration Tasks

### Categories & Search
- [ ] Update `components/search-filters.tsx` to fetch categories from backend
- [ ] Implement category filtering in search

### Rentals System
- [ ] Create rental management pages
- [ ] Implement rental status tracking
- [ ] Add rental history

### User Profile & Listings
- [ ] Create user profile page
- [ ] Implement user listings management
- [ ] Add item creation form

## Environment Variables

Add to your `.env.local`:

\`\`\`
NEXT_PUBLIC_API_URL=https://krili-backend.vercel.app/api
\`\`\`

## Error Handling

All API calls include error handling with toast notifications. The API client automatically:
- Logs errors to console
- Throws errors for catch blocks
- Provides error messages in responses

## Token Management

Tokens are automatically:
- Stored in localStorage
- Loaded on app initialization
- Sent with every authenticated request
- Cleared on logout

## Response Format

All API responses follow this format:

\`\`\`typescript
{
  success: boolean
  message?: string
  data?: any
  [key: string]: any // Additional fields like items, pagination, etc.
}
\`\`\`

## Next Steps

1. Set up environment variables
2. Test authentication flow
3. Verify item browsing works
4. Implement remaining features
5. Add error boundaries and loading states
6. Implement caching with SWR
