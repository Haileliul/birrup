import { createClient } from '@supabase/supabase-js';
import { PayoutRequest, PaymentMethod } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// REMOTE DATA SERVICES (Used when Supabase is connected)
// ==============================================================================

export const fetchRemoteUser = async (telegramId: number, username?: string, name?: string) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc('get_or_create_user', {
      p_telegram_id: telegramId,
      p_username: username || null,
      p_first_name: name || null,
    });
    if (error || !data || data.length === 0) return null;
    return data[0];
  } catch (e) {
    console.error('Supabase fetch user error:', e);
    return null;
  }
};

export const recordAdRewardRemote = async (telegramId: number, reward: number) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc('record_ad_reward', {
      p_telegram_id: telegramId,
      p_reward: reward,
    });
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Supabase record ad error:', e);
    return null;
  }
};

export const submitWithdrawalRemote = async (params: {
  telegramId: number;
  name: string;
  phone: string;
  method: PaymentMethod;
  amount: number;
}) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc('request_withdrawal', {
      p_telegram_id: params.telegramId,
      p_account_name: params.name,
      p_phone: params.phone,
      p_method: params.method,
      p_amount: params.amount,
    });
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Supabase withdrawal request error:', e);
    return null;
  }
};

export const fetchAllWithdrawalsRemote = async (): Promise<PayoutRequest[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      username: row.username,
      telegramId: String(row.user_id),
      name: row.account_name,
      phone: row.phone,
      amount: Number(row.amount),
      method: row.method as PaymentMethod,
      ads: row.ads_watched || 0,
      date: new Date(row.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: row.status,
      reference: row.reference || undefined,
      rejectionReason: row.rejection_reason || undefined,
    }));
  } catch (e) {
    console.error('Supabase fetch withdrawals error:', e);
    return null;
  }
};

export const adminProcessPayoutRemote = async (
  withdrawalId: string,
  action: 'pay' | 'reject',
  reference?: string,
  reason?: string
) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc('admin_process_payout', {
      p_withdrawal_id: withdrawalId,
      p_action: action,
      p_reference: reference || null,
      p_reason: reason || null,
    });
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Supabase admin process error:', e);
    return null;
  }
};
