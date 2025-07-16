import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AuthTest = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await fetchProfile(user.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
    } catch (err: any) {
      setError(`Profile fetch failed: ${err.message}`);
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setUser(data.user);
      await fetchProfile(data.user.id);
    } catch (err: any) {
      setError(`Sign in failed: ${err.message}`);
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (err: any) {
      setError(`Sign out failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Authentication Test</h2>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Current Status:</h3>
        <p className="text-sm text-gray-600">
          {user ? '✅ Signed in' : '❌ Not signed in'}
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {!user ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            disabled={loading}
          >
            Sign In
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="font-semibold mb-3 text-green-800">User Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">ID:</span> {user.id}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Email Verified:</span> {user.email_confirmed_at ? '✅' : '❌'}</p>
              <p><span className="font-medium">Last Sign In:</span> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
              <details className="mt-2">
                <summary className="text-sm text-gray-600 cursor-pointer">View raw user data</summary>
                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </details>
            </div>
          </div>
          
          {profile ? (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold mb-3 text-blue-800">Profile Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Full Name:</span> {profile.full_name || 'Not set'}</p>
                <p><span className="font-medium">Role:</span> {profile.role || 'Not set'}</p>
                <p><span className="font-medium">Company ID:</span> {profile.company_id || 'Not set'}</p>
                <details className="mt-2">
                  <summary className="text-sm text-gray-600 cursor-pointer">View raw profile data</summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <h3 className="font-semibold text-yellow-800">No Profile Found</h3>
              <p className="text-sm text-yellow-700 mt-1">
                A profile record could not be found for this user. This might be expected if you just signed up.
              </p>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthTest;
