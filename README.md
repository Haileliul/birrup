# Birrup (ብር-አፕ) — Telegram Mini App & Admin Payout Dashboard

A complete, high-performance Telegram Mini App and Web Admin Payout Dashboard designed for Ethiopia. Users earn Ethiopian Birr (ETB) by watching short video ads and completing micro-tasks, while admins manually review and process withdrawals via **Telebirr**, **CBE Birr**, and **M-Pesa Ethiopia**.

Recreated faithfully from the published Lovable design: [birrup-earning-payout-playground.lovable.app](https://birrup-earning-payout-playground.lovable.app/).

---

## 🌟 Key Features

### PART 1: User Telegram Mini App (Mobile-First, 390 × 844 px)
* **Dark Mode Theme**: Deep slate/navy backgrounds (`oklch(15.5% .026 254)`), vibrant emerald green accents (`oklch(79% .176 162)`), cyan highlights, glassmorphism cards, and Manrope typography.
* **Telegram Safe Areas & Topbar**: Top bar displaying user avatar, username (`@haileliul`), and pill-shaped balance badge (`850.00 ETB`).
* **Fixed Bottom Navigation**: 4 tabs with smooth state transitions:
  1. **Earn Screen (Home)**:
     - Hero card with glowing *"Watch Ad & Earn"* button and `+2.50 ETB` reward badge.
     - Interactive video ad player simulator with real-time 5-second playback timer and reward collection.
     - Cooldown timer (30s) and daily limit progress bar (14 / 30 ads watched today).
     - Recent earnings feed with completed badges.
  2. **Tasks Screen**:
     - Community bonus micro-tasks: *Join Telegram Channel* (+15 ETB), *Daily Check-in Streak* (+5 ETB), *Follow on TikTok* (+10 ETB), and *Follow on X* (+10 ETB).
     - Live progress panel and one-tap "Claim" / "Completed" buttons.
  3. **Friends (Referral) Screen**:
     - Referral banner with *10% ad earnings commission forever*.
     - One-click copy invite link and direct "Share on Telegram" integration (`https://t.me/share/url?...`).
     - Circle list showing invited friends, join dates, and commissions earned.
  4. **Wallet (ETB Withdraw) Screen**:
     - Available balance card with visual progress bar toward the 500 ETB minimum threshold.
     - Local payment method selector tabs: **Telebirr** (default), **CBE Birr**, and **M-Pesa**.
     - Payout form with validation: Full name verification, fixed `+251` Ethiopian prefix (`9XX XXX XXX`), and withdrawal amount with a `Max` quick-fill button.
     - Dynamic CTA (`Request Telebirr Payout`) and transaction history with masked phone numbers (`+251 91****45`) and color-coded status pills (*Pending*, *Completed*, *Rejected*).

---

### PART 2: Admin Payout Dashboard (Desktop Web, 1440 × 900 px)
* **Top KPI & Settings Bar**:
  - **Pending Payouts Card**: Total ETB awaiting dispatch and pending count.
  - **Total Paid Out Card**: Total ETB disbursed this month.
  - **Profitability Overview Card**: Estimated AdsGram USD₮ revenue converted to ETB vs. user payout liabilities.
  - **Quick Settings Box**: Editable live inputs for *USD-to-ETB Exchange Rate* (e.g. 130 ETB) and *Reward Per Ad* with save confirmation.
* **Manual Withdrawal Queue Table**:
  - Filter tabs: *Pending*, *Completed*, *Rejected*, and *All* with real-time counter badges.
  - Search filter by name, Telegram username, phone number, or Telegram ID.
  - One-click **Export to CSV** (`birrup-payouts.csv`).
  - Recipient phone number one-click copy button (`+251 9XX XXX XXX`).
  - Anti-fraud check displaying total ads watched by each user.
  - Row actions: Green **"Mark Paid"** button and red **"Reject & Refund"** button.
* **Payout Modals**:
  - **Mark Paid Modal**: Recipient summary + input field to paste the mobile money Transaction Reference ID (e.g. `BGT84920X`) and notify user.
  - **Reject & Refund Modal**: Input for rejection reason with automatic refund back to the user's available balance.

---

### Dual-View Switcher & Telegram Simulation Frame
* **Standard Desktop / Responsive View**: Full browser width with side navigation bar.
* **Telegram Phone Mockup (390 × 844 px)**: Simulates the exact Telegram Mini App mobile experience with Telegram header bar and bottom navigation.
* **1-Click Admin Switcher**: Instantly toggle between the Mini App and Admin Dashboard from the top bar.

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build for Production
```bash
npm run build
```

---

## 📱 Connecting to Telegram Mini App (BotFather)
1. Message [@BotFather](https://t.me/BotFather) on Telegram.
2. Use `/newapp` or `/newbot` to register your bot.
3. When prompted for Web App URL, supply your hosted URL (e.g. Vercel, Netlify, or Ngrok tunnel for local testing):
   ```
   https://your-domain.vercel.app/
   ```
4. The Mini App automatically loads with native Telegram header styling and safe-area padding!
