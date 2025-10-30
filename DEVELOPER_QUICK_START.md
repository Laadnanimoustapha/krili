# Developer Quick Start Guide

## Getting Started

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set Environment Variables
Create `.env.local`:
\`\`\`
NEXT_PUBLIC_API_URL=https://krili-backend.vercel.app/api
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Using the API Client

### Import the API Client
\`\`\`typescript
import { authApi, itemsApi, categoriesApi, rentalsApi, usersApi } from "@/lib/api-client"
\`\`\`

### Example: Login
\`\`\`typescript
const response = await authApi.login("user@example.com", "password")
if (response.success) {
  // User is logged in, token is automatically stored
  router.push("/browse")
}
\`\`\`

### Example: Fetch Items
\`\`\`typescript
const response = await itemsApi.getItems({
  search: "camera",
  category_id: 1,
  page: 1,
  limit: 20
})

if (response.success) {
  const items = response.items
  const pagination = response.pagination
}
\`\`\`

### Example: Create Rental
\`\`\`typescript
const response = await rentalsApi.createRental({
  item_id: 123,
  rental_start_date: "2024-01-15",
  rental_end_date: "2024-01-20"
})

if (response.success) {
  console.log("Rental created:", response.rental_id)
}
\`\`\`

## Component Structure

### Authentication Components
- `components/login-form.tsx` - Login page
- `components/register-form.tsx` - Registration page

### Browse Components
- `components/search-results.tsx` - Item listing with filters
- `components/search-filters.tsx` - Filter sidebar
- `components/item-details.tsx` - Item detail page

### Layout Components
- `components/header.tsx` - Navigation header
- `components/footer.tsx` - Footer

## Common Patterns

### Using Toast Notifications
\`\`\`typescript
import { useToast } from "@/hooks/use-toast"

export function MyComponent() {
  const { toast } = useToast()

  const handleAction = async () => {
    try {
      const response = await someApiCall()
      toast({
        title: "Success",
        description: "Action completed successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    }
  }
}
\`\`\`

### Using Loading States
\`\`\`typescript
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await apiCall()
  } finally {
    setIsLoading(false)
  }
}

return <Button disabled={isLoading}>{isLoading ? "Loading..." : "Submit"}</Button>
\`\`\`

### Using useRouter for Navigation
\`\`\`typescript
import { useRouter } from 'next/navigation'

export function MyComponent() {
  const router = useRouter()

  const handleNavigate = () => {
    router.push("/browse")
  }
}
\`\`\`

## File Structure

\`\`\`
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── login/
│   └── page.tsx            # Login page
├── register/
│   └── page.tsx            # Register page
├── browse/
│   └── page.tsx            # Browse items page
├── item/
│   └── [id]/
│       └── page.tsx        # Item detail page
└── ...

components/
├── login-form.tsx          # Login form
├── register-form.tsx       # Register form
├── search-results.tsx      # Item search results
├── search-filters.tsx      # Search filters
├── item-details.tsx        # Item details
├── header.tsx              # Header navigation
├── footer.tsx              # Footer
└── ui/                     # shadcn/ui components

lib/
├── api-client.ts           # API client
├── utils.ts                # Utility functions
└── product-images.ts       # Image URLs

hooks/
├── use-toast.ts            # Toast hook
└── use-mobile.ts           # Mobile detection hook
\`\`\`

## Debugging Tips

### Check API Responses
\`\`\`typescript
const response = await itemsApi.getItems()
console.log("[API Response]", response)
\`\`\`

### Check Token
\`\`\`typescript
import { apiClient } from "@/lib/api-client"
console.log("[Token]", localStorage.getItem("auth_token"))
\`\`\`

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Look for API requests to `krili-backend.vercel.app`
4. Check response status and body

## Common Errors & Solutions

### "Failed to fetch"
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend

### "Unauthorized" (401)
- Token may have expired
- Try logging in again
- Check localStorage for token

### "Not Found" (404)
- Check if resource exists
- Verify correct ID is being used
- Check API endpoint path

## Performance Tips

1. **Use SWR for Caching**
   \`\`\`typescript
   import useSWR from "swr"
   const { data, error } = useSWR("/api/items", fetcher)
   \`\`\`

2. **Lazy Load Images**
   \`\`\`typescript
   <Image src={url || "/placeholder.svg"} alt="..." loading="lazy" />
   \`\`\`

3. **Debounce Search**
   \`\`\`typescript
   const debouncedSearch = useCallback(
     debounce((query) => fetchItems(query), 300),
     []
   )
   \`\`\`

## Deployment

### Build for Production
\`\`\`bash
npm run build
\`\`\`

### Deploy to Vercel
\`\`\`bash
vercel deploy
\`\`\`

### Environment Variables
Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL=https://krili-backend.vercel.app/api`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## Support

For issues or questions:
1. Check the integration guide
2. Review error messages in console
3. Check network requests in DevTools
4. Review API response format
5. Check backend logs

## Next Steps

1. Implement remaining features
2. Add comprehensive testing
3. Optimize performance
4. Deploy to production
5. Monitor and maintain
