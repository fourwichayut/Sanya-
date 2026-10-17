import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { notification, setNotification } = useContracts();

  if (!notification) return null;

  return (
    <div className="fixed bottom-12 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-150 max-w-md">
      <div className="p-3.5 rounded-xl bg-zinc-900 text-white shadow-xl flex items-start space-x-2.5">
        <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs leading-relaxed font-medium">
          {notification}
        </div>
        <button
          onClick={() => setNotification(null)}
          className="text-zinc-400 hover:text-white shrink-0 p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
