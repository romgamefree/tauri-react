import {
  BookOpenCheck,
  CarFront,
  GraduationCap,
  Home,
  LayoutGrid,
  Moon,
  Sun,
  UsersRound,
} from "lucide-react";
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { entities } from "@/features/catalog/config";
import { useThemeStore } from "@/stores/theme-store";
import type { PageKey } from "@/types/navigation";

const navigation = [
  { key: "overview" as const, label: "Tổng quan", icon: Home },
  { key: "students" as const, label: entities.students.title, icon: GraduationCap },
  { key: "teachers" as const, label: entities.teachers.title, icon: UsersRound },
  { key: "vehicles" as const, label: entities.vehicles.title, icon: CarFront },
  { key: "courses" as const, label: entities.courses.title, icon: BookOpenCheck },
];

const appName = import.meta.env.APP_NAME || "DrivePro";
const appLicense = import.meta.env.APP_LICENSE || "";

export function AppSidebar({ activePage, onNavigate }: { activePage: PageKey; onNavigate: (page: PageKey) => void }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { dark, toggleTheme } = useThemeStore();

  function closeMobileSidebar() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={appName}
              onClick={() => { onNavigate("overview"); closeMobileSidebar(); }}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <LayoutGrid className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{appName}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {appLicense ? `License: ${appLicense}` : "Ứng dụng của bạn"}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ứng dụng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(({ key, label, icon: Icon }) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    onClick={() => { onNavigate(key); closeMobileSidebar(); }}
                    isActive={activePage === key}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleTheme} tooltip={dark ? "Giao diện sáng" : "Giao diện tối"}>
              {dark ? <Sun /> : <Moon />}
              <span>{dark ? "Giao diện sáng" : "Giao diện tối"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
