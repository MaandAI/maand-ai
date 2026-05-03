"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Check, CreditCard, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function BillingContent() {
  const { profile: currentUser } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Basic AI Therapy Sessions",
        "Progress Tracking",
        "Community Access",
        "Email Support",
      ],
      current: (currentUser?.subscription || "free") === "free",
    },
    {
      name: "Basic",
      price: "$29",
      period: "per month",
      features: [
        "Everything in Free",
        "Unlimited Therapy Sessions",
        "Advanced Progress Analytics",
        "Priority Support",
        "Mobile App Access",
      ],
      current: currentUser?.subscription === "basic",
      popular: false,
    },
    {
      name: "Pro",
      price: "$79",
      period: "per month",
      features: [
        "Everything in Basic",
        "VR Therapy Environments",
        "Personalized Treatment Plans",
        "1-on-1 Clinical Supervision",
        "API Access",
        "Advanced Integrations",
      ],
      current: currentUser?.subscription === "pro",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      features: [
        "Everything in Pro",
        "Dedicated Account Manager",
        "Custom Integrations",
        "HIPAA Compliance",
        "Bulk Licensing",
        "Advanced Security",
      ],
      current: currentUser?.subscription === "enterprise",
    },
  ];

  const invoices = [
    { id: "INV-001", date: "2024-03-01", amount: "$79.00", status: "Paid" },
    { id: "INV-002", date: "2024-02-01", amount: "$79.00", status: "Paid" },
    { id: "INV-003", date: "2024-01-01", amount: "$79.00", status: "Paid" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
        <p className="text-xs text-blue-500 mt-2 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 max-w-fit">
          Demo Mode: Billing integration is simulated for this showcase.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the {currentUser?.subscription || "free"} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">
                {currentUser?.subscription || "free"} Plan
              </p>
              <p className="text-sm text-muted-foreground">
                Next billing date: April 1, 2024
              </p>
            </div>
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? "border-primary border-2" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.popular && <Badge>Popular</Badge>}
                  {plan.current && <Badge variant="secondary">Current</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/2025</p>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
          <Button variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="font-medium">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.date}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{invoice.status}</Badge>
                  <p className="font-medium">{invoice.amount}</p>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}
