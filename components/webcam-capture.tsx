"use client"

import { useRef, useState, useCallback } from "react"
import Webcam from "react-webcam"
import type { WebcamCaptureProps } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, RotateCcw, Focus, Zap } from "lucide-react"
import { motion } from "framer-motion"

export type WebcamCapturePropsExtended = WebcamCaptureProps & {
  someExtraProp?: string
}

export function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isReady, setIsReady] = useState(false)

  const toggleCamera = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"))
  }, [])

  const captureImage = useCallback(() => {
    setIsLoading(true)

    setTimeout(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot()
        onCapture(imageSrc)
      } else {
        onCapture(null)
      }
      setIsLoading(false)
    }, 800)
  }, [onCapture])

  const handleUserMedia = useCallback(() => {
    setIsReady(true)
  }, [])

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-2xl mx-auto">


      {/* Enhanced Camera Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full"
      >
        <div className="relative rounded-lg overflow-hidden bg-neutral-100 p-2 border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="relative rounded-md overflow-hidden bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              className="w-full h-auto rounded-md"
              height={720}
              width={1280}
            />

            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleCamera}
                className="bg-white/90 backdrop-blur-sm hover:bg-white border-neutral-200 shadow-lg"
                aria-label="Switch camera"
              >
                <RotateCcw className="h-4 w-4 text-neutral-600" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full">
        <Button
          onClick={captureImage}
          disabled={isLoading || !isReady}
          className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white h-14 text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none rounded-lg border-0"
          aria-label="Capture image"
        >
          <div className="flex items-center justify-center">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Mengambil Foto...</span>
              </>
            ) : (
              <>
                <Camera className="mr-2 h-5 w-5" />
                <span>Ambil Foto</span>
              </>
            )}
          </div>
        </Button>
      </motion.div>

    </div>
  )
}
