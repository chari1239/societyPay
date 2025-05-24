import { SignupForm } from '@/components/auth/SignupForm';
import { Logo } from '@/components/shared/Logo';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
         <Logo size="lg" />
      </div>
      <SignupForm />
    </div>
  );
}
