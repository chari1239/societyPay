
export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  flatNumber: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

export interface Payment {
  id: string; // Firestore document ID
  userId: string; // Firebase Auth UID of the user who made the payment
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
  id: string; // Firestore document ID
  userId: string; // Firebase Auth UID of the user
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
