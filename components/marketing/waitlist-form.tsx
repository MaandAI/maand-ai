"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export function WaitlistForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Application Submitted</h3>
          <p className="text-muted-foreground">Thank you for your interest in Maand! We will contact you soon.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Join Our Priority Waitlist</CardTitle>
        <CardDescription>Be among the first to access our clinically validated platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter your full name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="your.email@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest">Primary Interest</Label>
            <Select required>
              <SelectTrigger id="interest">
                <SelectValue placeholder="Select your interest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Use</SelectItem>
                <SelectItem value="professional">Professional/Clinical Use</SelectItem>
                <SelectItem value="research">Research Partnership</SelectItem>
                <SelectItem value="investment">Investment Opportunity</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea id="message" placeholder="Tell us more about your interest..." rows={4} />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Join Priority Waitlist"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
