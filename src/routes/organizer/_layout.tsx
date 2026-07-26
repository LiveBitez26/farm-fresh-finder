import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../../components/ui/sidebar";
import { OrganizerSidebar } from "../../components/organizer/organizer-sidebar";
import { useAuth } from "../../hooks/use-auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { Separator } from "../../components/ui/separator";

export const Route = createFileRoute("/organizer/_layout")({
  component: OrganizerLayout,
});

function OrganizerLayout() {
  const { user, profile, isLoading, isProfileLoading } = useAuth();

  // While Supabase isn't wired up yet, let the console render in "preview
  // mode" with mock data rather than blocking on a real session.
  if (isSupabaseConfigured && !isLoading && !user) {
    return <Navigate to="/login" />;
  }

  if (isSupabaseConfigured && user && !isProfileLoading && profile && !profile.organization_id) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <SidebarProvider>
      <OrganizerSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            {!isSupabaseConfigured && "Preview mode — connect Supabase for live data"}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
