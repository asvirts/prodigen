import { Metadata } from "next"
import { PreferencesForm } from "@/components/preferences/preferences-form"

export const metadata: Metadata = {
  title: "Preferences | ProdiGen",
  description: "Manage your personalization preferences and settings"
}

export default async function PreferencesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Personalization Preferences</h1>
          <p className="text-muted-foreground mt-2">
            Customize your experience with AI-powered personalization. Your
            preferences help us tailor the application to better suit your needs
            and work style.
          </p>
        </div>
        <PreferencesForm />
      </div>
    </div>
  )
}
