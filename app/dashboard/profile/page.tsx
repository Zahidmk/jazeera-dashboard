"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Save, Upload, User, Mail, Phone, MapPin, Calendar, Shield, CheckCircle2 } from "lucide-react"

export default function ProfilePage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Mock user data
    const [userData, setUserData] = useState({
        name: "Ahmed Ali",
        email: "ahmed.ali@jazeera.com",
        phone: "+966 50 123 4567",
        role: "Manager",
        branch: "Riyadh Central",
        joinDate: "Jan 15, 2023",
        employeeId: "EMP-001",
        department: "Operations",
    })

    const handleSave = () => {
        setIsSaving(true)
        setSaveSuccess(false)
        // Simulate save
        setTimeout(() => {
            setIsSaving(false)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        }, 1000)
    }

    const handleChange = (field: string, value: string) => {
        setUserData((prev) => ({ ...prev, [field]: value }))
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
                {/* Profile Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <Avatar className="h-24 w-24 md:h-32 md:w-32">
                                    <AvatarImage
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=256&background=3b82f6&color=fff&bold=true`}
                                        alt={userData.name}
                                    />
                                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                                        {userData.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 cursor-pointer"
                                    title="Change profile picture"
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold">{userData.name}</h2>
                                <p className="text-muted-foreground">{userData.email}</p>
                                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                    <Badge variant="default" className="bg-blue-600 text-white">
                                        <Shield className="h-3 w-3 mr-1" />
                                        {userData.role}
                                    </Badge>
                                    <Badge variant="outline">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {userData.branch}
                                    </Badge>
                                    <Badge variant="outline">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Joined {userData.joinDate}
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
                                <Input
                                    value={userData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    className="mt-1"
                                    placeholder="Ahmed Ali"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Employee ID</label>
                                <Input
                                    value={userData.employeeId}
                                    className="mt-1"
                                    disabled
                                    placeholder="EMP-001"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    className="mt-1"
                                    placeholder="ahmed.ali@jazeera.com"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone Number
                                </label>
                                <Input
                                    value={userData.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    className="mt-1"
                                    placeholder="+966 50 123 4567"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Department</label>
                                <Input
                                    value={userData.department}
                                    onChange={(e) => handleChange("department", e.target.value)}
                                    className="mt-1"
                                    placeholder="Operations"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Branch
                                </label>
                                <select
                                    value={userData.branch}
                                    onChange={(e) => handleChange("branch", e.target.value)}
                                    className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="Riyadh Central">Riyadh Central</option>
                                    <option value="Riyadh North">Riyadh North</option>
                                    <option value="Jeddah">Jeddah</option>
                                    <option value="Dammam">Dammam</option>
                                </select>
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
                        <CardDescription>Manage your password and security preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Current Password</label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        type={showPassword ? "text" : "password"}
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
                            Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
                        </p>
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
                                    <p className="text-sm font-medium">Account Status</p>
                                    <p className="text-xs text-muted-foreground">Current status</p>
                                </div>
                                <Badge variant="default" className="bg-green-500">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Role</p>
                                    <p className="text-xs text-muted-foreground">Access level</p>
                                </div>
                                <Badge variant="default" className="bg-blue-600">{userData.role}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Member Since</p>
                                    <p className="text-xs text-muted-foreground">Join date</p>
                                </div>
                                <span className="text-sm font-medium">{userData.joinDate}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Last Login</p>
                                    <p className="text-xs text-muted-foreground">Recent activity</p>
                                </div>
                                <span className="text-sm font-medium">Today, 09:30 AM</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
