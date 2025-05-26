"use client"

import { useEffect, useState } from "react"
import { CreditCard, Download, Filter, MoreHorizontal, Search } from "lucide-react"

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

interface Transaction {
  id: number
  createdAt: string
  user: {
    id: number
    name: string
    email: string
  }
  amount: number
  amountType: string
  transactionType: string
  description: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    // In a real app, this would be an API call
    // fetch('/api/admin/transactions')
    //   .then(res => res.json())
    //   .then(data => {
    //     setTransactions(data.transactions)
    //     setLoading(false)
    //   })
    //   .catch(err => {
    //     console.error(err)
    //     setLoading(false)
    //   })

    // Mock data for demonstration with Ethiopian names and ETB
    setTimeout(() => {
      setTransactions([
        {
          id: 1,
          createdAt: "2023-05-01T10:30:00Z",
          user: {
            id: 1,
            name: "Abebe Kebede",
            email: "abebe@example.com",
          },
          amount: -250,
          amountType: "ETB",
          transactionType: "Challenge Entry",
          description: "Joined Marathon Challenge",
        },
        {
          id: 2,
          createdAt: "2023-05-15T14:45:00Z",
          user: {
            id: 1,
            name: "Abebe Kebede",
            email: "abebe@example.com",
          },
          amount: 500,
          amountType: "ETB",
          transactionType: "Challenge Reward",
          description: "Completed 10K Steps Challenge",
        },
        {
          id: 3,
          createdAt: "2023-05-18T09:15:00Z",
          user: {
            id: 2,
            name: "Tigist Haile",
            email: "tigist@example.com",
          },
          amount: -1000,
          amountType: "ETB",
          transactionType: "Withdrawal",
          description: "Withdrawal request #1",
        },
        {
          id: 4,
          createdAt: "2023-05-20T16:30:00Z",
          user: {
            id: 3,
            name: "Dawit Mekonnen",
            email: "dawit@example.com",
          },
          amount: -150,
          amountType: "ETB",
          transactionType: "Challenge Entry",
          description: "Joined Weekend Warrior Challenge",
        },
        {
          id: 5,
          createdAt: "2023-05-22T11:00:00Z",
          user: {
            id: 3,
            name: "Dawit Mekonnen",
            email: "dawit@example.com",
          },
          amount: 750,
          amountType: "ETB",
          transactionType: "Challenge Reward",
          description: "Completed Weekend Warrior Challenge",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || transaction.transactionType.toLowerCase() === typeFilter.toLowerCase()

    return matchesSearch && matchesType
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">View and manage all financial transactions in the system</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-app-primary"></div>
          <h2 className="text-xl font-semibold">Transactions</h2>
        </div>
        <Button variant="outline" className="group">
          <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          Export
        </Button>
      </div>

      <Card className="dashboard-card app-border">
        <CardHeader className="pb-3">
          <CardTitle>Financial Transactions</CardTitle>
          <CardDescription>View all platform financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or description..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="challenge entry">Challenge Entry</SelectItem>
                  <SelectItem value="challenge reward">Challenge Reward</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading transactions...</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No transactions found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-muted/50">
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.user.name}</div>
                          <div className="text-xs text-muted-foreground">{transaction.user.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span
                              className={`text-sm ${
                                transaction.transactionType === "Challenge Reward"
                                  ? "text-app-primary"
                                  : transaction.transactionType === "Withdrawal"
                                    ? "text-app-red"
                                    : ""
                              }`}
                            >
                              {transaction.transactionType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={transaction.amount > 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount.toLocaleString()} {transaction.amountType}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
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
