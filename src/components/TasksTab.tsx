import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BonusTask } from '../types';
import {
  Send,
  CalendarCheck,
  Music2,
  Twitter,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const tasksList: (BonusTask & { iconType: 'telegram' | 'checkin' | 'tiktok' | 'x' })[] = [
  {
    id: 'telegram',
    title: 'Join our Telegram channel',
    subtitle: 'Stay in the loop with the Birrup community',
    amount: 15,
    icon: 'telegram',
    iconType: 'telegram',
    url: 'https://t.me/birrup_community',
  },
  {
    id: 'checkin',
    title: 'Daily check-in streak',
    subtitle: 'Day 3 of 7 · A little consistency goes a long way',
    amount: 5,
    icon: 'checkin',
    iconType: 'checkin',
  },
  {
    id: 'tiktok',
    title: 'Follow us on TikTok',
    subtitle: 'A fresh dose of rewards, tips, and good vibes',
    amount: 10,
    icon: 'tiktok',
    iconType: 'tiktok',
    url: 'https://tiktok.com/@birrup_et',
  },
  {
    id: 'x',
    title: 'Follow Birrup on X',
    subtitle: 'Be the first to know what’s next',
    amount: 10,
    icon: 'x',
    iconType: 'x',
    url: 'https://x.com/birrup_et',
  },
];

export const TasksTab: React.FC = () => {
  const { claimedTasks, claimTask } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClaim = (task: BonusTask) => {
    const success = claimTask(task);
    if (success) {
      setToastMessage(`Demo task claimed: +${task.amount} ETB`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'telegram':
        return <Send size={18} />;
      case 'checkin':
        return <CalendarCheck size={18} />;
      case 'tiktok':
        return <Music2 size={18} />;
      case 'x':
        return <Twitter size={18} />;
      default:
        return <Sparkles size={18} />;
    }
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
          <h1>Little tasks. Extra birr.</h1>
          <p>A few simple things, a few more rewards.</p>
        </div>
        <div className="live-tag">
          <span className="live-dot" />
          Bonus challenges
        </div>
      </div>

      <div className="earn-grid">
        {/* Task List */}
        <section className="task-list">
          {tasksList.map((task) => {
            const isClaimed = claimedTasks.includes(task.id);
            return (
              <div key={task.id} className="task-row">
                <div className="icon-tile">{renderIcon(task.iconType)}</div>
                <div className="flex-1">
                  <h3>{task.title}</h3>
                  <p>{task.subtitle}</p>
                </div>
                <div className="task-reward">+{task.amount} ETB</div>
                <button
                  type="button"
                  disabled={isClaimed}
                  onClick={() => handleClaim(task)}
                  className={`min-w-[105px] h-9 px-4 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isClaimed
                      ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-80'
                      : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-sm'
                  }`}
                >
                  {isClaimed ? (
                    <>
                      <CheckCircle2 size={14} />
                      Completed
                    </>
                  ) : (
                    <>
                      Claim
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </section>

        {/* Aside Panel */}
        <aside>
          <div className="panel">
            <div className="icon-tile">
              <Sparkles size={18} />
            </div>
            <h2 className="mt-5">Small wins add up.</h2>
            <p className="text-muted-foreground text-xs leading-6 mt-3">
              {claimedTasks.length} of {tasksList.length} tasks completed
            </p>
            <progress value={claimedTasks.length} max={tasksList.length} className="mt-5" />
            <div className="divider" />
            <div className="daily-info">
              <Sparkles size={18} className="text-primary flex-shrink-0" />
              <div>
                <h3>40 ETB in bonus rewards</h3>
                <p>A little extra for your wallet.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
