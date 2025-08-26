"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sun, Moon, Upload } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    idType: "",
    idNumber: "",
    address: "",
    city: "",
    zipCode: "",
  })
  const [files, setFiles] = useState({
    idDocument: null as File | null,
    addressDocument: null as File | null,
  })
  const router = useRouter()

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.body.setAttribute("data-theme", newTheme)
    showNotification(`Switched to ${newTheme} theme`, "success")
  }

  // Notification system
  const showNotification = (message: string, type = "info", duration = 3000) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), duration)
  }

  // Handle form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      showNotification("Passwords do not match", "error")
      return
    }

    if (formData.password.length < 6) {
      showNotification("Password must be at least 6 characters", "error")
      return
    }

    if (!files.idDocument || !files.addressDocument) {
      showNotification("Please upload all required documents", "error")
      return
    }

    setIsLoading(true)
    showNotification("Creating account...", "info")

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      showNotification("Account created successfully! Please check your email for verification.", "success")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }, 2000)
  }

  // Social registration
  const socialRegister = (provider: string) => {
    setIsLoading(true)
    showNotification(`Registering with ${provider}...`, "info")

    setTimeout(() => {
      setIsLoading(false)
      showNotification("Account created successfully!", "success")
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    }, 1500)
  }

  // Handle file uploads
  const handleFileChange = (field: "idDocument" | "addressDocument", file: File | null) => {
    setFiles({ ...files, [field]: file })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          <Button variant="ghost" onClick={toggleTheme} className="gap-2">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            Theme
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Image src="/main.png" alt="KRILI Logo" width={120} height={40} />
              </div>
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <p className="text-muted-foreground">Join KRILI and start renting today</p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                {/* KYC Verification Section */}
                <div className="space-y-6 border-t pt-6">
                  <h3 className="text-lg font-semibold">Identity Verification</h3>

                  <div className="space-y-2">
                    <Label htmlFor="idType">ID Type</Label>
                    <Select
                      value={formData.idType}
                      onValueChange={(value) => setFormData({ ...formData, idType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="idCard">National ID Card</SelectItem>
                        <SelectItem value="driverLicense">Driver's License</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      placeholder="Enter your ID number"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idDocument">Upload ID Document</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="idDocument"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange("idDocument", e.target.files?.[0] || null)}
                        required
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("idDocument")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {files.idDocument ? files.idDocument.name : "Choose File"}
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold pt-4">Address Verification</h3>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter your full address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="ZIP Code"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressDocument">Proof of Address</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="addressDocument"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange("addressDocument", e.target.files?.[0] || null)}
                        required
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("addressDocument")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {files.addressDocument ? files.addressDocument.name : "Choose File"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Utility bill, bank statement, or government document
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button variant="outline" onClick={() => socialRegister("google")} disabled={isLoading}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" onClick={() => socialRegister("facebook")} disabled={isLoading}>
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  )
}
