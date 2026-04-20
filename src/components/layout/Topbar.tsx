import React, { useState } from 'react';
import { LogOut, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { UpdatePasswordModal } from './UpdatePasswordModal';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    // Basic mock logout for now
    navigate('/student/login');
  };

  return (
    <>
      <header className="bg-white border-b border-[var(--color-border)] h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm sticky top-0 z-20 w-full">
        {/* Brand / Logo Section (Always visible, responsive) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="BUREF" className="h-8 w-8 object-contain" />
            <span className="font-extrabold text-[var(--color-primary)] text-xl font-serif tracking-tight">BU Ref</span>
            <span className="hidden sm:inline font-medium text-sm text-[var(--color-text-secondary)] ml-2 border-l border-gray-300 pl-2">
              Babcock University Reference System
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setPasswordModalOpen(true)}
            className="px-3 py-1.5 text-sm h-auto flex items-center gap-2 font-medium"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Update Password</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm h-auto flex items-center gap-2 text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Logout</span>
          </Button>
        </div>
      </header>

      <UpdatePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setPasswordModalOpen(false)} 
      />
    </>
  );
};
