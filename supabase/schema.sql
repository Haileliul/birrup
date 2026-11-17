-- ==============================================================================
-- Birrup Ethiopian Rewards & Payout Platform - Database Schema
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_earned NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  ads_watched_today INT NOT NULL DEFAULT 0,
  last_ad_watched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast user lookup by Telegram ID
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);

-- 2. AD VIEWS TABLE (Anti-fraud & logging)
CREATE TABLE IF NOT EXISTS public.ad_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ad_views_user_id ON public.ad_views(user_id);

-- 3. BONUS TASKS CLAIMED TABLE
CREATE TABLE IF NOT EXISTS public.tasks_claimed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  reward_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_task UNIQUE (user_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_claimed_user_id ON public.tasks_claimed(user_id);

-- 4. WITHDRAWALS / PAYOUT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  account_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Telebirr', 'CBE Birr', 'M-Pesa')),
  amount NUMERIC(12, 2) NOT NULL,
  ads_watched INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Rejected')),
  reference TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);

-- 5. APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default application settings
INSERT INTO public.app_settings (key, value)
VALUES 
  ('usd_etb_rate', '130'::jsonb),
  ('reward_per_ad', '2.50'::jsonb),
  ('min_payout_amount', '500'::jsonb),
  ('daily_ad_limit', '30'::jsonb),
  ('ad_cooldown_seconds', '30'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- ATOMIC STORED PROCEDURES (Safe transactions, Anti-Tamper)
-- ==============================================================================

-- Stored Procedure: Get or Create User by Telegram ID
CREATE OR REPLACE FUNCTION public.get_or_create_user(
  p_telegram_id BIGINT,
  p_username TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  telegram_id BIGINT,
  username TEXT,
  name TEXT,
  balance NUMERIC,
  total_earned NUMERIC,
  ads_watched_today INT,
  last_ad_watched_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_today_start TIMESTAMPTZ := date_trunc('day', timezone('utc'::text, now()));
BEGIN
  -- Insert or update user profile
  INSERT INTO public.users (telegram_id, username, first_name, last_name, balance, total_earned)
  VALUES (p_telegram_id, p_username, p_first_name, p_last_name, 0.00, 0.00)
  ON CONFLICT (telegram_id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, users.username),
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users.last_name),
    updated_at = timezone('utc'::text, now())
  RETURNING users.id INTO v_user_id;

  -- Reset ads_watched_today if last view was before today UTC
  UPDATE public.users
  SET ads_watched_today = 0
  WHERE users.id = v_user_id AND (users.last_ad_watched_at IS NULL OR users.last_ad_watched_at < v_today_start);

  RETURN QUERY
  SELECT 
    u.id,
    u.telegram_id,
    COALESCE(u.username, '@user' || u.telegram_id::text) AS username,
    TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))) AS name,
    u.balance,
    u.total_earned,
    u.ads_watched_today,
    u.last_ad_watched_at
  FROM public.users u
  WHERE u.id = v_user_id;
END;
$$;

-- Stored Procedure: Atomic Ad Watch & Reward Credit
CREATE OR REPLACE FUNCTION public.record_ad_reward(
  p_telegram_id BIGINT,
  p_reward NUMERIC DEFAULT 2.50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user public.users%ROWTYPE;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_today_start TIMESTAMPTZ := date_trunc('day', v_now);
  v_cooldown_seconds INT := 30;
  v_daily_limit INT := 30;
BEGIN
  -- Fetch user row with row lock
  SELECT * INTO v_user
  FROM public.users
  WHERE telegram_id = p_telegram_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Reset daily limit if day has passed
  IF v_user.last_ad_watched_at IS NULL OR v_user.last_ad_watched_at < v_today_start THEN
    v_user.ads_watched_today := 0;
  END IF;

  -- Check daily limit
  IF v_user.ads_watched_today >= v_daily_limit THEN
    RETURN jsonb_build_object('success', false, 'error', 'Daily limit reached');
  END IF;

  -- Check cooldown timer
  IF v_user.last_ad_watched_at IS NOT NULL AND 
     EXTRACT(EPOCH FROM (v_now - v_user.last_ad_watched_at)) < v_cooldown_seconds THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cooldown active');
  END IF;

  -- Update user balance & stats
  UPDATE public.users
  SET 
    balance = balance + p_reward,
    total_earned = total_earned + p_reward,
    ads_watched_today = v_user.ads_watched_today + 1,
    last_ad_watched_at = v_now,
    updated_at = v_now
  WHERE id = v_user.id;

  -- Record ad view
  INSERT INTO public.ad_views (user_id, reward_amount, created_at)
  VALUES (v_user.id, p_reward, v_now);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_user.balance + p_reward,
    'total_earned', v_user.total_earned + p_reward,
    'ads_watched_today', v_user.ads_watched_today + 1
  );
END;
$$;

-- Stored Procedure: Atomic Payout Request
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_telegram_id BIGINT,
  p_account_name TEXT,
  p_phone TEXT,
  p_method TEXT,
  p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user public.users%ROWTYPE;
  v_withdrawal_id UUID;
BEGIN
  IF p_amount < 500.00 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum withdrawal is 500 ETB');
  END IF;

  SELECT * INTO v_user
  FROM public.users
  WHERE telegram_id = p_telegram_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_user.balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Deduct from balance atomically
  UPDATE public.users
  SET balance = balance - p_amount, updated_at = timezone('utc'::text, now())
  WHERE id = v_user.id;

  -- Insert withdrawal queue item
  INSERT INTO public.withdrawals (
    user_id, username, account_name, phone, method, amount, ads_watched, status
  )
  VALUES (
    v_user.id, COALESCE(v_user.username, '@user' || p_telegram_id::text),
    p_account_name, p_phone, p_method, p_amount, v_user.ads_watched_today, 'Pending'
  )
  RETURNING id INTO v_withdrawal_id;

  RETURN jsonb_build_object(
    'success', true,
    'withdrawal_id', v_withdrawal_id,
    'new_balance', v_user.balance - p_amount
  );
END;
$$;

-- Stored Procedure: Admin Process Payout (Mark Paid / Reject with Refund)
CREATE OR REPLACE FUNCTION public.admin_process_payout(
  p_withdrawal_id UUID,
  p_action TEXT, -- 'pay' or 'reject'
  p_reference TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_withdrawal public.withdrawals%ROWTYPE;
BEGIN
  SELECT * INTO v_withdrawal
  FROM public.withdrawals
  WHERE id = p_withdrawal_id AND status = 'Pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pending withdrawal request not found');
  END IF;

  IF p_action = 'pay' THEN
    UPDATE public.withdrawals
    SET 
      status = 'Completed',
      reference = p_reference,
      updated_at = timezone('utc'::text, now())
    WHERE id = p_withdrawal_id;

    RETURN jsonb_build_object('success', true, 'status', 'Completed');
  ELSIF p_action = 'reject' THEN
    -- Refund amount back to user's balance
    UPDATE public.users
    SET 
      balance = balance + v_withdrawal.amount,
      updated_at = timezone('utc'::text, now())
    WHERE id = v_withdrawal.user_id;

    UPDATE public.withdrawals
    SET 
      status = 'Rejected',
      rejection_reason = p_reason,
      updated_at = timezone('utc'::text, now())
    WHERE id = p_withdrawal_id;

    RETURN jsonb_build_object('success', true, 'status', 'Rejected', 'refunded', v_withdrawal.amount);
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid action');
  END IF;
END;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_claimed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to app settings
CREATE POLICY "Public read settings" ON public.app_settings FOR SELECT USING (true);

-- Allow public access for mini-app demo / anon key (secured via stored procedures)
CREATE POLICY "Allow anon read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow anon read withdrawals" ON public.withdrawals FOR SELECT USING (true);
CREATE POLICY "Allow anon read tasks" ON public.tasks_claimed FOR SELECT USING (true);
