import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { LecturerTable, type Lecturer } from '../../components/admin/LecturerTable';
import { InviteLecturerModal, type InviteFormData } from '../../components/admin/InviteLecturerModal';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const MOCK_LECTURERS: Lecturer[] = [
  { uid: '1', fullName: 'Dr. Adegboola', email: 'adegboola@babcock.edu.ng', department: 'Software Engineering', status: 'active', invitedAt: new Date('2025-01-15') },
  { uid: '2', fullName: 'Dr. Jane Doe', email: 'doe.j@babcock.edu.ng', department: 'Computer Science', status: 'active', invitedAt: new Date('2025-02-10') },
  { uid: '3', fullName: 'Prof. John Smith', email: 'smith.j@babcock.edu.ng', department: 'Information Technology', status: 'revoked', invitedAt: new Date('2024-11-05') },
];

export const ManageLecturers: React.FC = () => {
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  // We'll keep our local mock state in a reactive array if we want it to actually update on click:
  const [lecturers, setLecturers] = useState<Lecturer[]>(MOCK_LECTURERS);

  const handleInvite = (data: InviteFormData) => {
    // TODO: Call cloud function inviteLecturer
    toast.success(`Account created successfully for ${data.fullName}`);
    setInviteModalOpen(false);
  };

  const handleRevoke = (lecturer: Lecturer) => {
    // Optimistic UI update
    const isRevoking = lecturer.status === 'active';
    setLecturers(prev => 
      prev.map(l => l.uid === lecturer.uid ? { ...l, status: isRevoking ? 'revoked' : 'active' } : l)
    );
    
    if (isRevoking) {
      toast.error(`Access revoked for ${lecturer.fullName}`);
    } else {
      toast.success(`Access restored for ${lecturer.fullName}`);
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
        <Button onClick={() => setInviteModalOpen(true)} className="flex items-center gap-2 shadow-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl w-full sm:w-auto justify-center">
          <UserPlus className="w-4 h-4" /> Create New Account
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)]"></div>
        <LecturerTable lecturers={lecturers} onRevoke={handleRevoke} />
      </div>

      <InviteLecturerModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
        onInvite={handleInvite} 
      />
    </div>
  );
};
