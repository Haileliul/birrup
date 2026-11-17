import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Copy,
  CheckCircle2,
  Send,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const FriendsTab: React.FC = () => {
  const { friends, user } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const inviteLink = `https://t.me/birrup_bot?start=HB${user.id}`;
  const totalCommission = friends.reduce((acc, f) => acc + f.earned, 0);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      showToast('Invite link copied to clipboard!');
    } catch {
      showToast('Invite link ready to share');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const shareText = encodeURIComponent(
    'Earn Ethiopian Birr by watching short video ads on Birrup! Join here and get a head start:'
  );
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${shareText}`;

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
          <h1>Better with friends.</h1>
          <p>Share the good things. Grow your rewards together.</p>
        </div>
        <div className="live-tag">
          <span className="live-dot" />
          10% Forever
        </div>
      </div>

      <div className="earn-grid">
        {/* Main Column */}
        <div>
          {/* Banner */}
          <div className="friend-banner">
            <div className="eyebrow">
              <Users size={14} />
              THE MORE, THE MERRIER
            </div>
            <h2>
              Invite friends.
              <br />
              Earn <span className="text-primary">10%</span> together.
            </h2>
            <p>
              Get 10% of your friends’ ad earnings, forever.
              <br />
              Their rewards stay theirs. Your bonus is on us.
            </p>

            <div className="referral-link">
              <input
                aria-label="Your invite link"
                value={inviteLink}
                readOnly
                className="w-full bg-secondary border border-border rounded-md px-3 text-xs text-muted-foreground outline-none select-all"
              />
              <button
                type="button"
                aria-label="Copy invite link"
                title="Copy invite link"
                onClick={handleCopy}
                className="w-11 h-10 flex-shrink-0 bg-secondary hover:bg-accent border border-border rounded-md flex items-center justify-center text-foreground transition-colors cursor-pointer"
              >
                <Copy size={16} />
              </button>
            </div>

            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-3 h-11 bg-primary text-primary-foreground font-bold text-xs rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all"
            >
              <Send size={15} />
              Share on Telegram
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Friends List */}
          <div className="section-title">
            <h2>Your circle</h2>
            <span className="tiny-label">{friends.length} friends</span>
          </div>

          <div className="activity">
            {friends.map((friend) => (
              <div key={friend.name} className="activity-row">
                <div className="avatar text-xs font-bold">{friend.initials}</div>
                <div>
                  <h3>{friend.name}</h3>
                  <p>{friend.date}</p>
                </div>
                <div className="activity-amount">
                  +{friend.earned.toFixed(2)} ETB
                  <small>Commission earned</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aside Column */}
        <aside>
          <div className="panel">
            <div className="icon-tile">
              <Users size={18} />
            </div>
            <h2 className="mt-5">Your growing circle</h2>
            <div className="friends-stats">
              <div>
                <strong>{friends.length}</strong>
                <span>Friends invited</span>
              </div>
              <div>
                <strong className="text-primary">{totalCommission.toFixed(2)}</strong>
                <span>ETB earned</span>
              </div>
            </div>
            <div className="divider" />
            <div className="tiny-label leading-6">Good company. Even better rewards.</div>
          </div>
        </aside>
      </div>
    </div>
  );
};
