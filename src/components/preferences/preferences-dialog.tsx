"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { usePersonalization } from "@/lib/personalization/context"

export function PreferencesDialog() {
  const { preferences, updatePreference } = usePersonalization()
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    preferences.find(
      (pref) => pref.category === "notifications" && pref.setting === "enabled"
    )?.value || false
  )
  const [compactView, setCompactView] = useState(
    preferences.find(
      (pref) => pref.category === "layout" && pref.setting === "compact"
    )?.value || false
  )

  const handleNotificationsChange = async (checked: boolean) => {
    setNotificationsEnabled(checked)
    await updatePreference("notifications", "enabled", checked)
  }

  const handleCompactViewChange = async (checked: boolean) => {
    setCompactView(checked)
    await updatePreference("layout", "compact", checked)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Preferences</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
          <DialogDescription>
            Customize your experience with personalized settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your tasks and activities
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationsChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact">Compact View</Label>
              <p className="text-sm text-muted-foreground">
                Display more content with reduced spacing
              </p>
            </div>
            <Switch
              id="compact"
              checked={compactView}
              onCheckedChange={handleCompactViewChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" variant="ghost">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
