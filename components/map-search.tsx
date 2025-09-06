"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Navigation, ZoomIn, ZoomOut, Layers } from "lucide-react"

// Mock map data with coordinates
const mapItems = [
  {
    id: 1,
    title: "Professional DSLR Camera Kit",
    price: 45,
    rating: 4.9,
    location: "San Francisco, CA",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    category: "Photography",
    available: true,
  },
  {
    id: 2,
    title: "Power Drill Set with Bits",
    price: 25,
    rating: 4.7,
    location: "Oakland, CA",
    coordinates: { lat: 37.8044, lng: -122.2712 },
    category: "Tools & Equipment",
    available: true,
  },
  {
    id: 3,
    title: "Mountain Bike - Trek X-Caliber",
    price: 35,
    rating: 4.8,
    location: "Berkeley, CA",
    coordinates: { lat: 37.8715, lng: -122.273 },
    category: "Sports & Recreation",
    available: false,
  },
  {
    id: 4,
    title: "Gaming Setup - PS5 Console",
    price: 40,
    rating: 4.9,
    location: "San Jose, CA",
    coordinates: { lat: 37.3382, lng: -121.8863 },
    category: "Gaming",
    available: true,
  },
]

export function MapSearch() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 })
  const [zoomLevel, setZoomLevel] = useState(10)

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Map View</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Navigation className="h-4 w-4 mr-2" />
            My Location
          </Button>
          <Button variant="outline" size="sm">
            <Layers className="h-4 w-4 mr-2" />
            Satellite
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, #9C92AC 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 18))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Map Markers */}
          {mapItems.map((item) => (
            <div
              key={item.id}
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                left: `${((item.coordinates.lng + 122.5) / 1.5) * 100}%`,
                top: `${((37.9 - item.coordinates.lat) / 0.6) * 100}%`,
              }}
              onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
            >
              <div className={`relative ${selectedItem === item.id ? "z-20" : "z-10"}`}>
                {/* Marker Pin */}
                <div
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 ${
                    item.available
                      ? selectedItem === item.id
                        ? "bg-primary scale-125"
                        : "bg-primary hover:bg-primary/90"
                      : "bg-muted-foreground"
                  }`}
                >
                  <MapPin className="h-4 w-4 text-white" />
                </div>

                {/* Price Badge */}
                <Badge
                  className={`absolute -top-2 -right-2 text-xs px-1.5 py-0.5 transition-all duration-200 ${
                    selectedItem === item.id ? "scale-110" : ""
                  }`}
                  variant={item.available ? "default" : "secondary"}
                >
                  ${item.price}
                </Badge>

                {/* Item Details Popup */}
                {selectedItem === item.id && (
                  <Card className="absolute top-10 left-1/2 transform -translate-x-1/2 w-64 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{item.rating}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">${item.price}</p>
                            <p className="text-xs text-muted-foreground">per day</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <Button size="sm" className="text-xs h-7" disabled={!item.available}>
                            {item.available ? "View Details" : "Unavailable"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ))}

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Available Items</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                <span>Unavailable</span>
              </div>
            </div>
          </div>

          {/* Search Area Button */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Button
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm shadow-lg hover:scale-105 transition-all duration-200"
            >
              Search This Area
            </Button>
          </div>
        </div>
      </Card>

      {/* Map Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{mapItems.filter((item) => item.available).length} available items in this area</span>
        <Button variant="ghost" size="sm" className="text-xs">
          Expand Search Area
        </Button>
      </div>
    </div>
  )
}
