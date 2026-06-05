"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import {
  Search,
  Save,
  X,
  Clock,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  Edit,
} from "lucide-react"
import MonthSelector from "@/components/month-selector"
import { getManagementData } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmModal } from "@/components/ui/confirm-modal"

type Employee = {
  id: string
  name: string
  nip: string
  email?: string
  attendance: {
    [tanggal: string]: string
  }
  checkoutAttendance: {
    [tanggal: string]: string
  }
  summary: string
  stats?: {
    hadir: number
    terlambat: number
    absen: number
    totalWorkDays: number
  }
}

type AttendanceSettings = {
  checkInStartTime: string
  onTimeBeforeHour: string
  lateBeforeHour: string
  checkOutStartTime: string
  checkOutEndTime: string
  workDays: string[]
}

type Holiday = {
  id: number
  tanggal: string
  keterangan: string
}

const MONTHS = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
]

const DAY_OPTIONS = [
  { value: "monday", label: "Senin" },
  { value: "tuesday", label: "Selasa" },
  { value: "wednesday", label: "Rabu" },
  { value: "thursday", label: "Kamis" },
  { value: "friday", label: "Jumat" },
  { value: "saturday", label: "Sabtu" },
  { value: "sunday", label: "Minggu" },
]

const ATTENDANCE_STATUS = {
  PRESENT: ["hadir", "tepat waktu"] as const,
  LATE: "terlambat" as const,
  ABSENT: "absen" as const,
  SATURDAY: "sabtu" as const,
  SUNDAY: "minggu" as const,
  HOLIDAY: "libur" as const,
} as const

export default function ManagementPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [employeeData, setEmployeeData] = useState<Employee[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings>({
    checkInStartTime: "07:00",
    onTimeBeforeHour: "09:00",
    lateBeforeHour: "14:00",
    checkOutStartTime: "16:00",
    checkOutEndTime: "18:00",
    workDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  })

  // Add employee editing states
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    nip: "",
    email: "",
    password: "",
  })

  // Tambahkan state untuk holiday management
  const [activeTab, setActiveTab] = useState<"schedule" | "holidays">("schedule")
  const [isAddingHoliday, setIsAddingHoliday] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [holidayForm, setHolidayForm] = useState({
    tanggal: "",
    keterangan: "",
  })

  // Scroll management
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(true)
  const [confirmState, setConfirmState] = useState<{
    type: "delete-holiday" | "delete-employee"
    holiday?: Holiday
    employeeId?: string
    employeeName?: string
  } | null>(null)

  // Cache management
  const lastDataRef = useRef<{
    month: string
    year: string
    data: any
  } | null>(null)

  // Utility functions
  const getSelectedMonthName = () => {
    const month = MONTHS.find((m) => m.value === selectedMonth)
    return month?.label || "Januari"
  }

  // Ganti fungsi getAttendanceColor
  const getAttendanceColor = (status: string) => {
    const presentStatuses = ["hadir", "tepat waktu"]
    if (presentStatuses.includes(status)) return "bg-green-500"
    if (status === "terlambat") return "bg-yellow-500"
    if (status === "absen") return "bg-red-500"
    if (status === "sabtu") return "bg-green-600"
    if (status === "minggu") return "bg-purple-500"
    if (status === "libur") return "bg-orange-500"
    return "bg-gray-300"
  }

  // Ganti fungsi getAttendanceText
  const getAttendanceText = (status: string) => {
    const presentStatuses = ["hadir", "tepat waktu"]
    if (presentStatuses.includes(status)) return "H"
    if (status === "terlambat") return "T"
    if (status === "absen") return "A"
    if (status === "sabtu") return "S"
    if (status === "minggu") return "M"
    if (status === "libur") return "L"
    return "?"
  }

  // Ganti fungsi getAttendanceTooltip
  const getAttendanceTooltip = (status: string, dateStr?: string) => {
    if (status === "libur" && dateStr) {
      const holidayInfo = getHolidayInfo(dateStr)
      return holidayInfo ? `Hari Libur: ${holidayInfo.keterangan}` : "Hari Libur Khusus"
    }

    const presentStatuses = ["hadir", "tepat waktu"]
    if (presentStatuses.includes(status)) return "Hadir"
    if (status === "terlambat") return "Terlambat"
    if (status === "absen") return "Tidak Hadir"
    if (status === "sabtu") return "Hari Kerja Sabtu"
    if (status === "minggu") return "Minggu (Libur)"
    return "Belum Ada Data"
  }

  // Add after getAttendanceTooltip function
  const getCheckoutAttendanceColor = (status: string) => {
    if (status === "pulang") return "bg-blue-500"

    // Ikuti logic yang sama dengan kolom masuk
    const presentStatuses = ["hadir", "tepat waktu"]
    if (presentStatuses.includes(status)) return "bg-green-500"
    if (status === "terlambat") return "bg-yellow-500"
    if (status === "absen") return "bg-red-500"
    if (status === "sabtu") return "bg-green-600"
    if (status === "minggu") return "bg-purple-500"
    if (status === "libur") return "bg-orange-500"
    return "bg-gray-300"
  }

  const getCheckoutAttendanceText = (status: string) => {
    if (status === "pulang") return "P"

    // Tampilkan strip untuk status hari libur/minggu/sabtu
    const presentStatuses = ["hadir", "tepat waktu"]
    if (presentStatuses.includes(status)) return "-"
    if (status === "terlambat") return "-"
    if (status === "absen") return "-"
    if (status === "sabtu") return "-"
    if (status === "minggu") return "-"
    if (status === "libur") return "-"
    return ""
  }

  const getCheckoutAttendanceTooltip = (status: string, dateStr?: string) => {
    if (status === "pulang") return "Sudah Pulang"

    // Ikuti logic tooltip yang sama dengan kolom masuk
    if (status === "libur" && dateStr) {
      const holidayInfo = getHolidayInfo(dateStr)
      return holidayInfo ? `Hari Libur: ${holidayInfo.keterangan}` : "Hari Libur Khusus"
    }

    const presentStatuses = ["hadir", "tepat waktu"]
    if (presentStatuses.includes(status)) return "Belum Absen Pulang"
    if (status === "terlambat") return "Belum Absen Pulang"
    if (status === "absen") return "Tidak Hadir"
    if (status === "sabtu") return "Hari Kerja Sabtu"
    if (status === "minggu") return "Minggu (Libur)"
    return "Belum Ada Data"
  }

  const isHoliday = (dateStr: string) => {
    return holidays.some((holiday) => {
      const holidayDate = new Date(holiday.tanggal).toISOString().split("T")[0]
      return holidayDate === dateStr
    })
  }

  const getDaysInSelectedMonth = () => {
    const lastDay = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth), 0).getDate()
    return Array.from({ length: lastDay }, (_, i) => i + 1)
  }

  const filteredEmployees = employeeData.filter(
    (employee) => employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.nip.includes(searchTerm),
  )

  const isWithinCheckInTime = () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const isCheckInTime =
      currentTime >= attendanceSettings.checkInStartTime && currentTime <= attendanceSettings.lateBeforeHour
    const isCheckOutTime =
      currentTime >= attendanceSettings.checkOutStartTime && currentTime <= attendanceSettings.checkOutEndTime
    return isCheckInTime || isCheckOutTime
  }

  // Holiday management functions
  const resetHolidayForm = () => {
    setHolidayForm({ tanggal: "", keterangan: "" })
    setIsAddingHoliday(false)
    setEditingHoliday(null)
  }

  const handleAddHoliday = async () => {
    if (!holidayForm.tanggal || !holidayForm.keterangan.trim()) {
      alert("Tanggal dan keterangan harus diisi")
      return
    }

    try {
      const response = await fetch("/api/karyawan/management", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: holidayForm.tanggal,
          action: "add",
          keterangan: holidayForm.keterangan.trim(),
        }),
      })

      if (response.ok) {
        await fetchEmployeesAndSettings(true)
        resetHolidayForm()
        alert("Hari libur berhasil ditambahkan")
      } else {
        alert("Gagal menambahkan hari libur")
      }
    } catch (error) {
      console.error("Error adding holiday:", error)
      alert("Terjadi kesalahan saat menambahkan hari libur")
    }
  }

  const handleEditHoliday = async () => {
    if (!holidayForm.tanggal || !holidayForm.keterangan.trim()) {
      alert("Tanggal dan keterangan harus diisi")
      return
    }

    try {
      const response = await fetch("/api/karyawan/management", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: holidayForm.tanggal,
          action: "update",
          keterangan: holidayForm.keterangan.trim(),
          holidayId: editingHoliday?.id,
        }),
      })

      if (response.ok) {
        await fetchEmployeesAndSettings(true)
        resetHolidayForm()
        alert("Hari libur berhasil diperbarui")
      } else {
        alert("Gagal memperbarui hari libur")
      }
    } catch (error) {
      console.error("Error updating holiday:", error)
      alert("Terjadi kesalahan saat memperbarui hari libur")
    }
  }

  const handleDeleteHoliday = async (holiday: Holiday) => {
    try {
      const response = await fetch("/api/karyawan/management", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: holiday.tanggal,
          action: "remove",
          holidayId: holiday.id,
        }),
      })

      if (response.ok) {
        setHolidays((prev) => prev.filter((h) => h.id !== holiday.id))
      } else {
        const data = await response.json()
        alert(data.error || "Gagal menghapus hari libur")
      }
    } catch (error) {
      console.error("Error deleting holiday:", error)
      alert("Terjadi kesalahan saat menghapus hari libur")
    }
  }

  const startEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setHolidayForm({
      tanggal: new Date(holiday.tanggal).toISOString().split("T")[0],
      keterangan: holiday.keterangan,
    })
    setIsAddingHoliday(true)
    setActiveTab("holidays")
  }

  const downloadPDF = async () => {
    try {
      const res = await fetch(`/api/rekap-absensi?month=${selectedMonth}&year=${selectedYear}`)

      if (!res.ok) {
        let errorMessage = "Gagal mengunduh PDF"

        try {
          const contentType = res.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json()
            errorMessage = errorData.error || errorMessage
          } else {
            const text = await res.text()
            errorMessage = text || errorMessage
          }
        } catch (parseErr) {
          console.warn("Gagal parse respons error:", parseErr)
        }

        throw new Error(errorMessage)
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Staffora-rekap-absensi-${selectedMonth}-${selectedYear}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error("Download gagal:", error)
      alert(error.message || "Gagal mengunduh PDF rekap absensi.")
    }
  }

  const resetEmployeeForm = () => {
    setEmployeeForm({ name: "", nip: "", email: "", password: "" })
    setIsEditModalOpen(false)
    setEditingEmployee(null)
  }

  const startEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeForm({
      name: employee.name,
      nip: employee.nip,
      email: employee.email || "",
      password: "",
    })
    setIsEditModalOpen(true)
  }

  const handleEditEmployee = async () => {
    if (!employeeForm.name.trim() || !employeeForm.nip.trim()) {
      alert("Nama dan NIP harus diisi")
      return
    }

    try {
      const response = await fetch("/api/karyawan/editKaryawan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEmployee?.id,
          name: employeeForm.name.trim(),
          nip: employeeForm.nip.trim(),
          email: employeeForm.email.trim(),
          ...(employeeForm.password && { password: employeeForm.password }),
        }),
      })

      if (response.ok) {
        await fetchEmployeesAndSettings(true)
        resetEmployeeForm()
        alert("Data karyawan berhasil diperbarui")
      } else {
        const errorData = await response.json().catch(() => ({ message: "Gagal memperbarui data karyawan" }))
        alert(errorData.message || "Gagal memperbarui data karyawan")
      }
    } catch (error) {
      console.error("Error updating employee:", error)
      alert("Terjadi kesalahan saat memperbarui data karyawan")
    }
  }

  const getHolidayInfo = (dateStr: string) => {
    return holidays.find((holiday) => {
      const holidayDate = new Date(holiday.tanggal).toISOString().split("T")[0]
      return holidayDate === dateStr
    })
  }

  // Event handlers
  const handleHolidayToggle = async (dateStr: string) => {
    const existingHoliday = getHolidayInfo(dateStr)

    if (existingHoliday) {
      // Jika sudah ada, edit
      startEditHoliday(existingHoliday)
    } else {
      // Jika belum ada, tambah baru
      setHolidayForm({
        tanggal: dateStr,
        keterangan: "",
      })
      setIsAddingHoliday(true)
      setActiveTab("holidays")
      setIsSettingsModalOpen(true)
    }
  }

  const handleWorkDayToggle = (day: string) => {
    setAttendanceSettings((prev) => ({
      ...prev,
      workDays: prev.workDays.includes(day) ? prev.workDays.filter((d) => d !== day) : [...prev.workDays, day],
    }))
  }

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    try {
      const response = await fetch("/api/karyawan/management", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      })

      if (response.ok) {
        setEmployeeData((prev) => prev.filter((emp) => emp.id !== employeeId))
        alert(`Data karyawan "${employeeName}" berhasil dihapus!`)
      } else {
        alert("Gagal menghapus data karyawan")
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
      alert("Terjadi kesalahan saat menghapus data karyawan")
    }
  }

  const handleSaveSettings = async () => {
    // Validate time settings
    const checkInStart = new Date(`2000-01-01T${attendanceSettings.checkInStartTime}:00`)
    const onTimeBefore = new Date(`2000-01-01T${attendanceSettings.onTimeBeforeHour}:00`)
    const lateBefore = new Date(`2000-01-01T${attendanceSettings.lateBeforeHour}:00`)
    const checkOutStart = new Date(`2000-01-01T${attendanceSettings.checkOutStartTime}:00`)
    const checkOutEnd = new Date(`2000-01-01T${attendanceSettings.checkOutEndTime}:00`)

    if (onTimeBefore <= checkInStart) {
      alert("Batas waktu tepat waktu harus lebih besar dari waktu mulai absen masuk")
      return
    }

    if (lateBefore <= onTimeBefore) {
      alert("Batas waktu terlambat harus lebih besar dari batas waktu tepat waktu")
      return
    }

    if (checkOutStart <= lateBefore) {
      alert("Waktu mulai absen pulang harus lebih besar dari batas waktu terlambat masuk")
      return
    }

    if (checkOutEnd <= checkOutStart) {
      alert("Batas waktu absen pulang harus lebih besar dari waktu mulai absen pulang")
      return
    }

    try {
      const response = await fetch("/api/karyawan/management", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify(attendanceSettings),
      })

      if (response.ok) {
        setIsSettingsModalOpen(false)
        alert("Pengaturan absensi berhasil disimpan!")
        await fetchEmployeesAndSettings(true)
      } else {
        const errorData = await response.json().catch(() => ({ message: "Gagal menyimpan pengaturan" }))
        alert(errorData.message || "Gagal menyimpan pengaturan absensi")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Terjadi kesalahan saat menyimpan pengaturan")
    }
  }

  const handleManualRefresh = () => {
    fetchEmployeesAndSettings(true)
  }

  // Scroll functions
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftScroll(scrollLeft > 0)
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" })
  }

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" })
  }

  // Data fetching
  const fetchEmployeesAndSettings = useCallback(
    async (forceRefresh = false) => {
      // Use cache if available and not forcing refresh
      if (
        !forceRefresh &&
        lastDataRef.current &&
        lastDataRef.current.month === selectedMonth &&
        lastDataRef.current.year === selectedYear
      ) {
        const cachedData = lastDataRef.current.data

        if (cachedData.attendanceSettings) {
          setAttendanceSettings({
            checkInStartTime: cachedData.attendanceSettings.waktuMulaiAbsen ?? "07:00",
            onTimeBeforeHour: cachedData.attendanceSettings.batasTepatWaktu ?? "09:00",
            lateBeforeHour: cachedData.attendanceSettings.batasTerlambat ?? "14:00",
            checkOutStartTime: cachedData.attendanceSettings.waktuMulaiPulang ?? "16:00",
            checkOutEndTime: cachedData.attendanceSettings.batasWaktuPulang ?? "18:00",
            workDays: cachedData.attendanceSettings.hariKerja ?? [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
            ],
          })
        }

        if (Array.isArray(cachedData.employees)) {
          setEmployeeData(cachedData.employees)
          setLastFetchTime(cachedData.timestamp || new Date().toLocaleString())
        }

        if (Array.isArray(cachedData.holidays)) {
          setHolidays(cachedData.holidays)
        }

        return
      }

      setIsRefreshing(forceRefresh)
      setIsLoading(!forceRefresh)
      setErrorMessage(null)

      try {
        const data = await getManagementData(selectedMonth, selectedYear)

        // Cache the data
        lastDataRef.current = {
          month: selectedMonth,
          year: selectedYear,
          data: data,
        }

        // Update settings
        if (data.attendanceSettings) {
          setAttendanceSettings({
            checkInStartTime: data.attendanceSettings.waktuMulaiAbsen ?? "07:00",
            onTimeBeforeHour: data.attendanceSettings.batasTepatWaktu ?? "09:00",
            lateBeforeHour: data.attendanceSettings.batasTerlambat ?? "14:00",
            checkOutStartTime: data.attendanceSettings.waktuMulaiPulang ?? "16:00",
            checkOutEndTime: data.attendanceSettings.batasWaktuPulang ?? "18:00",
            workDays: data.attendanceSettings.hariKerja ?? [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
            ],
          })
        }

        // Update employee data
        setEmployeeData(Array.isArray(data.employees) ? data.employees : [])
        setLastFetchTime(data.timestamp || new Date().toLocaleString())

        // Update holidays data
        setHolidays(Array.isArray(data.holidays) ? data.holidays : [])
      } catch (error: any) {
        console.error("Failed to load data:", error)
        setErrorMessage(error.message || "Gagal memuat data. Silakan coba lagi.")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [selectedMonth, selectedYear],
  )

  // Effects
  useEffect(() => {
    fetchEmployeesAndSettings()
  }, [fetchEmployeesAndSettings])

  useEffect(() => {
    const handleFocus = () => {
      if (employeeData.length === 0) {
        fetchEmployeesAndSettings(true)
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [employeeData.length, fetchEmployeesAndSettings])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
      handleScroll()
      return () => scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen">
        <div className="flex items-center gap-4 border-b border-neutral-200 pb-6">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        <div className="flex flex-col lg:flex-row gap-4 p-6 bg-white rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-6">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden p-6">
          <div className="space-y-4">
            <div className="flex gap-4 border-b border-neutral-200 pb-4">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-6 flex-1 rounded-md" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center py-3 border-b border-neutral-200/40">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-6 w-48 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
                <div className="flex gap-2 flex-1">
                  <Skeleton className="h-6 w-8 rounded-md" />
                  <Skeleton className="h-6 w-8 rounded-md" />
                  <Skeleton className="h-6 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <h2 className="text-sm font-semibold text-red-700 mb-2">Terjadi Kesalahan</h2>
              <p className="text-xs text-red-600">{errorMessage}</p>
            </div>
            <button onClick={handleManualRefresh} disabled={isRefreshing}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-lg transition-colors text-sm font-medium">
              {isRefreshing ? <><RefreshCw className="h-4 w-4 inline mr-2 animate-spin" />Memuat...</> : <><RefreshCw className="h-4 w-4 inline mr-2" />Coba Lagi</>}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Manajemen Karyawan</h1>
          <p className="text-sm text-neutral-500">Kelola data karyawan dan absensi</p>
          {lastFetchTime && <p className="text-[10px] text-neutral-400 font-mono mt-1">Terakhir: {lastFetchTime}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleManualRefresh} disabled={isRefreshing}
            className="flex items-center px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-lg transition-all disabled:cursor-not-allowed text-sm font-medium shadow-sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Memuat..." : "Refresh"}
          </button>
          <button onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-white text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all text-sm font-medium shadow-sm">
            <Clock className="h-4 w-4 mr-2" />
            Atur Jam Kerja
          </button>
        </div>
      </div>

      {/* Status Absensi */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-600">Status Absensi</h3>
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full ${isWithinCheckInTime() ? "bg-emerald-500 animate-pulse" : "bg-red-500"} mr-2`} />
            <span className="text-xs font-medium text-neutral-700">{isWithinCheckInTime() ? "Sistem Absensi Aktif" : "Sistem Absensi Tidak Aktif"}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 text-xs uppercase tracking-wider mb-2">Jam Masuk</h4>
            <div className="text-xs text-neutral-600 space-y-1">
              <div><span className="font-medium">Mulai:</span> {attendanceSettings.checkInStartTime}</div>
              <div><span className="font-medium">Selesai:</span> {attendanceSettings.lateBeforeHour}</div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 text-xs uppercase tracking-wider mb-2">Jam Pulang</h4>
            <div className="text-xs text-neutral-600 space-y-1">
              <div><span className="font-medium">Mulai:</span> {attendanceSettings.checkOutStartTime}</div>
              <div><span className="font-medium">Selesai:</span> {attendanceSettings.checkOutEndTime}</div>
            </div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 text-xs uppercase tracking-wider mb-2">Status Kehadiran</h4>
            <div className="text-xs text-neutral-600 space-y-1">
              <div><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5" />Hadir: {attendanceSettings.checkInStartTime} - {attendanceSettings.onTimeBeforeHour}</div>
              <div><span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5" />Terlambat: {attendanceSettings.onTimeBeforeHour} - {attendanceSettings.lateBeforeHour}</div>
              <div><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5" />Tidak Hadir</div>
              <div><span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5" />Libur</div>
            </div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 text-xs uppercase tracking-wider mb-2">Hari Kerja</h4>
            <div className="text-xs text-neutral-600 mb-2">{attendanceSettings.workDays.map((day) => DAY_OPTIONS.find((d) => d.value === day)?.label).join(", ")}</div>
            {holidays.length > 0 && <div className="text-xs text-neutral-600"><span className="font-medium">Hari Libur:</span> {holidays.length} hari</div>}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4 p-6 bg-white rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input type="text" placeholder="Cari nama atau NIP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all text-sm shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
        </div>
        <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
        <button onClick={downloadPDF}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-all shadow-sm">
          Download PDF
        </button>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex relative">
          {/* Fixed Left Column - Employee Info */}
          <div className="sticky left-0 z-10">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th
                    colSpan={3}
                    className="h-12 bg-secondary/80 dark:bg-primary/20 px-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-b border-r border-border dark:border-gray-600"
                  >
                    Informasi Karyawan
                  </th>
                </tr>
                <tr>
                  <th className="h-10 w-16 px-3 bg-secondary dark:bg-primary/10 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-r">
                    No
                  </th>
                  <th className="h-10 w-48 px-3 bg-secondary dark:bg-primary/10 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-r">
                    Nama
                  </th>
                  <th className="h-10 w-36 px-3 bg-secondary dark:bg-primary/10 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-r">
                    NIP
                  </th>
                </tr>
                <tr>
                  <th className="h-8 w-16 bg-secondary dark:bg-primary/10 border-b border-r"></th>
                  <th className="h-8 w-48 bg-secondary dark:bg-primary/10 border-b border-r"></th>
                  <th className="h-8 w-36 bg-secondary dark:bg-primary/10 border-b border-r"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp, i) => (
                    <tr key={emp.id} className="hover:bg-secondary dark:hover:bg-primary/5 transition-colors">
                      <td className="h-16 w-16 px-3 text-center text-sm border-b border-r bg-white dark:bg-gray-800 align-middle">
                        {i + 1}
                      </td>
                      <td className="h-16 w-48 px-3 text-center text-sm border-b border-r bg-white dark:bg-gray-800 align-middle">
                        {emp.name}
                      </td>
                      <td className="h-16 w-36 px-3 text-center text-sm border-b border-r bg-white dark:bg-gray-800 align-middle">
                        {emp.nip}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="h-16 text-center text-sm border-b border-r bg-white dark:bg-gray-800">
                      Tidak ada data karyawan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Scrollable Middle Column - Attendance Data */}
          <div className="relative flex-1 overflow-hidden">
            {/* Scroll buttons */}
            {showLeftScroll && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-primary text-white rounded-r-lg p-2 shadow-lg hover:bg-primary/90 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {showRightScroll && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-primary text-white rounded-l-lg p-2 shadow-lg hover:bg-primary/90 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-secondary"
              style={{ maxWidth: "calc(100vw - 400px)" }}
              onScroll={handleScroll}
            >
              <table className="border-collapse w-max">
                <thead>
                  <tr>
                    <th
                      colSpan={getDaysInSelectedMonth().length * 2}
                      className="h-12 bg-secondary/80 dark:bg-primary/20 px-4 text-center text-sm font-semibold border-b border-r sticky top-0"
                    >
                      Absensi - {getSelectedMonthName()} {selectedYear}
                    </th>
                  </tr>
                  <tr className="sticky top-12">
                    {getDaysInSelectedMonth().map((day, index) => {
                      const dayStr = day.toString().padStart(2, "0")
                      const dateKey = `${selectedYear}-${selectedMonth}-${dayStr}`
                      const isHolidayDay = isHoliday(dateKey)
                      const isLastDay = index === getDaysInSelectedMonth().length - 1

                      return (
                        <th
                          key={day}
                          colSpan={2}
                          className={`h-10 w-24 px-2 text-center text-xs font-medium border-b border-r relative group cursor-pointer transition-colors ${
                            isHolidayDay
                              ? "bg-orange-200 dark:bg-orange-900/50 hover:bg-orange-300 dark:hover:bg-orange-900/70"
                              : "bg-secondary dark:bg-primary/10 hover:bg-secondary/80 dark:hover:bg-primary/20"
                          }`}
                          onClick={() => handleHolidayToggle(dateKey)}
                          title={
                            isHolidayDay
                              ? `${day} - Hari Libur (Klik untuk hapus)`
                              : `${day} - Klik untuk tandai sebagai hari libur`
                          }
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">{day}</span>
                            {isHolidayDay && (
                              <div className="flex items-center justify-center">
                                <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                                <span className="text-xs text-orange-600 dark:text-orange-400 ml-1">L</span>
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-5 opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none"></div>
                        </th>
                      )
                    })}
                  </tr>
                  <tr className="sticky top-22">
                    {getDaysInSelectedMonth().map((day, dayIndex) => (
                      <React.Fragment key={day}>
                        <th className="h-8 w-12 px-1 bg-secondary dark:bg-primary/10 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-r">
                          Masuk
                        </th>
                        <th className="h-8 w-12 px-1 bg-blue-50 dark:bg-blue-900/20 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-r">
                          Pulang
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-secondary dark:hover:bg-primary/5 transition-colors">
                        {getDaysInSelectedMonth().map((day, dayIndex) => {
                          const dayStr = day.toString().padStart(2, "0")
                          const dateKey = `${selectedYear}-${selectedMonth}-${dayStr}`
                          const checkinStatus = emp.attendance?.[dateKey] || "tidak"
                          const checkoutStatus = emp.checkoutAttendance?.[dateKey] || "kosong"
                          const isLastDay = dayIndex === getDaysInSelectedMonth().length - 1

                          return (
                            <React.Fragment key={day}>
                              {/* Check-in column */}
                              <td className="h-16 w-12 px-2 text-center border-b border-r">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto ${getAttendanceColor(
                                    checkinStatus,
                                  )}`}
                                  title={getAttendanceTooltip(checkinStatus, dateKey)}
                                >
                                  {getAttendanceText(checkinStatus)}
                                </div>
                              </td>
                              {/* Check-out column */}
                              <td className="h-16 w-12 px-2 text-center border-b border-r">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto ${getCheckoutAttendanceColor(
                                    checkoutStatus === "kosong" ? checkinStatus : checkoutStatus,
                                  )}`}
                                  title={getCheckoutAttendanceTooltip(
                                    checkoutStatus === "kosong" ? checkinStatus : checkoutStatus,
                                    dateKey,
                                  )}
                                >
                                  {getCheckoutAttendanceText(
                                    checkoutStatus === "kosong" ? checkinStatus : checkoutStatus,
                                  )}
                                </div>
                              </td>
                            </React.Fragment>
                          )
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={getDaysInSelectedMonth().length * 2}
                        className="h-16 text-center text-sm border-b border-r bg-white dark:bg-gray-800"
                      >
                        Tidak ada data absensi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fixed Right Columns - Summary and Actions */}
          <div className="sticky right-0 z-10 flex">
            {/* Summary */}
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="h-12 w-24 bg-secondary/80 dark:bg-primary/20 px-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-b">
                    Total
                  </th>
                </tr>
                <tr>
                  <th className="h-10 w-24 bg-secondary dark:bg-primary/10 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-l">
                    H(T)/Total
                  </th>
                </tr>
                <tr>
                  <th className="h-8 w-24 bg-secondary dark:bg-primary/10 border-b border-l"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-secondary dark:hover:bg-primary/5 transition-colors">
                      <td className="h-16 w-24 px-3 text-center border-b border-l bg-white dark:bg-gray-800 align-middle">
                        <div className="flex items-center justify-center font-mono text-sm text-gray-700 dark:text-gray-200">
                          {emp.summary}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="h-16 w-24 px-3 text-center border-b border-l bg-white dark:bg-gray-800">-</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Actions */}
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="h-12 w-24 bg-secondary/80 dark:bg-primary/20 px-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-b">
                    Aksi
                  </th>
                </tr>
                <tr>
                  <th className="h-10 w-24 bg-secondary dark:bg-primary/10 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-l">
                    &nbsp;
                  </th>
                </tr>
                <tr>
                  <th className="h-8 w-24 bg-secondary dark:bg-primary/10 border-b border-l"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-secondary dark:hover:bg-primary/5 transition-colors">
                      <td className="h-16 w-24 px-3 text-center border-b border-l bg-white dark:bg-gray-800 align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEditEmployee(emp)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md transition-colors"
                            title={`Edit data ${emp.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmState({ type: "delete-employee", employeeId: emp.id, employeeName: emp.name })}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors"
                            title={`Hapus data ${emp.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="h-16 w-24 px-3 text-center border-b border-l bg-white dark:bg-gray-800">-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Edit Data Karyawan</h3>
              <button onClick={resetEmployeeForm} className="text-neutral-400 hover:text-neutral-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Nama Lengkap *</label>
                <input type="text" value={employeeForm.name} onChange={(e) => setEmployeeForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">NIP *</label>
                <input type="text" value={employeeForm.nip} onChange={(e) => setEmployeeForm((p) => ({ ...p, nip: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Email</label>
                <input type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Password Baru</label>
                <input type="password" value={employeeForm.password} onChange={(e) => setEmployeeForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
                <p className="mt-1 text-xs text-neutral-500">Kosongkan jika tidak ingin mengubah password</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleEditEmployee} disabled={!employeeForm.name.trim() || !employeeForm.nip.trim()}
                className="flex-1 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed shadow-sm">
                <Save className="h-4 w-4 inline mr-2" />Simpan
              </button>
              <button onClick={resetEmployeeForm}
                className="px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Pengaturan Sistem</h3>
              <button onClick={() => { setIsSettingsModalOpen(false); resetHolidayForm(); setActiveTab("schedule") }}
                className="text-neutral-400 hover:text-neutral-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex border-b border-neutral-200 mb-6">
              <button onClick={() => setActiveTab("schedule")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "schedule" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>
                <Clock className="h-4 w-4 inline mr-2" />Jam Kerja
              </button>
              <button onClick={() => setActiveTab("holidays")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "holidays" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>
                <Calendar className="h-4 w-4 inline mr-2" />Hari Libur
              </button>
            </div>

            {/* Schedule Tab Content */}
            {activeTab === "schedule" && (
              <div className="space-y-6">
                {/* Existing schedule content */}
                <div className="border-b border-neutral-200 pb-6">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center"><Clock className="h-4 w-4 mr-2" />Pengaturan Waktu Absensi</h4>
                  <div className="space-y-4">
                    {[
                      { label: "1. Waktu Mulai Absen Masuk", val: attendanceSettings.checkInStartTime, set: (v: string) => setAttendanceSettings((p) => ({ ...p, checkInStartTime: v })), desc: "Waktu mulai karyawan bisa melakukan absensi masuk" },
                      { label: "2. Batas Waktu Tepat Waktu", val: attendanceSettings.onTimeBeforeHour, set: (v: string) => setAttendanceSettings((p) => ({ ...p, onTimeBeforeHour: v })), desc: "Absen sebelum jam ini dianggap Hadir" },
                      { label: "3. Batas Waktu Terlambat", val: attendanceSettings.lateBeforeHour, set: (v: string) => setAttendanceSettings((p) => ({ ...p, lateBeforeHour: v })), desc: "Absen setelah jam ini dianggap Tidak Hadir" },
                    ].map(({ label, val, set, desc }) => (
                      <div key={label}>
                        <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">{label}</label>
                        <input type="time" value={val} onChange={(e) => set(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
                        <p className="mt-1 text-xs text-neutral-500">{desc}</p>
                      </div>
                    ))}
                    <div className="border-t border-neutral-200 pt-4">
                      <h5 className="text-sm font-semibold text-neutral-900 mb-3">Pengaturan Jam Pulang</h5>
                      {[
                        { label: "4. Waktu Mulai Absen Pulang", val: attendanceSettings.checkOutStartTime, set: (v: string) => setAttendanceSettings((p) => ({ ...p, checkOutStartTime: v })), desc: "Waktu mulai absensi pulang" },
                        { label: "5. Batas Waktu Absen Pulang", val: attendanceSettings.checkOutEndTime, set: (v: string) => setAttendanceSettings((p) => ({ ...p, checkOutEndTime: v })), desc: "Batas akhir absensi pulang" },
                      ].map(({ label, val, set, desc }) => (
                        <div key={label}>
                          <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">{label}</label>
                          <input type="time" value={val} onChange={(e) => set(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
                          <p className="mt-1 text-xs text-neutral-500">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex"><AlertCircle className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0" /><p className="text-xs text-amber-800">Sistem absensi hanya aktif dari Waktu Mulai Absen sampai Batas Waktu Terlambat.</p></div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-3 block">Hari Kerja</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DAY_OPTIONS.map((day) => (
                      <label key={day.value} className="flex items-center space-x-2 cursor-pointer text-sm text-neutral-700">
                        <input type="checkbox" checked={attendanceSettings.workDays.includes(day.value)} onChange={() => handleWorkDayToggle(day.value)}
                          className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                        <span>{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-2">Preview</h4>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <div><strong>Jam Masuk:</strong> {attendanceSettings.checkInStartTime} - {attendanceSettings.lateBeforeHour}</div>
                    <div><strong>Jam Pulang:</strong> {attendanceSettings.checkOutStartTime} - {attendanceSettings.checkOutEndTime}</div>
                    <div className="mt-2 pt-2 border-t border-neutral-200"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5" />Hadir: {attendanceSettings.checkInStartTime} - {attendanceSettings.onTimeBeforeHour}</div>
                    <div><span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5" />Terlambat: {attendanceSettings.onTimeBeforeHour} - {attendanceSettings.lateBeforeHour}</div>
                    <div><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5" />Tidak Hadir</div>
                    <div className="mt-2"><strong>Hari Kerja:</strong> {attendanceSettings.workDays.map((d) => DAY_OPTIONS.find((o) => o.value === d)?.label).join(", ")}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSaveSettings} disabled={attendanceSettings.workDays.length === 0}
                    className="flex-1 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed shadow-sm">
                    <Save className="h-4 w-4 inline mr-2" />Simpan Pengaturan
                  </button>
                </div>
              </div>
            )}

            {/* Holidays Tab Content */}
            {activeTab === "holidays" && (
              <div className="space-y-6">
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-4">{editingHoliday ? "Edit Hari Libur" : "Tambah Hari Libur"}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Tanggal</label>
                      <input type="date" value={holidayForm.tanggal} onChange={(e) => setHolidayForm((p) => ({ ...p, tanggal: e.target.value }))}
                        className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Keterangan</label>
                      <input type="text" value={holidayForm.keterangan} onChange={(e) => setHolidayForm((p) => ({ ...p, keterangan: e.target.value }))}
                        placeholder="Contoh: Hari Raya Idul Fitri"
                        className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={editingHoliday ? handleEditHoliday : handleAddHoliday} disabled={!holidayForm.tanggal || !holidayForm.keterangan.trim()}
                      className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed shadow-sm">
                      {editingHoliday ? "Update" : "Tambah"} Hari Libur
                    </button>
                    {(isAddingHoliday || editingHoliday) && (
                      <button onClick={resetHolidayForm}
                        className="px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">Batal</button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-neutral-900">Daftar Hari Libur ({holidays.length})</h4>
                    <button onClick={() => { setHolidayForm({ tanggal: "", keterangan: "" }); setIsAddingHoliday(true); setEditingHoliday(null) }}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium transition-all shadow-sm">+ Tambah</button>
                  </div>
                  {holidays.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {holidays.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()).map((holiday) => (
                        <div key={holiday.id} className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-neutral-900 text-sm">{holiday.keterangan}</div>
                            <div className="text-xs text-neutral-500">{new Date(holiday.tanggal).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => startEditHoliday(holiday)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => setConfirmState({ type: "delete-holiday", holiday })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Belum ada hari libur</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-xs font-semibold uppercase tracking-widest text-neutral-700 mb-2">Hari Libur Umum</h5>
                  <p className="text-xs text-neutral-500 mb-3">Klik untuk menambah (tahun {selectedYear})</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { date: `${selectedYear}-01-01`, name: "Tahun Baru" },
                      { date: `${selectedYear}-08-17`, name: "Hari Kemerdekaan" },
                      { date: `${selectedYear}-12-25`, name: "Hari Natal" },
                      { date: `${selectedYear}-05-01`, name: "Hari Buruh" },
                    ].map((ch) => {
                      const exists = holidays.some((h) => new Date(h.tanggal).toISOString().split("T")[0] === ch.date)
                      return (
                        <button key={ch.date} onClick={() => { if (!exists) { setHolidayForm({ tanggal: ch.date, keterangan: ch.name }); setIsAddingHoliday(true); setEditingHoliday(null) } }} disabled={exists}
                          className={`p-2 text-xs rounded-lg transition-colors ${exists ? "bg-neutral-200 text-neutral-500 cursor-not-allowed" : "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200"}`}>
                          {ch.name}{exists && " ✓"}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-neutral-200">
              <button onClick={() => { setIsSettingsModalOpen(false); resetHolidayForm(); setActiveTab("schedule") }}
                className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmState !== null}
        onOpenChange={(open) => { if (!open) setConfirmState(null) }}
        title={confirmState?.type === "delete-employee" ? "Hapus Karyawan" : "Hapus Hari Libur"}
        description={
          confirmState?.type === "delete-employee"
            ? `Apakah Anda yakin ingin menghapus data karyawan "${confirmState.employeeName}"? Semua data absensi akan ikut terhapus.`
            : `Hapus hari libur "${confirmState?.holiday?.keterangan}" pada tanggal ${confirmState?.holiday?.tanggal ? new Date(confirmState.holiday.tanggal).toLocaleDateString("id-ID") : ""}?`
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (confirmState?.type === "delete-employee" && confirmState.employeeId) {
            handleDeleteEmployee(confirmState.employeeId, confirmState.employeeName || "")
          } else if (confirmState?.type === "delete-holiday" && confirmState.holiday) {
            handleDeleteHoliday(confirmState.holiday)
          }
          setConfirmState(null)
        }}
      />
    </div>
  )
}
