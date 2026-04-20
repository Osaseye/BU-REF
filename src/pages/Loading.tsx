import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 overflow-hidden relative">
      {/* Decorative gradient blobs */}
      <div className="fixed top-0 inset-x-0 h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)]"></div>
      <div className="fixed top-1/2 right-1/4 w-80 h-80 bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
      <div className="fixed bottom-1/4 left-1/4 w-80 h-80 bg-[var(--color-gold)]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mb-8 relative z-10 space-y-6">
        <div className="mx-auto relative w-24 h-24">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-xl border border-white/50 rounded-full shadow-2xl flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
            <div className="absolute inset-0 rounded-full border-t-2 border-[var(--color-gold)] animate-spin [animation-duration:3s]"></div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-extrabold text-[var(--color-primary)] font-serif tracking-tight drop-shadow-sm mb-1 text-center bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-gray-600">Loading Portal Data...</h2>
          <p className="text-sm font-medium text-gray-400">Verifying secure connection</p>
        </div>
      </div>
    </div>
  );
};