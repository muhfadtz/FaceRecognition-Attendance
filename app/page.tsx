"use client"

import { useEffect, useState } from "react"
import { AttendanceCard } from "@/components/attendance-card"
import { AttendanceForm } from "@/components/attendance-form"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FaceDetectionGuide } from "@/components/face-detection-guide"
import { Navbar } from "@/components/navbar"
import type { AttendanceResponse } from "@/lib/types"
import { motion } from "framer-motion"
import { Camera, Clock, Activity } from "lucide-react"
import AuthGuard from "@/components/auth-guard"

function HomePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update waktu setiap detik
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSuccess = (data: AttendanceResponse) => {
    setAttendanceData(data)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setAttendanceData(null)
  }

  const handleReset = () => {
    setAttendanceData(null)
    setError(null)
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-neutral-900">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider mb-6">
                <Activity className="h-3.5 w-3.5" />
                <span>Attendance Platform</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4 leading-tight title-serif">
                Staffora<span className="text-neutral-900">.</span>
                <span className="text-neutral-700 block text-2xl md:text-3xl font-medium mt-1">
                  Smart Face Attendance
                </span>
              </h1>

              <p className="text-base text-neutral-500 mb-8 max-w-2xl mx-auto">
                Biometric identification platform for enterprise workforce management.
              </p>

              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-neutral-200">
                <Clock className="h-5 w-5 text-neutral-700" />
                <div className="text-left">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Current Time</p>
                  <p className="text-lg font-bold text-neutral-900 font-mono">
                    {currentTime.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <FaceDetectionGuide />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center"
            >
              <div className="w-full max-w-2xl">
                <div className="bg-white p-8 rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-neutral-900 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Mark Attendance</h2>
                    <p className="text-neutral-500 text-sm">
                      Capture your face to record check-in/out
                    </p>
                  </div>

                  {isLoading && <LoadingSpinner />}

                  {!attendanceData && !isLoading && (
                    <AttendanceForm onSuccess={handleSuccess} onError={handleError} onLoading={setIsLoading} />
                  )}

                  {attendanceData && !isLoading && <AttendanceCard data={attendanceData} onReset={handleReset} />}

                  {error && !isLoading && !attendanceData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-200 p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                          <Camera className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-800 text-sm">Verification Error</h3>
                          <p className="text-red-600 text-xs">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <footer className="border-t border-neutral-200 bg-white mt-12">
          <div className="container mx-auto px-6 py-6">
            <div className="text-center">
              <p className="text-neutral-500 text-xs font-semibold tracking-wide uppercase">
                &copy; {new Date().getFullYear()} Staffora Inc.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

export default function Home() {
  return (
    <AuthGuard requiredRole="user">
      <HomePage />
    </AuthGuard>
  )
}
