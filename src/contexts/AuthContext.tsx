import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

// Define the shape of the profile data we expect
interface UserProfile {
  id: string;
  role: 'admin' | 'tenant';
  full_name?: string;
  block_number?: string;
  // Add other profile fields as needed
}

// Define the shape of the context value
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean; // Now accurately reflects initial auth AND profile loading
  signOut: () => Promise<void>;
}

// Create the context with a default undefined value initially
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start as true

  useEffect(() => {
    let profileFetchAttempted = false; // Flag to prevent race conditions

    // 1. Set up auth state change listener FIRST
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log('Auth state changed:', _event, newSession);
        const currentUser = newSession?.user ?? null;
        setSession(newSession);
        setUser(currentUser);

        // If user logs out, clear profile and stop loading
        if (!currentUser) {
          setProfile(null);
          setLoading(false);
          profileFetchAttempted = false; // Reset flag
        }
        // Profile fetching will be handled by the user state change below
        // We only set loading to false here if the user is null (logged out)
      }
    );

    // 2. Get initial session state and trigger initial load/profile fetch
    const initializeAuth = async () => {
      setLoading(true); // Ensure loading is true during init
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting initial session:", error);
        setLoading(false); // Stop loading on error
        return;
      }

      const initialUser = initialSession?.user ?? null;
      setSession(initialSession);
      setUser(initialUser);

      // If there's no initial user, we are done loading
      if (!initialUser) {
        setLoading(false);
      }
      // If there IS an initial user, the useEffect below listening to 'user' will handle profile fetch and set loading to false eventually
    };

    initializeAuth();

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // Run only once on mount

  // 3. Fetch user profile when user object changes (and exists)
  useEffect(() => {
    // Only fetch if we have a user
    if (user) {
      setLoading(true); // Set loading true when starting profile fetch
      let isMounted = true; // Prevent state update on unmounted component

      const fetchProfile = async () => {
        console.log(`Fetching profile for user: ${user.id}`);
        try {
          const { data, error, status } = await supabase
            .from('profiles')
            .select(`id, role, full_name, block_number`)
            .eq('id', user.id)
            .single();

          if (!isMounted) return; // Don't update state if component unmounted

          if (error && status !== 406) {
            console.error('Error fetching profile:', error);
            setProfile(null);
          } else if (data) {
            console.log('Profile fetched successfully:', data);
            setProfile(data as UserProfile);
          } else {
            console.warn(`No profile found for user ID: ${user.id}.`);
            setProfile(null);
          }
        } catch (e) {
          console.error('Unexpected error fetching profile:', e);
          if (isMounted) setProfile(null);
        } finally {
          // IMPORTANT: Set loading to false only after fetch attempt completes
          if (isMounted) setLoading(false);
        }
      };

      fetchProfile();

      // Cleanup function to set isMounted to false
      return () => {
        isMounted = false;
      };

    } else {
      // No user, ensure profile is null and loading is false (handled by listener/init)
      setProfile(null);
      // setLoading(false); // Should be handled by listener/init when user becomes null
    }
  }, [user]); // Re-run this effect ONLY when the user object itself changes

  // Sign out function
  const signOut = async () => {
    setLoading(true); // Optionally set loading during sign out
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      setLoading(false); // Stop loading on error
    }
    // State updates (session, user, profile to null, loading to false) handled by listener
  };

  // Value provided to consuming components
  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
  };

  // Render children only when initial loading is potentially complete
  // or let RootRedirect handle the loading state display
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};