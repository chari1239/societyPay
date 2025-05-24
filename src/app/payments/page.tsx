
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image'; // Added import
import Link from 'next/link'; // Added import
import { AppLayout } from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { PaymentHistoryItem } from '@/components/payments/PaymentHistoryItem';
import type { Payment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { mockPayments } from '@/lib/mockData'; // Using mock data
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button'; // Ensure Button is imported

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
              Use the UPI details below to complete your payment, then submit the form to record your transaction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* New UPI Info Section */}
            <div className="mb-8 p-4 border rounded-lg bg-muted/20 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-primary"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                Pay Using UPI
              </h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex-shrink-0">
                  <Image 
                    src="https://placehold.co/150x150.png" 
                    alt="UPI QR Code" 
                    width={150} 
                    height={150} 
                    className="rounded-lg border shadow-md"
                    data-ai-hint="qr code"
                  />
                </div>
                <div className="space-y-3 flex-grow">
                  <p className="text-sm text-muted-foreground">
                    Scan the QR code with your preferred UPI app or use the UPI ID below.
                  </p>
                  <div className="p-3 bg-background border rounded-md text-center sm:text-left">
                    <p className="text-base font-mono text-primary tracking-wider">society.pay@exampleupi</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    (This is a mock UPI ID for demonstration purposes.)
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild disabled className="opacity-70 cursor-not-allowed">
                      <Link href="#gpay-mock">
                        Pay with GPay (Simulated)
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild disabled className="opacity-70 cursor-not-allowed">
                      <Link href="#phonepe-mock">
                        Pay with PhonePe (Simulated)
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild disabled className="opacity-70 cursor-not-allowed">
                      <Link href="#paytm-mock">
                        Pay with Paytm (Simulated)
                      </Link>
                    </Button>
                  </div>
                   <p className="text-sm text-foreground font-medium pt-3">
                    <strong>Important:</strong> After completing your payment, please use the form below to record the transaction details.
                  </p>
                </div>
              </div>
            </div>
            {/* End New UPI Info Section */}

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
