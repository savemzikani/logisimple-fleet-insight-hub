import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';

export class AuthService {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Don't fail the login if we can't get the profile
      }

      return {
        user: data.user,
        session: data.session,
        profile: profile || null,
        error: null,
      };
    } catch (error: any) {
      console.error('Error in signIn:', error);
      return {
        user: null,
        session: null,
        profile: null,
        error: error.message || 'Failed to sign in',
      };
    }
  }

  async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    try {
      // First create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email,
            first_name: userData.first_name,
            last_name: userData.last_name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // If this is the first user, create a company
      if (userData.role === 'admin' && !userData.company_id) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert([{
            name: userData.company_name || `${userData.first_name}'s Company`,
            settings: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              currency: 'USD',
              distance_unit: 'miles',
              fuel_unit: 'gallons',
            },
          }])
          .select()
          .single();

        if (companyError) {
          throw companyError;
        }

        // Update the user's profile with the company ID
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: data.user.id,
              company_id: company.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              role: 'admin',
            });

          if (profileError) {
            throw profileError;
          }

          return {
            user: data.user,
            session: data.session,
            profile: {
              id: data.user.id,
              company_id: company.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              role: 'admin',
            },
            error: null,
          };
        }
      }

      return {
        user: data.user,
        session: data.session,
        profile: null,
        error: null,
      };
    } catch (error: any) {
      console.error('Error in signUp:', error);
      return {
        user: null,
        session: null,
        profile: null,
        error: error.message || 'Failed to sign up',
      };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error in signOut:', error);
      return { error: error.message || 'Failed to sign out' };
    }
  }

  async getCurrentUser(): Promise<{
    user: User | null;
    profile: UserProfile | null;
    error: string | null;
  }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { user: null, profile: null, error: error?.message || 'No user found' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { user, profile: null, error: 'Failed to load user profile' };
      }

      return { user, profile, error: null };
    } catch (error: any) {
      console.error('Error in getCurrentUser:', error);
      return { user: null, profile: null, error: error.message || 'Failed to get current user' };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      return { error: error.message || 'Failed to send password reset email' };
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error in updatePassword:', error);
      return { error: error.message || 'Failed to update password' };
    }
  }
}

export const authService = new AuthService();
