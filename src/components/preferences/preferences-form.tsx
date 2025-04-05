"use client"

import React from "react"
import { useState } from "react"
import { usePersonalization } from "@/lib/personalization/context"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

interface PreferenceCategory {
  id: string
  name: string
  settings: {
    id: string
    name: string
    type: "toggle" | "select"
    options?: string[]
  }[]
}

const defaultCategories: PreferenceCategory[] = [
  {
    id: "interface",
    name: "Interface Preferences",
    settings: [
      {
        id: "autoAdapt",
        name: "Adaptive Interface",
        type: "toggle"
      },
      {
        id: "layout",
        name: "Default Layout",
        type: "select",
        options: ["Compact", "Comfortable", "Spacious"]
      }
    ]
  },
  {
    id: "notifications",
    name: "Notification Preferences",
    settings: [
      {
        id: "smartNotifications",
        name: "AI-Powered Notifications",
        type: "toggle"
      },
      {
        id: "frequency",
        name: "Notification Frequency",
        type: "select",
        options: ["Low", "Medium", "High"]
      }
    ]
  }
]

export function PreferencesForm() {
  const { preferences, updatePreference, loading } = usePersonalization()
  const [saving, setSaving] = useState(false)

  const handleToggleChange = async (
    category: string,
    setting: string,
    checked: boolean
  ) => {
    setSaving(true)
    try {
      await updatePreference(category, setting, checked)
    } catch (error) {
      console.error("Error updating preference:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectChange = async (
    category: string,
    setting: string,
    value: string
  ) => {
    setSaving(true)
    try {
      await updatePreference(category, setting, value)
    } catch (error) {
      console.error("Error updating preference:", error)
    } finally {
      setSaving(false)
    }
  }

  const getPreferenceValue = (category: string, setting: string) => {
    const preference = preferences.find(
      (p) => p.category === category && p.setting === setting
    )
    return preference?.value
  }

  if (loading) {
    return <div>Loading preferences...</div>
  }

  return (
    <div className="space-y-6">
      {defaultCategories.map((category) => (
        <Card key={category.id} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
          <div className="space-y-4">
            {category.settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between"
              >
                <Label htmlFor={setting.id}>{setting.name}</Label>
                {setting.type === "toggle" ? (
                  <Switch
                    id={setting.id}
                    checked={
                      getPreferenceValue(category.id, setting.id) ?? false
                    }
                    onCheckedChange={(checked) =>
                      handleToggleChange(category.id, setting.id, checked)
                    }
                    disabled={saving}
                  />
                ) : (
                  <Select
                    value={
                      getPreferenceValue(category.id, setting.id) ??
                      setting.options?.[0]
                    }
                    onValueChange={(value) =>
                      handleSelectChange(category.id, setting.id, value)
                    }
                    disabled={saving}
                  >
                    {setting.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
