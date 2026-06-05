"use client"

import { Users, UserPlus, LogOut, HomeIcon as HouseIcon, Settings, FileText, Shield } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { logout } from "@/lib/auth"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: HouseIcon,
    },
    {
        name: "Management",
        href: "/dashboard/management",
        icon: Users,
    },
    {
        name: "Registration",
        href: "/dashboard/registration",
        icon: UserPlus,
    },

]

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const { close } = useSidebar()

    const handleLogout = async () => {
        if (confirm("Are you sure you want to sign out?")) {
            try {
                const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
                await fetch(`${BASE_URL}/api/logout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                })
            } catch (error) {
                console.log("Logout API call failed, but continuing with local logout")
            }

            // Use the enhanced logout function from auth.ts
            logout()
        }
    }

    const handleNavigation = (href: string) => {
        router.push(href)
        close()
    }

    return (
        <Sidebar className="flex flex-col h-full bg-paper border-r border-border">
            <SidebarHeader className="border-b border-border bg-surface p-4">
                <div className="flex items-center">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-ink truncate title-serif">Staffora<span className="text-accent">.</span></h2>
                        <p className="text-[9px] text-muted font-bold uppercase tracking-wider truncate mono-label">Enterprise Portal</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-transparent flex-1 overflow-y-auto">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-accent font-bold px-4 py-2 uppercase tracking-wider mono-label !text-[10px]">
                        Main Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="px-2">
                        <SidebarMenu>
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton
                                            onClick={() => handleNavigation(item.href)}
                                            isActive={isActive}
                                            className={`w-full justify-start gap-3 transition-all duration-200 mx-2 my-1 ${isActive
                                                ? "bg-accent text-surface shadow-sm font-semibold"
                                                : "text-ink hover:bg-accent/10 hover:text-accent font-medium"
                                                }`}
                                        >
                                            <item.icon className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{item.name}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>




            </SidebarContent>

            <SidebarFooter className="border-t border-border bg-surface p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 font-semibold"
                        >
                            <LogOut className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
