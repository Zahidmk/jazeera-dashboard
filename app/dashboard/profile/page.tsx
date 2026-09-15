"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Save, User, Mail, Phone, Calendar, Shield, CheckCircle2, Truck, Loader2 } from "lucide-react"
import { apiCall } from "@/lib/api/client"
import { useAuth } from "@/lib/context/AuthContext"

interface MeResponse {
    id: string
    name: string
    email: string
    phone: string | null
    role: string
    createdAt: string
    van?: { id: string; plateNumber: string; model?: string | null } | null
    isShiftStarted?: boolean
}

export default function ProfilePage() {
    const { updateUser } = useAuth()

    const [me, setMe] = useState<MeResponse | null>(null)
    const [loading, setLoading] = useState(true)

    // Editable profile fields
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    // Password change
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiCall<{ success: boolean; data: MeResponse }>("/api/v1/auth/me")
            setMe(res.data)
            setName(res.data.name)
            setEmail(res.data.email)
            setPhone(res.data.phone ?? "")
        } catch {
            // apiCall already surfaces auth failures via the global redirect/logout flow
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleSave = async () => {
        setIsSaving(true)
        setSaveSuccess(false)
        setSaveError(null)
        try {
            const res = await apiCall<{ success: boolean; data: MeResponse }>("/api/v1/auth/me", {
                method: "PATCH",
                body: JSON.stringify({ name, email, phone: phone || null }),
            })
            setMe((prev) => (prev ? { ...prev, ...res.data } : prev))
            updateUser({ name: res.data.name, email: res.data.email, phone: res.data.phone })
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Failed to save profile")
        } finally {
            setIsSaving(false)
        }
    }

    const handleChangePassword = async () => {
        setPasswordError(null)
        if (!currentPassword || !newPassword) {
            setPasswordError("Enter your current password and a new password")
            return
        }
        setIsChangingPassword(true)
        setPasswordSuccess(false)
        try {
            await apiCall("/api/v1/auth/me", {
                method: "PATCH",
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            setCurrentPassword("")
            setNewPassword("")
            setPasswordSuccess(true)
            setTimeout(() => setPasswordSuccess(false), 3000)
        } catch (e) {
            setPasswordError(e instanceof Error ? e.message : "Failed to change password")
        } finally {
            setIsChangingPassword(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Topbar title="My Profile" />
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading profile...
                </div>
            </div>
        )
    }

    if (!me) {
        return (
            <div className="min-h-screen bg-background">
                <Topbar title="My Profile" />
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                    Failed to load profile.
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Topbar
                title="My Profile"
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
                                    <Save className="h-4 w-4 mr-2 animate-pulse" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                }
            />

            <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
                {saveError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{saveError}</div>
                )}

                {/* Profile Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <Avatar className="h-24 w-24 md:h-32 md:w-32">
                                <AvatarImage
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name || me.name)}&size=256&background=3b82f6&color=fff&bold=true`}
                                    alt={me.name}
                                />
                                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                                    {me.name.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold">{me.name}</h2>
                                <p className="text-muted-foreground">{me.email}</p>
                                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                    <Badge variant="default" className="bg-blue-600 text-white">
                                        <Shield className="h-3 w-3 mr-1" />
                                        {me.role}
                                    </Badge>
                                    {me.van && (
                                        <Badge variant="outline">
                                            <Truck className="h-3 w-3 mr-1" />
                                            {me.van.plateNumber}
                                        </Badge>
                                    )}
                                    <Badge variant="outline">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Joined {new Date(me.createdAt).toLocaleDateString()}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone Number
                                </label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="+966 5X XXX XXXX" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Role</label>
                                <Input value={me.role} className="mt-1" disabled />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security Settings
                        </CardTitle>
                        <CardDescription>Change your password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {passwordError && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{passwordError}</div>
                        )}
                        {passwordSuccess && (
                            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Password updated
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Current Password</label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="cursor-pointer"
                                        title={showPassword ? "Hide" : "Show"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">New Password</label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="cursor-pointer"
                                        title={showNewPassword ? "Hide" : "Show"}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            New password must be at least 8 characters long.
                        </p>
                        <Button onClick={handleChangePassword} disabled={isChangingPassword} variant="outline" className="cursor-pointer">
                            {isChangingPassword ? "Updating..." : "Update Password"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>View your account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Role</p>
                                    <p className="text-xs text-muted-foreground">Access level</p>
                                </div>
                                <Badge variant="default" className="bg-blue-600">{me.role}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Member Since</p>
                                    <p className="text-xs text-muted-foreground">Join date</p>
                                </div>
                                <span className="text-sm font-medium">{new Date(me.createdAt).toLocaleDateString()}</span>
                            </div>
                            {me.van && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Assigned Van</p>
                                        <p className="text-xs text-muted-foreground">Current vehicle</p>
                                    </div>
                                    <span className="text-sm font-medium">{me.van.plateNumber}</span>
                                </div>
                            )}
                            {typeof me.isShiftStarted === "boolean" && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Shift Status</p>
                                        <p className="text-xs text-muted-foreground">Current shift</p>
                                    </div>
                                    <Badge variant={me.isShiftStarted ? "default" : "outline"} className={me.isShiftStarted ? "bg-green-500" : ""}>
                                        {me.isShiftStarted ? "Active" : "Not started"}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
