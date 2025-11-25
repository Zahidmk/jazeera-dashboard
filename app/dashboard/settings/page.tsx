"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [formData, setFormData] = useState({
    environment: "production",
    syncInterval: "300",
    maxRetries: "3",
    timeout: "5000",
    apiKey: "sk_live_••••••••••••••••••••••••",
    webhookUrl: "https://api.example.com/webhook",
    webhookSecret: "whsec_••••••••••••••••••••••••",
    odooUrl: "https://odoo.example.com",
    odooApiKey: "odoo_••••••••••••••••••••••••",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.syncInterval || parseInt(formData.syncInterval) < 60) {
      newErrors.syncInterval = "Sync interval must be at least 60 seconds"
    }

    if (!formData.maxRetries || parseInt(formData.maxRetries) < 1) {
      newErrors.maxRetries = "Max retries must be at least 1"
    }

    if (!formData.timeout || parseInt(formData.timeout) < 1000) {
      newErrors.timeout = "Timeout must be at least 1000ms"
    }

    if (!formData.webhookUrl || !formData.webhookUrl.startsWith("http")) {
      newErrors.webhookUrl = "Webhook URL must be a valid HTTP/HTTPS URL"
    }

    if (!formData.odooUrl || !formData.odooUrl.startsWith("http")) {
      newErrors.odooUrl = "Odoo URL must be a valid HTTP/HTTPS URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validate()) {
      setIsSaving(true)
      // Simulate save
      setTimeout(() => {
        setIsSaving(false)
        alert("Settings saved successfully!")
      }, 1000)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Settings" />
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
        {/* Environment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Settings</CardTitle>
            <CardDescription>Configure the application environment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Environment</label>
              <select
                value={formData.environment}
                onChange={(e) => handleChange("environment", e.target.value)}
                className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Sync Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Configuration</CardTitle>
            <CardDescription>Configure sync intervals and retry settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sync Interval (seconds)</label>
              <Input
                type="number"
                value={formData.syncInterval}
                onChange={(e) => handleChange("syncInterval", e.target.value)}
                className="mt-1"
                min="60"
              />
              {errors.syncInterval && (
                <p className="text-sm text-destructive mt-1">{errors.syncInterval}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Max Retries</label>
              <Input
                type="number"
                value={formData.maxRetries}
                onChange={(e) => handleChange("maxRetries", e.target.value)}
                className="mt-1"
                min="1"
              />
              {errors.maxRetries && (
                <p className="text-sm text-destructive mt-1">{errors.maxRetries}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Timeout (milliseconds)</label>
              <Input
                type="number"
                value={formData.timeout}
                onChange={(e) => handleChange("timeout", e.target.value)}
                className="mt-1"
                min="1000"
              />
              {errors.timeout && (
                <p className="text-sm text-destructive mt-1">{errors.timeout}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys and secrets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={formData.apiKey}
                  onChange={(e) => handleChange("apiKey", e.target.value)}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Odoo API Key</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="password"
                  value={formData.odooApiKey}
                  onChange={(e) => handleChange("odooApiKey", e.target.value)}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {}}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook URLs */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook URLs</CardTitle>
            <CardDescription>Configure webhook endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Webhook URL</label>
              <Input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => handleChange("webhookUrl", e.target.value)}
                className="mt-1"
                placeholder="https://api.example.com/webhook"
              />
              {errors.webhookUrl && (
                <p className="text-sm text-destructive mt-1">{errors.webhookUrl}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Webhook Secret</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type={showWebhookSecret ? "text" : "password"}
                  value={formData.webhookSecret}
                  onChange={(e) => handleChange("webhookSecret", e.target.value)}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                >
                  {showWebhookSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Odoo Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Odoo Configuration</CardTitle>
            <CardDescription>Configure Odoo ERP connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Odoo URL</label>
              <Input
                type="url"
                value={formData.odooUrl}
                onChange={(e) => handleChange("odooUrl", e.target.value)}
                className="mt-1"
                placeholder="https://odoo.example.com"
              />
              {errors.odooUrl && (
                <p className="text-sm text-destructive mt-1">{errors.odooUrl}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}

