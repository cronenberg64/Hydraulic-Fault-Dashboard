
import { useState, useCallback, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  createdAt: number;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'operator' | 'viewer';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('hydraulic_user');
    const storedToken = localStorage.getItem('hydraulic_token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('hydraulic_user');
        localStorage.removeItem('hydraulic_token');
      }
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (registerData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('hydraulic_users') || '[]');
      const userExists = existingUsers.find((u: any) => 
        u.username === registerData.username || u.email === registerData.email
      );

      if (userExists) {
        return { success: false, message: 'Username or email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: registerData.username,
        email: registerData.email,
        role: registerData.role || 'viewer',
        permissions: getPermissions(registerData.role || 'viewer'),
        createdAt: Date.now()
      };

      // Store user credentials (in production, this would be handled by backend)
      const userCredentials = {
        ...newUser,
        password: registerData.password // In production, this would be hashed
      };

      existingUsers.push(userCredentials);
      localStorage.setItem('hydraulic_users', JSON.stringify(existingUsers));

      return { success: true, message: 'Account created successfully' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      // Check stored users first
      const storedUsers = JSON.parse(localStorage.getItem('hydraulic_users') || '[]');
      const storedUser = storedUsers.find((u: any) => 
        (u.username === username || u.email === username) && u.password === password
      );

      if (storedUser) {
        const userData: User = {
          id: storedUser.id,
          username: storedUser.username,
          email: storedUser.email,
          role: storedUser.role,
          permissions: storedUser.permissions,
          createdAt: storedUser.createdAt
        };

        const token = btoa(`${username}:${Date.now()}`);
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('hydraulic_user', JSON.stringify(userData));
        localStorage.setItem('hydraulic_token', token);
        
        return true;
      }

      // Fallback to hardcoded credentials for demo
      const validCredentials = [
        { username: 'admin', password: 'admin123', role: 'admin' as const, email: 'admin@hydraulic.com' },
        { username: 'operator', password: 'operator123', role: 'operator' as const, email: 'operator@hydraulic.com' },
        { username: 'viewer', password: 'viewer123', role: 'viewer' as const, email: 'viewer@hydraulic.com' }
      ];

      const credential = validCredentials.find(
        cred => (cred.username === username || cred.email === username) && cred.password === password
      );

      if (credential) {
        const userData: User = {
          id: `demo_${credential.username}`,
          username: credential.username,
          email: credential.email,
          role: credential.role,
          permissions: getPermissions(credential.role),
          createdAt: Date.now()
        };

        const token = btoa(`${username}:${Date.now()}`);
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('hydraulic_user', JSON.stringify(userData));
        localStorage.setItem('hydraulic_token', token);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('hydraulic_user');
    localStorage.removeItem('hydraulic_token');
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasPermission
  };
};

const getPermissions = (role: string): string[] => {
  switch (role) {
    case 'admin':
      return ['read', 'write', 'delete', 'manage_users', 'inject_faults', 'reset_system', 'train_ml', 'export_data'];
    case 'operator':
      return ['read', 'write', 'inject_faults', 'reset_system', 'train_ml'];
    case 'viewer':
      return ['read'];
    default:
      return [];
  }
};
