import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500 overflow-hidden relative">
      {/* Decorative gradient blobs */}
      <div className="fixed top-0 inset-x-0 h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)]"></div>
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 left-1/4 w-80 h-80 bg-[var(--color-gold)]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mb-8 relative z-10">
        <div className="mx-auto w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] shadow-xl shadow-red-100 flex items-center justify-center border border-red-100 mb-6">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-8xl font-extrabold text-[var(--color-primary)] font-serif tracking-tighter mb-4 drop-shadow-sm">404</h1>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 mb-4 font-serif">Page Not Found</h2>
        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
          The clearance portal resource you are looking for doesn't exist or has been moved. 
        </p>
      </div>

      <Button 
        onClick={() => navigate('/')}
        className="relative z-10 px-8 py-3.5 text-base font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-xl shadow-[var(--color-primary)]/20 hover:shadow-2xl hover:-translate-y-1 transition-all rounded-xl flex items-center gap-3"
      >
        <Home className="w-5 h-5" />
        Return to Portal
      </Button>
    </div>
  );
};