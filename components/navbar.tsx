"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getUserRole, clearUserRole } from "@/lib/auth"
import { LogOut, User, Menu } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export function Navbar() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

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
    <nav className="bg-white/85 backdrop-blur-md border-b border-neutral-200 py-4 sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 title-serif">Staffora<span className="text-neutral-900">.</span></h1>
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold mono-label">Enterprise Portal</p>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-neutral-900 hover:bg-neutral-100 transition"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <Avatar className="h-8 w-8 bg-neutral-900">
                <AvatarFallback className="bg-neutral-900 text-white font-semibold text-xs">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-semibold text-neutral-900">{userName || "User"}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(true)}
              className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all duration-200 font-semibold"
            >
              <LogOut className="h-4 w-4 mr-2 text-neutral-500" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-2 px-6">
          <div className="flex flex-col space-y-3 bg-white px-4 py-3 rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 bg-neutral-900">
                <AvatarFallback className="bg-neutral-900 text-white font-semibold text-xs">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-semibold text-neutral-900">{userName || "User"}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(true)}
              className="w-full border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all duration-200 font-semibold"
            >
              <LogOut className="h-4 w-4 mr-2 text-neutral-500" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
      <ConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Sign Out"
        description="Apakah Anda yakin ingin keluar?"
        confirmLabel="Sign Out"
        cancelLabel="Batal"
        onConfirm={handleLogout}
      />
    </nav>
  )
}
