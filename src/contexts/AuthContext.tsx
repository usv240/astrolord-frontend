import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { trackLogin, trackSignUp, setAnalyticsUserId, setAnalyticsUserProperties } from '@/lib/analytics';
import { getErrorMessage } from '@/utils/errorHelpers';

interface User {
  id: string;
  email: string;
  name?: string;
  is_admin?: boolean;
  onboarding_completed?: boolean;
  email_preferences?: boolean;
  has_password?: boolean;  // False for OAuth-only users
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      // If we have a stored user from localStorage, use it immediately
      // This prevents the flash of redirecting to login
      if (storedUser && token) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);

          // Fetch fresh user data from /me to get onboarding_completed status
          authAPI.getMe().then((res) => {
            const freshUser = res.data;
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }).catch(async (error) => {
            // Token is invalid, try to refresh
            if (refreshToken) {
              try {
                const refreshResponse = await authAPI.refreshToken(refreshToken);
                localStorage.setItem('authToken', refreshResponse.data.access_token);
                setUser(refreshResponse.data.user);
              } catch (refreshError) {
                // Both tokens failed, clear everything
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setUser(null);
              }
            } else {
              // No refresh token, clear everything
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              setUser(null);
            }
          });
        } catch (parseError) {
          // Invalid stored user, clear everything
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token, refresh_token, user: userData } = response.data;

      localStorage.setItem('authToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Track login with analytics
      trackLogin('email');
      setAnalyticsUserId(userData.id);
      setAnalyticsUserProperties({ subscription_tier: 'free', has_chart: false });

      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Login failed'));
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      await authAPI.register(email, password, name);
      toast.success('Verification code sent to your email!');
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Registration failed'));
      throw error;
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      const response = await authAPI.verifyEmail(email, otp);
      const { access_token, refresh_token, user: userData } = response.data;

      localStorage.setItem('authToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Track signup completion with analytics
      trackSignUp('email');
      setAnalyticsUserId(userData.id);
      setAnalyticsUserProperties({ subscription_tier: 'free', has_chart: false });

      toast.success('Email verified successfully!');
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Verification failed'));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
