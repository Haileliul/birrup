import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  Play,
  ListChecks,
  Users,
  Wallet,
  Shield,
  Bell,
  HelpCircle,
  Smartphone,
  Monitor,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  X,
  LucideIcon
} from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    balance,
    activeTab,
    setActiveTab,
    activeView,
    setActiveView,
    viewMode,
    setViewMode,
    user,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  interface NavItem {
    id: 'earn' | 'tasks' | 'friends' | 'wallet';
    label: string;
    icon: LucideIcon;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'earn', label: 'Earn', icon: Play },
    { id: 'tasks', label: 'Tasks', icon: ListChecks, badge: '3' },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar (hidden when in phone-frame preview or on mobile screen) */}
      <aside className={`app-sidebar ${viewMode === 'telegram-frame' ? '!hidden' : ''}`}>
        {/* Brand Logo */}
        <div
          className="brand cursor-pointer"
          onClick={() => {
            setActiveView('app');
            setActiveTab('earn');
          }}
        >
          <span className="brand-mark">
            <Zap size={22} fill="currentColor" />
          </span>
          <div>
            birr<span className="text-primary">up</span>
            <small>A little time. A little more.</small>
          </div>
        </div>

        {/* Section Label */}
        <div className="sidebar-label">YOUR EVERYDAY REWARDS</div>

        {/* Navigation Links */}
        <nav className="app-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === 'app' && activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setActiveView('app');
                  setActiveTab(item.id);
                }}
                className={`nav-item ${isActive ? 'active' : ''} w-full text-left cursor-pointer`}
              >
                <Icon />
                <span>{item.label}</span>
                {item.badge && activeTab !== 'tasks' && (
                  <span className="ml-auto text-xs bg-secondary text-primary font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="divider" />

          {/* Admin Dashboard Sidebar Item */}
          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className={`nav-item ${activeView === 'admin' ? 'active' : ''} w-full text-left cursor-pointer`}
          >
            <Shield />
            <span>Admin dashboard</span>
            <ChevronRight size={14} className="ml-auto opacity-70" />
          </button>
        </nav>

        {/* Sidebar Bottom Area */}
        <div className="sidebar-bottom">
          <div className="help-box">
            <HelpCircle size={19} className="text-muted-foreground" />
            <h3>A little help?</h3>
            <p>We’re here when you need us.</p>
            <button
              type="button"
              onClick={() => setIsSupportOpen(true)}
              className="text-primary text-xs font-semibold hover:underline mt-2 flex items-center gap-1 cursor-pointer"
            >
              Get support <ArrowRight size={12} />
            </button>
          </div>

          <div className="sidebar-profile">
            <div className="avatar">{user.initials}</div>
            <div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-id">{user.username}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`app-body flex-1 ${viewMode === 'telegram-frame' ? '!ml-0' : ''}`}>
        {/* Top Bar */}
        <header className="topbar">
          <span className="topbar-label font-medium">
            {activeView === 'admin' ? 'Workspace / Payout operations' : 'Your time, rewarded.'}
          </span>

          {/* Mobile User Profile Header */}
          <div className="mobile-user hidden">
            <div className="avatar text-xs font-bold">{user.initials}</div>
            <div>
              <div className="profile-name text-xs">{user.name}</div>
              <div className="profile-id text-[11px]">{user.username}</div>
            </div>
          </div>

          {/* Topbar Actions */}
          <div className="topbar-actions">
            {/* View Mode Toggle: Responsive vs Telegram 390x844 Frame */}
            <div className="hidden md:flex items-center bg-secondary border border-border rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('responsive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === 'responsive'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Desktop Responsive View"
              >
                <Monitor size={14} />
                <span>Standard</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('telegram-frame')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === 'telegram-frame'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Telegram Mini App 390x844 Frame"
              >
                <Smartphone size={14} />
                <span>Telegram View</span>
              </button>
            </div>

            {/* Quick Admin / User Switcher */}
            <button
              type="button"
              onClick={() => setActiveView(activeView === 'admin' ? 'app' : 'admin')}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-border bg-secondary hover:bg-accent text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {activeView === 'admin' ? (
                <>
                  <Smartphone size={13} className="text-primary" />
                  <span>Open Mini App</span>
                </>
              ) : (
                <>
                  <Shield size={13} className="text-primary" />
                  <span>Admin Panel</span>
                </>
              )}
            </button>

            {/* Pill-shaped Balance Badge */}
            <div
              className="balance-pill cursor-pointer"
              onClick={() => {
                setActiveView('app');
                setActiveTab('wallet');
              }}
            >
              <Wallet size={16} />
              <span>Balance</span>
              <strong>
                {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-muted-foreground text-[11px]">ETB</span>
              </strong>
            </div>

            {/* Notification Button */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setIsNotifOpen(true)}
              className="notification-button w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Bell size={18} />
            </button>

            <div className="avatar text-xs font-bold hidden sm:grid">{user.initials}</div>
          </div>
        </header>

        {/* Content Render with Optional Telegram Phone Mockup Frame */}
        {viewMode === 'telegram-frame' ? (
          <div className="telegram-frame-wrapper">
            <div className="text-center mb-3 text-xs text-muted-foreground flex items-center gap-2">
              <Smartphone size={14} className="text-primary" />
              <span>Telegram Mini App Simulation Mode (390 x 844 px)</span>
            </div>
            <div className="telegram-phone-container">
              {/* Telegram Native Header simulation */}
              <div className="telegram-header-bar">
                <span className="text-primary font-bold">Close</span>
                <span className="font-bold text-xs tracking-wide">Birrup Mini App</span>
                <span className="text-muted-foreground font-mono text-xs">•••</span>
              </div>

              {/* Scrollable Mini App Inside Frame */}
              <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
                {children}
              </div>

              {/* Fixed Bottom Navigation inside Frame */}
              <nav className="mobile-nav !flex">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === 'app' && activeTab === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setActiveView('app');
                        setActiveTab(item.id);
                      }}
                      className={`flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        ) : (
          <main className={`main-content ${activeView === 'admin' ? 'admin-content' : ''}`}>
            {children}

            <div className="bottom-note">
              <ShieldCheck size={14} />
              {activeView === 'admin'
                ? 'Manual payouts · Ethiopian Mobile Money operations'
                : 'Secure rewards. Local payouts. Made for Ethiopia.'}
              <span className="mx-2">·</span>
              <span>Birrup v1.0</span>
              {activeView === 'admin' && (
                <button
                  type="button"
                  onClick={() => setActiveView('app')}
                  className="text-primary hover:underline ml-2 font-medium cursor-pointer"
                >
                  Back to Mini App
                </button>
              )}
            </div>
          </main>
        )}

        {/* Native Mobile Bottom Navigation Bar (Shown on small screens in responsive mode) */}
        {viewMode !== 'telegram-frame' && (
          <nav className="mobile-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === 'app' && activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setActiveView('app');
                    setActiveTab(item.id);
                  }}
                  className={`flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Notifications Modal */}
      {isNotifOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-foreground">You’re all caught up</h3>
              <button
                type="button"
                onClick={() => setIsNotifOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your latest payout and reward updates will appear here. Whenever an admin confirms your Telebirr,
              CBE Birr, or M-Pesa transaction, you’ll receive an instant push update.
            </p>
            <button
              type="button"
              onClick={() => setIsNotifOpen(false)}
              className="w-full mt-5 h-10 rounded-lg bg-secondary text-foreground text-xs font-semibold hover:bg-accent cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {isSupportOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-foreground">Birrup Ethiopian Support</h3>
              <button
                type="button"
                onClick={() => setIsSupportOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For payout inquiries, please prepare your requested date, registered name, and mobile money phone number.
              Our support team verifies all transactions manually against local bank logs.
            </p>
            <div className="mt-4 p-3 bg-secondary rounded-lg text-xs space-y-1">
              <p>Telegram Support: <span className="text-primary font-bold">@birrup_support</span></p>
              <p>Operating Hours: <span className="text-foreground">Monday – Saturday, 8:00 AM – 8:00 PM EAT</span></p>
            </div>
            <button
              type="button"
              onClick={() => setIsSupportOpen(false)}
              className="w-full mt-5 h-10 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
