"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Mail, MessageSquare, Phone, MapPin } from "lucide-react"
import Link from "next/link"

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

    // Mock API call
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
      icon: Phone,
      title: "Phone",
      content: "+1 (555) 123-4567",
      description: "Monday - Friday, 9am - 5pm EST",
    },
    {
      icon: MapPin,
      title: "Location",
      content: "San Francisco, CA",
      description: "Remote-first team",
    },
  ]

  const supportTopics = [
    {
      icon: MessageSquare,
      title: "General Inquiries",
      description: "Questions about our platform, features, or launch timeline",
    },
    {
      icon: Mail,
      title: "Partnership Opportunities",
      description: "Clinical partnerships, research collaborations, or business inquiries",
    },
    {
      icon: Phone,
      title: "Technical Support",
      description: "Help with your account, billing, or technical issues",
    },
  ]

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center py-16">
        <div className="container max-w-2xl px-4 md:px-6">
          <Card className="border-2 border-primary">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Message Received!</h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out, <strong>{formData.name}</strong>. We've received your message and will
                respond to <strong>{formData.email}</strong> within 24 hours.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Confirmation email sent</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Our team has been notified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Average response time: 8 hours</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/">Return Home</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/modules">Explore Modules</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              We're Here to Help
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions about Maand? Want to learn more about our platform? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                    {isLoading ? "Sending..." : "Send Message"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting this form, you agree to our privacy policy. We'll never share your information.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
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

              <Card>
                <CardHeader>
                  <CardTitle>How Can We Help?</CardTitle>
                  <CardDescription>Common reasons people reach out</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supportTopics.map((topic, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <topic.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">{topic.title}</h4>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Callout */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Looking for Quick Answers?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Many common questions are answered in our modules section or on our waitlist page
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" size="lg">
              <Link href="/modules">View Modules</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/waitlist">Join Waitlist</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
