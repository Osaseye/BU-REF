import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Briefcase, Mail, Phone, Globe, AlignLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useStudent } from '../../hooks/useStudent';

export const StudentDetail: React.FC = () => {
  const { matricNo } = useParams<{ matricNo: string }>();
  const navigate = useNavigate();
  const { student: profileData, loading, error } = useStudent(matricNo);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <p className="text-lg text-[var(--color-danger)] font-semibold">{error || 'Student not found'}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex items-center justify-between">
         <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 !px-3 !py-1.5 text-sm rounded-xl border-gray-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Big Avatar Card */}
        <div className="lg:w-1/3 shrink-0">
          <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/10 border border-[var(--color-border)] relative overflow-hidden flex flex-col items-center p-8 backdrop-blur-sm">
            {/* Decorative background blobs and gradient */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--color-primary-muted)] to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="mt-4 relative z-10 mb-6">
               <div className="w-32 h-32 bg-white text-[var(--color-primary)] rounded-full border-4 border-white shadow-lg flex items-center justify-center font-bold font-serif text-5xl overflow-hidden">
                 {profileData.photoURL ? (
                    <img src={profileData.photoURL} alt={profileData.fullName} className="w-full h-full object-cover" />
                 ) : (
                    profileData.fullName.charAt(0)
                 )}
               </div>
            </div>
            
            <div className="text-center relative z-10 mb-6 w-full">
              <h2 className="text-2xl font-extrabold font-serif text-[var(--color-primary)] tracking-tight">
                {profileData.fullName}
              </h2>
              <div className="mt-2 flex items-center justify-center gap-3">
                <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-[var(--color-gold)]"></div>
                <p className="text-xs text-[var(--color-gold)] uppercase tracking-[0.1em] font-bold">
                  {profileData.matricNo}
                </p>
                <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-[var(--color-gold)]"></div>
              </div>
            </div>

            <div className="w-full space-y-4 relative z-10 mt-2 pt-6 border-t border-[var(--color-border)]/60">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                 <span className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 flex items-center gap-1.5">Profile Status</span>
                 {profileData.profileComplete ? (
                    <Badge variant="success" className="shadow-sm font-semibold">Fully Completed</Badge>
                 ) : (
                    <Badge variant="error" className="shadow-sm font-semibold">Incomplete</Badge>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: UMIS & Details */}
        <div className="lg:w-2/3 flex-1 space-y-8">
           
           {/* Academic Record Card */}
           <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
             <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl pointer-events-none"></div>
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
              <div className="p-2 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded-lg relative z-10">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-[var(--color-primary)] font-serif">University Record</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Read-only data synced securely from UMIS</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Program of Study</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profileData.department}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Faculty / School</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profileData.faculty}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Current Level</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profileData.level}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" /> Academic Standing</p>
                 <p className="text-sm font-bold text-[var(--color-primary)]">{profileData.cgpa} CGPA</p>
              </div>
            </div>
           </div>

           {/* Contact & Bio Card */}
           <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded-lg">
                  <Briefcase className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-[var(--color-primary)] font-serif">Clearance Details</h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">Project and contact information provided by the student</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Contact Email</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] break-all">{profileData.contactEmail ? <a href={`mailto:${profileData.contactEmail}`} className="hover:underline">{profileData.contactEmail}</a> : 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone Number</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profileData.phoneNumber || 'Not specified'}</p>
              </div>
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Project Title</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profileData.projectTitle || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><GraduationCap className="w-3 h-3" /> Supervisor Name</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profileData.supervisorName || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5"><Globe className="w-3 h-3" /> LinkedIn URL</p>
                    {profileData.linkedInURL ? (
                      <a href={profileData.linkedInURL} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold break-all text-[var(--color-primary)] underline">
                        {profileData.linkedInURL}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">Not specified</p>
                    )}
                  </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-xs text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5"><AlignLeft className="w-3 h-3" /> Short Bio</p>
                <p className="text-sm text-[var(--color-text-primary)] bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {profileData.bio || 'This student has not provided a biography yet.'}
                </p>
              </div>
                    {profileData.linkedInURL ? (
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] break-all text-[var(--color-primary)] underline">
                        <a href={profileData.linkedInURL} target="_blank" rel="noreferrer">{profileData.linkedInURL.replace('https://www.', '')}</a>
                      </p>
                    ) : ( <p className="text-sm font-semibold text-[var(--color-text-primary)]">N/A</p> )}
                  </div>
              </div>
              <div className="col-span-1 md:col-span-2 border-t border-[var(--color-border)] pt-6 mt-2">
                <p className="text-xs text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5"><AlignLeft className="w-3 h-3" /> Short Bio</p>
                <p className="text-sm text-[var(--color-text-primary)] bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 relative">
                  <span className="absolute top-2 left-2 text-4xl text-[var(--color-primary)]/10 font-serif opacity-50">"</span>
                  <span className="relative z-10 leading-relaxed block pl-4">{profileData.bio}</span>
                </p>
              </div>
            </div>
           </div>

        </div>
      </div>
    </div>
  );
};
