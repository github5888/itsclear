import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.map(n => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0" />
        };

        const borders = {
          success: 'border-emerald-200 bg-white text-slate-900 shadow-emerald-500/10',
          error: 'border-rose-200 bg-white text-slate-900 shadow-rose-500/10',
          warning: 'border-amber-200 bg-white text-slate-900 shadow-amber-500/10',
          info: 'border-sky-200 bg-white text-slate-900 shadow-sky-500/10'
        };

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 animate-slideUp ${borders[n.type]}`}
          >
            {icons[n.type]}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm tracking-wide text-slate-900">{n.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
