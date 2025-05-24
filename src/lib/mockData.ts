import type { User, Payment, Reminder } from '@/types';
import { MOCK_USER_ID, CURRENT_MONTH_LABEL, CURRENT_MONTH_VALUE } from './constants';

export const mockUsers: User[] = [
  { id: MOCK_USER_ID, name: 'John Doe', email: 'john.doe@example.com', flatNumber: 'A-101', avatarUrl: 'https://placehold.co/100x100.png', isAdmin: true },
  { id: 'user002', name: 'Jane Smith', email: 'jane.smith@example.com', flatNumber: 'A-102', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'user003', name: 'Mike Johnson', email: 'mike.johnson@example.com', flatNumber: 'B-205', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'user004', name: 'Sarah Brown', email: 'sarah.brown@example.com', flatNumber: 'C-301', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'user005', name: 'David Wilson', email: 'david.wilson@example.com', flatNumber: 'C-302' },
];

export const mockPayments: Payment[] = [
  { 
    id: 'payment001', 
    userId: MOCK_USER_ID, 
    userName: 'John Doe',
    userAvatar: 'https://placehold.co/100x100.png',
    amount: 2500, 
    paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    month: CURRENT_MONTH_LABEL, 
    method: 'UPI', 
    transactionId: 'UPI123456789', 
    status: 'Paid',
    receiptFileName: 'receipt_july.pdf'
  },
  { 
    id: 'payment002', 
    userId: 'user002', 
    userName: 'Jane Smith',
    userAvatar: 'https://placehold.co/100x100.png',
    amount: 2500, 
    paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    month: CURRENT_MONTH_LABEL, 
    method: 'UPI', 
    transactionId: 'UPI987654321', 
    status: 'Paid',
    receiptFileName: 'payment_jane.jpg'
  },
  { 
    id: 'payment003', 
    userId: 'user003', 
    userName: 'Mike Johnson',
    userAvatar: 'https://placehold.co/100x100.png',
    amount: 2500, 
    paymentDate: new Date().toISOString(), 
    month: CURRENT_MONTH_LABEL, // Paid for current month
    method: 'UPI', 
    transactionId: 'UPIABCDEF123', 
    status: 'Paid' 
  },
];

// To reflect users who haven't paid for the current month for the status page
export const getHouseholdPaymentStatus = (monthValue: string = CURRENT_MONTH_VALUE): User[] => {
  return mockUsers.map(user => {
    const payment = mockPayments.find(p => p.userId === user.id && p.month === monthValueToLabel(monthValue));
    return {
      ...user,
      paymentStatus: payment ? 'Paid' : 'Pending', // Or 'Overdue' based on logic
    };
  });
};

const monthValueToLabel = (value: string): string => {
  const [year, month] = value.split('-');
  const date = new Date(parseInt(year), parseInt(month) -1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}


export const mockReminders: Reminder[] = [
  { 
    id: 'reminder001', 
    userId: 'user004', 
    userName: 'Sarah Brown',
    flatNumber: 'C-301',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // Due in 5 days
    amountDue: 2500,
    message: `Friendly reminder: Your maintenance fee of ₹2500 for ${CURRENT_MONTH_LABEL} is due soon.`, 
    status: 'Scheduled' 
  },
  { 
    id: 'reminder002', 
    userId: 'user005', 
    userName: 'David Wilson',
    flatNumber: 'C-302',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), // Due 2 days ago
    amountDue: 2500,
    message: `Action Required: Your maintenance fee of ₹2500 for ${CURRENT_MONTH_LABEL} is overdue. Please pay at your earliest.`, 
    status: 'Sent',
    sentDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() 
  },
];

export const getLoggedInUser = (): User | undefined => mockUsers.find(u => u.id === MOCK_USER_ID);
