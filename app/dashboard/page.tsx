"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, UserX, Clock, Calendar, TrendingUp, Activity, Loader2, AlertCircle } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
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
    return () => { clearInterval(timer); clearInterval(dataTimer) }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen">
        <div className="flex items-center gap-4 border-b border-neutral-200 pb-6">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
          <Skeleton className="h-12 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center"><Skeleton className="h-10 w-10 rounded-md" /><Skeleton className="h-5 w-10 rounded-full" /></div>
              <div className="flex flex-col gap-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-16" /></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white border border-neutral-200 rounded-lg shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-sm text-neutral-500 mb-6">{error}</p>
          <button onClick={() => { setIsLoading(true); fetchDashboardData() }}
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Tidak ada data tersedia</p>
      </div>
    )
  }

  const attendancePercentage = data.totalKaryawan > 0 ? Math.round((data.hadir / data.totalKaryawan) * 100) : 0

  const statsCards = [
    { title: "Total Karyawan", value: data.totalKaryawan, icon: Users, color: "text-blue-600 bg-blue-50", changeType: "increase" as const },
    { title: "Hadir Hari Ini", value: data.hadir, icon: UserCheck, color: "text-emerald-600 bg-emerald-50", change: `${attendancePercentage}%`, changeType: "increase" as const },
    { title: "Tidak Masuk", value: data.absen, icon: UserX, color: "text-red-600 bg-red-50", changeType: "decrease" as const, change: `${100 - attendancePercentage}%` },
    { title: "Terlambat", value: data.telat, icon: Clock, color: "text-amber-600 bg-amber-50", changeType: "increase" as const, change: data.totalKaryawan > 0 ? `${Math.round((data.telat / data.totalKaryawan) * 100)}%` : "0%" },
    { title: "Sudah Pulang", value: data.pulang, icon: UserCheck, color: "text-purple-600 bg-purple-50", changeType: "increase" as const, change: data.hadir > 0 ? `${Math.round((data.pulang / data.hadir) * 100)}%` : "0%" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ontime": return "text-emerald-700 bg-emerald-50 border border-emerald-200"
      case "late": return "text-amber-700 bg-amber-50 border border-amber-200"
      case "permission": return "text-blue-700 bg-blue-50 border border-blue-200"
      case "sick": return "text-purple-700 bg-purple-50 border border-purple-200"
      case "checkout": return "text-purple-700 bg-purple-50 border border-purple-200"
      default: return "text-neutral-500 bg-neutral-50 border border-neutral-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ontime": return "Tepat Waktu"; case "late": return "Terlambat"
      case "permission": return "Izin"; case "sick": return "Sakit"
      case "checkout": return "Pulang"; default: return "Unknown"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen">
      <div className="flex items-center gap-4 border-b border-neutral-200 pb-6">
        <SidebarTrigger className="-ml-1 lg:hidden text-neutral-900" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-1">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
            <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{data.date}</span>
            </p>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-neutral-200">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Waktu</p>
            <p className="text-lg font-bold text-neutral-900 font-mono">{currentTime.toLocaleTimeString("id-ID")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {statsCards.map((card, index) => (
          <div key={index}
            className="bg-white rounded-lg p-6 border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              {card.change && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                  card.changeType === "increase" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}>{card.change}</span>
              )}
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1">{card.title}</p>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto w-full mt-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 lg:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6 border-b border-neutral-200 pb-4">
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-neutral-500" />
              Aktivitas Terbaru
            </h3>
          </div>
          {activities.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {activities.map((activity) => (
                <div key={activity.id}
                  className="flex items-center justify-between p-4 bg-neutral-50/50 border border-neutral-200/60 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 text-sm truncate">
                      {activity.name}
                      <span className="ml-2 text-xs font-normal text-neutral-500">({activity.role})</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">{activity.action}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-semibold text-neutral-900 mb-1 font-mono">{activity.time}</p>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Activity className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">Belum ada aktivitas hari ini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
