import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarRange,
  MessageSquare,
  PackageCheck,
  CreditCard,
  BarChart3,
  Settings,
  Leaf,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useAuth } from "../../hooks/use-auth";

const NAV_ITEMS = [
  { to: "/organizer", label: "Overview", icon: LayoutDashboard },
  { to: "/organizer/vendors", label: "Vendor Management", icon: Users },
  { to: "/organizer/compliance", label: "Compliance Vault", icon: ShieldCheck },
  { to: "/organizer/schedule", label: "Market Schedule & Booth Map", icon: CalendarRange },
  { to: "/organizer/communications", label: "Communication Hub", icon: MessageSquare },
  { to: "/organizer/orders", label: "Orders & Pickup Logistics", icon: PackageCheck },
  { to: "/organizer/payments", label: "Payments & Fees", icon: CreditCard },
  { to: "/organizer/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/organizer/settings", label: "Organization Settings", icon: Settings },
] as const;

export function OrganizerSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-foreground">
              MarketConnect
            </span>
            <span className="text-[11px] text-muted-foreground">Organizer Console</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.to === "/organizer"
                    ? pathname === "/organizer"
                    : pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Sign out">
              <LogOut />
              <span>{profile?.full_name ?? profile?.email ?? "Sign out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
