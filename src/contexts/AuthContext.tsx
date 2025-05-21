import React from "react";
import type { ReactNode } from "react";
import { useEffect, useState, useCallback } from "react";
import type {
  Session,
  User,
  AuthChangeEvent,
  UserAttributes, // Import UserAttributes
} from "@supabase/supabase-js";
import { supabaseAuth, type Profile } from "../supabase/supabase.auth";
import { AuthContext } from "./authContextDef";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        const currentSession = await supabaseAuth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (!currentSession) {
          // If no session, try to get user (might be a pending redirect from OAuth)
          const currentUser = await supabaseAuth.getUser();
          const profile = currentUser?.id
            ? await supabaseAuth.fetchUserProfile(currentUser?.id)
            : null;
          setUser(currentUser);
          setProfile(profile);
        }
      } catch (e) {
        setError(e as Error);
        console.error("Error fetching initial session:", e);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: authListener } = supabaseAuth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Fetch profile for the new user
        if (session?.user) {
          try {
            let userProfile = await supabaseAuth.fetchUserProfile(
              session.user.id
            );

            // If no profile exists (e.g., first-time OAuth login), create one
            if (!userProfile) {
              console.log("No profile found, creating one for OAuth user");

              // Get user info from session
              const email = session.user.email || "";
              const [firstName = "", lastName = ""] = email
                .split("@")[0]
                .split(".");

              // Create default profile
              const defaultProfile: Profile = {
                id: session.user.id,
                first_name: firstName,
                last_name: lastName,
                theme: "dark",
              };

              // Create profile in database
              const profileResult = await supabaseAuth.createUserProfile(
                defaultProfile
              );
              if (profileResult.data) {
                userProfile = profileResult.data;
              }
            }

            setProfile(userProfile);
          } catch (profileError) {
            console.error(
              "Error fetching profile on auth change:",
              profileError
            );
            // Don't set main error to avoid disrupting auth flow
          }
        }
        setIsLoading(false);
        setError(null); // Clear previous errors on auth state change
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profile = await supabaseAuth.fetchUserProfile(user.id);
        setProfile(profile);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleAuthOperation = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      successCallback?: (data: T) => void,
      errorCallback?: (error: Error) => void
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await operation();
        if (successCallback) successCallback(response);
        // Session and user state will be updated by onAuthStateChange listener
      } catch (e) {
        const err = e as Error;
        setError(err);
        if (errorCallback) errorCallback(err);
        console.error("Auth operation error:", err.message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signInWithPassword = async (email: string, password: string) => {
    await handleAuthOperation(() =>
      supabaseAuth.signInWithPassword(email, password)
    );
  };

  const signInWithOAuth = async (
    provider: "google" | "github" | "facebook" | "twitter"
  ) => {
    // OAuth redirects, so loading state might be less relevant here until redirect returns
    // but we set it for consistency and potential immediate errors.
    await handleAuthOperation(() => supabaseAuth.signInWithOAuth(provider));
  };

  const signUp = async (
    email: string,
    password: string,
    initialMetadata?: {
      first_name?: string;
      last_name?: string;
      username?: string;
      theme?: "dark" | "light";
    }
  ) => {
    await handleAuthOperation(async () => {
      // First, create the auth user
      const authResponse = await supabaseAuth.signUp(email, password);

      if (authResponse.error) {
        throw authResponse.error;
      }

      // If we have initial metadata and a user was created successfully, create the profile
      if (initialMetadata && authResponse.data.user) {
        const userId = authResponse.data.user.id;

        // Create profile object with required fields
        const profileData: Profile = {
          id: userId,
          first_name: initialMetadata.first_name || "",
          last_name: initialMetadata.last_name || "",
          theme: initialMetadata.theme || "dark",
        };

        // Create the profile in the profiles table
        const profileResult = await supabaseAuth.createUserProfile(profileData);

        if (profileResult.error) {
          console.error("Error creating profile:", profileResult.error);
          // Note: We don't throw here to avoid preventing the user from being created
          // even if profile creation fails. The profile can be created later.
        }
      }

      return authResponse;
    });
  };

  const signOut = async () => {
    await handleAuthOperation(() => supabaseAuth.signOut());
  };

  const resetPassword = async (email: string) => {
    await handleAuthOperation(() => supabaseAuth.resetPassword(email));
  };

  const handleUpdateUserAuthMetadata = async (
    metadata: UserAttributes["data"]
  ) => {
    await handleAuthOperation(() =>
      supabaseAuth.updateUserAuthMetadata(metadata)
    );
  };

  const handleUpdateUserProfile = useCallback(
    async (metadataUpdates: Partial<Profile>) => {
      if (!user) throw new Error("User not authenticated");

      await handleAuthOperation(async () => {
        const result = await supabaseAuth.updateUserProfile(
          user.id,
          metadataUpdates
        );
        if (result.data) {
          // Update local profile state with the returned updated profile
          setProfile((current) =>
            current
              ? {
                  ...current,
                  ...result.data,
                }
              : result.data
          );
        }
        return result;
      });
    },
    [user, handleAuthOperation]
  );

  const handleUpdatePassword = async (newPassword: string) => {
    await handleAuthOperation(() => supabaseAuth.updatePassword(newPassword));
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    error,
    signInWithPassword,
    signInWithOAuth,
    signUp,
    signOut,
    resetPassword,
    updatePassword: handleUpdatePassword, // Use the defined handler
    updateUserProfile: handleUpdateUserProfile, // Assign the implemented function
    updateUserAuthMetadata: handleUpdateUserAuthMetadata, // Assign the correctly typed and named function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
