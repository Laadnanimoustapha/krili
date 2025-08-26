"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Phone, Mail, HelpCircle, BookOpen, Users } from "lucide-react"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqs = [
    {
      question: "How do I rent an item?",
      answer:
        "To rent an item, browse our catalog, select the item you want, choose your rental dates, and complete the booking process. You'll receive confirmation details via email.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, and PayPal. Payment is processed securely through our platform when you confirm your booking.",
    },
    {
      question: "How do I list my item for rent?",
      answer:
        "Click on 'List Item' in the navigation, fill out the item details, upload photos, set your pricing, and submit for review. Your item will be live within 24 hours after approval.",
    },
    {
      question: "What if an item gets damaged during rental?",
      answer:
        "All rentals are covered by our protection policy. Report any damage immediately through the app. We'll assess the situation and handle repairs or replacements as needed.",
    },
    {
      question: "How do I cancel a booking?",
      answer:
        "You can cancel bookings up to 24 hours before the rental start time through your profile dashboard. Cancellation fees may apply depending on the timing.",
    },
    {
      question: "How do I contact the item owner?",
      answer:
        "Use our built-in messaging system to communicate with item owners. This keeps all communication secure and documented within our platform.",
    },
  ]

  const guides = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using KRILI platform",
      category: "Beginner",
      readTime: "5 min",
    },
    {
      title: "How to List Items",
      description: "Step-by-step guide to listing your items for rent",
      category: "Listing",
      readTime: "8 min",
    },
    {
      title: "Safety Guidelines",
      description: "Best practices for safe rentals",
      category: "Safety",
      readTime: "6 min",
    },
    {
      title: "Payment & Pricing",
      description: "Understanding payments, fees, and pricing strategies",
      category: "Finance",
      readTime: "7 min",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How can we help you?</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Find answers to your questions or get in touch with our support team
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-300">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guides.map((guide, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{guide.category}</Badge>
                      <span className="text-sm text-gray-500">{guide.readTime}</span>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {guide.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{guide.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <MessageCircle className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">Live Chat</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Available 24/7</p>
                    </div>
                    <Button className="ml-auto">Start Chat</Button>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Mail className="w-8 h-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Email Support</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">support@krili.com</p>
                    </div>
                    <Button variant="outline" className="ml-auto bg-transparent">
                      Send Email
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Phone className="w-8 h-8 text-purple-500" />
                    <div>
                      <h3 className="font-semibold">Phone Support</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">+212 5 22 00 00 00</p>
                    </div>
                    <Button variant="outline" className="ml-auto bg-transparent">
                      Call Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input placeholder="What can we help you with?" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea placeholder="Describe your issue or question..." rows={6} />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Community Forum</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Connect with other users, share tips, and get advice from the community.
                    </p>
                    <Button variant="outline">Visit Forum</Button>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Video Tutorials</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Watch step-by-step video guides to make the most of KRILI.
                    </p>
                    <Button variant="outline">Watch Videos</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
