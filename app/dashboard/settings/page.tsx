"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Save, RefreshCw, CheckCircle2, AlertCircle, Database, Globe, Key, Webhook, Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [showOdooKey, setShowOdooKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [formData, setFormData] = useState({
    // General Settings
    environment: "production",
    appName: "Jazeera Dashboard",
    timezone: "Asia/Riyadh",
    language: "en",

    // Sync Configuration
    syncInterval: "300",
    maxRetries: "3",
    timeout: "5000",
    autoSync: true,

    // API Keys
    apiKey: "sk_live_••••••••••••••••••••••••",
    odooApiKey: "odoo_••••••••••••••••••••••••",

    // Webhook Configuration
    webhookUrl: "https://api.example.com/webhook",
    webhookSecret: "whsec_••••••••••••••••••••••••",
    webhookEnabled: true,

    // Odoo Configuration
    odooUrl: "https://odoo.example.com",
    odooDatabase: "production_db",
    odooUsername: "admin",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationEmail: "admin@example.com",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

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

    if (formData.webhookEnabled && (!formData.webhookUrl || !formData.webhookUrl.startsWith("http"))) {
      newErrors.webhookUrl = "Webhook URL must be a valid HTTP/HTTPS URL"
    }

    if (!formData.odooUrl || !formData.odooUrl.startsWith("http")) {
      newErrors.odooUrl = "Odoo URL must be a valid HTTP/HTTPS URL"
    }

    if (formData.emailNotifications && !formData.notificationEmail) {
      newErrors.notificationEmail = "Email is required for email notifications"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validate()) {
      setIsSaving(true)
      setSaveSuccess(false)
      // Simulate save
      setTimeout(() => {
        setIsSaving(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }, 1000)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleTestConnection = (type: 'odoo' | 'webhook') => {
    alert(`Testing ${type} connection...`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Settings"
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        }
      />
      <div className="p-4 lg:p-6 space-y-6 max-w-6xl">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general" className="cursor-pointer">
              <SettingsIcon className="h-4 w-4 mr-2 hidden sm:inline" />
              General
            </TabsTrigger>
            {/* <TabsTrigger value="sync" className="cursor-pointer">
              <RefreshCw className="h-4 w-4 mr-2 hidden sm:inline" />
              Sync
            </TabsTrigger> */}
            {/* <TabsTrigger value="api" className="cursor-pointer">
              <Key className="h-4 w-4 mr-2 hidden sm:inline" />
              API Keys
            </TabsTrigger> */}
            {/* <TabsTrigger value="integrations" className="cursor-pointer">
              <Database className="h-4 w-4 mr-2 hidden sm:inline" />
              Integrations
            </TabsTrigger> */}
            <TabsTrigger value="notifications" className="cursor-pointer">
              <Globe className="h-4 w-4 mr-2 hidden sm:inline" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Application Name</label>
                    <Input
                      value={formData.appName}
                      onChange={(e) => handleChange("appName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
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
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleChange("timezone", e.target.value)}
                      className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => handleChange("language", e.target.value)}
                      className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync Configuration */}
          <TabsContent value="sync" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Configuration</CardTitle>
                <CardDescription>Configure data synchronization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto Sync</p>
                    <p className="text-xs text-muted-foreground">Automatically sync data at intervals</p>
                  </div>
                  <Button
                    variant={formData.autoSync ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("autoSync", !formData.autoSync)}
                    className="cursor-pointer"
                  >
                    {formData.autoSync ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="text-sm font-medium">Timeout (ms)</label>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage API keys and authentication tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Dashboard API Key</label>
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
                      className="cursor-pointer"
                      title={showApiKey ? "Hide" : "Show"}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Used for API authentication</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Odoo API Key</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showOdooKey ? "text" : "password"}
                      value={formData.odooApiKey}
                      onChange={(e) => handleChange("odooApiKey", e.target.value)}
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowOdooKey(!showOdooKey)}
                      className="cursor-pointer"
                      title={showOdooKey ? "Hide" : "Show"}
                    >
                      {showOdooKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Used for Odoo ERP integration</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-4 mt-6">
            {/* Odoo Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Odoo ERP Integration</span>
                  <Badge variant="default">Active</Badge>
                </CardTitle>
                <CardDescription>Configure Odoo ERP connection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="text-sm font-medium">Database Name</label>
                    <Input
                      value={formData.odooDatabase}
                      onChange={(e) => handleChange("odooDatabase", e.target.value)}
                      className="mt-1"
                      placeholder="production_db"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      value={formData.odooUsername}
                      onChange={(e) => handleChange("odooUsername", e.target.value)}
                      className="mt-1"
                      placeholder="admin"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('odoo')}
                  className="cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            {/* Webhook Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Webhook Configuration</span>
                  <Button
                    variant={formData.webhookEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("webhookEnabled", !formData.webhookEnabled)}
                    className="cursor-pointer"
                  >
                    {formData.webhookEnabled ? "Enabled" : "Disabled"}
                  </Button>
                </CardTitle>
                <CardDescription>Configure webhook endpoints for real-time updates</CardDescription>
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
                    disabled={!formData.webhookEnabled}
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
                      disabled={!formData.webhookEnabled}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      disabled={!formData.webhookEnabled}
                      className="cursor-pointer"
                      title={showWebhookSecret ? "Hide" : "Show"}
                    >
                      {showWebhookSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {formData.webhookEnabled && (
                  <Button
                    variant="outline"
                    onClick={() => handleTestConnection('webhook')}
                    className="cursor-pointer"
                  >
                    <Webhook className="h-4 w-4 mr-2" />
                    Test Webhook
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Button
                    variant={formData.emailNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("emailNotifications", !formData.emailNotifications)}
                    className="cursor-pointer"
                  >
                    {formData.emailNotifications ? "On" : "Off"}
                  </Button>
                </div>
                {formData.emailNotifications && (
                  <div>
                    <label className="text-sm font-medium">Notification Email</label>
                    <Input
                      type="email"
                      value={formData.notificationEmail}
                      onChange={(e) => handleChange("notificationEmail", e.target.value)}
                      className="mt-1"
                      placeholder="admin@example.com"
                    />
                    {errors.notificationEmail && (
                      <p className="text-sm text-destructive mt-1">{errors.notificationEmail}</p>
                    )}
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">SMS Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Button
                    variant={formData.smsNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("smsNotifications", !formData.smsNotifications)}
                    className="cursor-pointer"
                  >
                    {formData.smsNotifications ? "On" : "Off"}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Button
                    variant={formData.pushNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("pushNotifications", !formData.pushNotifications)}
                    className="cursor-pointer"
                  >
                    {formData.pushNotifications ? "On" : "Off"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
