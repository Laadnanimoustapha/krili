"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, CheckCircle, AlertCircle, Clock, Camera, FileText, MapPin, Phone, Mail } from "lucide-react"

export default function KYCPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationStatus, setVerificationStatus] = useState({
    identity: "pending",
    address: "pending",
    phone: "verified",
    email: "verified",
    selfie: "pending",
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const completedSteps = Object.values(verificationStatus).filter((status) => status === "verified").length
  const totalSteps = Object.keys(verificationStatus).length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-muted-foreground">
          Complete your identity verification to unlock all features and increase trust with other users.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Verification Progress
            <Badge variant="outline">
              {completedSteps}/{totalSteps} Complete
            </Badge>
          </CardTitle>
          <CardDescription>Complete all verification steps to become a trusted member</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(verificationStatus.email)}
              <span className="text-sm">Email</span>
              {getStatusBadge(verificationStatus.email)}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(verificationStatus.phone)}
              <span className="text-sm">Phone</span>
              {getStatusBadge(verificationStatus.phone)}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(verificationStatus.identity)}
              <span className="text-sm">Identity</span>
              {getStatusBadge(verificationStatus.identity)}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(verificationStatus.address)}
              <span className="text-sm">Address</span>
              {getStatusBadge(verificationStatus.address)}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(verificationStatus.selfie)}
              <span className="text-sm">Selfie</span>
              {getStatusBadge(verificationStatus.selfie)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Identity
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address
          </TabsTrigger>
          <TabsTrigger value="selfie" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Selfie
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact
          </TabsTrigger>
        </TabsList>

        {/* Identity Verification */}
        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Identity Document Verification
                {getStatusBadge(verificationStatus.identity)}
              </CardTitle>
              <CardDescription>
                Upload a clear photo of your government-issued ID, passport, or driver's license
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="national-id">National ID Card</SelectItem>
                    <SelectItem value="drivers-license">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Front Side</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload front side</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Back Side</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload back side</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips for better verification:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ensure all text is clearly visible and readable</li>
                  <li>• Take photos in good lighting conditions</li>
                  <li>• Avoid glare and shadows on the document</li>
                  <li>• Make sure the entire document fits in the frame</li>
                </ul>
              </div>

              <Button className="w-full">Submit Identity Documents</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Verification */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Verification
                {getStatusBadge(verificationStatus.address)}
              </CardTitle>
              <CardDescription>
                Upload a recent utility bill, bank statement, or official document showing your address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address-document-type">Document Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility-bill">Utility Bill</SelectItem>
                    <SelectItem value="bank-statement">Bank Statement</SelectItem>
                    <SelectItem value="rental-agreement">Rental Agreement</SelectItem>
                    <SelectItem value="tax-document">Tax Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Upload Document</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload address proof</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address-line-1">Address Line 1</Label>
                  <Input id="address-line-1" placeholder="Street address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-line-2">Address Line 2 (Optional)</Label>
                  <Input id="address-line-2" placeholder="Apartment, suite, etc." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" placeholder="State" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal-code">Postal Code</Label>
                    <Input id="postal-code" placeholder="Postal code" />
                  </div>
                </div>
              </div>

              <Button className="w-full">Submit Address Verification</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Selfie Verification */}
        <TabsContent value="selfie">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Selfie Verification
                {getStatusBadge(verificationStatus.selfie)}
              </CardTitle>
              <CardDescription>
                Take a selfie while holding your identity document for additional security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Upload Selfie with Document</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to take or upload selfie</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Selfie Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Hold your identity document next to your face</li>
                  <li>• Ensure your face is clearly visible and well-lit</li>
                  <li>• Look directly at the camera</li>
                  <li>• Remove sunglasses or hats that obscure your face</li>
                  <li>• Make sure the document details are readable</li>
                </ul>
              </div>

              <Button className="w-full">Submit Selfie Verification</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Verification */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Verification
              </CardTitle>
              <CardDescription>Verify your phone number and email address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Verified
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800 dark:text-green-200">Contact Verification Complete</h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your email and phone number have been successfully verified.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
