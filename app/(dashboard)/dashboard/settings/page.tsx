"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Eye, Volume2, Languages } from "lucide-react"

function SettingsContent() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)

  const [highContrast, setHighContrast] = useState(false)
  const [screenReaderMode, setScreenReaderMode] = useState(false)
  const [voiceNavigation, setVoiceNavigation] = useState(false)
  const [accessibilityLanguage, setAccessibilityLanguage] = useState("en")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
        <p className="text-xs text-amber-500 mt-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 max-w-fit">
          Note: These settings are currently in preview and will be persisted in a future update.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
            </div>
            <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-reports">Weekly Progress Reports</Label>
              <p className="text-sm text-muted-foreground">Get weekly summaries of your progress</p>
            </div>
            <Switch id="weekly-reports" checked={weeklyReports} onCheckedChange={setWeeklyReports} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select defaultValue="utc">
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">Eastern Time</SelectItem>
                <SelectItem value="pst">Pacific Time</SelectItem>
                <SelectItem value="gmt">GMT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>Manage your privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">Two-Factor Authentication</Button>
          <Button variant="outline">Download Your Data</Button>
          <Separator className="my-4" />
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>Customize the app for your accessibility needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
              </div>
              <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
            </div>
            <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="screen-reader">Screen Reader Optimizations</Label>
              </div>
              <p className="text-sm text-muted-foreground">Enhanced support for screen readers</p>
              {screenReaderMode && <p className="text-xs text-primary mt-1 font-medium">✓ Screen reader mode active</p>}
            </div>
            <Switch id="screen-reader" checked={screenReaderMode} onCheckedChange={setScreenReaderMode} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="voice-navigation">Voice Navigation (Beta)</Label>
              </div>
              <p className="text-sm text-muted-foreground">Navigate the app using voice commands</p>
            </div>
            <Switch id="voice-navigation" checked={voiceNavigation} onCheckedChange={setVoiceNavigation} />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="accessibility-language">Accessibility Language</Label>
            </div>
            <Select value={accessibilityLanguage} onValueChange={setAccessibilityLanguage}>
              <SelectTrigger id="accessibility-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español (Spanish)</SelectItem>
                <SelectItem value="fr">Français (French)</SelectItem>
                <SelectItem value="de">Deutsch (German)</SelectItem>
                <SelectItem value="zh">中文 (Chinese)</SelectItem>
                <SelectItem value="ar">العربية (Arabic)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Set language for accessibility features and screen reader output
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}
