"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { apiCall } from "@/lib/api/client"
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings as SettingsIcon,
  Globe,
  Loader2,
  Database,
} from "lucide-react"

interface SettingsData {
  // env (read-only)
  odooUrl: string
  odooDatabase: string
  odooUsername: string
  environment: string
  // editable
  syncInterval: number
  maxRetries: number
  timeout: number
  autoSync: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  notificationEmail: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")

  // Local editable copy
  const [form, setForm] = useState({
    syncInterval: "300",
    maxRetries: "3",
    timeout: "5000",
    autoSync: true,
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false,
    notificationEmail: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<ApiResponse<SettingsData>>("/api/v1/admin/settings")
      setSettings(res.data)
      setForm({
        syncInterval: String(res.data.syncInterval),
        maxRetries: String(res.data.maxRetries),
        timeout: String(res.data.timeout),
        autoSync: res.data.autoSync,
        emailNotifications: res.data.emailNotifications,
        smsNotifications: res.data.smsNotifications,
        pushNotifications: res.data.pushNotifications,
        notificationEmail: res.data.notificationEmail,
      })
    } catch (err) {
      console.error("Failed to load settings:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.syncInterval || parseInt(form.syncInterval) < 60)
      newErrors.syncInterval = "Must be at least 60 seconds"
    if (!form.maxRetries || parseInt(form.maxRetries) < 1)
      newErrors.maxRetries = "Must be at least 1"
    if (!form.timeout || parseInt(form.timeout) < 1000)
      newErrors.timeout = "Must be at least 1000ms"
    if (form.emailNotifications && !form.notificationEmail)
      newErrors.notificationEmail = "Email is required when email notifications are on"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setSaveSuccess(false)
    setSaveError("")
    try {
      await apiCall("/api/v1/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          syncInterval: parseInt(form.syncInterval),
          maxRetries: parseInt(form.maxRetries),
          timeout: parseInt(form.timeout),
          autoSync: form.autoSync,
          emailNotifications: form.emailNotifications,
          smsNotifications: form.smsNotifications,
          pushNotifications: form.pushNotifications,
          notificationEmail: form.notificationEmail,
        }),
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      loadSettings()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar title="Settings" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </div>
    )
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
            {saveError && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                {saveError}
              </Badge>
            )}
            <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
              {saving ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Settings</>
              )}
            </Button>
          </div>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
        <Tabs defaultValue="sync" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="sync" className="cursor-pointer">
              <RefreshCw className="h-4 w-4 mr-2 hidden sm:inline" />
              Sync
            </TabsTrigger>
            <TabsTrigger value="integrations" className="cursor-pointer">
              <Database className="h-4 w-4 mr-2 hidden sm:inline" />
              Odoo Config
            </TabsTrigger>
            <TabsTrigger value="notifications" className="cursor-pointer">
              <Globe className="h-4 w-4 mr-2 hidden sm:inline" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* ── Sync Configuration ── */}
          <TabsContent value="sync" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Sync Configuration
                </CardTitle>
                <CardDescription>Configure data synchronisation with Odoo ERP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Auto Sync toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto Sync</p>
                    <p className="text-xs text-muted-foreground">Automatically sync Odoo data on interval</p>
                  </div>
                  <Button
                    variant={form.autoSync ? "default" : "outline"}
                    size="sm"
                    onClick={() => set("autoSync", !form.autoSync)}
                    className="cursor-pointer"
                  >
                    {form.autoSync ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Sync Interval (seconds)</label>
                    <Input
                      type="number"
                      value={form.syncInterval}
                      onChange={(e) => set("syncInterval", e.target.value)}
                      className="mt-1"
                      min="60"
                      disabled={!form.autoSync}
                    />
                    {errors.syncInterval && <p className="text-xs text-red-500 mt-1">{errors.syncInterval}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Min: 60 seconds</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Retries</label>
                    <Input
                      type="number"
                      value={form.maxRetries}
                      onChange={(e) => set("maxRetries", e.target.value)}
                      className="mt-1"
                      min="1"
                    />
                    {errors.maxRetries && <p className="text-xs text-red-500 mt-1">{errors.maxRetries}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timeout (ms)</label>
                    <Input
                      type="number"
                      value={form.timeout}
                      onChange={(e) => set("timeout", e.target.value)}
                      className="mt-1"
                      min="1000"
                    />
                    {errors.timeout && <p className="text-xs text-red-500 mt-1">{errors.timeout}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Odoo Config (read-only from env) ── */}
          <TabsContent value="integrations" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Odoo ERP Integration</span>
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                </CardTitle>
                <CardDescription>
                  These values are loaded from server environment variables. Edit the backend <code>.env</code> file to change them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Odoo URL</label>
                    <div className="mt-1 px-3 py-2 rounded-md border bg-muted text-sm font-mono break-all">
                      {settings?.odooUrl || <span className="text-muted-foreground italic">Not set</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Database</label>
                    <div className="mt-1 px-3 py-2 rounded-md border bg-muted text-sm font-mono">
                      {settings?.odooDatabase || <span className="text-muted-foreground italic">Not set</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <div className="mt-1 px-3 py-2 rounded-md border bg-muted text-sm font-mono">
                      {settings?.odooUsername || <span className="text-muted-foreground italic">Not set</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Environment</label>
                    <div className="mt-1 px-3 py-2 rounded-md border bg-muted text-sm font-mono capitalize">
                      {settings?.environment || "development"}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Odoo API key is stored securely in <code>ODOO_API_KEY</code> env var and not shown here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Notifications ── */}
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how the system sends notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Send alerts via email</p>
                  </div>
                  <Button
                    variant={form.emailNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => set("emailNotifications", !form.emailNotifications)}
                    className="cursor-pointer"
                  >
                    {form.emailNotifications ? "On" : "Off"}
                  </Button>
                </div>
                {form.emailNotifications && (
                  <div>
                    <label className="text-sm font-medium">Notification Email</label>
                    <Input
                      type="email"
                      value={form.notificationEmail}
                      onChange={(e) => set("notificationEmail", e.target.value)}
                      placeholder="admin@jazeera.com"
                      className="mt-1"
                    />
                    {errors.notificationEmail && <p className="text-xs text-red-500 mt-1">{errors.notificationEmail}</p>}
                  </div>
                )}
                <Separator />
                {/* SMS */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">SMS Notifications</p>
                    <p className="text-xs text-muted-foreground">Send alerts via SMS</p>
                  </div>
                  <Button
                    variant={form.smsNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => set("smsNotifications", !form.smsNotifications)}
                    className="cursor-pointer"
                  >
                    {form.smsNotifications ? "On" : "Off"}
                  </Button>
                </div>
                <Separator />
                {/* Push */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Button
                    variant={form.pushNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => set("pushNotifications", !form.pushNotifications)}
                    className="cursor-pointer"
                  >
                    {form.pushNotifications ? "On" : "Off"}
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
