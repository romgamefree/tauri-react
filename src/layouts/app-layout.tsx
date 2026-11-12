import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import type { PageKey } from "@/types/navigation"
import { entities } from "@/features/catalog/config"

function sidebarInitiallyOpen() {
  const savedState = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("sidebar_state="))
    ?.split("=")[1]

  return savedState !== "false"
}

export default function Layout({ children, activePage, onNavigate }: {
  children: React.ReactNode;
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}) {
  return (
    <SidebarProvider defaultOpen={sidebarInitiallyOpen()}>
      <AppSidebar activePage={activePage} onNavigate={onNavigate} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">{activePage === "overview" ? "Tổng quan" : entities[activePage].title}</span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
