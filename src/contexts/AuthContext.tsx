import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types';
import { authService } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the current user and profile
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setUser(session.user);
          setProfile(null);
        } else {
          setUser(session.user);
          setProfile(profile as UserProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error in fetchUser:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    // Initial fetch
    fetchUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile on auth change:', error);
            setUser(session.user);
            setProfile(null);
          } else {
            setUser(session.user);
            setProfile(profile as UserProfile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    // Cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUser]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await authService.signIn(email, password);
      return { error: error || null };
    } catch (error: any) {
      console.error('Error in signIn:', error);
      return { error: error.message || 'Failed to sign in' };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const { error } = await authService.signUp(email, password, userData);
      return { error: error || null };
    } catch (error: any) {
      console.error('Error in signUp:', error);
      return { error: error.message || 'Failed to sign up' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return { error };
      }
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error: any) {
      console.error('Error in signOut:', error);
      return { error: error.message || 'Failed to sign out' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email);
      return { error: error || null };
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      return { error: error.message || 'Failed to reset password' };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await authService.updatePassword(newPassword);
      return { error: error || null };
    } catch (error: any) {
      console.error('Error in updatePassword:', error);
      return { error: error.message || 'Failed to update password' };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
