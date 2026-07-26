import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { OrgRole, Profile } from "../lib/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** Role of the current user within their active organization, if any. */
  role: OrgRole | null;
  /** True while the initial Supabase session is being restored. */
  isLoading: boolean;
  /** True while profile/role are being (re)fetched for a signed-in user. */
  isProfileLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Re-fetch profile + role — call after creating an organization in onboarding. */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<OrgRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      setIsProfileLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProfileAndRole = useCallback(async (userId: string) => {
    setIsProfileLoading(true);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    setProfile((profileData as Profile) ?? null);

    if (profileData) {
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      setRole((memberData?.role as OrgRole) ?? null);
    } else {
      setRole(null);
    }
    setIsProfileLoading(false);
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      setRole(null);
      setIsProfileLoading(false);
      return;
    }
    loadProfileAndRole(userId);
  }, [session?.user, loadProfileAndRole]);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await loadProfileAndRole(session.user.id);
    }
  }, [session?.user, loadProfileAndRole]);

  const signInWithPassword: AuthContextValue["signInWithPassword"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpWithPassword: AuthContextValue["signUpWithPassword"] = async (
    email,
    password,
    fullName,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        role,
        isLoading,
        isProfileLoading,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
