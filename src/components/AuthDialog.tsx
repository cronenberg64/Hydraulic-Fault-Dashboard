
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, User, Mail, Lock } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticate: (username: string, password: string) => Promise<boolean>;
  onRegister?: (registerData: {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'operator' | 'viewer';
  }) => Promise<{ success: boolean; message: string }>;
}

export const AuthDialog = ({ isOpen, onOpenChange, onAuthenticate, onRegister }: AuthDialogProps) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer' as 'admin' | 'operator' | 'viewer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await onAuthenticate(loginForm.username, loginForm.password);
      if (success) {
        onOpenChange(false);
        toast({
          title: "Login Successful",
          description: "Welcome to the hydraulic dashboard!",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!onRegister) {
      toast({
        title: "Registration Unavailable",
        description: "Registration is not available.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await onRegister({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role
      });

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Account created successfully! You can now log in.",
        });
        // Switch to login tab
        setRegisterForm({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'viewer'
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>Hydraulic System Access</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="login" className="text-white">Login</TabsTrigger>
            <TabsTrigger value="register" className="text-white">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-slate-300">Username or Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter username or email"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !loginForm.username || !loginForm.password}
                className="w-full"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-slate-300">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="register-username"
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    placeholder="Choose username"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="register-email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-role" className="text-slate-300">Role</Label>
                <Select 
                  value={registerForm.role} 
                  onValueChange={(value: 'admin' | 'operator' | 'viewer') => 
                    setRegisterForm({ ...registerForm, role: value })
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="viewer" className="text-white">Viewer - Read Only</SelectItem>
                    <SelectItem value="operator" className="text-white">Operator - Control System</SelectItem>
                    <SelectItem value="admin" className="text-white">Admin - Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="register-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    placeholder="Create password"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !registerForm.username || !registerForm.email || 
                         !registerForm.password || !registerForm.confirmPassword}
                className="w-full"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="text-xs text-slate-400 text-center mt-4">
          Demo credentials: admin/admin123, operator/operator123, viewer/viewer123
        </div>
      </DialogContent>
    </Dialog>
  );
};
