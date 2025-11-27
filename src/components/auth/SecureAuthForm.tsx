/**
 * Secure authentication form with enhanced security measures
 * Part of Phase 2: Authentication and Input Security
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  validateAndSanitize, 
  secureInputSchemas, 
  authRateLimit, 
  passwordSchema,
  CSRFProtection 
} from '@/utils/security/input-validation';

// Enhanced form schemas with security validation
const signInSchema = z.object({
  email: secureInputSchemas.email,
  password: z.string().min(1, 'Password is required'),
  csrfToken: z.string().min(1, 'Security token is required'),
});

const signUpSchema = z.object({
  email: secureInputSchemas.email,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: secureInputSchemas.name,
  accountType: z.enum(['patient', 'therapist']),
  csrfToken: z.string().min(1, 'Security token is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

interface SecureAuthFormProps {
  onSignIn: (email: string, password: string) => Promise<{ error?: any }>;
  onSignUp: (email: string, password: string, name: string, accountType: string) => Promise<{ error?: any }>;
  isLoading?: boolean;
}

export const SecureAuthForm: React.FC<SecureAuthFormProps> = ({
  onSignIn,
  onSignUp,
  isLoading = false
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [csrfToken, setCsrfToken] = useState('');
  const { toast } = useToast();

  // Initialize CSRF token
  useEffect(() => {
    const token = CSRFProtection.generateToken();
    setCsrfToken(token);
  }, []);

  // Handle rate limiting block countdown
  useEffect(() => {
    if (blockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setBlockTimeRemaining(blockTimeRemaining - 1);
        if (blockTimeRemaining <= 1) {
          setIsBlocked(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [blockTimeRemaining]);

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      csrfToken: csrfToken,
    },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      accountType: 'patient',
      csrfToken: csrfToken,
    },
  });

  // Update CSRF token in forms when it changes
  useEffect(() => {
    signInForm.setValue('csrfToken', csrfToken);
    signUpForm.setValue('csrfToken', csrfToken);
  }, [csrfToken, signInForm, signUpForm]);

  const handleSignIn = async (data: SignInData) => {
    const userIdentifier = data.email.toLowerCase();
    
    // Check rate limiting
    if (!authRateLimit.isAllowed(userIdentifier)) {
      setIsBlocked(true);
      setBlockTimeRemaining(30 * 60); // 30 minutes
      toast({
        title: "Too Many Attempts",
        description: "Account temporarily locked due to multiple failed login attempts. Please try again in 30 minutes.",
        variant: "destructive",
      });
      return;
    }

    // Validate CSRF token
    if (!CSRFProtection.validateToken(data.csrfToken)) {
      toast({
        title: "Security Error",
        description: "Invalid security token. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate and sanitize input
    const emailValidation = validateAndSanitize(data.email, secureInputSchemas.email);
    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",  
        description: (emailValidation as { success: false; error: string }).error,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await onSignIn(emailValidation.data, data.password);
      
      if (result.error) {
        // Record failed attempt for rate limiting
        authRateLimit.recordFailedAttempt(userIdentifier);
        
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive",
        });
      } else {
        // Reset rate limiting on successful login
        authRateLimit.reset(userIdentifier);
        toast({
          title: "Welcome Back",
          description: "Successfully signed in.",
        });
      }
    } catch (error) {
      authRateLimit.recordFailedAttempt(userIdentifier);
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    const userIdentifier = data.email.toLowerCase();
    
    // Check rate limiting
    if (!authRateLimit.isAllowed(userIdentifier)) {
      setIsBlocked(true);
      setBlockTimeRemaining(30 * 60);
      toast({
        title: "Too Many Attempts",
        description: "Too many registration attempts. Please try again in 30 minutes.",
        variant: "destructive",
      });
      return;
    }

    // Validate CSRF token
    if (!CSRFProtection.validateToken(data.csrfToken)) {
      toast({
        title: "Security Error",
        description: "Invalid security token. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate and sanitize all inputs
    const emailValidation = validateAndSanitize(data.email, secureInputSchemas.email);
    const nameValidation = validateAndSanitize(data.fullName, secureInputSchemas.name);
    const passwordValidation = validateAndSanitize(data.password, passwordSchema);

    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: (emailValidation as { success: false; error: string }).error,
        variant: "destructive",
      });
      return;
    }

    if (!nameValidation.success) {
      toast({
        title: "Invalid Name",
        description: (nameValidation as { success: false; error: string }).error,
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.success) {
      toast({
        title: "Invalid Password",
        description: (passwordValidation as { success: false; error: string }).error,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await onSignUp(
        emailValidation.data,
        passwordValidation.data,
        nameValidation.data,
        data.accountType
      );
      
      if (result.error) {
        authRateLimit.recordFailedAttempt(userIdentifier);
        toast({
          title: "Registration Failed",
          description: result.error.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error) {
      authRateLimit.recordFailedAttempt(userIdentifier);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isBlocked) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Account temporarily locked due to multiple failed attempts.
            Please try again in {formatTime(blockTimeRemaining)}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">Secure Authentication</span>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-2 px-4 text-center ${
            !isSignUp
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsSignUp(true)}
          className={`flex-1 py-2 px-4 text-center ${
            isSignUp
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign Up
        </button>
      </div>

      {!isSignUp ? (
        <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
          <input type="hidden" {...signInForm.register('csrfToken')} value={csrfToken} />
          
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              placeholder="Enter your email"
              {...signInForm.register('email')}
              autoComplete="email"
            />
            {signInForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {signInForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <div className="relative">
              <Input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...signInForm.register('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {signInForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {signInForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      ) : (
        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
          <input type="hidden" {...signUpForm.register('csrfToken')} value={csrfToken} />
          
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="Enter your full name"
              {...signUpForm.register('fullName')}
              autoComplete="name"
            />
            {signUpForm.formState.errors.fullName && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              {...signUpForm.register('email')}
              autoComplete="email"
            />
            {signUpForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-account-type">Account Type</Label>
            <select
              id="signup-account-type"
              {...signUpForm.register('accountType')}
              className="w-full p-2 border rounded-md"
            >
              <option value="patient">Patient</option>
              <option value="therapist">Therapist</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                {...signUpForm.register('password')}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {signUpForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...signUpForm.register('confirmPassword')}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {signUpForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      )}
    </div>
  );
};