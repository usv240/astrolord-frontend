import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';
import { createLogger } from '@/utils/logger';

const log = createLogger('AuthCallback');

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      if (token) {
        // Store token with the correct key expected by api.ts and AuthContext
        localStorage.setItem('authToken', token);
        
        try {
          // Fetch user details to populate the user object
          const response = await authAPI.getMe();
          const user = response.data;
          
          // Store user details as expected by AuthContext
          localStorage.setItem('user', JSON.stringify(user));
          
          toast.success('Successfully logged in with Google!');
          
          // Force a full page reload to ensure AuthContext re-initializes with the new token/user
          window.location.href = '/dashboard';
        } catch (error) {
          log.error('Failed to fetch user details', { error: String(error) });
          toast.error('Login failed. Could not verify user details.');
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } else {
        toast.error('Login failed. No token received.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-primary">Processing login...</div>
    </div>
  );
};

export default AuthCallback;
