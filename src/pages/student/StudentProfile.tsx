import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProfileForm } from '../../components/student/ProfileForm';
import { AvatarUpload } from '../../components/student/AvatarUpload';
import { Edit2, Save, GraduationCap, CheckCircle2, User, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const StudentProfile: React.FC = () => {
  // Mock UMIS Data
  const umisData = {
    matricNo: '19/0000',
    fullName: 'Adekola John Smith',
    department: 'Software Engineering',
    faculty: 'Computing and Engineering Sciences',
    cgpa: 4.56,
    level: '400L',
    graduationYear: '2024',
    dob: '12-10-2002',
    email: 'adekola@student.babcock.edu.ng',
    phone: '(+234) 801 234 5678'
  };

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleProfileUpdate = async (data: any) => {
    console.log('Update profile payload:', { ...data, avatarFile });
    // TODO: Connect to Firestore updates
    setIsEditing(false);
  };

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary)] font-serif tracking-tight">Student Profile</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your records and profile data</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Big Avatar Card applying Auth Layout Flair */}
        <div className="lg:w-1/3 shrink-0">
          <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/10 border border-[var(--color-border)] relative overflow-hidden flex flex-col items-center p-8">
            {/* Decorative background blobs and gradient */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--color-primary-muted)] to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Logo from Auth Layout style */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center justify-center p-2 bg-white rounded-lg shadow-sm border border-[var(--color-border)] ring-1 ring-black/5 z-10 w-12 h-12">
               <img src="/logo.png" alt="BUREF" className="w-full h-full object-contain" />
            </div>
            
            <div className="mt-8 relative z-10 mb-6">
              <AvatarUpload initials={umisData.fullName.charAt(0)} onUpload={handleAvatarUpload} size="lg" />
            </div>
            
            <div className="text-center relative z-10 mb-6 w-full">
              <h2 className="text-2xl font-extrabold font-serif text-[var(--color-primary)] tracking-tight">
                {umisData.fullName}
              </h2>
              <div className="mt-2 flex items-center justify-center gap-3">
                <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-[var(--color-gold)]"></div>
                <p className="text-xs text-[var(--color-gold)] uppercase tracking-[0.1em] font-bold">
                  {umisData.matricNo}
                </p>
                <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-[var(--color-gold)]"></div>
              </div>
            </div>

            <div className="w-full space-y-4 relative z-10 mt-2 pt-6 border-t border-[var(--color-border)]/60">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <span className="text-xs text-[var(--color-text-secondary)] font-medium mb-1">Current Session</span>
                <span className="text-sm font-bold text-[var(--color-text-primary)]">2023/2024</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-green-50/50 border border-green-100/50">
                <span className="text-xs text-green-700 font-medium mb-1">Status</span>
                <Badge variant="success" className="shadow-sm font-semibold">Active Student</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: UMIS & Editable Data Cards */}
        <div className="lg:w-2/3 flex-1 space-y-8">
          
          {/* UMIS Data Card - Non Editable */}
          <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
              <div className="p-2 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded-lg">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-primary)] font-serif">University Record</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Read-only data synced securely from UMIS</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Program of Study</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{umisData.department}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Faculty / School</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{umisData.faculty}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Current Level</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{umisData.level}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Graduation Year</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{umisData.graduationYear}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Academic Standing (CGPA)</p>
                <p className="text-sm font-bold text-[var(--color-primary)]">{umisData.cgpa}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Date of Birth</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{umisData.dob}</p>
              </div>
            </div>
          </div>

          {/* Editable Data Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded-lg">
                  <User className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-[var(--color-primary)] font-serif">Personal Details</h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">Update your contact and residence information</p>
                 </div>
              </div>
              <Button 
                variant={isEditing ? "primary" : "outline"}
                onClick={() => setIsEditing(!isEditing)} 
                className="text-xs !py-1.5 !px-3 font-medium flex gap-2 shadow-sm"
              >
                {isEditing ? (
                  <><Save className="w-3 h-3" /> Cancel</>
                ) : (
                  <>Edit <Edit2 className="w-3 h-3" /></>
                )}
              </Button>
            </div>
            
            {isEditing ? (
              <div className="animate-in fade-in slide-in-from-top-2">
                 <ProfileForm onSubmit={handleProfileUpdate} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Contact Email</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] break-all">{umisData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone Number</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{umisData.phone}</p>
                </div>
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Project Title</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">AI-driven Reference System</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><User className="w-3 h-3" /> Supervisor Name</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Dr. John Doe</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> LinkedIn URL</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] break-all text-[var(--color-primary)] underline">https://linkedin.com/in/adekolasmith</p>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5"><User className="w-3 h-3" /> Short Bio</p>
                  <p className="text-sm text-[var(--color-text-primary)] bg-gray-50 p-4 rounded-xl border border-gray-100">
                    A passionate final-year software engineering student dedicated to solving real-world problems.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
