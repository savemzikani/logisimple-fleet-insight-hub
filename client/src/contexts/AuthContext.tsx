import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import { authService } from '@/lib/api';

interface User {
  id: string;
  email: string;
}

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
      
      // Try to get the current user profile from our API
      const response = await fetch('/api/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const profile = await response.json();
        setUser({ id: profile.user_id, email: profile.email });
        setProfile(profile as UserProfile);
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

    // For session-based auth, we don't need real-time listeners
    // The session state will be checked when needed via API calls
  }, [fetchUser]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await authService.signIn(email, password);
      if (!error && data) {
        setUser(data.user);
        setProfile(data.profile);
        return { error: null };
      }
      return { error: error?.message || 'Failed to sign in' };
    } catch (error: any) {
      console.error('Error in signIn:', error);
      return { error: error.message || 'Failed to sign in' };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const { data, error } = await authService.signUp(email, password, userData);
      if (!error && data) {
        setUser(data.user);
        setProfile(data.profile);
        return { error: null };
      }
      return { error: error?.message || 'Failed to sign up' };
    } catch (error: any) {
      console.error('Error in signUp:', error);
      return { error: error.message || 'Failed to sign up' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await authService.signOut();
      if (!error) {
        setUser(null);
        setProfile(null);
        return { error: null };
      }
      return { error: error.message || 'Failed to sign out' };
    } catch (error: any) {
      console.error('Error in signOut:', error);
      return { error: error.message || 'Failed to sign out' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email);
      return { error: error?.message || null };
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      return { error: error.message || 'Failed to reset password' };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await authService.updatePassword(newPassword);
      return { error: error?.message || null };
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
