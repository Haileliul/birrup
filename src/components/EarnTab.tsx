import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { showRewardedAd } from '../lib/adsgram';
import {
  Play,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Tv,
  Radio
} from 'lucide-react';

export const EarnTab: React.FC = () => {
  const {
    watched,
    dailyLimit,
    cooldown,
    reward,
    totalEarned,
    earnings,
    recordAdWatched,
    setActiveTab,
    isSupabaseLive,
  } = useApp();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoTimer, setVideoTimer] = useState(5);
  const [showAllEarnings, setShowAllEarnings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const canWatch = watched < dailyLimit && cooldown === 0 && !isLoadingAd;

  useEffect(() => {
    if (!isVideoModalOpen || videoTimer === 0) return;
    const interval = setTimeout(() => {
      setVideoTimer((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(interval);
  }, [isVideoModalOpen, videoTimer]);

  const handleStartAd = async () => {
    if (!canWatch) return;

    setIsLoadingAd(true);

    // Attempt to trigger real AdsGram rewarded video ad
    const adResult = await showRewardedAd();

    setIsLoadingAd(false);

    if (adResult.success) {
      // User watched the real AdsGram video!
      await recordAdWatched();
      showToast(`AdsGram reward verified: +${reward.toFixed(2)} ETB!`);
      return;
    }

    if (adResult.error === 'NO_BLOCK_ID' || !adResult.isRealAd) {
      // Fallback to interactive demo preview simulator
      setVideoTimer(5);
      setIsVideoModalOpen(true);
      return;
    }

    // User skipped or ad failed
    showToast(`Ad incomplete: ${adResult.error}`);
  };

  const handleClaimAdReward = async () => {
    if (videoTimer > 0) return;
    await recordAdWatched();
    setIsVideoModalOpen(false);
    showToast(`Reward credited: +${reward.toFixed(2)} ETB`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const displayedEarnings = showAllEarnings ? earnings : earnings.slice(0, 4);

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
          <h1>A little time. A little more birr.</h1>
          <p>Watch, earn, and make the most of your everyday.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Pills */}
          <div className="live-tag">
            <Radio size={12} className="animate-pulse text-primary" />
            <span>AdsGram Ready</span>
          </div>
          {isSupabaseLive && (
            <div className="live-tag !border-cyan/40 !text-cyan">
              <span className="live-dot !bg-cyan" />
              <span>Supabase Cloud</span>
            </div>
          )}
        </div>
      </div>

      <div className="earn-grid">
        {/* Left / Main Column */}
        <div>
          {/* Hero Earn Card */}
          <section className="hero-earn">
            <img
              src="/assets/reward-coins.jpg"
              alt="Emerald reward coins"
              className="coins"
              width={1024}
              height={1024}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="eyebrow">
              <Zap size={13} />
              YOUR NEXT LITTLE WIN
            </div>
            <h2>
              Press play.
              <br />
              Get <span className="text-primary">rewarded.</span>
            </h2>
            <p>
              A short video. A simple reward.
              <br />
              Earn <strong className="text-foreground">{reward.toFixed(2)} ETB</strong> with every ad you watch.
            </p>

            <button
              className="watch-button btn-primary flex items-center justify-center gap-2 font-bold text-sm rounded-lg px-6 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
              disabled={!canWatch}
              onClick={handleStartAd}
            >
              <Play size={17} fill="currentColor" />
              {isLoadingAd
                ? 'Loading AdsGram Ad…'
                : watched >= dailyLimit
                ? 'Daily limit reached'
                : cooldown > 0
                ? `Next video in ${cooldown}s`
                : 'Watch Ad & Earn'}
              <span className="ml-3 text-xs bg-black/20 px-2 py-0.5 rounded-full">
                +{reward.toFixed(2)} ETB
              </span>
            </button>

            <div className="hero-footnote">
              <ShieldCheck size={13} />
              No deposits. No hassle. Just rewards.
            </div>
          </section>

          {/* Quick Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">
                <TrendingUp size={14} />
                Today’s earnings
              </div>
              <div className="stat-value">
                {(watched * reward).toFixed(2)} <small>ETB</small>
              </div>
              <div className="stat-note">↗ A little more, every day</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                <Play size={14} />
                Ads watched
              </div>
              <div className="stat-value">
                {watched} <small>/ {dailyLimit} today</small>
              </div>
              <div className="stat-note">{dailyLimit - watched} more opportunities</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                <Zap size={14} />
                Total earned
              </div>
              <div className="stat-value">
                {totalEarned.toFixed(2)} <small>ETB</small>
              </div>
              <div className="stat-note">All your little wins</div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <section className="activity">
            <div className="section-title">
              <h2>Recent earnings</h2>
              <button
                type="button"
                className="text-muted-foreground text-xs hover:text-foreground cursor-pointer flex items-center gap-1"
                onClick={() => setShowAllEarnings((prev) => !prev)}
              >
                {showAllEarnings ? 'Show less' : 'View all'}
                <ArrowUpRight size={13} />
              </button>
            </div>

            {displayedEarnings.map((item) => (
              <div key={item.id} className="activity-row">
                <div className="icon-tile">
                  {item.title.includes('Referral') ? (
                    <Users size={16} />
                  ) : item.title.includes('check') ? (
                    <Sparkles size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
                <div className="activity-amount">
                  +{item.amount.toFixed(2)} ETB
                  <small>Completed</small>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Right Rail Column */}
        <aside className="earn-rail space-y-5">
          {/* Daily Progress Panel */}
          <section className="panel">
            <div className="panel-title">
              <h2>Your daily progress</h2>
              <div className="icon-tile h-7 w-7">
                <TrendingUp size={15} />
              </div>
            </div>
            <span className="tiny-label">Every little video counts.</span>
            <div className="daily-count">
              {watched} <span>/ {dailyLimit} ads</span>
            </div>
            <progress value={watched} max={dailyLimit} />
            <div className="progress-label">
              <span>{Math.round((watched / dailyLimit) * 100)}% completed</span>
              <span>{dailyLimit - watched} left</span>
            </div>
            <div className="divider" />
            <div className="daily-info">
              <div className="icon-tile">
                <Clock size={16} />
              </div>
              <div>
                <h3>{((dailyLimit - watched) * reward).toFixed(2)} ETB still to earn</h3>
                <p>Resets every day at midnight UTC</p>
              </div>
            </div>
            <div className="tip-box">
              <strong>✨ Make it a daily little habit.</strong>
              A few minutes today. A little extra for tomorrow.
            </div>
          </section>

          {/* Referral Callout Panel */}
          <section className="panel referral-panel">
            <div className="icon-tile">
              <Users size={18} />
            </div>
            <h2>
              Good things are
              <br />
              better together.
            </h2>
            <p>
              Invite a friend and earn <strong className="text-cyan">10%</strong> of their ad rewards. For as long as
              they earn.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('friends')}
              className="w-full text-xs font-semibold py-2.5 px-4 rounded-md border border-border bg-card hover:bg-secondary text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              Invite your friends <ArrowUpRight size={14} />
            </button>
          </section>
        </aside>
      </div>

      {/* Video Ad Simulation Modal */}
      {isVideoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-foreground">Your next little reward</h3>
              <span className="tiny-label">AdsGram Video Simulator</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Watch this short preview video to verify and credit +{reward.toFixed(2)} ETB directly to your wallet.
            </p>

            <div className="video-stage">
              <Tv className="animate-pulse" />
              <h2 className="text-base font-bold text-center">
                {videoTimer > 0 ? `Playing · ${videoTimer}s remaining` : 'Video complete!'}
              </h2>
              <span className="tiny-label">AdsGram Ethiopia Partner Video</span>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="w-full h-11 rounded-lg font-bold text-xs bg-primary text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
                disabled={videoTimer > 0}
                onClick={handleClaimAdReward}
              >
                <CheckCircle2 size={16} />
                {videoTimer > 0 ? `Watching… (${videoTimer}s)` : `Collect ${reward.toFixed(2)} ETB`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
