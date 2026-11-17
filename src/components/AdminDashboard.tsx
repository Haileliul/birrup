import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PayoutRequest, PayoutStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal,
  Download,
  Copy,
  XCircle,
  Tv,
  Check,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    payouts,
    rate,
    reward,
    saveSettings,
    markPayoutPaid,
    rejectPayout,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'Pending' | 'Completed' | 'Rejected' | 'All'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rateInput, setRateInput] = useState(String(rate));
  const [rewardInput, setRewardInput] = useState(String(reward));

  // Modal State
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [modalMode, setModalMode] = useState<'pay' | 'reject'>('pay');
  const [referenceId, setReferenceId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculations
  const pendingList = payouts.filter((p) => p.status === 'Pending');
  const completedList = payouts.filter((p) => p.status === 'Completed');
  const rejectedList = payouts.filter((p) => p.status === 'Rejected');

  const totalPendingETB = pendingList.reduce((acc, p) => acc + p.amount, 0);
  const totalPaidOutETB = completedList.reduce((acc, p) => acc + p.amount, 0);

  // Demo AdsGram conversion calculation
  const demoAdsGramRevenueUSD = 68.5; // Example gross ad revenue in USD
  const totalRevenueETB = demoAdsGramRevenueUSD * rate;
  const totalLiabilitiesETB = totalPendingETB + totalPaidOutETB;
  const estimatedNetMargin = totalRevenueETB - totalLiabilitiesETB;

  // Filtered List
  const filteredPayouts = payouts.filter((p) => {
    const matchesFilter = activeFilter === 'All' ? true : p.status === activeFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      p.name.toLowerCase().includes(query) ||
      p.username.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      p.telegramId.includes(query);
    return matchesFilter && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettings = () => {
    const numRate = Number(rateInput);
    const numReward = Number(rewardInput);

    if (!Number.isFinite(numRate) || numRate <= 0 || !Number.isFinite(numReward) || numReward <= 0) {
      showToast('Enter valid positive values for rate and reward.');
      return;
    }

    saveSettings(numRate, numReward);
    showToast('Reward settings saved successfully');
  };

  const handleCopyPhone = async (phone: string, name: string) => {
    try {
      await navigator.clipboard.writeText(`+251${phone}`);
      showToast(`Copied +251${phone} (${name})`);
    } catch {
      showToast(`+251${phone}`);
    }
  };

  const handleExportCSV = () => {
    const headers = ['User', 'Telegram ID', 'Name', 'Phone', 'Method', 'Amount ETB', 'Ads Watched', 'Status', 'Date', 'Reference'];
    const rows = filteredPayouts.map((p) => [
      p.username,
      p.telegramId,
      p.name,
      `+251${p.phone}`,
      p.method,
      p.amount,
      p.ads,
      p.status,
      p.date,
      p.reference || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `birrup-payouts-${activeFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV file');
  };

  const handleOpenActionModal = (payout: PayoutRequest, mode: 'pay' | 'reject') => {
    setSelectedPayout(payout);
    setModalMode(mode);
    setReferenceId('');
    setRejectReason('');
  };

  const handleConfirmModalAction = () => {
    if (!selectedPayout) return;

    if (modalMode === 'pay') {
      if (!referenceId.trim()) {
        showToast('Please enter the mobile money transaction reference ID.');
        return;
      }
      markPayoutPaid(selectedPayout.id, referenceId.trim());
      showToast(`Payout marked as Paid! Reference: ${referenceId.trim()}`);
    } else {
      if (!rejectReason.trim()) {
        showToast('Please enter a rejection reason.');
        return;
      }
      rejectPayout(selectedPayout.id, rejectReason.trim());
      showToast(`Payout rejected and refunded ${selectedPayout.amount} ETB to user.`);
    }

    setSelectedPayout(null);
  };

  const getMethodBadgeClass = (method: string) => {
    if (method === 'CBE Birr') return 'cbe';
    if (method === 'M-Pesa') return 'mpesa';
    return '';
  };

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
          <h1>Payout operations</h1>
          <p>A clear queue. A careful review. Every birr accounted for.</p>
        </div>
        <div className="live-tag">
          <span className="live-dot" />
          Admin Workspace
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="admin-kpis">
        {/* Pending Payouts Card */}
        <div className="stat-card">
          <div className="stat-label">
            <Clock size={16} />
            Pending payouts
          </div>
          <div className="stat-value">
            {totalPendingETB.toLocaleString('en-US', { minimumFractionDigits: 2 })} <small>ETB</small>
          </div>
          <div className="stat-note text-warning">{pendingList.length} requests awaiting review</div>
        </div>

        {/* Paid Out This Month Card */}
        <div className="stat-card">
          <div className="stat-label">
            <CheckCircle2 size={16} />
            Paid out this month
          </div>
          <div className="stat-value">
            {totalPaidOutETB.toLocaleString('en-US', { minimumFractionDigits: 2 })} <small>ETB</small>
          </div>
          <div className="stat-note">{completedList.length} completed payouts</div>
        </div>

        {/* Profitability Overview Card */}
        <div className="stat-card">
          <div className="stat-label">
            <TrendingUp size={16} />
            Estimated net margin
          </div>
          <div className="stat-value">
            {estimatedNetMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })} <small>ETB</small>
          </div>
          <div className="tiny-label mt-2">
            Demo AdsGram: {demoAdsGramRevenueUSD.toFixed(2)} USD₮ × {rate} ETB
          </div>
          <div className="tiny-label mt-1">
            Revenue {totalRevenueETB.toLocaleString('en-US', { minimumFractionDigits: 2 })} · Liabilities {totalLiabilitiesETB.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Quick Settings Bar */}
      <section className="settings-bar">
        <h3 className="flex items-center gap-2 font-bold text-sm text-foreground">
          <SlidersHorizontal size={16} className="text-primary" />
          Reward & Exchange Settings
        </h3>

        <label className="flex items-center gap-2 text-xs">
          USD₮ → ETB
          <input
            type="number"
            aria-label="USD to ETB exchange rate"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            className="w-24 bg-secondary border border-border rounded px-2.5 py-1 text-xs text-foreground outline-none"
          />
        </label>

        <label className="flex items-center gap-2 text-xs">
          Reward / ad (ETB)
          <input
            type="number"
            step="0.01"
            aria-label="Reward per ad"
            value={rewardInput}
            onChange={(e) => setRewardInput(e.target.value)}
            className="w-24 bg-secondary border border-border rounded px-2.5 py-1 text-xs text-foreground outline-none"
          />
        </label>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          <Check size={14} />
          Save settings
        </button>
      </section>

      {/* Manual Withdrawal Queue Section */}
      <section className="queue">
        <div className="queue-top">
          <div>
            <h2 className="text-base font-bold text-foreground">Withdrawal queue</h2>
            <p className="tiny-label mt-1">Review each recipient before sending their payout via Telebirr or bank app.</p>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search name, user, or phone…"
              aria-label="Search payouts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary border border-border rounded-md px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              title="Export filtered payouts to CSV"
              aria-label="Export filtered payouts"
              onClick={handleExportCSV}
              className="w-9 h-8 border border-border bg-card hover:bg-secondary rounded-md flex items-center justify-center text-foreground cursor-pointer transition-colors"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {(['Pending', 'Completed', 'Rejected', 'All'] as const).map((filter) => {
            const count =
              filter === 'All'
                ? payouts.length
                : filter === 'Pending'
                ? pendingList.length
                : filter === 'Completed'
                ? completedList.length
                : rejectedList.length;
            const isSelected = activeFilter === filter;
            return (
              <button
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-secondary text-primary border border-primary/30' : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                {filter}
                <span className="tiny-label text-xs bg-background/50 px-1.5 py-0.5 rounded-full">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Table Wrap */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Method</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Ads watched</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                  {/* User */}
                  <td>
                    <strong>{item.username}</strong>
                    <small>ID {item.telegramId}</small>
                  </td>

                  {/* Method */}
                  <td>
                    <span className={`method-badge ${getMethodBadgeClass(item.method)}`}>
                      {item.method}
                    </span>
                  </td>

                  {/* Recipient Info with Copy Button */}
                  <td>
                    <div className="table-recipient">
                      <div>
                        <strong>{item.name}</strong>
                        <small>
                          +251 {item.phone.slice(0, 3)} {item.phone.slice(3, 6)} {item.phone.slice(6)}
                        </small>
                      </div>
                      <button
                        type="button"
                        aria-label={`Copy ${item.name}'s phone`}
                        title="Copy phone number"
                        onClick={() => handleCopyPhone(item.phone, item.name)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Amount */}
                  <td>
                    <strong className="text-foreground">
                      {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                    <small>ETB</small>
                  </td>

                  {/* Ads Watched (Anti-Fraud) */}
                  <td>
                    <span className="flex gap-1.5 items-center text-xs">
                      <Tv size={13} className="text-primary" />
                      {item.ads}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="text-muted-foreground">{item.date}</td>

                  {/* Actions */}
                  <td>
                    {item.status === 'Pending' ? (
                      <div className="table-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(item, 'pay')}
                          className="bg-primary text-primary-foreground font-semibold px-2.5 py-1 rounded text-xs hover:opacity-90 flex items-center gap-1 cursor-pointer transition-opacity"
                        >
                          <Check size={12} />
                          Mark Paid
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(item, 'reject')}
                          className="text-destructive hover:bg-destructive/10 font-semibold px-2.5 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <XCircle size={12} />
                          Reject & Refund
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className={`status ${item.status} font-semibold inline-block`}>
                          {item.status}
                        </span>
                        {item.reference && (
                          <small className="tiny-label text-primary mt-1">Ref: {item.reference}</small>
                        )}
                        {item.rejectionReason && (
                          <small className="tiny-label text-destructive mt-1">{item.rejectionReason}</small>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPayouts.length === 0 && (
            <div className="empty-state">No payout requests match this view.</div>
          )}
        </div>

        <div className="flex justify-between mt-4 tiny-label">
          <span>{filteredPayouts.length} requests shown</span>
          <span>Manual Payout Dashboard · Telebirr, CBE Birr & M-Pesa</span>
        </div>
      </section>

      {/* Confirmation & Rejection Modal */}
      {selectedPayout && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-base font-bold text-foreground">
              {modalMode === 'pay' ? 'Confirm a manual payout' : 'Reject & refund request'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {modalMode === 'pay'
                ? 'Send the payment in your mobile money app first, then record its reference here.'
                : 'The requested amount will return directly to the user’s wallet balance.'}
            </p>

            {/* Recipient summary */}
            <div className="modal-summary mb-4">
              <div className="summary-row">
                <span>Account holder</span>
                <strong>{selectedPayout.name}</strong>
              </div>
              <div className="summary-row">
                <span>{selectedPayout.method} number</span>
                <strong>+251 {selectedPayout.phone}</strong>
              </div>
              <div className="summary-row">
                <span>Payout amount</span>
                <strong className="text-primary font-bold">
                  {selectedPayout.amount.toFixed(2)} ETB
                </strong>
              </div>
            </div>

            {/* Input field depending on mode */}
            {modalMode === 'pay' ? (
              <label className="field mb-4">
                Transaction reference ID
                <input
                  type="text"
                  placeholder="e.g. BGT84920X"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-xs text-foreground outline-none focus:border-primary mt-1"
                />
              </label>
            ) : (
              <label className="field mb-4">
                Reason for rejection
                <input
                  type="text"
                  placeholder="e.g. Account holder name doesn’t match"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-xs text-foreground outline-none focus:border-destructive mt-1"
                />
              </label>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="flex-1 h-11 border border-border bg-secondary hover:bg-accent rounded-lg text-xs font-semibold text-foreground cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmModalAction}
                className={`flex-1 h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-opacity ${
                  modalMode === 'pay'
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-destructive text-white hover:opacity-90'
                }`}
              >
                {modalMode === 'pay' ? (
                  <>
                    <CheckCircle2 size={16} />
                    Confirm & Notify User
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Reject & Refund
                  </>
                )}
              </button>
            </div>

            <p className="tiny-label text-center mt-3">
              Admin action recorded. Local Ethiopian Mobile Money settlement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
