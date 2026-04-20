import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { LecturerTable, type Lecturer } from '../../components/admin/LecturerTable';
import { InviteLecturerModal, type InviteFormData } from '../../components/admin/InviteLecturerModal';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLecturers } from '../../hooks/useLecturers';

export const ManageLecturers: React.FC = () => {
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const { lecturers, loading, inviteLecturer, revokeLecturer } = useLecturers();

  const handleInvite = async (data: InviteFormData) => {
    await inviteLecturer(data.fullName, data.email, data.department);
    setInviteModalOpen(false);
  };

  const handleRevoke = async (lecturer: Lecturer) => {
    // Only handle revoking logic. Restoration is not in spec, we just set `status: 'revoked'`.
    if (lecturer.status === 'active') {
      await revokeLecturer(lecturer.uid);
    } else {
       toast.info('Restoration of revoked lecturers is not supported in the current version.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex items-center justify-between">
         <Link 
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border border-gray-200 shadow-sm bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary)] font-serif tracking-tight">Manage Staff Data</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Create new lecturer accounts or revoke their clearance access.
          </p>
        </div>
        <div className="flex w-full sm:w-auto bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-1 shrink-0">
          <Link 
            to="/admin/dashboard"
            className="flex-1 text-center px-4 py-2 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            Synced Students
          </Link>
          <Link 
            to="/admin/lecturers"
            className="flex-1 text-center px-4 py-2 text-sm font-bold rounded-lg transition-all bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
          >
            Manage Staff
          </Link>
        </div>
      </div>

      <div className="flex justify-end gap-4 mb-6">
        <Button onClick={() => setInviteModalOpen(true)} className="flex items-center gap-2 shadow-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white rounded-xl w-full sm:w-auto justify-center">
          <UserPlus className="w-4 h-4" /> Create New Account
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)]"></div>
        {loading ? (
           <div className="flex justify-center items-center py-12">
             <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
           </div>
        ) : (
           <LecturerTable lecturers={lecturers} onRevoke={handleRevoke} />
        )}
      </div>

      <InviteLecturerModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
        onInvite={handleInvite} 
      />
    </div>
  );
};
