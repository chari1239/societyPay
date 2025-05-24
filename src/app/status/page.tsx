"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/AppLayout';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResidentPaymentStatusCard } from '@/components/dashboard/ResidentPaymentStatusCard';
import type { User } from '@/types';
import { getHouseholdPaymentStatus } from '@/lib/mockData';
import { MONTH_OPTIONS, CURRENT_MONTH_VALUE } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function PaymentStatusPage() {
  const [residentsWithStatus, setResidentsWithStatus] = useState<(User & { paymentStatus?: 'Paid' | 'Pending' | 'Overdue' })[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH_VALUE);

  useEffect(() => {
    setResidentsWithStatus(getHouseholdPaymentStatus(selectedMonth));
  }, [selectedMonth]);

  const paidCount = residentsWithStatus.filter(r => r.paymentStatus === 'Paid').length;
  const pendingCount = residentsWithStatus.filter(r => r.paymentStatus === 'Pending' || r.paymentStatus === 'Overdue').length;
  const totalCount = residentsWithStatus.length;

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">Payment Status Dashboard</CardTitle>
                <CardDescription>
                  Real-time overview of who has paid their maintenance fees.
                </CardDescription>
              </div>
              <div className="w-full sm:w-auto min-w-[200px]">
                <Label htmlFor="month-select" className="text-sm font-medium mb-1 block">Select Month:</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month-select">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{paidCount}</p>
                <p className="text-sm text-green-500">Paid</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-sm text-yellow-500">Pending/Overdue</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
                <p className="text-sm text-blue-500">Total Households</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {residentsWithStatus.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {residentsWithStatus.map(resident => (
              <ResidentPaymentStatusCard key={resident.id} resident={resident} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No resident data available for the selected month.</p>
        )}
      </div>
    </AppLayout>
  );
}
