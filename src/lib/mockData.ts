
import type { User, Payment, Reminder } from '@/types';
// MOCK_USER_ID is no longer relevant as auth is handled by Firebase.
// export const MOCK_USER_ID = 'user123'; 
import { CURRENT_MONTH_LABEL, CURRENT_MONTH_VALUE } from './constants';

// This mockUsers array might still be used by features not yet migrated to Firebase (e.g., full resident list for status page).
// However, for authentication and current user profile, AuthContext and Firebase are the source of truth.
export const mockUsers: User[] = [
  // { id: MOCK_USER_ID, name: 'John Doe', email: 'john.doe@example.com', flatNumber: 'A-101', avatarUrl: 'https://placehold.co/100x100.png', isAdmin: true },
  { id: 'firebase-uid-placeholder-001', name: 'John Doe (Mock)', email: 'john.doe@example.com', flatNumber: 'A-101', avatarUrl: 'https://placehold.co/100x100.png', isAdmin: true },
  { id: 'user002', name: 'Jane Smith', email: 'jane.smith@example.com', flatNumber: 'A-102', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'user003', name: 'Mike Johnson', email: 'mike.johnson@example.com', flatNumber: 'B-205', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'user004', name: 'Sarah Brown', email: 'sarah.brown@example.com', flatNumber: 'C-301', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'user005', name: 'David Wilson', email: 'david.wilson@example.com', flatNumber: 'C-302' },
];

export const mockPayments: Payment[] = [
  { 
    id: 'payment001', 
    userId: 'firebase-uid-placeholder-001', // This ID should ideally match a Firebase UID if this data were to be used with the new auth.
    userName: 'John Doe (Mock)',
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
// This function will need to be updated to use Firebase data.
export const getHouseholdPaymentStatus = (monthValue: string = CURRENT_MONTH_VALUE): User[] => {
  console.warn("getHouseholdPaymentStatus is using mock data and needs to be updated for Firebase.")
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

// getLoggedInUser is no longer the source of truth. useAuth().user from AuthContext should be used.
// export const getLoggedInUser = (): User | undefined => mockUsers.find(u => u.id === MOCK_USER_ID);
// Commenting out to prevent usage. Code relying on this will need to be updated.
export const getLoggedInUser = (): User | undefined => {
  console.warn("getLoggedInUser from mockData is deprecated. Use useAuth().user instead.");
  return undefined; 
};
