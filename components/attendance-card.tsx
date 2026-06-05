"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, Clock, User, BadgeIcon as IdCard, Camera, RotateCcw, Sparkles, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { AttendanceCardProps } from "@/lib/types"
import dayjs from "dayjs"

export function AttendanceCard({ data, onReset }: AttendanceCardProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] bg-white">
          <CardHeader className="relative p-0">
            <div className="bg-neutral-900 p-8 text-white relative overflow-hidden">
              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, duration: 0.8 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold mb-2"
                >
                  Absensi Berhasil
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/80 text-sm font-medium"
                >
                  Kehadiran Anda telah tercatat dalam sistem
                </motion.p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">Nama</p>
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {data.nama || "Tidak tersedia"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <IdCard className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">NIP</p>
                  <p className="text-sm font-mono font-semibold text-neutral-900 truncate">
                    {data.nip || "Tidak tersedia"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">Tanggal</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {data.timestamp ? dayjs(data.timestamp).format("DD MMMM YYYY") : "Tidak tersedia"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">Waktu</p>
                  <p className="text-sm font-mono font-semibold text-neutral-900">
                    {data.timestamp ? dayjs(data.timestamp).format("HH:mm:ss") : "Tidak tersedia"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg"
            >
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900 text-sm mb-0.5">Status Kehadiran</p>
                  <p className="text-neutral-700 text-sm font-medium">
                    {data.message || "Absensi berhasil dicatat"}
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="w-full"
            >
              <Button
                onClick={onReset}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg shadow-sm transition-all duration-200"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Tandai Absensi
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
