import {
  type AuthResponse,
  type Session,
  type User,
  type AuthChangeEvent,
  type UserAttributes,
} from "@supabase/supabase-js";
import { supabase } from "./supabase.client";

export interface Profile {
  id?: string; // Should match auth.users.id, usually a UUID
  first_name: string;
  last_name: string;
  theme: "dark" | "light";
}

// Auth functions for use with AuthContext
export const supabaseAuth = {
  /**
   * Get the current session
   */
  getSession: async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error.message);
      return null;
    }
    return data?.session || null;
  },

  /**
   * Get the current user
   */
  getUser: async (): Promise<User | null> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error.message);
      return null;
    }
    return data?.user || null;
  },

  /**
   * Sign in with email and password
   */
  signInWithPassword: async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth: async (
    provider: "google" | "github" | "facebook" | "twitter"
  ) => {
    return await supabase.auth.signInWithOAuth({ provider });
  },

  /**
   * Sign up with email and password (only creates the auth user)
   * Profile creation will be handled separately.
   */
  signUp: async (
    email: string,
    password: string,
    // Optional: if you still want to set some initial non-profile user_metadata
    optionsData?: Record<string, unknown>
  ): Promise<AuthResponse> => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: optionsData,
      },
    });
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<{ error: Error | null }> => {
    return await supabase.auth.signOut();
  },

  /**
   * Reset password with email
   */
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email);
  },

  /**
   * Update user password (auth user)
   */
  updatePassword: async (newPassword: string) => {
    return await supabase.auth.updateUser({ password: newPassword });
  },

  // --- Profile Specific Functions ---

  /**
   * Fetch user profile from 'profiles' table
   */
  fetchUserProfile: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116: "Searched for a single row, but found no results" - this is not an error for us here
      console.error("Error fetching profile:", error.message);
      throw error;
    }
    return data as Profile | null;
  },

  /**
   * Create a new user profile in 'profiles' table
   * Typically called after user sign-up.
   */
  createUserProfile: async (
    profileData: Profile
  ): Promise<{ data: Profile | null; error: Error | null }> => {
    const { data, error } = await supabase
      .from("profiles")
      .insert([profileData])
      .select()
      .single(); // Assuming you want the created profile back

    if (error) {
      console.error("Error creating profile:", error.message);
    }
    return { data: data as Profile | null, error: error as Error | null };
  },

  /**
   * Update an existing user profile in 'profiles' table
   */
  updateUserProfile: async (
    userId: string,
    updates: Partial<Profile>
  ): Promise<{ data: Profile | null; error: Error | null }> => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates })
      .eq("id", userId)
      .select()
      .single(); // Assuming you want the updated profile back

    if (error) {
      console.error("Error updating profile:", error.message);
    }
    return { data: data as Profile | null, error: error as Error | null };
  },

  /**
   * Update user_metadata for the current user (if still needed for non-profile data)
   */
  updateUserAuthMetadata: async (metadata: UserAttributes["data"]) => {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });
    return { data, error };
  },

  /**
   * Set up auth state change listener
   */
  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
