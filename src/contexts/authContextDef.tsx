import { createContext, useContext } from "react";
import type { Session, User, UserAttributes } from "@supabase/supabase-js";
import type { Profile } from "../supabase/supabase.auth"; // Assuming Profile type is here

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
// Previous default:
// export const AuthContext = createContext<AuthContextType>({
//     session: null,
//     user: null,
//     isLoading: true, // Default isLoading to true as initial state is usually loading
//     error: null,
//     signInWithPassword: async () => {},
//     signInWithOAuth: async () => {},
//     signUp: async () => {},
//     signOut: async () => {},
//     resetPassword: async () => {},
//     updatePassword: async () => {},
//     updateUserProfile: async () => {},
//     updateUserAuthMetadata: async () => {},
// });

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  // Return type matches interface
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Check for undefined
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
