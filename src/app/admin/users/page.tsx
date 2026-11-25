"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Search,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [planFilter, setPlanFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [isLoading, setIsLoading] = React.useState(true)

  // Edit user state
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editPlan, setEditPlan] = React.useState("free")
  const [editStatus, setEditStatus] = React.useState("active")
  const [editRole, setEditRole] = React.useState("user")
  const [isSaving, setIsSaving] = React.useState(false)

  // Add user state
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [newFullName, setNewFullName] = React.useState("")
  const [newBusinessName, setNewBusinessName] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newPlan, setNewPlan] = React.useState("free")
  const [newRole, setNewRole] = React.useState("user")

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load user list")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchUsers()
  }, [])

  const handleEditClick = (user: any) => {
    setSelectedUser(user)
    setEditPlan(user.subscription_plan || "free")
    setEditStatus(user.status || "active")
    setEditRole(user.role || "user")
    setIsEditOpen(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          subscription_plan: editPlan,
          status: editStatus,
          role: editRole,
        }),
      })

      if (!res.ok) throw new Error("Failed to update profile")

      toast.success(`Updated profile for ${selectedUser.full_name || selectedUser.email}`)
      setIsEditOpen(false)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || "Failed to update user")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail || !newBusinessName) {
      toast.error("Email and Business Name are required")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: newFullName || newBusinessName,
          business_name: newBusinessName,
          email: newEmail,
          subscription_plan: newPlan,
          role: newRole,
          status: "active",
        }),
      })

      if (!res.ok) throw new Error("Failed to create user profile")

      toast.success(`User ${newEmail} created successfully!`)
      setIsAddOpen(false)
      setNewFullName("")
      setNewBusinessName("")
      setNewEmail("")
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || "Failed to create user")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user ${name}?`)) return
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete user")
      toast.success(`User ${name} deleted`)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user")
    }
  }

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.business_name && u.business_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))

    const matchesPlan = planFilter === "all" || u.subscription_plan === planFilter
    const matchesStatus = statusFilter === "all" || u.status === statusFilter

    return matchesSearch && matchesPlan && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading flex items-center gap-3">
            Registered Users Management <Users className="h-6 w-6 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-tenant user directory with subscription controls and account status toggles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchUsers}
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                <UserPlus className="h-4 w-4 mr-2" /> Add User Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
              <DialogHeader>
                <DialogTitle className="text-white font-heading text-lg">Create New User Profile</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Add a contractor or admin user manually to the database.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold">Full Name / Owner</Label>
                  <Input
                    placeholder="e.g. John Smith"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold">Business Name *</Label>
                  <Input
                    placeholder="e.g. Smith Plumbing"
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold">Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="john@smithplumbing.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs font-semibold">Subscription Plan</Label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:outline-none"
                    >
                      <option value="free">Free Trial</option>
                      <option value="starter">Starter ($29/mo)</option>
                      <option value="pro">Pro ($79/mo)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs font-semibold">User Role</Label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:outline-none"
                    >
                      <option value="user">Contractor (User)</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>
                </div>
                <DialogFooter className="pt-4 border-t border-slate-800">
                  <Button type="submit" disabled={isSaving} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold w-full">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save New User Profile"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="bg-slate-900 border-slate-800 p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name, business, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-white focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Plan:</span>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md text-xs p-2 text-slate-200"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md text-xs p-2 text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Data Table */}
      <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 bg-slate-900/40 px-6 py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white font-heading">
              User Profiles Directory ({filteredUsers.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Showing real-time records stored in the SaaS system database.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No matching user profiles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Owner / User Name</th>
                    <th className="px-6 py-3.5">Business Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Plan</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Registered Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {user.full_name || user.business_name || "Contractor"}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {user.business_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            user.role === "admin"
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold"
                              : "border-slate-700 bg-slate-800 text-slate-300"
                          }
                        >
                          {user.role === "admin" ? "👑 Admin" : "🔨 Contractor"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200">
                          {user.subscription_plan || "free"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            user.status === "suspended"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : user.status === "trialing"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          }
                        >
                          {user.status || "active"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(user.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuLabel>Manage Profile</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem onClick={() => handleEditClick(user)} className="cursor-pointer focus:bg-slate-800 focus:text-white">
                              <Edit className="h-3.5 w-3.5 mr-2 text-amber-400" /> Edit Plan & Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                              className="cursor-pointer text-red-400 focus:bg-red-950/30 focus:text-red-300"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-white font-heading text-lg">
              Manage User: {selectedUser?.full_name || selectedUser?.business_name}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Update plan tier, account status, or administrative permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Subscription Plan Tier</Label>
              <select
                value={editPlan}
                onChange={(e) => setEditPlan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white"
              >
                <option value="free">Free (Trial)</option>
                <option value="starter">Starter ($29/month)</option>
                <option value="pro">Pro Contractor ($79/month)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Account Status</Label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white"
              >
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="suspended">Suspended / Blocked</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Role</Label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white"
              >
                <option value="user">Contractor User</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-800">
            <Button
              onClick={handleSaveUser}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold w-full"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
