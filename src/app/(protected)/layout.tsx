import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"
import type { ReactNode } from "react"
import { AppSidebar } from "./dashboard/app-sidebar"

interface Props {
    children: ReactNode
}

export default function Layout({ children }: Props) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full m-2">
                <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md px-2 py-4">
                    <SidebarTrigger />
                    <div className="ml-auto"></div>
                    <UserButton />
                </div>
                <div className="h-4"></div>
                <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh - 6rem)] p-4">
                    { children }
                </div>
            </main>
        </SidebarProvider>
    )
}