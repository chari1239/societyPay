"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, UploadCloud, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Payment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { MONTH_OPTIONS, CURRENT_MONTH_VALUE } from '@/lib/constants';
import PaymentConfirmationDialog from './PaymentConfirmationDialog';

const paymentSchema = z.object({
  amount: z.preprocess(
    (val) => parseFloat(z.string().parse(val)),
    z.number().positive({ message: 'Amount must be positive' })
  ),
  month: z.string().min(1, { message: 'Payment month is required' }),
  paymentDate: z.date({ required_error: 'Payment date is required' }),
  transactionId: z.string().optional(),
  // receipt: typeof window === 'undefined' ? z.any() : z.instanceof(FileList).optional(), // Optional file upload
  receipt: z.any().optional(), // Simplified for mock
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onPaymentSubmitted: (payment: Payment) => void;
}

export function PaymentForm({ onPaymentSubmitted }: PaymentFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [submittedPayment, setSubmittedPayment] = useState<Payment | null>(null);
  const { toast } = useToast();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 2500, // Default maintenance amount
      month: CURRENT_MONTH_VALUE,
      paymentDate: new Date(),
      transactionId: '',
      receipt: undefined,
      notes: '',
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to make a payment.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    // Simulate API call & UPI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      amount: data.amount,
      month: MONTH_OPTIONS.find(opt => opt.value === data.month)?.label || data.month,
      paymentDate: data.paymentDate.toISOString(),
      method: 'UPI',
      transactionId: data.transactionId,
      receiptFileName: data.receipt && data.receipt[0] ? (data.receipt[0] as File).name : undefined,
      status: 'Paid',
    };
    
    onPaymentSubmitted(newPayment); // Update local state or context
    setSubmittedPayment(newPayment);
    setIsLoading(false);
    setIsConfirmationOpen(true);
    form.reset({ 
        amount: 2500, 
        month: CURRENT_MONTH_VALUE, 
        paymentDate: new Date(), 
        transactionId: '', 
        receipt: undefined, 
        notes: '' 
    });
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="amount" type="number" placeholder="2500" {...form.register('amount')} className="pl-10" />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Payment For Month</Label>
            <Controller
              control={form.control}
              name="month"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
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
              )}
            />
            {form.formState.errors.month && (
              <p className="text-sm text-destructive">{form.formState.errors.month.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Controller
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {form.formState.errors.paymentDate && (
              <p className="text-sm text-destructive">{form.formState.errors.paymentDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">UPI Transaction ID (Optional)</Label>
            <Input id="transactionId" placeholder="e.g., ABC123XYZ789" {...form.register('transactionId')} />
            {form.formState.errors.transactionId && (
              <p className="text-sm text-destructive">{form.formState.errors.transactionId.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="receipt">Upload Receipt (Optional)</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="receipt"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, PDF (MAX. 5MB)</p>
              </div>
              <Input id="receipt" type="file" className="hidden" {...form.register('receipt')} />
            </label>
          </div>
           {form.watch("receipt")?.[0] && (
            <p className="text-sm text-muted-foreground mt-1">Selected file: {(form.watch("receipt")?.[0] as File)?.name}</p>
          )}
          {form.formState.errors.receipt && (
            <p className="text-sm text-destructive">{(form.formState.errors.receipt.message as string)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea id="notes" placeholder="Any additional information..." {...form.register('notes')} />
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit Payment"
          )}
        </Button>
      </form>
      {submittedPayment && (
        <PaymentConfirmationDialog 
          isOpen={isConfirmationOpen} 
          onOpenChange={setIsConfirmationOpen}
          paymentDetails={submittedPayment}
        />
      )}
    </>
  );
}
