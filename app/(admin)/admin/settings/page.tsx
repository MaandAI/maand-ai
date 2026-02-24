"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Save } from "lucide-react"
import { useState } from "react"

function AdminSettingsContent() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [newUserRegistration, setNewUserRegistration] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">Manage platform configuration and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure global platform behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Temporarily disable access to the platform</p>
            </div>
            <Switch id="maintenance" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="registration">New User Registration</Label>
              <p className="text-sm text-muted-foreground">Allow new users to create accounts</p>
            </div>
            <Switch id="registration" checked={newUserRegistration} onCheckedChange={setNewUserRegistration} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send automated email notifications</p>
            </div>
            <Switch id="notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>Configure system-level settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxUsers">Max Active Users</Label>
            <Input id="maxUsers" type="number" defaultValue="10000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input id="sessionTimeout" type="number" defaultValue="60" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input id="apiKey" type="password" defaultValue="sk_live_xxxxxxxxxxxxx" />
          </div>

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage security and access controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Configure 2FA</Button>
          <Button variant="outline">Manage IP Whitelist</Button>
          <Button variant="outline">View Audit Logs</Button>
          <Separator className="my-4" />
          <Button variant="destructive">Reset All Sessions</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminSettingsContent />
    </ProtectedRoute>
  )
}
