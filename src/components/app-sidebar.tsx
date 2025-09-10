"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { LayoutDashboard, FileText, Bot, Plug, ChevronRight, User, LogOut, Settings, MessagesSquare } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"

export function AppSidebar() {
    const { user, logout } = useAuth()
    const pathname = usePathname()
    
    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
        { name: "Documents", icon: FileText, url: "/dashboard/documents" },
        { name: "Bot Customizer", icon: Bot, url: "/dashboard/bot" },
        // { name: "Conversations", icon: MessageSquare, url: "/dashboard/conversations" },
            // { name: "Leads", icon: Target, url: "/dashboard/leads" },
        { name: "Chat", icon: MessagesSquare, url: "/dashboard/chat" },
        { name: "Integrations", icon: Plug, url: "/dashboard/integrations" },
    ]

    // Function to determine if a menu item is active
    const isMenuItemActive = (itemUrl: string) => {
        if (itemUrl === "/dashboard") {
            // Dashboard is active only when on exact /dashboard path
            return pathname === "/dashboard"
        }
        // Other items are active when pathname starts with their URL
        return pathname.startsWith(itemUrl)
    }

    const handleLogout = async () => {
        await logout()
    }

    const getUserInitials = (name?: string, email?: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        if (email) {
            return email.slice(0, 2).toUpperCase()
        }
        return 'U'
    }

    return (
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="px-6 py-8 border-b border-sidebar-border">
                <div className="text-2xl font-light text-sidebar-foreground">
                    Traliq<span className="font-bold text-white">.ai</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 tracking-wide">
                    INTELLIGENT CHAT PLATFORM
                </div>
            </SidebarHeader>
            
            <SidebarContent className="px-4 py-6">
                <SidebarGroup>
                    <SidebarMenu className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = isMenuItemActive(item.url)
                            return (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={isActive}
                                        className="group relative"
                                    >
                                        <a
                                            href={item.url}
                                            className={`
                                                flex items-center justify-between w-full px-4 py-3 rounded-xl
                                                transition-all duration-200 ease-in-out
                                                hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                                                hover:translate-x-1 hover:shadow-lg hover:shadow-black/20
                                                ${isActive 
                                                    ? 'bg-white text-black shadow-lg shadow-black/30' 
                                                    : 'text-sidebar-foreground'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`h-5 w-5 transition-transform duration-200 ${
                                                    isActive ? 'scale-110' : 'group-hover:scale-105'
                                                }`} />
                                                <span className="font-medium text-sm tracking-wide">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
                                                isActive 
                                                    ? 'opacity-100 translate-x-0' 
                                                    : 'opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'
                                            }`} />
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter className="px-4 py-4 border-t border-sidebar-border mt-auto">
                {/* User Profile Section */}
                <div className="mb-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start p-3 h-auto hover:bg-sidebar-accent"
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar_url} alt={user?.name || user?.email} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            {getUserInitials(user?.name, user?.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-medium text-sidebar-foreground truncate">
                                            {user?.name || 'User'}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {user?.email}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                {/* Footer Info */}
                <div className="text-xs text-muted-foreground text-center">
                    © 2025 Traliq.ai
                </div>
                <div className="text-xs text-muted-foreground/60 text-center mt-1">
                    Version 1.0.0
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
