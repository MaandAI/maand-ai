"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Settings, Info } from "lucide-react"
import { AvatarDisplay } from "@/components/avatar/avatar-display"
import { StateIndicator } from "@/components/avatar/state-indicator"
import { type AvatarState, type AvatarTone, TONE_DESCRIPTIONS } from "@/lib/mock/avatar-states"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function AvatarPage() {
  const [avatarEnabled, setAvatarEnabled] = useState(true)
  const [avatarState, setAvatarState] = useState<AvatarState>("calm")
  const [avatarTone, setAvatarTone] = useState<AvatarTone>("supportive")
  const [empathy, setEmpathy] = useState([80])
  const [directness, setDirectness] = useState([60])

  useEffect(() => {
    if (!avatarEnabled) return

    const interval = setInterval(() => {
      // Simulate random state changes based on "user activity"
      const states: AvatarState[] = ["calm", "supportive", "reflective", "listening", "thinking"]
      const randomState = states[Math.floor(Math.random() * states.length)]
      setAvatarState(randomState)
    }, 8000) // Change state every 8 seconds

    return () => clearInterval(interval)
  }, [avatarEnabled])

  const handleReset = () => {
    setEmpathy([80])
    setDirectness([60])
    setAvatarTone("supportive")
    setAvatarEnabled(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Therapy Avatar</h1>
        <p className="text-muted-foreground mt-2">
          Meet your AI companion designed to support your mental wellness journey
        </p>
      </div>

      {avatarEnabled && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Luna responds to your conversations with subtle emotional states. Her reactions help create a more
            empathetic therapy experience.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Avatar Display Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Your Therapy Companion</CardTitle>
            <CardDescription>AI-powered support tailored to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <AvatarDisplay state={avatarState} enabled={avatarEnabled} size="md" />
            </div>

            {avatarEnabled && <StateIndicator state={avatarState} />}

            {/* Avatar Description */}
            <div className="space-y-3 text-center">
              <h3 className="font-semibold text-lg">Luna</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Luna is your compassionate AI therapy companion, trained to provide evidence-based support using
                cognitive behavioral therapy (CBT) techniques. She&apos;s here to listen without judgment and guide you
                through your mental wellness journey.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-primary">47</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-xs text-muted-foreground">Days Active</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-primary">89%</p>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Start Session
            </Button>
          </CardContent>
        </Card>

        {/* Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Avatar Settings
            </CardTitle>
            <CardDescription>Customize your therapy companion experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="avatar-toggle" className="text-base font-semibold">
                    Enable Avatar
                  </Label>
                  <p className="text-xs text-muted-foreground">Turn Luna on or off during sessions</p>
                </div>
                <Switch id="avatar-toggle" checked={avatarEnabled} onCheckedChange={setAvatarEnabled} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base">Conversation Tone</Label>
                <p className="text-sm text-muted-foreground">Choose how Luna communicates with you</p>
              </div>

              <RadioGroup value={avatarTone} onValueChange={(value) => setAvatarTone(value as AvatarTone)}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 rounded-lg border-2 border-muted hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="supportive" id="tone-supportive" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="tone-supportive" className="font-semibold cursor-pointer">
                        Supportive
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{TONE_DESCRIPTIONS.supportive}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg border-2 border-muted hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="neutral" id="tone-neutral" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="tone-neutral" className="font-semibold cursor-pointer">
                        Neutral
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{TONE_DESCRIPTIONS.neutral}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg border-2 border-muted hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="motivating" id="tone-motivating" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="tone-motivating" className="font-semibold cursor-pointer">
                        Motivating
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{TONE_DESCRIPTIONS.motivating}</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Communication Style */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Communication Style</Label>
                <p className="text-sm text-muted-foreground">Adjust how Luna interacts with you</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="empathy">Empathy Level</Label>
                    <p className="text-xs text-muted-foreground">How warm and supportive</p>
                  </div>
                  <div className="w-32">
                    <Slider value={empathy} onValueChange={setEmpathy} max={100} step={1} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="directness">Directness</Label>
                    <p className="text-xs text-muted-foreground">How straightforward</p>
                  </div>
                  <div className="w-32">
                    <Slider value={directness} onValueChange={setDirectness} max={100} step={1} />
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <Label className="text-base">Features</Label>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="proactive">Proactive Check-ins</Label>
                    <p className="text-xs text-muted-foreground">Luna initiates conversations</p>
                  </div>
                  <Switch id="proactive" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminders">Daily Reminders</Label>
                    <p className="text-xs text-muted-foreground">Gentle nudges for practice</p>
                  </div>
                  <Switch id="reminders" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="crisis">Crisis Detection</Label>
                    <p className="text-xs text-muted-foreground">Alert for urgent support</p>
                  </div>
                  <Switch id="crisis" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="voice">Voice Responses</Label>
                    <p className="text-xs text-muted-foreground">Audio feedback option</p>
                  </div>
                  <Switch id="voice" />
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" onClick={handleReset}>
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
