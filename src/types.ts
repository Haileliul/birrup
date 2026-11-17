export type PaymentMethod = 'Telebirr' | 'CBE Birr' | 'M-Pesa';

export type PayoutStatus = 'Pending' | 'Completed' | 'Rejected';

export interface PayoutRequest {
  id: string;
  username: string;
  telegramId: string;
  name: string;
  phone: string;
  amount: number;
  method: PaymentMethod;
  ads: number;
  date: string;
  status: PayoutStatus;
  reference?: string;
  rejectionReason?: string;
}

export interface EarningActivity {
  id: number | string;
  title: string;
  subtitle: string;
  amount: number;
}

export interface BonusTask {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  icon: string;
  url?: string;
}

export interface InvitedFriend {
  name: string;
  initials: string;
  date: string;
  earned: number;
}
