import { createFileRoute, Outlet, Navigate, Link, useRouterState } from "@tanstack/react-router";
import {
  Loader2,
  Leaf,
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
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
} from "../../components/ui/sidebar";
import { Separator } from "../../components/ui/separator";
import { useAuth } from "../../hooks/use-auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useOrganizationsNeedingAttention } from "../../hooks/use-platform-admin-data";

export const Route = createFileRoute("/admin/_layout")({
  component: AdminLayout,
});

const NAV_GROUPS: {
  label: string;
  items: {
    to: string;
    label: string;
    icon: typeof LayoutDashboard;
    showAttentionBadge?: boolean;
  }[];
}[] = [
  {
    label: "Platform",
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard },
      {
        to: "/admin/organizations",
        label: "Organizations",
        icon: Building2,
        showAttentionBadge: true,
      },
      { to: "/admin/subscriptions", label: "Subscriptions & Billing", icon: CreditCard },
      { to: "/admin/analytics", label: "Platform Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Configure",
    items: [{ to: "/admin/settings", label: "Platform Settings", icon: Settings }],
  },
];

function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, signOut } = useAuth();
  const needingAttention = useOrganizationsNeedingAttention();

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
            <span className="text-[11px] text-sidebar-foreground/60">Platform Console</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-foreground/5 px-2.5 py-2 text-xs text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
          Global · all organizations
        </div>
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
                    item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.showAttentionBadge && needingAttention.length > 0 && (
                        <SidebarMenuBadge>{needingAttention.length}</SidebarMenuBadge>
                      )}
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

function AdminLayout() {
  const { user, profile, isLoading, isProfileLoading } = useAuth();

  if (isSupabaseConfigured && !isLoading && !user) {
    return <Navigate to="/login" search={{ redirect: "/admin" }} />;
  }

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isSupabaseConfigured && profile && !profile.is_platform_owner) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div className="max-w-sm">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            Access denied
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is for MarketConnect platform administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theme">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
