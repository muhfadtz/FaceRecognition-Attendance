"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Camera, Save, X, Loader2, RotateCcw, User, Mail, Lock, BadgeIcon, CheckCircle, UserPlus, Users } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

interface FormData {
    nama: string
    nip: string
    email: string
    password: string
    status: string
}

export default function RegistrationPage() {
    const [formData, setFormData] = useState<FormData>({
        nama: "",
        nip: "",
        email: "",
        password: "",
        status: "Staff",
    })

    const [currentStep, setCurrentStep] = useState(1)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<string | null>(null)
    const [isNipValid, setIsNipValid] = useState(true)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isCameraActive, setIsCameraActive] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        setFormData((prev) => {
            const newData = {
                ...prev,
                [name]: value,
            }
            return newData
        })

        // Reset error message when user types
        if (submitMessage) {
            setSubmitMessage(null)
        }

        // Validasi NIP secara real-time
        if (name === "nip") {
            const isValidFormat = /^\d{5,12}$/.test(value.trim())
            setIsNipValid(value === "" || isValidFormat)
        }
    }

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setIsCameraActive(true)
            }
        } catch (error) {
            console.error("Error accessing camera:", error)
            setSubmitMessage("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.")
        }
    }, [])

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach((track) => track.stop())
            videoRef.current.srcObject = null
            setIsCameraActive(false)
        }
    }, [])

    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const video = videoRef.current
            const context = canvas.getContext("2d")

            if (context) {
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                context.drawImage(video, 0, 0)

                const dataURL = canvas.toDataURL("image/jpeg", 0.8)
                setImageSrc(dataURL)
                stopCamera()
                setSubmitMessage("Foto berhasil diambil!")
            }
        }
    }, [stopCamera])

    const retakePhoto = () => {
        setImageSrc(null)
        setSubmitMessage(null)
        startCamera()
    }

    const validateStep1 = () => {
        const trimmedData = {
            nama: formData.nama?.trim() || "",
            nip: formData.nip?.trim() || "",
            email: formData.email?.trim() || "",
            password: formData.password?.trim() || "",
            status: formData.status?.trim() || "",
        }

        if (!trimmedData.nama || !trimmedData.nip || !trimmedData.email || !trimmedData.password || !trimmedData.status) {
            setSubmitMessage("Semua field wajib diisi")
            return false
        }

        if (trimmedData.password.length < 6) {
            setSubmitMessage("Password minimal 6 karakter")
            return false
        }

        // Validasi NIP format
        if (!/^\d{5,12}$/.test(trimmedData.nip)) {
            setSubmitMessage("Format NIP tidak valid. NIP harus berupa 5-12 digit angka.")
            setIsNipValid(false)
            return false
        }

        // Validasi email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedData.email)) {
            setSubmitMessage("Format email tidak valid")
            return false
        }

        // Validasi status
        if (!["Staff", "Teacher"].includes(trimmedData.status)) {
            setSubmitMessage("Status harus berupa 'Staff' atau 'Teacher'")
            return false
        }

        setIsNipValid(true)
        return true
    }

    // Fungsi untuk mengecek apakah form valid
    const isFormValid = () => {
        const trimmedData = {
            nama: formData.nama?.trim() || "",
            nip: formData.nip?.trim() || "",
            email: formData.email?.trim() || "",
            password: formData.password?.trim() || "",
            status: formData.status?.trim() || "",
        }

        const isValid =
            trimmedData.nama &&
            trimmedData.nip &&
            trimmedData.email &&
            trimmedData.password &&
            trimmedData.status &&
            trimmedData.password.length >= 6 &&
            /^\d{5,12}$/.test(trimmedData.nip) &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedData.email) &&
            ["Staff", "Teacher"].includes(trimmedData.status)

        return isValid
    }

    const handleNextStep = () => {
        if (validateStep1()) {
            setCurrentStep(2)
            setSubmitMessage(null)
        }
    }

    const handleSubmit = async () => {
        if (!imageSrc) {
            setSubmitMessage("Foto wajah wajib diambil")
            return
        }

        setIsSubmitting(true)
        setSubmitMessage("Mendaftarkan karyawan...")

        try {
            const requestData = {
                nama: formData.nama || "",
                nip: formData.nip || "",
                email: formData.email || "",
                password: formData.password || "",
                status: formData.status || "Staff",
                fotoWajah: imageSrc || "",
            }

            const response = await fetch("/api/karyawan/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            })

            const data = await response.json()

            if (!response.ok) {
                // Tangani error dari backend, termasuk error dari Flask
                if (data.error?.includes("wajah")) {
                    setSubmitMessage("Gagal: Wajah tidak terdeteksi. Pastikan wajah terlihat jelas.")
                } else {
                    setSubmitMessage(data.error || data.message || `HTTP Error: ${response.status}`)
                }
                return
            }

            // Kalau sukses:
            setSubmitMessage(data.message || `Pendaftaran ${formData.nama} berhasil!`)

            // Reset form setelah beberapa detik
            setTimeout(() => {
                setFormData({
                    nama: "",
                    nip: "",
                    email: "",
                    password: "",
                    status: "Staff",
                })
                setImageSrc(null)
                setCurrentStep(1)
                setSubmitMessage(null)
                setIsNipValid(true)
            }, 4000)
        } catch (error: any) {
            console.error("Registration error:", error)
            setSubmitMessage(`Error: ${error.message || "Terjadi kesalahan saat pendaftaran"}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusIcon = (status: string) => {
        return status === "Teacher" ? "👨‍🏫" : "👨‍💼"
    }

    const getStatusColor = (status: string) => {
        return status === "Teacher" 
            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
            : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900"
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 bg-background min-h-screen">
            {/* Header with Sidebar Trigger */}
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <SidebarTrigger className="-ml-1 lg:hidden text-foreground" />
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-1">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pendaftaran Karyawan</h1>
                        <p className="text-muted-foreground">Tambah karyawan baru ke sistem</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-md border border-primary/20">
                            <UserPlus className="h-5 w-5" />
                            <span className="font-medium text-sm">Langkah {currentStep} dari 2</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto w-full">
                {/* Step Indicator */}
                <div className="flex items-center mb-10">
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold border ${
                                currentStep >= 1 ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border"
                            }`}
                        >
                            1
                        </div>
                        <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                            Data Karyawan
                        </span>
                    </div>

                    <div className="flex-1 mx-4">
                        <div className={`h-1.5 rounded-full ${currentStep >= 2 ? "bg-primary" : "bg-secondary"}`}></div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold border ${
                                currentStep >= 2 ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border"
                            }`}
                        >
                            2
                        </div>
                        <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                            Foto Wajah
                        </span>
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
                    {currentStep === 1 && (
                        <div className="p-8 lg:p-10">
                            <h2 className="text-xl font-bold text-foreground mb-8">Informasi Karyawan</h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                                        <input
                                            type="text"
                                            name="nama"
                                            value={formData.nama || ""}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                            placeholder="Masukkan nama lengkap"
                                            required
                                        />
                                        {formData.nama && (
                                            <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        NIP (Nomor Induk Pegawai)
                                    </label>
                                    <div className="relative">
                                        <BadgeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                                        <input
                                            type="text"
                                            name="nip"
                                            value={formData.nip || ""}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-4 py-3 border rounded-md bg-background text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                                                !isNipValid && formData.nip ? "border-destructive ring-destructive/20" : "border-border"
                                            }`}
                                            placeholder="Masukkan NIP (5-12 digit)"
                                            required
                                        />
                                        {isNipValid && formData.nip && (
                                            <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    {!isNipValid && formData.nip && (
                                        <p className="text-xs text-destructive flex items-center mt-1">
                                            <X className="h-4 w-4 mr-1" />
                                            Format NIP tidak valid. Gunakan 5-12 digit angka.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email || ""}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                            placeholder="Masukkan email"
                                            required
                                        />
                                        {formData.email && (
                                            <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password || ""}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                            placeholder="Masukkan password (min. 6 karakter)"
                                            required
                                        />
                                        {formData.password && formData.password.length >= 6 && (
                                            <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    {formData.password && formData.password.length < 6 && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center mt-1">
                                            Password minimal 6 karakter
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                                        <select
                                            name="status"
                                            value={formData.status || "Staff"}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 appearance-none"
                                            required
                                        >
                                            <option value="Staff">Staff</option>
                                            <option value="Teacher">Teacher</option>
                                        </select>
                                        {formData.status && (
                                            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(formData.status)}`}>
                                                    <span className="mr-1">{getStatusIcon(formData.status)}</span>
                                                    {formData.status}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Pilih status karyawan: Staff untuk pegawai administrasi, Teacher untuk tenaga pengajar
                                    </p>
                                </div>
                            </div>

                            {submitMessage && currentStep === 1 && (
                                <div
                                    className={`mt-8 p-4 rounded-md text-sm border ${
                                        submitMessage.includes("berhasil")
                                            ? "bg-primary/10 text-primary border-primary/20"
                                            : "bg-destructive/10 text-destructive border-destructive/20"
                                    }`}
                                >
                                    {submitMessage}
                                </div>
                            )}

                            <div className="flex justify-end mt-10">
                                <button
                                    onClick={handleNextStep}
                                    disabled={!isFormValid()}
                                    className="px-8 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="p-8 lg:p-10">
                            <h2 className="text-xl font-bold text-foreground mb-8">Pengambilan Foto Wajah</h2>

                            <div className="space-y-8">
                                {/* Employee Info Summary */}
                                <div className="bg-background border border-border rounded-md p-5">
                                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-4 flex items-center">
                                        <User className="h-4 w-4 mr-2 text-primary" />
                                        Ringkasan Data Karyawan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground font-medium">Nama:</span>
                                            <span className="ml-2 text-foreground font-semibold">{formData.nama}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground font-medium">NIP:</span>
                                            <span className="ml-2 text-foreground font-mono font-semibold">{formData.nip}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground font-medium">Email:</span>
                                            <span className="ml-2 text-foreground font-semibold">{formData.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-muted-foreground font-medium">Status:</span>
                                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(formData.status)}`}>
                                                <span className="mr-1">{getStatusIcon(formData.status)}</span>
                                                {formData.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Camera Instructions */}
                                <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-md p-5">
                                    <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm uppercase tracking-wider mb-4 flex items-center">
                                        <Camera className="h-4 w-4 mr-2" />
                                        Panduan Pengambilan Foto
                                    </h3>
                                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2.5 pl-2">
                                        <li className="flex items-start">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 mr-2" />
                                            Pastikan wajah terlihat jelas dan tidak tertutup
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 mr-2" />
                                            Posisikan wajah di tengah frame
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 mr-2" />
                                            Pastikan pencahayaan cukup terang
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 mr-2" />
                                            Hindari bayangan pada wajah
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 mr-2" />
                                            Lepas kacamata atau masker jika memungkinkan
                                        </li>
                                    </ul>
                                </div>

                                {/* Camera Section */}
                                <div className="flex flex-col items-center space-y-6">
                                    {!imageSrc && (
                                        <div className="relative">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                className={`w-96 h-72 bg-secondary rounded-md border-2 border-dashed border-border shadow-inner ${
                                                    !isCameraActive ? "hidden" : ""
                                                }`}
                                            />
                                            {!isCameraActive && (
                                                <div className="w-96 h-72 bg-secondary rounded-md border-2 border-dashed border-border flex items-center justify-center shadow-inner">
                                                    <div className="text-center p-6">
                                                        <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                                            <Camera className="h-10 w-10 text-primary" />
                                                        </div>
                                                        <p className="text-foreground font-semibold mb-1">Kamera belum aktif</p>
                                                        <p className="text-muted-foreground text-sm">
                                                            Klik tombol di bawah untuk mengaktifkan kamera
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <canvas ref={canvasRef} className="hidden" />
                                        </div>
                                    )}

                                    {imageSrc && (
                                        <div className="text-center">
                                            <div className="bg-background p-4 rounded-md border border-border inline-block">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Preview Foto:</p>
                                                <img
                                                    src={imageSrc || "/placeholder.svg"}
                                                    alt="Preview"
                                                    className="w-80 h-auto rounded-md border border-border mx-auto shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Camera Controls */}
                                    <div className="flex gap-4 justify-center">
                                        {!isCameraActive && !imageSrc && (
                                            <button
                                                onClick={startCamera}
                                                className="flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                                            >
                                                <Camera className="h-5 w-5 mr-2" />
                                                Aktifkan Kamera
                                            </button>
                                        )}

                                        {isCameraActive && !imageSrc && (
                                            <>
                                                <button
                                                    onClick={capturePhoto}
                                                    className="flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                                                >
                                                    <Camera className="h-5 w-5 mr-2" />
                                                    Ambil Foto
                                                </button>
                                                <button
                                                    onClick={stopCamera}
                                                    className="flex items-center px-6 py-3 bg-destructive text-destructive-foreground font-semibold rounded-md hover:bg-destructive/90 transition-colors shadow-sm"
                                                >
                                                    <X className="h-5 w-5 mr-2" />
                                                    Batal
                                                </button>
                                            </>
                                        )}

                                        {imageSrc && (
                                            <button
                                                onClick={retakePhoto}
                                                className="flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors shadow-sm"
                                            >
                                                <RotateCcw className="h-5 w-5 mr-2" />
                                                Ambil Ulang
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {submitMessage && currentStep === 2 && (
                                    <div
                                        className={`p-4 rounded-md text-sm border ${
                                            submitMessage.includes("berhasil")
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "bg-destructive/10 text-destructive border-destructive/20"
                                        }`}
                                    >
                                        {submitMessage}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-between pt-6 border-t border-border">
                                    <button
                                        onClick={() => {
                                            setCurrentStep(1)
                                            setSubmitMessage(null)
                                            stopCamera()
                                            setImageSrc(null)
                                        }}
                                        className="px-6 py-3 border border-border text-foreground text-sm font-semibold rounded-md hover:bg-secondary transition-colors"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!imageSrc || isSubmitting}
                                        className="flex items-center px-8 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Mendaftarkan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5 mr-2" />
                                                Daftar Karyawan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}