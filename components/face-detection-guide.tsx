"use client"

import { Camera, CheckCircle, AlertTriangle, Info, Lightbulb } from "lucide-react"
import { motion } from "framer-motion"

export function FaceDetectionGuide() {
  const guidelines = [
    {
      icon: Camera,
      title: "Posisi Wajah",
      description: "Pastikan wajah berada di tengah frame",
      type: "info",
    },
    {
      icon: Lightbulb,
      title: "Pencahayaan",
      description: "Gunakan pencahayaan yang cukup terang",
      type: "success",
    },
    {
      icon: AlertTriangle,
      title: "Hindari Bayangan",
      description: "Pastikan tidak ada bayangan pada wajah",
      type: "warning",
    },
    {
      icon: CheckCircle,
      title: "Lepas Aksesoris",
      description: "Lepas kacamata atau masker jika memungkinkan",
      type: "info",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-5 rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center">
          <Camera className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Panduan Pengambilan Foto</h3>
          <p className="text-xs text-neutral-500">Tips untuk hasil terbaik</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {guidelines.map((guide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-neutral-200 text-neutral-700">
              <guide.icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-neutral-900 text-xs">{guide.title}</h4>
              <p className="text-neutral-500 text-[11px]">{guide.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="flex items-center gap-2 mb-1">
          <Info className="h-3.5 w-3.5 text-neutral-600" />
          <span className="text-xs font-semibold text-neutral-700">Tips</span>
        </div>
        <p className="text-[11px] text-neutral-500">
          Pastikan koneksi internet stabil dan izinkan akses kamera pada browser Anda.
        </p>
      </div>
    </motion.div>
  )
}
