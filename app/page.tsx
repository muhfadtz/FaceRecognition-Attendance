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

      <main className="min-h-screen bg-paper text-ink">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                <Activity className="h-4 w-4" />
                <span className="mono-label !text-[10px] tracking-widest">Enterprise Attendance Platform</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-ink mb-4 leading-tight title-serif">
                Staffora<span className="text-accent">.</span>
                <span className="text-accent block text-2xl md:text-3xl font-medium mt-1">
                  Smart Face Attendance
                </span>
              </h1>

              <p className="text-base text-muted mb-8 max-w-2xl mx-auto">
                Next-generation biometric identification and smart analytics platform for enterprise workforce management.
              </p>

              {/* Current Time Display */}
              <div className="inline-flex items-center gap-3 bg-surface px-6 py-3 rounded-2xl shadow-sm border border-border">
                <Clock className="h-5 w-5 text-accent" />
                <div className="text-left">
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold">Current Time</p>
                  <p className="text-lg font-bold text-ink font-mono">
                    {currentTime.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Guide Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <FaceDetectionGuide />
            </motion.div>

            {/* Main Attendance Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center"
            >
              <div className="w-full max-w-2xl">
                <div className="bg-surface p-10 rounded-3xl border border-border shadow-sm">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
                      <Camera className="h-10 w-10 text-surface" />
                    </div>
                    <h2 className="text-2xl font-bold text-ink mb-3 title-serif">Mark Attendance</h2>
                    <p className="text-muted text-sm">
                      Align your face to capture secure biometric check-in/out
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
                      className="bg-red-50 border border-red-200 p-6 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Camera className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-800">Verification Error</h3>
                          <p className="text-red-600 text-sm">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>


              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-surface mt-12">
          <div className="container mx-auto px-6 py-6">
            <div className="text-center">
              <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                © {new Date().getFullYear()} Staffora Inc. All rights reserved.
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
