import React, { createContext, useContext, useState, useEffect } from 'react';
import { PayoutRequest, EarningActivity, BonusTask, PaymentMethod, InvitedFriend } from '../types';

interface AppContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  totalEarned: number;
  watched: number;
  dailyLimit: number;
  cooldown: number;
  setCooldown: React.Dispatch<React.SetStateAction<number>>;
  reward: number;
  setReward: React.Dispatch<React.SetStateAction<number>>;
  rate: number;
  setRate: React.Dispatch<React.SetStateAction<number>>;
  claimedTasks: string[];
  payouts: PayoutRequest[];
  earnings: EarningActivity[];
  friends: InvitedFriend[];
  activeTab: 'earn' | 'tasks' | 'friends' | 'wallet';
  setActiveTab: (tab: 'earn' | 'tasks' | 'friends' | 'wallet') => void;
  activeView: 'app' | 'admin';
  setActiveView: (view: 'app' | 'admin') => void;
  viewMode: 'responsive' | 'telegram-frame';
  setViewMode: (mode: 'responsive' | 'telegram-frame') => void;
  user: {
    id: string;
    username: string;
    name: string;
    initials: string;
    avatarUrl?: string;
  };
  creditReward: (amount: number, title: string) => void;
  recordAdWatched: () => void;
  claimTask: (task: BonusTask) => boolean;
  submitPayoutRequest: (params: { name: string; phone: string; amount: number; method: PaymentMethod }) => { success: boolean; error?: string };
  markPayoutPaid: (id: string, reference: string) => void;
  rejectPayout: (id: string, reason: string) => void;
  saveSettings: (newRate: number, newReward: number) => void;
}

const initialPayouts: PayoutRequest[] = [
  {
    id: '1',
    username: '@meron_t',
    telegramId: '782419032',
    name: 'Meron Tesfaye',
    phone: '912345678',
    amount: 750,
    method: 'Telebirr',
    ads: 300,
    date: 'Nov 17, 2026',
    status: 'Pending',
  },
  {
    id: '2',
    username: '@abebe_k',
    telegramId: '621904738',
    name: 'Abebe Kebede',
    phone: '911234567',
    amount: 1250,
    method: 'CBE Birr',
    ads: 500,
    date: 'Nov 17, 2026',
    status: 'Pending',
  },
  {
    id: '3',
    username: '@hana_b',
    telegramId: '549210386',
    name: 'Hana Bekele',
    phone: '712345678',
    amount: 500,
    method: 'M-Pesa',
    ads: 200,
    date: 'Nov 17, 2026',
    status: 'Pending',
  },
  {
    id: '4',
    username: '@dawit_m',
    telegramId: '894701253',
    name: 'Dawit Mekonnen',
    phone: '922345678',
    amount: 850,
    method: 'Telebirr',
    ads: 340,
    date: 'Nov 16, 2026',
    status: 'Pending',
  },
  {
    id: '5',
    username: '@selam_a',
    telegramId: '734890162',
    name: 'Selam Asefa',
    phone: '933456789',
    amount: 1500,
    method: 'Telebirr',
    ads: 600,
    date: 'Nov 16, 2026',
    status: 'Pending',
  },
  {
    id: '6',
    username: '@haileliul',
    telegramId: '492718356',
    name: 'Haileliul Baye',
    phone: '911234545',
    amount: 600,
    method: 'Telebirr',
    ads: 240,
    date: 'Nov 12, 2026',
    status: 'Completed',
    reference: 'BGT84920X',
  },
  {
    id: '7',
    username: '@haileliul',
    telegramId: '492718356',
    name: 'Haileliul Baye',
    phone: '911234545',
    amount: 500,
    method: 'CBE Birr',
    ads: 200,
    date: 'Nov 5, 2026',
    status: 'Rejected',
    rejectionReason: 'Account holder name mismatch with CBE account',
  },
];

const initialEarnings: EarningActivity[] = [
  { id: 1, title: 'Video reward', subtitle: 'Today, 10:42 AM', amount: 2.5 },
  { id: 2, title: 'Video reward', subtitle: 'Today, 10:38 AM', amount: 2.5 },
  { id: 3, title: 'Daily check-in', subtitle: 'Today, 10:30 AM', amount: 5 },
  { id: 4, title: 'Referral commission', subtitle: 'Today, 9:56 AM · Meron T.', amount: 1.25 },
];

const initialFriends: InvitedFriend[] = [
  { name: 'Meron Tesfaye', initials: 'MT', date: 'Joined Nov 14', earned: 42.5 },
  { name: 'Abebe Kebede', initials: 'AK', date: 'Joined Nov 10', earned: 35.0 },
  { name: 'Hana Bekele', initials: 'HB', date: 'Joined Nov 8', earned: 22.5 },
  { name: 'Dawit Mekonnen', initials: 'DM', date: 'Joined Nov 2', earned: 18.75 },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(850.0);
  const [totalEarned, setTotalEarned] = useState<number>(1450.0);
  const [watched, setWatched] = useState<number>(14);
  const dailyLimit = 30;
  const [cooldown, setCooldown] = useState<number>(0);
  const [reward, setReward] = useState<number>(2.5);
  const [rate, setRate] = useState<number>(130);
  const [claimedTasks, setClaimedTasks] = useState<string[]>(['checkin']);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(initialPayouts);
  const [earnings, setEarnings] = useState<EarningActivity[]>(initialEarnings);
  const [friends] = useState<InvitedFriend[]>(initialFriends);

  const [activeTab, setActiveTab] = useState<'earn' | 'tasks' | 'friends' | 'wallet'>('earn');
  const [activeView, setActiveView] = useState<'app' | 'admin'>('app');
  const [viewMode, setViewMode] = useState<'responsive' | 'telegram-frame'>('responsive');

  const user = {
    id: '492718356',
    username: '@haileliul',
    name: 'Haileliul Baye',
    initials: 'HB',
  };

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const creditReward = (amount: number, title: string) => {
    setBalance((prev) => prev + amount);
    setTotalEarned((prev) => prev + amount);
    setEarnings((prev) => [
      {
        id: Date.now(),
        title,
        subtitle: 'Just now',
        amount,
      },
      ...prev,
    ]);
  };

  const recordAdWatched = () => {
    if (watched >= dailyLimit || cooldown > 0) return;
    setWatched((prev) => prev + 1);
    creditReward(reward, 'Video reward');
    setCooldown(30);
  };

  const claimTask = (task: BonusTask) => {
    if (claimedTasks.includes(task.id)) return false;
    setClaimedTasks((prev) => [...prev, task.id]);
    creditReward(task.amount, task.title);
    return true;
  };

  const submitPayoutRequest = ({
    name,
    phone,
    amount,
    method,
  }: {
    name: string;
    phone: string;
    amount: number;
    method: PaymentMethod;
  }) => {
    const trimmedName = name.trim();
    const cleanPhone = phone.replace(/\s+/g, '');

    if (trimmedName.split(/\s+/).length < 2) {
      return { success: false, error: 'Enter the account holder’s full name (first & last).' };
    }
    if (!/^[79]\d{8}$/.test(cleanPhone)) {
      return { success: false, error: 'Enter a valid 9-digit Ethiopian mobile number (e.g. 912345678).' };
    }
    if (!Number.isFinite(amount) || amount < 500) {
      return { success: false, error: 'The minimum withdrawal is 500 ETB.' };
    }
    if (amount > balance) {
      return { success: false, error: 'The amount exceeds your available balance.' };
    }

    setBalance((prev) => prev - amount);
    const newRequest: PayoutRequest = {
      id: String(Date.now()),
      username: user.username,
      telegramId: user.id,
      name: trimmedName,
      phone: cleanPhone,
      amount,
      method,
      ads: watched,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending',
    };

    setPayouts((prev) => [newRequest, ...prev]);
    return { success: true };
  };

  const markPayoutPaid = (id: string, reference: string) => {
    setPayouts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Completed', reference } : item))
    );
  };

  const rejectPayout = (id: string, reason: string) => {
    const target = payouts.find((p) => p.id === id);
    if (target && target.username === user.username) {
      // Refund balance
      setBalance((prev) => prev + target.amount);
    }
    setPayouts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Rejected', rejectionReason: reason } : item))
    );
  };

  const saveSettings = (newRate: number, newReward: number) => {
    setRate(newRate);
    setReward(newReward);
  };

  return (
    <AppContext.Provider
      value={{
        balance,
        setBalance,
        totalEarned,
        watched,
        dailyLimit,
        cooldown,
        setCooldown,
        reward,
        setReward,
        rate,
        setRate,
        claimedTasks,
        payouts,
        earnings,
        friends,
        activeTab,
        setActiveTab,
        activeView,
        setActiveView,
        viewMode,
        setViewMode,
        user,
        creditReward,
        recordAdWatched,
        claimTask,
        submitPayoutRequest,
        markPayoutPaid,
        rejectPayout,
        saveSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
