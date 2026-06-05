"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, UserX, Clock, Calendar, TrendingUp, Activity, Loader2, AlertCircle } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardContent() {
  const [data, setData] = useState<{
    date: string
    totalKaryawan: number
    hadir: number
    absen: number
    telat: number
    pulang: number
    lastUpdated: string
  } | null>(null)

  const [activities, setActivities] = useState<
    {
      id: number
      name: string
      action: string
      time: string
      status: string
      role: string
    }[]
  >([])

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch("/api/karyawan/dashboard")
      if (!response.ok) throw new Error("Gagal memuat data")

      const result = await response.json()

      setData({
        date: new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        totalKaryawan: result.totalKaryawan,
        hadir: result.hadir,
        absen: result.absen,
        telat: result.telat,
        pulang: result.pulang || 0,
        lastUpdated: new Date().toLocaleTimeString("id-ID"),
      })

      setActivities(result.aktivitasTerbaru || [])
      setIsLoading(false)
    } catch (error) {
      console.error("Error memuat data dashboard:", error)
      setError("Gagal memuat data dashboard. Silakan coba lagi.")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const dataTimer = setInterval(() => fetchDashboardData(), 60000)

    return () => {
      clearInterval(timer)
      clearInterval(dataTimer)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 bg-background min-h-screen">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-6 border border-border shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Activities Skeleton */}
        <div className="max-w-4xl mx-auto w-full mt-4">
          <div className="bg-card rounded-lg border border-border p-6 lg:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-background/50 border border-border/60 rounded-lg">
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true)
              fetchDashboardData()
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Tidak ada data tersedia</p>
        </div>
      </div>
    )
  }

  const attendancePercentage = data.totalKaryawan > 0 ? Math.round((data.hadir / data.totalKaryawan) * 100) : 0

  const statsCards = [
    {
      title: "Total Karyawan",
      value: data.totalKaryawan,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
      bgColor: "bg-card",
      textColor: "text-foreground",
      changeType: "increase",
    },
    {
      title: "Hadir Hari Ini",
      value: data.hadir,
      icon: UserCheck,
      color: "text-primary bg-primary/10",
      bgColor: "bg-card",
      textColor: "text-foreground",
      change: `${attendancePercentage}%`,
      changeType: "increase",
    },
    {
      title: "Tidak Masuk",
      value: data.absen,
      icon: UserX,
      color: "text-destructive bg-destructive/10",
      bgColor: "bg-card",
      textColor: "text-foreground",
      changeType: "decrease",
      change: `${100 - attendancePercentage}%`,
    },
    {
      title: "Terlambat",
      value: data.telat,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
      bgColor: "bg-card",
      textColor: "text-foreground",
      change: data.totalKaryawan > 0 ? `${Math.round((data.telat / data.totalKaryawan) * 100)}%` : "0%",
      changeType: "increase",
    },
    {
      title: "Sudah Pulang",
      value: data.pulang,
      icon: UserCheck,
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40",
      bgColor: "bg-card",
      textColor: "text-foreground",
      change: data.hadir > 0 ? `${Math.round((data.pulang / data.hadir) * 100)}%` : "0%",
      changeType: "increase",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ontime":
        return "text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-900"
      case "late":
        return "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
      case "permission":
        return "text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
      case "sick":
        return "text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900"
      case "checkout":
        return "text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900"
      default:
        return "text-muted-foreground bg-secondary dark:bg-gray-900 border border-border"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ontime":
        return "Tepat Waktu"
      case "late":
        return "Terlambat"
      case "permission":
        return "Izin"
      case "sick":
        return "Sakit"
      case "checkout":
        return "Pulang"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <SidebarTrigger className="-ml-1 lg:hidden text-foreground" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{data.date}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right bg-card px-4 py-2.5 rounded-md shadow-sm border border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Waktu Sekarang</p>
              <p className="text-lg lg:text-xl font-bold text-foreground font-mono mt-0.5">
                {currentTime.toLocaleTimeString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-md p-6 border border-border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              {card.change && (
                <div
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    card.changeType === "increase"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {card.change}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{card.title}</p>
              <p className={`text-2xl lg:text-3xl font-bold tracking-tight ${card.textColor}`}>{card.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activities */}
      <div className="max-w-4xl mx-auto w-full mt-4">
        <div className="bg-card rounded-md border border-border p-6 lg:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              Aktivitas Terbaru
            </h3>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-background/50 border border-border/60 rounded-md hover:bg-background/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {activity.name}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({activity.role})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.action}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-semibold text-foreground mb-1 font-mono">{activity.time}</p>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada aktivitas hari ini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
