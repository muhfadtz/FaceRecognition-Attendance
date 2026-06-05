"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import { logout } from "@/lib/auth"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface LogoutButtonProps {
    className?: string
    showText?: boolean
}

export default function LogoutButton({ className = "", showText = true }: LogoutButtonProps) {
    const [showModal, setShowModal] = useState(false)

    const handleLogout = () => {
        logout()
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${className}`}
            >
                <LogOut className="h-4 w-4" />
                {showText && <span>Keluar</span>}
            </button>
            <ConfirmModal
                open={showModal}
                onOpenChange={setShowModal}
                title="Keluar"
                description="Apakah Anda yakin ingin keluar?"
                confirmLabel="Keluar"
                cancelLabel="Batal"
                onConfirm={handleLogout}
            />
        </>
    )
}
