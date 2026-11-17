import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const WalletTab: React.FC = () => {
  const { balance, payouts, submitPayoutRequest, user } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Telebirr');
  const [fullName, setFullName] = useState(user.name);
  const [phone, setPhone] = useState('911234545');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const methods: PaymentMethod[] = ['Telebirr', 'CBE Birr', 'M-Pesa'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    const result = await submitPayoutRequest({
      name: fullName,
      phone,
      amount: numAmount,
      method: selectedMethod,
    });

    if (!result.success) {
      setError(result.error || 'Failed to submit request');
      return;
    }

    setError(null);
    setAmount('');
    showToast('Demo payout request added to the review queue.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const userPayouts = payouts.filter((p) => p.username === user.username);

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-full shadow-lg text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h1>Your rewards. Your wallet.</h1>
          <p>Turn your time into something real.</p>
        </div>
        <div className="live-tag">
          <span className="live-dot" />
          Fast Local Payouts
        </div>
      </div>

      <div className="wallet-grid">
        {/* Left Column: Balance & History */}
        <section>
          {/* Available Balance Card */}
          <div className="panel">
            <div className="panel-title">
              <h2>Available balance</h2>
              <Wallet size={18} className="text-primary" />
            </div>
            <div className="balance-large">
              {balance.toFixed(2)} <small>ETB</small>
            </div>
            <progress value={Math.min(balance, 500)} max={500} />
            <div className="progress-label">
              <span>{balance >= 500 ? 'Ready for withdrawal' : `${(500 - balance).toFixed(2)} ETB to go`}</span>
              <span>Minimum: 500 ETB</span>
            </div>
          </div>

          {/* Transaction History */}
          <div className="activity">
            <div className="section-title">
              <h2>Transaction history</h2>
              <Clock size={16} className="text-muted-foreground" />
            </div>

            {userPayouts.map((item) => {
              const maskedPhone =
                item.phone.length >= 6
                  ? `+251 ${item.phone.slice(0, 2)}****${item.phone.slice(-2)}`
                  : `+251 ${item.phone}`;
              return (
                <div key={item.id} className="activity-row">
                  <div className="icon-tile">
                    {item.status === 'Completed' ? (
                      <CheckCircle2 size={16} />
                    ) : item.status === 'Rejected' ? (
                      <XCircle size={16} className="text-destructive" />
                    ) : (
                      <Clock size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3>{item.method} withdrawal</h3>
                    <p>
                      {maskedPhone} · {item.date}
                    </p>
                    <span className={`status ${item.status} inline-block mt-1 font-semibold`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <strong className="text-xs text-foreground font-bold">
                      {item.amount.toFixed(2)} ETB
                    </strong>
                    {item.reference && (
                      <p className="tiny-label mt-1 text-primary">Ref: {item.reference}</p>
                    )}
                    {item.rejectionReason && (
                      <p className="tiny-label mt-1 text-destructive">{item.rejectionReason}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {userPayouts.length === 0 && (
              <div className="empty-state">No transaction history yet.</div>
            )}
          </div>
        </section>

        {/* Right Column: Request Form */}
        <section className="panel">
          <h2>Request a payout</h2>
          <p className="tiny-label mt-2">Choose where your rewards go.</p>

          {/* Payment Method Selector */}
          <div className="method-selector">
            {methods.map((method) => {
              const isSelected = selectedMethod === method;
              const methodKey =
                method === 'CBE Birr' ? 'cbe' : method === 'M-Pesa' ? 'mpesa' : '';
              return (
                <button
                  type="button"
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={`method ${methodKey} ${isSelected ? 'selected' : ''} rounded-md font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
                >
                  {isSelected && <CheckCircle2 size={13} />}
                  {method}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Account Holder Name */}
            <label className="field">
              Account holder’s full name
              <input
                type="text"
                placeholder="e.g. Haileliul Baye"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="w-full bg-secondary border border-border rounded-md px-3 text-xs text-foreground outline-none focus:border-primary transition-colors"
              />
            </label>

            {/* Phone Number */}
            <label className="field">
              Phone number
              <div className="input-combined bg-secondary border border-border rounded-md px-3 py-1 flex items-center">
                <span className="text-xs text-muted-foreground font-semibold">+251</span>
                <input
                  type="tel"
                  placeholder="9XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel-national"
                  className="w-full bg-transparent border-0 px-2 text-xs text-foreground outline-none"
                />
              </div>
            </label>

            {/* Withdrawal Amount */}
            <label className="field">
              Withdrawal amount
              <div className="input-combined bg-secondary border border-border rounded-md px-3 py-1 flex items-center">
                <input
                  type="number"
                  step="0.01"
                  placeholder="500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-0 px-2 text-xs text-foreground outline-none"
                />
                <span className="text-xs text-muted-foreground mr-2 font-semibold">ETB</span>
                <button
                  type="button"
                  onClick={() => setAmount(balance.toFixed(2))}
                  className="text-primary text-xs font-bold hover:underline cursor-pointer"
                >
                  Max
                </button>
              </div>
            </label>

            {/* Error Message */}
            {error && (
              <p role="alert" className="text-destructive text-xs mt-3 flex items-center gap-1.5 font-medium">
                <AlertCircle size={14} />
                {error}
              </p>
            )}

            {/* Tip Box */}
            <div className="tip-box mt-5">
              <strong className="flex gap-2 items-center text-foreground font-semibold">
                <ShieldCheck size={14} className="text-primary" />
                A quick check before we send
              </strong>
              Payouts are manually reviewed. Your account name must match the name on your mobile money account.
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full h-12 mt-5 bg-primary text-primary-foreground font-bold text-xs rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-md"
            >
              Request {selectedMethod} Payout
              <ArrowRight size={15} />
            </button>

            <p className="tiny-label text-center mt-3">No withdrawal fee. Just your well-earned birr.</p>
          </form>
        </section>
      </div>
    </div>
  );
};
