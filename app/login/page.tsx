"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { setUserRole, isAuthenticated } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Check if user is already authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            const userRole = localStorage.getItem("role")
            if (userRole === "admin") {
                router.replace("/dashboard")
            } else if (userRole === "user") {
                router.replace("/")
            }
        }
    }, [router])

    // Detect Google Redirect Session on Load
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                handleSupabaseUser(session.user)
            }
        }
        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                handleSupabaseUser(session.user)
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    const handleSupabaseUser = async (user: any) => {
        setLoading(true)
        setError("")
        try {
            const response = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email.split("@")[0]
                })
            })
            const data = await response.json()
            if (response.ok) {
                setUserRole(data.role as "admin" | "user")
                if (data.role === "admin") {
                    localStorage.setItem("userType", "admin")
                    router.replace("/dashboard")
                } else if (data.role === "user") {
                    localStorage.setItem("nama", data.nama)
                    localStorage.setItem("userType", "karyawan")
                    router.replace("/")
                }
            } else {
                setError(data.error || "Access denied.")
                await supabase.auth.signOut()
            }
        } catch (err) {
            setError("Failed to verify Google account on server.")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError("")
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.href.split("?")[0]
                }
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google.")
            setLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        if (!email || !password) {
            setError("Email and password are required.")
            setLoading(false)
            return
        }

        try {
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
            const res = await fetch(`${BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (res.ok) {
                setUserRole(data.role as "admin" | "user")
                if (data.role === "admin") {
                    localStorage.setItem("userType", "admin")
                    router.replace("/dashboard")
                } else if (data.role === "user") {
                    localStorage.setItem("nama", data.nama)
                    localStorage.setItem("userType", "karyawan")
                    router.replace("/")
                }
            } else {
                setError(data.message || data.error || "Login failed")
            }
        } catch (err) {
            setError("Failed to connect to backend server.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row text-neutral-900 font-sans relative">
            {/* SVG Noise Filter definition */}
            <svg className="hidden">
                <filter id="noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.07 0" />
                </filter>
            </svg>

            {/* Left Aesthetic Grainy Panel */}
            <div className="hidden lg:block lg:w-[45%] xl:w-[48%] relative overflow-hidden bg-neutral-950 border-r border-neutral-800">
                {/* 1. Base vertical stripe patterns */}
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)`
                    }}
                />

                {/* 2. Abstract warm gradient glow layers */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,#D97706_0%,transparent_50%)] opacity-30 mix-blend-screen filter blur-[60px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#EA4335_0%,transparent_60%)] opacity-20 mix-blend-screen filter blur-[80px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,#8E8E8E_0%,transparent_40%)] opacity-10 mix-blend-screen filter blur-[50px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-900 opacity-90" />

                {/* 3. Noise Overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ filter: "url(#noise)" }} />

                {/* Brand Logo inside left panel */}
                <div className="absolute top-8 left-8 z-10 flex items-center gap-1.5 text-white">
                    <span className="text-xl font-bold tracking-tight">Staffora<span className="text-amber-500">.</span></span>
                </div>

                {/* Bottom Tagline */}
                <div className="absolute bottom-8 left-8 right-8 z-10 max-w-sm">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono font-semibold mb-2">Automated Workforce Biometrics</p>
                    <p className="text-sm text-neutral-300 font-medium leading-relaxed">
                        Precision face recognition attendance with secure cloud-level verification.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-[55%] xl:w-[52%] flex flex-col justify-between p-8 lg:p-16 min-h-screen bg-white">
                {/* Top header navigation */}
                <div className="flex justify-between items-center w-full">
                    {/* Logo for mobile view (hidden on desktop) */}
                    <div className="lg:hidden flex items-center">
                        <span className="text-xl font-bold tracking-tight text-neutral-900">Staffora<span className="text-accent">.</span></span>
                    </div>
                    <div className="hidden lg:block" /> {/* spacing placeholder */}
                    <span className="text-xs text-neutral-500 font-medium hover:underline cursor-pointer">Support</span>
                </div>

                {/* Center Form Container */}
                <div className="max-w-[380px] w-full mx-auto my-auto space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Welcome back</h1>
                        <p className="text-sm text-neutral-500">Sign in to your Staffora account to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-600">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-neutral-200 focus:border-neutral-900 rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-neutral-600">Password</label>
                                <span className="text-xs text-neutral-400 hover:text-neutral-900 cursor-pointer transition-colors">Forgot?</span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-3.5 pr-10 py-2.5 border border-neutral-200 focus:border-neutral-900 rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-medium">
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-150 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-1.5 text-sm"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In with Email
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-neutral-150"></div>
                        <span className="flex-shrink mx-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">or continue with</span>
                        <div className="flex-grow border-t border-neutral-150"></div>
                    </div>

                    {/* Google OAuth Login Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 shadow-sm active:scale-[0.995] disabled:opacity-50 text-sm"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>

                    <p className="text-center text-xs text-neutral-400 font-medium px-4">
                        By checking in, you agree to our{" "}
                        <span className="text-neutral-500 hover:text-neutral-900 underline cursor-pointer">Terms of Service</span> and{" "}
                        <span className="text-neutral-500 hover:text-neutral-900 underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>

                {/* Footer copyright */}
                <div className="text-center w-full pt-4">
                    <p className="text-[10px] text-neutral-400 font-mono tracking-wider">
                        STAFFORA INC. PRIVATE B2B SYSTEM
                    </p>
                </div>
            </div>
        </div>
    )
}
