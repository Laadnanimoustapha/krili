"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Filter, X, Loader2 } from "lucide-react"
import { categoriesApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: number
  name: string
  slug: string
}

const conditions = ["New", "Like New", "Good", "Fair"]

interface SearchFiltersProps {
  onFilterChange?: (filters: {
    priceRange: number[]
    selectedCategories: number[]
    selectedConditions: string[]
    city: string
  }) => void
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const { toast } = useToast()
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [city, setCity] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const response = await categoriesApi.getCategories()

        if (response.success && response.categories) {
          setCategories(response.categories)
        } else {
          toast({
            title: "Error",
            description: "Failed to load categories",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        selectedCategories,
        selectedConditions,
        city,
      })
    }
  }, [priceRange, selectedCategories, selectedConditions, city, onFilterChange])

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryId))
    }
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions([...selectedConditions, condition])
    } else {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition))
    }
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedConditions([])
    setPriceRange([0, 500])
    setCity("")
  }

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Enter city or zip code"
              className="pl-10"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Within 5 miles</SelectItem>
              <SelectItem value="10">Within 10 miles</SelectItem>
              <SelectItem value="25">Within 25 miles</SelectItem>
              <SelectItem value="50">Within 50 miles</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Price Range (per day)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="w-full" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories available</p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                />
                <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                  {category.name}
                </Label>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Condition */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conditions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={condition}
                checked={selectedConditions.includes(condition)}
                onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
              />
              <Label htmlFor={condition} className="text-sm font-normal cursor-pointer">
                {condition}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="available-now" />
            <Label htmlFor="available-now" className="text-sm font-normal cursor-pointer">
              Available Now
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="instant-book" />
            <Label htmlFor="instant-book" className="text-sm font-normal cursor-pointer">
              Instant Book
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
