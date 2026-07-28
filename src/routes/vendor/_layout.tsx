import { createFileRoute, Outlet, Navigate, Link, useRouterState } from "@tanstack/react-router";
import { Loader2, Leaf, LayoutDashboard, Package, User, FileText, LogOut } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar";
import { Separator } from "../../components/ui/separator";
import { useAuth } from "../../hooks/use-auth";
import { useMyVendor } from "../../hooks/use-vendor-portal-data";
import { isSupabaseConfigured } from "../../lib/supabase";

export const Route = createFileRoute("/vendor/_layout")({
  component: VendorPortalLayout,
});

const NAV_ITEMS = [
  { to: "/vendor", label: "Overview", icon: LayoutDashboard },
  { to: "/vendor/products", label: "My Products", icon: Package },
  { to: "/vendor/documents", label: "Documents", icon: FileText },
  { to: "/vendor/profile", label: "Farm Profile", icon: User },
] as const;

function VendorSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, signOut } = useAuth();
  const { data: vendor } = useMyVendor();

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
            <span className="text-[11px] text-sidebar-foreground/60">Vendor Portal</span>
          </div>
        </div>
        {vendor && (
          <div className="rounded-lg border border-sidebar-border bg-sidebar-foreground/5 px-2.5 py-2 text-xs text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            <span className="text-sidebar-foreground/50">Business · </span>
            <span className="font-medium">{vendor.business_name}</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.to === "/vendor" ? pathname === "/vendor" : pathname.startsWith(item.to);
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

function VendorPortalLayout() {
  const { user, isLoading } = useAuth();
  const { data: vendor, isLoading: vendorLoading } = useMyVendor();

  if (isSupabaseConfigured && !isLoading && !user) {
    return <Navigate to="/login" />;
  }

  if (isLoading || vendorLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isSupabaseConfigured && user && !vendor) {
    return (
      <div className="organizer-theme flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div className="max-w-sm">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            No vendor account linked
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account isn't linked to a vendor listing yet. Ask your market organizer for your
            vendor invite link to get set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="organizer-theme">
      <SidebarProvider>
        <VendorSidebar />
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
