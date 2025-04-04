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
  loading: boolean; // Indicates if auth state is being determined initially
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
  const [loading, setLoading] = useState(true); // Start as true until initial check is done

  useEffect(() => {
    // 1. Get initial session state
    const getInitialSession = async () => {
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting initial session:", error);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false); // Initial check complete
    };

    getInitialSession();

    // 2. Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log('Auth state changed:', _event, newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        // No need to set loading here, it's for the initial load
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 3. Fetch user profile when user object changes (and exists)
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          // Fetch profile based on user ID
          const { data, error, status } = await supabase
            .from('profiles')
            .select(`id, role, full_name, block_number`) // Select desired fields
            .eq('id', user.id)
            .single(); // Expect only one profile per user

          if (error && status !== 406) { // 406 means no rows found, which is okay initially
            console.error('Error fetching profile:', error);
            setProfile(null); // Reset profile on error
          } else if (data) {
            setProfile(data as UserProfile);
          } else {
             setProfile(null); // No profile found
             console.warn(`No profile found for user ID: ${user.id}. This might be expected if profile creation is pending.`);
          }
        } catch (e) {
          console.error('Unexpected error fetching profile:', e);
          setProfile(null);
        }
      } else {
        // Clear profile if user logs out
        setProfile(null);
      }
    };

    fetchProfile();
  }, [user]); // Re-run this effect when the user object changes

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    // State updates (session, user, profile) will be handled by the onAuthStateChange listener
  };

  // Value provided to consuming components
  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
  };

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