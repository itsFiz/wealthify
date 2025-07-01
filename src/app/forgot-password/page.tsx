'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Shield, Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEmailSent(true);
    }, 2000);
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4 relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

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
              <Image src="/wealthifylogo.png" alt="Wealthify Logo" width={32} height={32} />    
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
              Reset Your{' '}
              <span className="text-primary">Password</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              Don&apos;t worry, it happens to the best of us. We&apos;ll send you a link to reset your password.
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
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium">Secure password reset</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Email verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Quick & easy process</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Reset Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <Card className="w-full max-w-md metric-card">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold">
                {isEmailSent ? 'Check Your Email' : 'Forgot Password?'}
              </CardTitle>
              <CardDescription>
                {isEmailSent 
                  ? "We've sent a password reset link to your email address"
                  : "Enter your email address and we'll send you a reset link"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {!isEmailSent ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => handleInputChange(e.target.value)}
                          className={`glassmorphism-button ${error ? 'border-red-500' : ''}`}
                        />
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center space-x-1 text-red-500 text-xs"
                          >
                            <AlertCircle className="h-3 w-3" />
                            <span>{error}</span>
                          </motion.div>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 btn-primary glassmorphism-button"
                      >
                        <motion.div 
                          className="flex items-center justify-center space-x-2"
                          whileHover={{ scale: 1.02 }}
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Mail className="h-4 w-4" />
                              <span>Send Reset Link</span>
                            </>
                          )}
                        </motion.div>
                      </Button>
                    </form>

                    <div className="text-center">
                      <Link 
                        href="/auth/signin" 
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Sign In
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
                    >
                      <Mail className="h-8 w-8 text-green-600" />
                    </motion.div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        We sent a password reset link to
                      </p>
                      <p className="font-medium text-primary">{email}</p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={() => router.push('/auth/signin')}
                        className="w-full h-12 btn-primary glassmorphism-button"
                      >
                        <motion.div 
                          className="flex items-center justify-center space-x-2"
                          whileHover={{ scale: 1.02 }}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back to Sign In</span>
                        </motion.div>
                      </Button>

                      <div className="text-center text-sm text-muted-foreground">
                        Didn&apos;t receive the email?{' '}
                        <button 
                          onClick={() => {
                            setIsEmailSent(false);
                            setEmail('');
                          }}
                          className="text-primary hover:underline font-medium"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 