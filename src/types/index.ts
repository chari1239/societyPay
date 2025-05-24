
export interface User {
  id: string;
  name: string;
  email: string;
  flatNumber: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string; 
  userAvatar?: string;
  amount: number;
  paymentDate: string; // ISO string
  month: string; // e.g., "July 2024"
  method: 'UPI';
  transactionId?: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  receiptFileName?: string; 
}

export interface Reminder {
  id: string;
  userId: string;
  userName: string;
  flatNumber: string;
  dueDate: string; // ISO string
  amountDue: number;
  message: string;
  sentDate?: string; // ISO string
  status: 'Scheduled' | 'Sent' | 'Acknowledged';
}

export interface SelectOption {
  value: string;
  label: string;
}
