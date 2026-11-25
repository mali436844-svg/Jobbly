"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  ShieldAlert,
  Megaphone,
  Database,
  Save,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = React.useState(false)
  const [systemBanner, setSystemBanner] = React.useState("")
  const [trialDays, setTrialDays] = React.useState(30)
  const [isSaving, setIsSaving] = React.useState(false)

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      setMaintenanceMode(data.maintenance_mode || false)
      setSystemBanner(data.system_banner || "")
      setTrialDays(data.trial_days || 30)
    } catch {
      toast.error("Failed to load admin settings")
    }
  }

  React.useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance_mode: maintenanceMode,
          system_banner: systemBanner,
          trial_days: Number(trialDays),
        }),
      })

      if (!res.ok) throw new Error("Failed to save settings")

      toast.success("System controls updated successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading flex items-center gap-3">
            System Controls & Global Settings <Settings className="h-6 w-6 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure system banner announcements, maintenance toggles, and database connection status.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save System Controls
        </Button>
      </div>

      {/* Maintenance & Banner Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-400" /> System Announcement Banner
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Broadcast a custom notification banner across all logged-in contractor dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-slate-300 font-semibold">Banner Broadcast Message</Label>
              <Input
                value={systemBanner}
                onChange={(e) => setSystemBanner(e.target.value)}
                placeholder="e.g. Scheduled maintenance this Sunday at 2:00 AM EST"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            {systemBanner && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 font-medium">
                <Megaphone className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Live Preview: {systemBanner}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" /> Maintenance Mode & Trial Period
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Toggle global application access and trial duration parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">Maintenance Mode</p>
                <p className="text-xs text-slate-500">Temporarily restrict access for non-admin users</p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenanceMode ? "bg-red-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    maintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-300 font-semibold">Free Trial Duration (Days)</Label>
              <Input
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-white w-32"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Connection Info */}
      <Card className="bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-white font-heading">Database & System Infrastructure</h2>
            <p className="text-xs text-slate-400">Environment status & connected backend drivers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400">Database Driver</p>
              <p className="text-sm font-semibold text-white mt-0.5">Mock JSON Persistent Storage + Supabase SSR Driver</p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400">Email Notification Gateway</p>
              <p className="text-sm font-semibold text-white mt-0.5">Resend Transactional API Integration</p>
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-mono">Configured</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
