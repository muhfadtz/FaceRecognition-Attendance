"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Camera, Save, X, Loader2, RotateCcw, User, Mail, Lock, BadgeIcon, CheckCircle, UserPlus, Users } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CustomSelect } from "@/components/ui/custom-select"

interface FormData {
    nama: string
    nip: string
    email: string
    password: string
    status: string
}

export default function RegistrationPage() {
    const [formData, setFormData] = useState<FormData>({ nama: "", nip: "", email: "", password: "", status: "Staff" })
    const [currentStep, setCurrentStep] = useState(1)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<string | null>(null)
    const [isNipValid, setIsNipValid] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isCameraActive, setIsCameraActive] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (submitMessage) setSubmitMessage(null)
        if (name === "nip") setIsNipValid(value === "" || /^\d{5,12}$/.test(value.trim()))
    }

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({ ...prev, status: value }))
        if (submitMessage) setSubmitMessage(null)
    }

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
            if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true) }
        } catch { setSubmitMessage("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.") }
    }, [])

    const stopCamera = useCallback(() => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop())
            videoRef.current.srcObject = null; setIsCameraActive(false)
        }
    }, [])

    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")
            if (ctx) {
                canvas.width = videoRef.current.videoWidth
                canvas.height = videoRef.current.videoHeight
                ctx.drawImage(videoRef.current, 0, 0)
                setImageSrc(canvas.toDataURL("image/jpeg", 0.8))
                stopCamera()
                setSubmitMessage("Foto berhasil diambil!")
            }
        }
    }, [stopCamera])

    const validateStep1 = () => {
        const d = { nama: formData.nama?.trim() || "", nip: formData.nip?.trim() || "", email: formData.email?.trim() || "", password: formData.password?.trim() || "", status: formData.status?.trim() || "" }
        if (!d.nama || !d.nip || !d.email || !d.password || !d.status) { setSubmitMessage("Semua field wajib diisi"); return false }
        if (d.password.length < 6) { setSubmitMessage("Password minimal 6 karakter"); return false }
        if (!/^\d{5,12}$/.test(d.nip)) { setSubmitMessage("Format NIP tidak valid."); setIsNipValid(false); return false }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { setSubmitMessage("Format email tidak valid"); return false }
        if (!["Staff", "Teacher"].includes(d.status)) { setSubmitMessage("Status harus Staff atau Teacher"); return false }
        setIsNipValid(true); return true
    }

    const isFormValid = () => {
        const d = { nama: formData.nama?.trim() || "", nip: formData.nip?.trim() || "", email: formData.email?.trim() || "", password: formData.password?.trim() || "", status: formData.status?.trim() || "" }
        return !!(d.nama && d.nip && d.email && d.password && d.status && d.password.length >= 6 && /^\d{5,12}$/.test(d.nip) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) && ["Staff", "Teacher"].includes(d.status))
    }

    const handleSubmit = async () => {
        if (!imageSrc) { setSubmitMessage("Foto wajah wajib diambil"); return }
        setIsSubmitting(true); setSubmitMessage("Mendaftarkan karyawan...")
        try {
            const res = await fetch("/api/karyawan/register", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama: formData.nama, nip: formData.nip, email: formData.email, password: formData.password, status: formData.status, fotoWajah: imageSrc }),
            })
            const data = await res.json()
            if (!res.ok) { setSubmitMessage(data.error?.includes("wajah") ? "Gagal: Wajah tidak terdeteksi." : data.error || data.message || `Error: ${res.status}`); return }
            setSubmitMessage(data.message || `Pendaftaran ${formData.nama} berhasil!`)
            setTimeout(() => { setFormData({ nama: "", nip: "", email: "", password: "", status: "Staff" }); setImageSrc(null); setCurrentStep(1); setSubmitMessage(null); setIsNipValid(true) }, 4000)
        } catch (e: any) { setSubmitMessage(`Error: ${e.message || "Terjadi kesalahan"}`) }
        finally { setIsSubmitting(false) }
    }

    const getStatusBadge = (status: string) => {
        if (status === "Teacher") return "bg-blue-50 text-blue-700 border border-blue-200"
        return "bg-purple-50 text-purple-700 border border-purple-200"
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen">
            <div className="flex items-center gap-4 border-b border-neutral-200 pb-6">
                <SidebarTrigger className="-ml-1 lg:hidden text-neutral-900" />
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-1">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Pendaftaran Karyawan</h1>
                        <p className="text-sm text-neutral-500">Tambah karyawan baru ke sistem</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium">
                        <UserPlus className="h-4 w-4" />
                        Langkah {currentStep} dari 2
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto w-full">
                <div className="flex items-center mb-10">
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border ${currentStep >= 1 ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-400 border-neutral-200"}`}>1</div>
                        <span className={`mt-2 text-[10px] font-semibold uppercase tracking-widest ${currentStep >= 1 ? "text-neutral-900" : "text-neutral-400"}`}>Data</span>
                    </div>
                    <div className="flex-1 mx-4"><div className={`h-1 rounded-full ${currentStep >= 2 ? "bg-neutral-900" : "bg-neutral-200"}`}></div></div>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border ${currentStep >= 2 ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-400 border-neutral-200"}`}>2</div>
                        <span className={`mt-2 text-[10px] font-semibold uppercase tracking-widest ${currentStep >= 2 ? "text-neutral-900" : "text-neutral-400"}`}>Foto</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                    {currentStep === 1 && (
                        <div className="p-8 lg:p-10">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-8">Informasi Karyawan</h2>
                            <div className="space-y-6">
                                {[{ icon: User, name: "nama", label: "Nama Lengkap", type: "text", placeholder: "Masukkan nama lengkap" },
                                  { icon: BadgeIcon, name: "nip", label: "NIP (Nomor Induk Pegawai)", type: "text", placeholder: "Masukkan NIP (5-12 digit)" },
                                  { icon: Mail, name: "email", label: "Email", type: "email", placeholder: "Masukkan email" },
                                  { icon: Lock, name: "password", label: "Password", type: "password", placeholder: "Masukkan password (min. 6 karakter)" }
                                ].map(({ icon: Icon, name, label, type, placeholder }) => (
                                    <div key={name} className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-600">{label}</label>
                                        <div className="relative">
                                            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                            <input type={type} name={name} value={(formData as any)[name] || ""} onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2.5 border ${name === "nip" && !isNipValid && formData.nip ? "border-red-400" : "border-neutral-200"} rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]`}
                                                placeholder={placeholder} required />
                                            {(formData as any)[name] && (name !== "password" || (formData as any)[name].length >= 6) && (name !== "nip" || isNipValid) && (
                                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                                            )}
                                        </div>
                                        {name === "nip" && !isNipValid && formData.nip && <p className="text-xs text-red-500 mt-1">Format NIP tidak valid. Gunakan 5-12 digit angka.</p>}
                                        {name === "password" && formData.password && formData.password.length < 6 && <p className="text-xs text-amber-600 mt-1">Password minimal 6 karakter</p>}
                                    </div>
                                ))}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-600">Status</label>
                                    <div className="relative">
                                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
                                        <CustomSelect
                                            value={formData.status}
                                            onChange={handleStatusChange}
                                            options={[{ value: "Staff", label: "Staff" }, { value: "Teacher", label: "Teacher" }]}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                            {submitMessage && currentStep === 1 && (
                                <div className={`mt-6 p-3 rounded-lg text-xs font-medium border ${submitMessage.includes("berhasil") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>{submitMessage}</div>
                            )}
                            <div className="flex justify-end mt-8">
                                <button onClick={() => { if (validateStep1()) { setCurrentStep(2); setSubmitMessage(null) } }}
                                    disabled={!isFormValid()}
                                    className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-sm font-medium rounded-lg transition-all disabled:cursor-not-allowed shadow-sm">
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="p-8 lg:p-10">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-8">Pengambilan Foto Wajah</h2>
                            <div className="space-y-8">
                                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                                    <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-widest mb-4 flex items-center"><User className="h-4 w-4 mr-2 text-neutral-500" />Ringkasan</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-neutral-500">Nama:</span> <span className="text-neutral-900 font-semibold ml-1">{formData.nama}</span></div>
                                        <div><span className="text-neutral-500">NIP:</span> <span className="text-neutral-900 font-mono font-semibold ml-1">{formData.nip}</span></div>
                                        <div><span className="text-neutral-500">Email:</span> <span className="text-neutral-900 font-semibold ml-1">{formData.email}</span></div>
                                        <div><span className={getStatusBadge(formData.status)}>{formData.status}</span></div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center space-y-6">
                                    {!imageSrc && (
                                        <div className="relative">
                                            <video ref={videoRef} autoPlay playsInline className={`w-96 h-72 bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 ${isCameraActive ? "" : "hidden"}`} />
                                            {!isCameraActive && (
                                                <div className="w-96 h-72 bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center">
                                                    <div className="text-center p-6">
                                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-neutral-200"><Camera className="h-8 w-8 text-neutral-500" /></div>
                                                        <p className="text-neutral-900 font-semibold mb-1">Kamera belum aktif</p>
                                                        <p className="text-neutral-500 text-sm">Klik tombol untuk mengaktifkan</p>
                                                    </div>
                                                </div>
                                            )}
                                            <canvas ref={canvasRef} className="hidden" />
                                        </div>
                                    )}
                                    {imageSrc && (
                                        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 inline-block">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-3">Preview:</p>
                                            <img src={imageSrc} alt="Preview" className="w-80 h-auto rounded-lg border border-neutral-200 mx-auto shadow-sm" />
                                        </div>
                                    )}

                                    <div className="flex gap-3 justify-center">
                                        {!isCameraActive && !imageSrc && (
                                            <button onClick={startCamera} className="flex items-center px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-all shadow-sm text-sm">
                                                <Camera className="h-4 w-4 mr-2" />Aktifkan Kamera
                                            </button>
                                        )}
                                        {isCameraActive && !imageSrc && (
                                            <>
                                                <button onClick={capturePhoto} className="flex items-center px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-all shadow-sm text-sm">
                                                    <Camera className="h-4 w-4 mr-2" />Ambil Foto
                                                </button>
                                                <button onClick={stopCamera} className="flex items-center px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-all text-sm">
                                                    <X className="h-4 w-4 mr-2" />Batal
                                                </button>
                                            </>
                                        )}
                                        {imageSrc && (
                                            <button onClick={() => { setImageSrc(null); setSubmitMessage(null); startCamera() }} className="flex items-center px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-all shadow-sm text-sm">
                                                <RotateCcw className="h-4 w-4 mr-2" />Ambil Ulang
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {submitMessage && currentStep === 2 && (
                                    <div className={`p-3 rounded-lg text-xs font-medium border ${submitMessage.includes("berhasil") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>{submitMessage}</div>
                                )}

                                <div className="flex justify-between pt-6 border-t border-neutral-200">
                                    <button onClick={() => { setCurrentStep(1); setSubmitMessage(null); stopCamera(); setImageSrc(null) }}
                                        className="px-5 py-2.5 border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors">Kembali</button>
                                    <button onClick={handleSubmit} disabled={!imageSrc || isSubmitting}
                                        className="flex items-center px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-sm font-medium rounded-lg transition-all disabled:cursor-not-allowed shadow-sm">
                                        {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Mendaftarkan...</> : <><Save className="h-4 w-4 mr-2" />Daftar Karyawan</>}
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