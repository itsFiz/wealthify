'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowRight, Shield, Zap, TrendingUp, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      });
      
      if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call for now
    setTimeout(() => {
      setIsLoading(false);
      // For now, redirect to sign in
      router.push('/auth/signin?message=Account created successfully! Please sign in.');
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 text-center lg:text-left"
        >
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary"
            >
              <Wallet className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              Wealthify
            </span>
          </div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl lg:text-5xl font-bold tracking-tight"
            >
              Start Your{' '}
              <span className="text-primary">Financial</span>{' '}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Journey
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              Join thousands of Malaysians who are turning their financial dreams into reality 
              with smart goal tracking and gamified progress.
            </motion.p>
          </div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid gap-4 text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium">Track multiple income streams</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Gamified progress tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Bank-level security</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Sign Up Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <Card className="w-full max-w-md shadow-2xl border-0 bg-background/80 backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Get started with your financial transformation
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Google Sign Up */}
              <Button 
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full h-12 text-base bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
                variant="outline"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
                ) : (
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or create with email
                  </span>
                </div>
              </div>

              {/* Email Sign Up Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`h-11 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    <AnimatePresence>
                      {formData.name && !errors.name && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 flex items-center"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`h-11 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    <AnimatePresence>
                      {formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 flex items-center"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`h-11 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <AnimatePresence>
                    {formData.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 flex items-center"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`h-11 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <AnimatePresence>
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute right-10 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 flex items-center"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/signin" 
                    className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="underline hover:text-primary">Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}