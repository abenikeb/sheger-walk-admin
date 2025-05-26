"use client"

import { useEffect, useState } from "react"
import { Check, Filter, MoreHorizontal, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface WithdrawRequest {
  id: number
  date: string
  user: {
    id: number
    name: string
    email: string
  }
  withdrawAmount: number
  status: "Pending" | "Approved" | "Rejected"
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    // In a real app, this would be an API call
    // fetch('/api/admin/withdrawals')
    //   .then(res => res.json())
    //   .then(data => {
    //     setWithdrawals(data.withdrawRequests)
    //     setLoading(false)
    //   })
    //   .catch(err => {
    //     console.error(err)
    //     setLoading(false)
    //   })

    // Mock data for demonstration with Ethiopian names and ETB
    setTimeout(() => {
      setWithdrawals([
        {
          id: 1,
          date: "2023-05-18T09:15:00Z",
          user: {
            id: 2,
            name: "Tigist Haile",
            email: "tigist@example.com",
          },
          withdrawAmount: 1000,
          status: "Pending",
        },
        {
          id: 2,
          date: "2023-05-10T14:30:00Z",
          user: {
            id: 1,
            name: "Abebe Kebede",
            email: "abebe@example.com",
          },
          withdrawAmount: 500,
          status: "Approved",
        },
        {
          id: 3,
          date: "2023-05-05T11:45:00Z",
          user: {
            id: 3,
            name: "Dawit Mekonnen",
            email: "dawit@example.com",
          },
          withdrawAmount: 750,
          status: "Rejected",
        },
        {
          id: 4,
          date: "2023-05-20T16:00:00Z",
          user: {
            id: 4,
            name: "Hiwot Tadesse",
            email: "hiwot@example.com",
          },
          withdrawAmount: 2000,
          status: "Pending",
        },
        {
          id: 5,
          date: "2023-05-15T10:20:00Z",
          user: {
            id: 5,
            name: "Yonas Alemu",
            email: "yonas@example.com",
          },
          withdrawAmount: 1500,
          status: "Pending",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch =
      withdrawal.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdrawal.user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || withdrawal.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleApprove = (id: number) => {
    // In a real app, this would be an API call
    // fetch(`/api/admin/withdrawals/${id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ status: 'Approved' }),
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     // Update the local state
    //     setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: 'Approved' } : w))
    //   })
    //   .catch(err => console.error(err))

    // For demonstration, just update the local state
    setWithdrawals(withdrawals.map((w) => (w.id === id ? { ...w, status: "Approved" } : w)))
  }

  const handleReject = (id: number) => {
    // In a real app, this would be an API call
    // fetch(`/api/admin/withdrawals/${id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ status: 'Rejected' }),
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     // Update the local state
    //     setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: 'Rejected' } : w))
    //   })
    //   .catch(err => console.error(err))

    // For demonstration, just update the local state
    setWithdrawals(withdrawals.map((w) => (w.id === id ? { ...w, status: "Rejected" } : w)))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h1>
        <p className="text-muted-foreground">Manage user withdrawal requests and approvals</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-app-primary"></div>
          <h2 className="text-xl font-semibold">Withdrawals</h2>
        </div>
      </div>

      <Card className="dashboard-card app-border">
        <CardHeader className="pb-3">
          <CardTitle>Withdrawal Management</CardTitle>
          <CardDescription>Review and process user withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading withdrawals...</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No withdrawal requests found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWithdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id} className="hover:bg-muted/50">
                        <TableCell>{formatDate(withdrawal.date)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{withdrawal.user.name}</div>
                          <div className="text-xs text-muted-foreground">{withdrawal.user.email}</div>
                        </TableCell>
                        <TableCell className="font-medium">{withdrawal.withdrawAmount.toLocaleString()} ETB</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              withdrawal.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : withdrawal.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {withdrawal.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {withdrawal.status === "Pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                                onClick={() => handleApprove(withdrawal.id)}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="sr-only">Approve</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                onClick={() => handleReject(withdrawal.id)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Reject</span>
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View details</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View user</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
