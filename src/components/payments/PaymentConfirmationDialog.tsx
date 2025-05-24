"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, IndianRupee, CalendarDays, Hash } from "lucide-react";
import type { Payment } from "@/types";
import { motion, AnimatePresence } from "framer-motion"; // For animation

interface PaymentConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  paymentDetails: Payment;
}

export default function PaymentConfirmationDialog({ 
  isOpen, 
  onOpenChange, 
  paymentDetails 
}: PaymentConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DialogHeader className="items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                </motion.div>
                <DialogTitle className="text-2xl">Payment Successful!</DialogTitle>
                <DialogDescription>
                  Your payment has been recorded. Thank you!
                </DialogDescription>
              </DialogHeader>
              <div className="my-6 space-y-3">
                <div className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-md">
                  <span className="text-muted-foreground flex items-center"><IndianRupee className="w-4 h-4 mr-2"/>Amount Paid:</span>
                  <span className="font-medium">₹{paymentDetails.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-md">
                  <span className="text-muted-foreground flex items-center"><CalendarDays className="w-4 h-4 mr-2"/>For Month:</span>
                  <span className="font-medium">{paymentDetails.month}</span>
                </div>
                {paymentDetails.transactionId && (
                   <div className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-md">
                    <span className="text-muted-foreground flex items-center"><Hash className="w-4 h-4 mr-2"/>Transaction ID:</span>
                    <span className="font-medium truncate max-w-[150px]">{paymentDetails.transactionId}</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => onOpenChange(false)} className="w-full">
                  Done
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
