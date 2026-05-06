"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Mail, MessageSquare, Phone, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SectionWrapper } from "@/components/features/shared/section-wrapper"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "support@maand.tech",
      description: "We typically respond within 24 hours",
    },
    {
      icon: MessageSquare,
      title: "Chat Support",
      content: "Available in Dashboard",
      description: "Priority support for registered users",
    },
    {
      icon: MapPin,
      title: "Location",
      content: "Global Team",
      description: "Remote-first clinical research",
    },
  ]

  if (isSubmitted) {
    return (
      <SectionWrapper className="min-h-[80vh] flex items-center justify-center">
        <Card className="border-2 border-primary w-full max-w-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Message Received!</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Thank you for reaching out, <strong>{formData.name}</strong>. We've received your message and will
              respond to <strong>{formData.email}</strong> within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">About Our Mission</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </SectionWrapper>
    )
  }

  return (
    <div className="flex flex-col">
      <SectionWrapper>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
            We're Here to Help
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have questions about Maand? Want to learn more about our platform? We'd love to hear from you.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper backgroundColor="muted">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="What's this about?" value={formData.subject} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Tell us more about your inquiry..." value={formData.message} onChange={handleChange} required disabled={isLoading} rows={6} className="resize-none" />
                </div>
                <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
                <CardDescription>Multiple ways to reach our team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{info.title}</h3>
                      <p className="text-foreground mb-1">{info.content}</p>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Clinical Research</CardTitle>
                <CardDescription>For institutional partners</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you are interested in our clinical validation process or want to discuss research collaborations, please mention "Research" in your subject line.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionWrapper>
    </div>
  )
}
