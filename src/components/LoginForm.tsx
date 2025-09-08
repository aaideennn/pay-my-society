import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Home, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLogin: (userType: 'member' | 'admin', email: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'member' | 'admin'>('member');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(userType, email);
  };

  const demoCredentials = {
    member: { email: 'rajesh.kumar@email.com', password: 'demo123' },
    admin: { email: 'admin@greensociety.com', password: 'admin123' }
  };

  const fillDemo = (type: 'member' | 'admin') => {
    setUserType(type);
    setEmail(demoCredentials[type].email);
    setPassword(demoCredentials[type].password);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Society Manager</h1>
          <p className="text-white/80">Smart Society Management System</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          {/* User Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl mb-6">
            <Button
              type="button"
              variant={userType === 'member' ? 'default' : 'ghost'}
              className={`flex-1 transition-smooth ${
                userType === 'member' 
                  ? 'bg-gradient-primary text-white shadow-primary' 
                  : 'hover:bg-muted-foreground/10'
              }`}
              onClick={() => setUserType('member')}
            >
              Member Login
            </Button>
            <Button
              type="button"
              variant={userType === 'admin' ? 'default' : 'ghost'}
              className={`flex-1 transition-smooth ${
                userType === 'admin' 
                  ? 'bg-gradient-primary text-white shadow-primary' 
                  : 'hover:bg-muted-foreground/10'
              }`}
              onClick={() => setUserType('admin')}
            >
              Admin Login
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-primary hover:shadow-primary transition-smooth text-white font-semibold"
            >
              Sign In as {userType === 'admin' ? 'Admin' : 'Member'}
            </Button>
          </form>

          {/* Demo Access */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">Quick Demo Access:</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-10"
                onClick={() => fillDemo('member')}
              >
                <Badge variant="secondary" className="mr-2">Demo</Badge>
                Member
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-10"
                onClick={() => fillDemo('admin')}
              >
                <Badge variant="secondary" className="mr-2">Demo</Badge>
                Admin
              </Button>
            </div>
          </div>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center text-white/80">
          <p className="text-sm">✨ Online Payments • 📊 Financial Tracking • 🏢 Member Management</p>
        </div>
      </div>
    </div>
  );
};