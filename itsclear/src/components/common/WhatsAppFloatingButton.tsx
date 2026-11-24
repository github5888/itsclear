import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber = '919876543210',
  defaultMessage = 'Namaste itsclear! I want to inquire about fresh stoneground chakki atta delivery.'
}) => {
  const [showTooltip, setShowTooltip] = useState(true);

  const handleOpenWhatsApp = () => {
    const encodedMsg = encodeURIComponent(defaultMessage);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center group">
      {/* Tooltip / Pill Badge */}
      {showTooltip && (
        <div className="relative mr-3 hidden sm:flex items-center bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg border border-slate-700 whitespace-nowrap animate-fade-in">
          <span>Order or Chat on WhatsApp</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="ml-2 text-slate-400 hover:text-white"
            aria-label="Dismiss tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Circular WhatsApp Button */}
      <button
        onClick={handleOpenWhatsApp}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20ba5a] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-300"
        aria-label="Chat with itsclear on WhatsApp"
      >
        {/* Pulsing online status radar */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>

        {/* WhatsApp Icon */}
        <svg
          className="w-7 h-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.53 1.838.814 2.796.815 3.18 0 5.767-2.587 5.768-5.766.001-3.181-2.586-5.768-5.768-5.768zm3.385 8.169c-.144.405-.837.774-1.17.824-.312.046-.717.065-2.073-.496-1.737-.718-2.859-2.484-2.946-2.6-.087-.116-.708-.941-.708-1.796 0-.855.449-1.277.608-1.451.16-.174.348-.217.464-.217.116 0 .232.001.333.006.107.005.249-.041.39.299.144.348.492 1.202.535 1.29.043.087.072.188.014.304-.058.116-.087.188-.174.289-.087.101-.183.226-.261.304-.087.087-.178.182-.077.355.101.173.45 1.058 1.159 1.689.654.582 1.205.761 1.378.848.174.087.275.072.376-.043.101-.116.434-.507.55-.681.116-.174.232-.145.39-.087.16.058 1.013.477 1.187.564.174.087.29.13.333.203.044.072.044.42-.1 1.225zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.436 5.178L2 22l4.965-1.399C8.423 21.492 10.154 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.15-.494-4.42-1.343l-.317-.21-2.956.833.847-2.883-.231-.334C3.992 15.011 3.48 13.558 3.48 12c0-4.698 3.822-8.52 8.52-8.52 4.698 0 8.52 3.822 8.52 8.52 0 4.698-3.822 8.52-8.52 8.52z" />
        </svg>
      </button>
    </aside>
  );
};
