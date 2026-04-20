import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-background)] to-[var(--color-primary-muted)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Elevated Logo Container */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[var(--color-border)] mb-6 ring-1 ring-black/5">
          <img
            className="h-24 w-auto object-contain"
            src="/logo.png"
            alt="BUREF - Babcock University"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x150?text=BUREF';
            }}
          />
        </div>

        {/* Improved Typography */}
        <h2 className="text-center text-4xl font-extrabold text-[var(--color-primary)] font-serif tracking-tight">
          BUREF
        </h2>
        <h3 className="mt-1.5 text-center text-lg font-medium text-[var(--color-text-primary)]">
          Babcock University Reference System
        </h3>
        
        {/* Stylized Motto */}
        <div className="mt-4 flex items-center gap-3 mb-2">
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[var(--color-gold)]"></div>
          <p className="text-center text-xs text-[var(--color-gold)] uppercase tracking-[0.2em] font-bold">
            Knowledge, Truth, Service
          </p>
          <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[var(--color-gold)]"></div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 transition-all">
        {/* Polished Card for the Form */}
        <div className="bg-white py-10 px-8 shadow-xl shadow-[var(--color-primary)]/10 sm:rounded-2xl border border-[var(--color-border)] backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500 delay-150">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
