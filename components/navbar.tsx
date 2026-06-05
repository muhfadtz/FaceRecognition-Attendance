"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getUserRole, clearUserRole } from "@/lib/auth"
import { LogOut, User, Menu } from "lucide-react"
import { ModeToggle } from "./mode-toggle"

export function Navbar() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false) // State untuk hamburger menu

  useEffect(() => {
    const storedRole = getUserRole()
    const storedName = localStorage.getItem("nama") || ""
    setRole(storedRole)
    setUserName(storedName)
    setIsCheckingAuth(false)
  }, [])

  const handleLogout = async () => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
      await fetch(`${BASE_URL}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.log("Logout API call failed, but continuing with local logout")
    }

    clearUserRole()
    router.push("/login")
  }

  if (isCheckingAuth) {
    return null
  }

  return (
    <nav className="bg-surface/85 backdrop-blur-md border-b border-border py-4 sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Left Side - Brand */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div>
            <h1 className="text-xl font-bold text-ink title-serif">Staffora<span className="text-accent">.</span></h1>
            <p className="text-[9px] uppercase tracking-wider text-muted font-bold mono-label">Enterprise Portal</p>
          </div>
        </Link>

        {/* Right Side - Hamburger & User Info */}
        <div className="flex items-center space-x-4">
          {/* Tombol Hamburger - muncul di layar kecil */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-accent hover:bg-accent/10 transition"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Info User + Logout - muncul di layar besar */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-paper px-4 py-2 rounded-xl border border-border">
              <Avatar className="h-8 w-8 bg-accent">
                <AvatarFallback className="bg-accent text-surface font-semibold text-xs">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink">{userName || "User"}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-border text-ink hover:bg-paper transition-all duration-200 font-semibold"
            >
              <LogOut className="h-4 w-4 mr-2 text-accent" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu untuk mobile */}
      {menuOpen && (
        <div className="md:hidden mt-2 px-6">
          <div className="flex flex-col space-y-3 bg-paper px-4 py-3 rounded-xl border border-border">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 bg-accent">
                <AvatarFallback className="bg-accent text-surface font-semibold text-xs">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink">{userName || "User"}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-border text-ink hover:bg-paper transition-all duration-200 font-semibold"
            >
              <LogOut className="h-4 w-4 mr-2 text-accent" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
