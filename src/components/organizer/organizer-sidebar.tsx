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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useAuth } from "../../hooks/use-auth";
import { useNavBadgeCounts, useOrganization } from "../../hooks/use-organization-data";

const NAV_GROUPS: {
  label: string;
  items: {
    to: string;
    label: string;
    icon: typeof LayoutDashboard;
    badgeKey?: "vendors" | "compliance";
  }[];
}[] = [
  {
    label: "Operate",
    items: [
      { to: "/organizer", label: "Overview", icon: LayoutDashboard },
      { to: "/organizer/vendors", label: "Vendor Management", icon: Users, badgeKey: "vendors" },
      {
        to: "/organizer/compliance",
        label: "Compliance Vault",
        icon: ShieldCheck,
        badgeKey: "compliance",
      },
      { to: "/organizer/schedule", label: "Schedule & Booth Map", icon: CalendarRange },
      { to: "/organizer/communications", label: "Communication Hub", icon: MessageSquare },
    ],
  },
  {
    label: "Transact",
    items: [
      { to: "/organizer/orders", label: "Orders & Pickup", icon: PackageCheck },
      { to: "/organizer/payments", label: "Payments & Fees", icon: CreditCard },
      { to: "/organizer/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Configure",
    items: [{ to: "/organizer/settings", label: "Organization Settings", icon: Settings }],
  },
];

export function OrganizerSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, signOut } = useAuth();
  const { data: organization } = useOrganization();
  const { data: badgeCounts } = useNavBadgeCounts();

  const orgName = organization?.name ?? "Preview Organization";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 px-3 py-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-sidebar-foreground">
              MarketConnect
            </span>
            <span className="text-[11px] text-sidebar-foreground/60">Organizer Console</span>
          </div>
        </div>

        <Link
          to="/organizer/settings"
          className="flex items-center justify-between rounded-lg border border-sidebar-border bg-sidebar-foreground/5 px-2.5 py-2 text-left text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/10 group-data-[collapsible=icon]:hidden"
        >
          <span className="truncate">
            <span className="text-sidebar-foreground/50">Org · </span>
            <span className="font-medium">{orgName}</span>
          </span>
          <Settings className="ml-2 h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/45">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.to === "/organizer"
                      ? pathname === "/organizer"
                      : pathname.startsWith(item.to);
                  const badgeValue = item.badgeKey ? badgeCounts?.[item.badgeKey] : undefined;
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {Boolean(badgeValue) && <SidebarMenuBadge>{badgeValue}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
