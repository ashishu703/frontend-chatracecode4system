"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { errorLogsApi, type ErrorLog, type ErrorStats } from "@/utils/api/errorLogs/errorLogsApi"

export default function ErrorLogsSettings() {
  const { toast } = useToast()
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [stats, setStats] = useState<ErrorStats>({
    totalErrors: 0,
    broadcastErrors: 0,
    messageErrors: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [logsData, statsData] = await Promise.all([
        errorLogsApi.getErrorLogs({ limit: 100 }).catch(() => ({ errorLogs: [], count: 0 })),
        errorLogsApi.getErrorStats().catch(() => ({ totalErrors: 0, broadcastErrors: 0, messageErrors: 0 }))
      ])
      setErrorLogs(logsData.errorLogs || [])
      setStats(statsData)
    } catch (error: any) {
      console.error("Failed to fetch error logs:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load error logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await fetchData()
      toast({
        title: "Success",
        description: "Error logs refreshed successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh error logs",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    } catch {
      return dateString
    }
  }

  const getPlatformBadgeColor = (platform: string) => {
    const platformLower = platform.toLowerCase()
    if (platformLower.includes("whatsapp") || platformLower.includes("wa")) {
      return "bg-green-50 text-green-700 border-green-200"
    } else if (platformLower.includes("messenger") || platformLower.includes("facebook")) {
      return "bg-blue-50 text-blue-700 border-blue-200"
    } else if (platformLower.includes("instagram")) {
      return "bg-pink-50 text-pink-700 border-pink-200"
    }
    return "bg-gray-50 text-gray-700 border-gray-200"
  }

  return (
    <motion.div
      key="error-logs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md rounded-xl">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Errors</p>
              <p className="text-3xl font-bold text-red-600">
                {loading ? <Loader2 className="h-8 w-8 animate-spin inline-block" /> : stats.totalErrors}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-md rounded-xl">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Broadcast Errors</p>
              <p className="text-3xl font-bold text-orange-600">
                {loading ? <Loader2 className="h-8 w-8 animate-spin inline-block" /> : stats.broadcastErrors}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-md rounded-xl">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Message Errors</p>
              <p className="text-3xl font-bold text-orange-600">
                {loading ? <Loader2 className="h-8 w-8 animate-spin inline-block" /> : stats.messageErrors}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Logs Table */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <CardTitle>Error Logs</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || loading}
              >
                {refreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              View and analyze error logs from your messaging and broadcasting activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : errorLogs.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No error logs found</p>
                <p className="text-sm text-gray-400 mt-2">All your messages are being delivered successfully!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Error Code</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Error Message</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm font-semibold text-red-600">
                          {log.errorCode}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPlatformBadgeColor(log.platform)}>
                            {log.platform}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.recipient}</TableCell>
                        <TableCell className="max-w-md text-sm">{log.errorMessage}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(log.date)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
