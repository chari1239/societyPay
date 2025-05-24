import type { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ResidentPaymentStatusCardProps {
  resident: User & { paymentStatus?: 'Paid' | 'Pending' | 'Overdue' };
}

export function ResidentPaymentStatusCard({ resident }: ResidentPaymentStatusCardProps) {
  const status = resident.paymentStatus || 'Pending'; // Default to Pending if not set

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center space-x-4 pb-3">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={resident.avatarUrl || `https://placehold.co/100x100.png?text=${resident.name.charAt(0)}`} alt={resident.name} data-ai-hint="user avatar profile"/>
          <AvatarFallback>{resident.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">{resident.name}</CardTitle>
          <CardDescription>Flat: {resident.flatNumber}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Payment Status:</span>
          <Badge 
            variant={status === 'Paid' ? 'default' : 'outline'}
            className={
              status === 'Paid' ? 'bg-green-100 text-green-700 border-green-300' : 
              status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 
              'bg-red-100 text-red-700 border-red-300' 
            }
          >
            {status === 'Paid' ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <AlertCircle className="mr-1 h-3.5 w-3.5" />}
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
