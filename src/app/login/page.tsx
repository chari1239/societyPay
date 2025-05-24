import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/shared/Logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <LoginForm />
    </div>
  );
}
