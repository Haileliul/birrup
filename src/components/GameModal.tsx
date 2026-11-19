import React, { useState } from 'react';
import {
  Gamepad2,
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameUrl?: string;
}

export const GameModal: React.FC<GameModalProps> = ({
  isOpen,
  onClose,
  gameUrl = 'https://coin-rush-iota.vercel.app/',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-card border border-border flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 w-screen h-screen rounded-none z-50'
            : 'w-full max-w-4xl h-[92vh] sm:h-[86vh] rounded-2xl'
        }`}
      >
        {/* Modal Top Bar */}
        <header className="h-14 px-4 bg-secondary/80 border-b border-border flex items-center justify-between flex-shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shadow-[0_0_12px_rgba(74,222,128,0.3)]">
              <Gamepad2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-foreground">Coin Rush</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                  <Sparkles size={10} />
                  Live Game
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block">Play & enjoy on Birrup</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Open in New Window */}
            <a
              href={gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors flex items-center gap-1 text-xs"
              title="Open game in a new browser tab"
            >
              <ExternalLink size={16} />
              <span className="hidden md:inline text-[11px]">New Tab</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer ml-1"
              title="Close Game"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Game Iframe Container */}
        <div className="relative flex-1 w-full bg-black overflow-hidden flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 z-10 gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium animate-pulse">
                Loading Coin Rush…
              </p>
            </div>
          )}

          <iframe
            src={gameUrl}
            title="Coin Rush Game"
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0 select-none"
            allow="autoplay; fullscreen; accelerometer; gyroscope; gamepad; payment"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
