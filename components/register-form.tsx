"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    agreeToMarketing: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "email":
        return value && /\S+@\S+\.\S+/.test(value)
      case "password":
        return value.length >= 8
      case "confirmPassword":
        return value === formData.password
      case "firstName":
      case "lastName":
        return value.length >= 2
      case "phone":
        return value.length >= 10
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeToTerms) {
      const form = e.currentTarget as HTMLFormElement
      form.classList.add("animate-shake")
      setTimeout(() => form.classList.remove("animate-shake"), 500)
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-4 group">
          <div className="relative">
            <Image
              src="https://laadnanimoustapha.github.io/krili/public/Assests/logo.ico"
              alt="Krili Logo"
              width={40}
              height={40}
              className="rounded group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-primary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          </div>
          <span className="text-2xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">
            Krili
          </span>
        </Link>
        <h1 className="text-3xl font-bold animate-in fade-in slide-in-from-top-2 duration-500 delay-200">
          Create Account
        </h1>
        <p className="text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-500 delay-300">
          Join the rental marketplace community
        </p>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400 hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-300 delay-500">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  First Name
                  {formData.firstName && validateField("firstName", formData.firstName) && (
                    <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in scale-in duration-200" />
                  )}
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`transition-all duration-200 ${
                    formData.firstName && validateField("firstName", formData.firstName)
                      ? "border-green-500 focus:border-green-500"
                      : ""
                  }`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  Last Name
                  {formData.lastName && validateField("lastName", formData.lastName) && (
                    <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in scale-in duration-200" />
                  )}
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`transition-all duration-200 ${
                    formData.lastName && validateField("lastName", formData.lastName)
                      ? "border-green-500 focus:border-green-500"
                      : ""
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300 delay-600">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email Address
                {formData.email && validateField("email", formData.email) && (
                  <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in scale-in duration-200" />
                )}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`transition-all duration-200 ${
                  formData.email && validateField("email", formData.email)
                    ? "border-green-500 focus:border-green-500"
                    : ""
                }`}
              />
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300 delay-700">
              <Label htmlFor="phone" className="flex items-center gap-2">
                Phone Number
                {formData.phone && validateField("phone", formData.phone) && (
                  <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in scale-in duration-200" />
                )}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`transition-all duration-200 ${
                  formData.phone && validateField("phone", formData.phone)
                    ? "border-green-500 focus:border-green-500"
                    : ""
                }`}
              />
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300 delay-800">
              <Label htmlFor="password" className="flex items-center gap-2">
                Password
                {formData.password && validateField("password", formData.password) && (
                  <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in scale-in duration-200" />
                )}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`transition-all duration-200 ${
                    formData.password && validateField("password", formData.password)
                      ? "border-green-500 focus:border-green-500"
                      : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent group"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  ) : (
                    <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  )}
                </Button>
              </div>
              {formData.password && (
                <div className="text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div
                    className={`flex items-center gap-2 ${formData.password.length >= 8 ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${formData.password.length >= 8 ? "bg-green-500" : "bg-muted"} transition-colors duration-200`}
                    />
                    At least 8 characters
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300 delay-900">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                Confirm Password
                {formData.confirmPassword && validateField("confirmPassword", formData.confirmPassword) && (
                  <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in scale-in duration-200" />
                )}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`transition-all duration-200 ${
                    formData.confirmPassword && validateField("confirmPassword", formData.confirmPassword)
                      ? "border-green-500 focus:border-green-500"
                      : formData.confirmPassword && !validateField("confirmPassword", formData.confirmPassword)
                        ? "border-destructive focus:border-destructive"
                        : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent group"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  ) : (
                    <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-1000">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  className="transition-all duration-200"
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline transition-colors duration-200">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={formData.agreeToMarketing}
                  onCheckedChange={(checked) => handleInputChange("agreeToMarketing", checked as boolean)}
                  className="transition-all duration-200"
                />
                <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer leading-relaxed">
                  I'd like to receive marketing emails about new features and promotions
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!formData.agreeToTerms || isLoading}
              loading={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="bg-muted/50 p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300 delay-1100 hover:bg-muted/70 transition-colors duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">KYC Verification Required</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To ensure safety and trust, all users must complete identity verification after registration. This helps
                protect our community.
              </p>
            </div>

            <div className="text-center text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 delay-1200">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium transition-colors duration-200">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
