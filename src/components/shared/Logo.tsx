import { Building, DollarSign } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const iconSize = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-2">
      <div className="p-1 bg-primary rounded-md">
        <Building size={iconSize * 0.9} className="text-primary-foreground" />
      </div>
      {showText && (
        <span className={`${textSize} font-semibold text-primary`}>
          {APP_NAME}
        </span>
      )}
    </div>
  );
}
