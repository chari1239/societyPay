"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { PaymentHistoryItem } from '@/components/payments/PaymentHistoryItem';
import type { Payment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { mockPayments } from '@/lib/mockData'; // Using mock data
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      // Filter mock payments for the logged-in user
      const payments = mockPayments
        .filter(p => p.userId === user.id)
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      setUserPayments(payments);
    }
  }, [user]);

  const handlePaymentSubmitted = (newPayment: Payment) => {
    // Add to local state (and mock data for session persistence if desired)
    setUserPayments(prevPayments => [newPayment, ...prevPayments]
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));
    mockPayments.unshift(newPayment); // Add to global mock for this session
    
    toast({
      title: "Payment Recorded",
      description: `Your payment of ₹${newPayment.amount} for ${newPayment.month} has been successfully recorded.`,
      duration: 5000,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Make a Payment</CardTitle>
            <CardDescription>
              Submit your monthly maintenance payment details here. All payments are made via UPI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm onPaymentSubmitted={handlePaymentSubmitted} />
          </CardContent>
        </Card>

        <Separator />

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Payment History</CardTitle>
            <CardDescription>View all your past maintenance payments.</CardDescription>
          </CardHeader>
          <CardContent>
            {userPayments.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userPayments.map(payment => (
                  <PaymentHistoryItem key={payment.id} payment={payment} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">You have no payment history yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
