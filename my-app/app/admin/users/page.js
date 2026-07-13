'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { verifyAccess } from '@/utils/auth/authCheck'

// IMPORTING YOUR ACTUAL COMPONENT LIBRARY SUB-PRIMITIVES
import MainLayout from "@/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table"

import { Users, Shield, UserX, UserPlus } from "lucide-react"

export default function ManageUsersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadWorkspaceData() {
      // 1. Security guard checkpoint
      await verifyAccess(pathname, true, router.replace)

      try {
        const res = await fetch('/api/users', { cache: 'no-store' })
        const usersData = await res.json()
        if (res.ok) setUsers(usersData.data)
      } catch (err) {
        console.error('Failed to load user directory data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadWorkspaceData()
  }, [pathname, router])

  // Handles dynamic client-side layout filtering matching your dashboard query logic
  const filteredUsers = users.filter((u) =>
    (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  async function handleRoleChange(userId, newRole) {
    const originalUsers = [...users]
    setUsers(users.map(u => u.userId === userId ? { ...u, role: newRole } : u))

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: newRole })
      })
      if (!res.ok) throw new Error()
    } catch {
      setUsers(originalUsers) // Optimistic UI state rollback matching your pattern
    }
  }

  async function handleDeleteUser(userId) {
    if (!confirm('Purge this profile account?')) return

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) setUsers(users.filter(u => u.userId !== userId))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full text-center text-muted-foreground text-sm font-medium py-12">
          Verifying security access & reading directory records...
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* HEADER TRACKING LAYOUT SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-foreground" style={{ fontSize: "1.375rem", fontWeight: 700 }}>
              User Directory Management
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Review platform roles and override access control permissions.
            </p>
          </div>

          {/* ADD USER NAVIGATION ACTION BUTTON CONFIGURED WITH ENCODED CALLBACK REDIRECT */}
          <Button
            type="button"
            onClick={() => router.push(`/admin/users/new-user?callbackUrl=${encodeURIComponent(pathname)}`)}
            size="sm"
            className="cursor-pointer gap-1.5 self-start sm:self-auto bg-[#007CA6] hover:bg-[#00668a] text-white rounded-xl"
          >
            <UserPlus size={16} />
            Add System User
          </Button>
        </div>

        {/* COMPONENT PRIMITIVE DATA CONTENT BLOCK */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>System Operators ({filteredUsers.length})</CardTitle>
            <CardAction>
              {/* Dynamic live filter query search bar matching your input fields */}
              <div className="w-full max-w-xs mt-2 sm:mt-0">
                <Input
                  placeholder="Search user profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 rounded-lg text-xs"
                />
              </div>
            </CardAction>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identity Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>UUID Registry Identifier</TableHead>
                  <TableHead>System Access Level</TableHead>
                  <TableHead className="text-right">Administrative Options</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((worker) => (
                  <TableRow key={worker.userId} onClick={() => router.push(`/admin/users/${worker.userId}`)} className="hover:bg-muted/30 transition-colors">

                    {/* User Identity cell */}
                    <TableCell className="font-medium text-foreground">
                      {worker.name || "No Name Set"}
                    </TableCell>

                    {/* Email cell */}
                    <TableCell className="text-muted-foreground">
                      {worker.email}
                    </TableCell>

                    {/* Registry UUID Monospace Code Tag cell */}
                    <TableCell>
                      <span className="font-mono text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded border border-border">
                        {worker.userId}
                      </span>
                    </TableCell>

                    {/* Access Badges drop logic matching your dynamic state style */}
                    <TableCell>
                      <div className="inline-flex items-center relative gap-2">
                        <Badge
                          className={
                            worker.role === "admin"
                              ? "bg-amber-100 text-amber-800 font-semibold uppercase tracking-wide text-[10px]"
                              : "bg-slate-100 text-slate-800 font-semibold uppercase tracking-wide text-[10px]"
                          }
                        >
                          {worker.role === "admin" ? "Admin" : "Staff"}
                        </Badge>

                        {/* Native structural custom select element designed inside clean row boundaries */}
                        <select
                          value={worker.role}
                          onClick={(e) => e.stopPropagation()}

                          onChange={(e) => handleRoleChange(worker.userId, e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                        </select>
                      </div>
                    </TableCell>

                    {/* Danger administrative execution drop triggers */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(worker.userId);
                        }}
                        className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium px-2.5 rounded-lg text-xs cursor-pointer gap-1"
                      >
                        <UserX size={13} />
                        Delete Account
                      </Button>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="w-full text-center text-muted-foreground text-xs py-8">
                No system accounts matched your active filter queries.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}