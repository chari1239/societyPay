
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  flatNumber: z.string().min(1, { message: 'Flat number is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      flatNumber: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const result = await signup(data.name, data.email, data.flatNumber, data.password);
      
      if (result.success) {
        toast({ title: "Signup Successful", description: "Welcome to SocietyPay!" });
        router.push('/dashboard');
      } else {
        let errorTitle = "Signup Failed";
        let errorMessage = "An error occurred during signup. Please try again.";

        if (result.error) {
          console.error("SignupForm: Error from AuthContext:", result.error);
          if (result.error.code === 'auth/network-request-failed') {
            errorTitle = "Network Error";
            errorMessage = "A network error occurred. Please check your internet connection and try again.";
          } else if (result.error.code === 'auth/email-already-in-use') {
            errorMessage = "This email address is already in use. Please try logging in or use a different email.";
            form.setError("email", { type: "manual", message: "This email is already in use." });
          } else {
            // Use the Firebase error message if available and not too cryptic
            errorMessage = result.error.message || errorMessage;
          }
        }
        
        toast({ title: errorTitle, description: errorMessage, variant: "destructive" });
        if (result.error?.code !== 'auth/email-already-in-use') { 
           form.setError("root", { message: errorMessage });
        }
      }
    } catch (error) { 
      // Catch any unexpected errors from the signup call itself or during result processing
      console.error("SignupForm: Unexpected error during signup process:", error);
      toast({ title: "Signup Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
      form.setError("root", { message: "An unexpected error occurred. Please check your internet connection and try again." });
    } finally {
      setIsLoading(false); // Ensure this always runs
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Join SocietyPay to manage your maintenance payments.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="flatNumber">Flat Number</Label>
            <Input id="flatNumber" placeholder="e.g., A-101" {...form.register('flatNumber')} />
            {form.formState.errors.flatNumber && (
              <p className="text-sm text-destructive">{form.formState.errors.flatNumber.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
           {form.formState.errors.root && (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
