import { AppLayout } from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, IndianRupee, Users } from 'lucide-react';
import { mockUsers, mockPayments, getLoggedInUser } from '@/lib/mockData';
import { CURRENT_MONTH_LABEL } from '@/lib/constants';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPage() {
  const currentUser = getLoggedInUser();
  const totalHouseholds = mockUsers.length;
  const paidThisMonth = mockPayments.filter(p => p.month === CURRENT_MONTH_LABEL).length;
  const userPayment = mockPayments.find(p => p.userId === currentUser?.id && p.month === CURRENT_MONTH_LABEL);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {currentUser?.name || 'Resident'}!</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Payment Status ({CURRENT_MONTH_LABEL})</CardTitle>
              {userPayment ? 
                <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                <IndianRupee className="h-5 w-5 text-destructive" />
              }
            </CardHeader>
            <CardContent>
              {userPayment ? (
                <>
                  <div className="text-2xl font-bold text-green-600">Paid</div>
                  <p className="text-xs text-muted-foreground">
                    ₹{userPayment.amount} on {new Date(userPayment.paymentDate).toLocaleDateString()}
                  </p>
                </>
              ) : (
                 <>
                  <div className="text-2xl font-bold text-destructive">Pending</div>
                  <p className="text-xs text-muted-foreground">
                    Maintenance fee for {CURRENT_MONTH_LABEL} is due.
                  </p>
                </>
              )}
               <Button asChild size="sm" className="mt-4 w-full sm:w-auto">
                <Link href="/payments">
                  {userPayment ? 'View History' : 'Pay Now'} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Society Payments ({CURRENT_MONTH_LABEL})</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidThisMonth} / {totalHouseholds}</div>
              <p className="text-xs text-muted-foreground">
                Households have paid this month.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full sm:w-auto">
                <Link href="/status">
                  View Full Status <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/reports">Monthly Reports</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/reminders">Payment Reminders</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/profile">My Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest payments in the society.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockPayments.slice(0, 3).map(payment => (
              <div key={payment.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={payment.userAvatar || `https://placehold.co/40x40.png?text=${payment.userName.charAt(0)}`} alt={payment.userName} data-ai-hint="user avatar small" />
                    <AvatarFallback>{payment.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{payment.userName}</p>
                    <p className="text-xs text-muted-foreground">Paid for {payment.month}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-green-600">₹{payment.amount}</p>
                  <p className="text-xs text-muted-foreground">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {mockPayments.length === 0 && <p className="text-muted-foreground">No recent payments.</p>}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
