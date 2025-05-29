import { createContext, useContext } from "react";
import type { Session, User, UserAttributes } from "@supabase/supabase-js";
import type { Profile } from "../../supabase/supabase.auth"; // Assuming Profile type is here

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};

// Interface for the auth context value
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (
    provider: "google" | "github" | "facebook" | "twitter"
  ) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    initialMetadata?: {
      // Matches the signature in AuthContext.tsx
      first_name?: string;
      last_name?: string;
      username?: string;
      theme?: "dark" | "light";
    }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateUserProfile: (metadataUpdates: Partial<Profile>) => Promise<void>; // Corresponds to updateUserMetadata in AuthContext
  updateUserAuthMetadata: (
    metadataUpdates: UserAttributes["data"]
  ) => Promise<void>; // If you expose this separately
}

// Create context with default values
// It's generally better to initialize with undefined and check in useAuth,
// or provide more complete (though potentially no-op) async defaults.
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  // Return type matches interface
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Check for undefined
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
