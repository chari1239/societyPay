import type { Payment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, CalendarDays, CheckCircle, FileText, Hash } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentHistoryItemProps {
  payment: Payment;
}

export function PaymentHistoryItem({ payment }: PaymentHistoryItemProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Payment for {payment.month}</CardTitle>
            <CardDescription>
              Paid on: {format(new Date(payment.paymentDate), 'PPP')}
            </CardDescription>
          </div>
          <Badge variant={payment.status === 'Paid' ? 'default' : 'destructive'} className={payment.status === 'Paid' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
            {payment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center">
          <IndianRupee className="h-4 w-4 mr-2 text-primary" />
          <span>Amount:</span>
          <span className="ml-auto font-semibold">₹{payment.amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-primary" />
          <span>Method:</span>
          <span className="ml-auto">{payment.method}</span>
        </div>
        {payment.transactionId && (
          <div className="flex items-center">
            <Hash className="h-4 w-4 mr-2 text-primary" />
            <span>Transaction ID:</span>
            <span className="ml-auto truncate max-w-[150px]">{payment.transactionId}</span>
          </div>
        )}
        {payment.receiptFileName && (
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-primary" />
            <span>Receipt:</span>
            <span className="ml-auto truncate max-w-[150px]">{payment.receiptFileName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
