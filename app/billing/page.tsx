"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react"

export default function BillingPage() {
  const [walletBalance] = useState(2450.75)
  const [pendingEarnings] = useState(320.5)

  const transactions = [
    {
      id: "1",
      type: "earning",
      amount: 150.0,
      description: "Rental payment - MacBook Pro",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      type: "withdrawal",
      amount: -200.0,
      description: "Bank withdrawal",
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: "3",
      type: "payment",
      amount: -75.0,
      description: "Wishlist purchase - Camera Lens",
      date: "2024-01-13",
      status: "completed",
    },
    {
      id: "4",
      type: "earning",
      amount: 89.5,
      description: "Rental payment - Bike",
      date: "2024-01-12",
      status: "pending",
    },
  ]

  const paymentMethods = [
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      isDefault: true,
    },
    {
      id: "2",
      type: "card",
      last4: "8888",
      brand: "Mastercard",
      isDefault: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Wallet</h1>
          <p className="text-muted-foreground">Manage your payments, earnings, and wallet balance</p>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${walletBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">${pendingEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Processing payments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">$1,234.50</div>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Money */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-500" />
                    Add Money
                  </CardTitle>
                  <CardDescription>Add funds to your wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-amount">Amount</Label>
                    <Input id="add-amount" placeholder="0.00" type="number" />
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                </CardContent>
              </Card>

              {/* Withdraw Money */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Minus className="h-5 w-5 text-red-500" />
                    Withdraw Money
                  </CardTitle>
                  <CardDescription>Transfer funds to your bank account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount</Label>
                    <Input id="withdraw-amount" placeholder="0.00" type="number" />
                  </div>
                  <p className="text-sm text-muted-foreground">Available: ${walletBalance.toFixed(2)}</p>
                  <Button variant="outline" className="w-full bg-transparent">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw Funds
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "earning"
                              ? "bg-green-500/10"
                              : transaction.type === "withdrawal"
                                ? "bg-blue-500/10"
                                : "bg-red-500/10"
                          }`}
                        >
                          {transaction.type === "earning" ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          ) : transaction.type === "withdrawal" ? (
                            <ArrowUpRight className="h-4 w-4 text-blue-500" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                          {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                          {transaction.status === "completed" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {method.brand} •••• {method.last4}
                        </p>
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Separator />
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wishlist Payments</CardTitle>
                <CardDescription>Pay for items in your wishlist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div>
                        <p className="font-medium">Professional Camera</p>
                        <p className="text-sm text-muted-foreground">3 days rental</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$89.99</p>
                      <Button size="sm" className="mt-1">
                        Pay Now
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div>
                        <p className="font-medium">Mountain Bike</p>
                        <p className="text-sm text-muted-foreground">1 week rental</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$125.00</p>
                      <Button size="sm" className="mt-1">
                        Pay Now
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Total Wishlist Value</p>
                      <p className="text-sm text-muted-foreground">2 items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">$214.99</p>
                      <Button className="mt-2">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay All
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
