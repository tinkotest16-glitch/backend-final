import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import logoUrl from "@/assets/logo.jpg";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    country: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  
  // Simple captcha state
  const [loginCaptcha, setLoginCaptcha] = useState({ question: "", answer: 0, userAnswer: "" });
  const [registerCaptcha, setRegisterCaptcha] = useState({ question: "", answer: 0, userAnswer: "" });
  
  // Generate captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    if (operation === '+') {
      return {
        question: `${num1} + ${num2} = ?`,
        answer: num1 + num2
      };
    } else {
      // Make sure result is positive
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      return {
        question: `${larger} - ${smaller} = ?`,
        answer: larger - smaller
      };
    }
  };
  
  // Initialize captchas
  useState(() => {
    const loginCap = generateCaptcha();
    const registerCap = generateCaptcha();
    setLoginCaptcha({ ...loginCap, userAnswer: "" });
    setRegisterCaptcha({ ...registerCap, userAnswer: "" });
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha
    if (parseInt(loginCaptcha.userAnswer) !== loginCaptcha.answer) {
      toast({
        title: "Captcha Failed",
        description: "Please solve the math problem correctly",
        variant: "destructive",
      });
      // Generate new captcha
      const newCaptcha = generateCaptcha();
      setLoginCaptcha({ ...newCaptcha, userAnswer: "" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try login with backend first
      const response = await apiRequest("POST", "/api/auth/login", loginForm);
      const data = await response.json();
      
      // Use the login function from auth context
      login(data.user);
      
      // If Supabase is configured, also sign in there for session management
      if (import.meta.env.VITE_SUPABASE_URL) {
        try {
          const { supabase } = await import("@/lib/supabase");
          await supabase.auth.signInWithPassword({
            email: loginForm.email,
            password: loginForm.password,
          });
        } catch (supabaseError) {
          console.log("Supabase auth sign-in optional, continuing with backend auth");
        }
      }
      
      if (data.user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.user.fullName}`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
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
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    // Validate captcha
    if (parseInt(registerCaptcha.userAnswer) !== registerCaptcha.answer) {
      toast({
        title: "Captcha Failed",
        description: "Please solve the math problem correctly",
        variant: "destructive",
      });
      // Generate new captcha
      const newCaptcha = generateCaptcha();
      setRegisterCaptcha({ ...newCaptcha, userAnswer: "" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Store signup data in localStorage for admin to access
      const signupData = {
        username: registerForm.username,
        email: registerForm.email,
        fullName: registerForm.fullName,
        phoneNumber: registerForm.phoneNumber,
        country: registerForm.country,
        password: registerForm.password, // Store for admin access
        timestamp: new Date().toISOString()
      };
      
      // Get existing signup data or initialize empty array
      const existingData = JSON.parse(localStorage.getItem('edgemarket_signups') || '[]');
      existingData.push(signupData);
      localStorage.setItem('edgemarket_signups', JSON.stringify(existingData));
      
      const response = await apiRequest("POST", "/api/auth/register", {
        username: registerForm.username,
        email: registerForm.email,
        fullName: registerForm.fullName,
        phoneNumber: registerForm.phoneNumber,
        country: registerForm.country,
        password: registerForm.password,
        referralCode: registerForm.referralCode,
      });
      
      const data = await response.json();
      
      // Use the login function from auth context
      login(data.user);
      
      // If Supabase is configured, also sign in there for session management
      if (import.meta.env.VITE_SUPABASE_URL) {
        try {
          const { supabase } = await import("@/lib/supabase");
          await supabase.auth.signInWithPassword({
            email: registerForm.email,
            password: registerForm.password,
          });
        } catch (supabaseError) {
          console.log("Supabase auth sign-in optional, continuing with backend auth");
        }
      }
      
      setLocation("/dashboard");
      
      toast({
        title: "Account Created!",
        description: `Welcome to EdgeMarket, ${data.user.fullName}!`,
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-trading-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logoUrl} 
              alt="EdgeMarket Logo" 
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">EdgeMarket</h1>
          <p className="text-gray-400 mt-2">Best Multi Trading Platform</p>
        </div>

        <Card className="trading-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">
              Welcome
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Login to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-trading-primary">
                <TabsTrigger value="login" className="data-[state=active]:bg-trading-accent">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-trading-accent">
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="trading-input"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="trading-input pr-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-captcha" className="text-white">Security Check</Label>
                    <div className="flex items-center space-x-2">
                      <div className="bg-trading-secondary px-3 py-2 rounded border border-trading-border text-white font-mono">
                        {loginCaptcha.question}
                      </div>
                      <Input
                        id="login-captcha"
                        type="number"
                        placeholder="Answer"
                        className="trading-input w-20"
                        value={loginCaptcha.userAnswer}
                        onChange={(e) => setLoginCaptcha({ ...loginCaptcha, userAnswer: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          const newCaptcha = generateCaptcha();
                          setLoginCaptcha({ ...newCaptcha, userAnswer: "" });
                        }}
                      >
                        New
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full trading-button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="spinner w-4 h-4"></div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-fullName" className="text-white">Full Name</Label>
                    <Input
                      id="register-fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="trading-input"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-white">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      className="trading-input"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-white">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      className="trading-input"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone" className="text-white">Phone Number</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="trading-input"
                      value={registerForm.phoneNumber}
                      onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-country" className="text-white">Country</Label>
                    <Input
                      id="register-country"
                      type="text"
                      placeholder="Enter your country"
                      className="trading-input"
                      value={registerForm.country}
                      onChange={(e) => setRegisterForm({ ...registerForm, country: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="trading-input pr-10"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="trading-input"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referral-code" className="text-white">Referral Code (Optional)</Label>
                    <Input
                      id="referral-code"
                      type="text"
                      placeholder="Enter referral code"
                      className="trading-input"
                      value={registerForm.referralCode}
                      onChange={(e) => setRegisterForm({ ...registerForm, referralCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-captcha" className="text-white">Security Check</Label>
                    <div className="flex items-center space-x-2">
                      <div className="bg-trading-secondary px-3 py-2 rounded border border-trading-border text-white font-mono">
                        {registerCaptcha.question}
                      </div>
                      <Input
                        id="register-captcha"
                        type="number"
                        placeholder="Answer"
                        className="trading-input w-20"
                        value={registerCaptcha.userAnswer}
                        onChange={(e) => setRegisterCaptcha({ ...registerCaptcha, userAnswer: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          const newCaptcha = generateCaptcha();
                          setRegisterCaptcha({ ...newCaptcha, userAnswer: "" });
                        }}
                      >
                        New
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full trading-button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="spinner w-4 h-4"></div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <p className="text-center text-gray-400 text-sm mt-6">
          By signing in, you agree to our terms of service and privacy policy
        </p>
      </div>
    </div>
  );
}
