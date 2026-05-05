import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Shield, Users, CheckCircle2, BookOpen, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { httpsCallable } from 'firebase/functions';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { functions, db } from '../../lib/firebase';
import { getUserFacingErrorMessage } from '../../lib/authErrors';
import { firestore } from '../../lib/firestore';
import type { StudentProfile, SyncMeta } from '../../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // ── Live students from Firestore ───────────────────────────────────────────
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(d => d.data() as StudentProfile));
      setStudentsLoading(false);
    });
    return unsub;
  }, []);

  // ── Sync metadata ──────────────────────────────────────────────────────────
  const [syncMeta, setSyncMeta] = useState<SyncMeta | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    firestore.getLastSyncMeta().then(setSyncMeta);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const bulkSync = httpsCallable(functions, 'bulkSyncStudentsFromUmis');
      const result = await bulkSync({});
      const { synced, failed } = result.data as { synced: number; failed: number };
      const meta = await firestore.getLastSyncMeta();
      setSyncMeta(meta);
      if (failed === 0) {
        toast.success(`Sync complete — ${synced} students updated.`);
      } else {
        toast.warning(`Sync finished — ${synced} synced, ${failed} failed.`);
      }
    } catch (err: any) {
      toast.error(getUserFacingErrorMessage(err, 'Sync failed. Please try again.'));
    } finally {
      setSyncing(false);
    }
  };

  const formatSyncTime = (ts: unknown): string => {
    if (!ts) return 'Never';
    if (ts instanceof Timestamp) return ts.toDate().toLocaleString();
    if (ts instanceof Date) return ts.toLocaleString();
    return 'Unknown';
  };

  const departments = useMemo(() => {
    const deps = new Set(students.map(s => s.department));
    return ['All', ...Array.from(deps)];
  }, [students]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.matricNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'All' || student.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary)] font-serif tracking-tight">System Administration</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Supervise global student clearance and manage lecturer access</p>
        </div>
        <div className="flex w-full md:w-auto bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-1 shrink-0">
          <Link 
            to="/admin/dashboard"
            className="flex-1 text-center px-4 py-2 text-sm font-bold rounded-lg transition-all bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
          >
            Synced Students
          </Link>
          <Link 
            to="/admin/lecturers"
            className="flex-1 text-center px-4 py-2 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            Manage Staff
          </Link>
        </div>
      </div>

      {/* UMIS Sync Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-5 md:p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)]" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[var(--color-primary)]" />
              Student Data Sync
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Last sync: <span className="font-semibold">{formatSyncTime(syncMeta?.lastSyncAt)}</span></span>
              {syncMeta && (
                <>
                  <span className="text-gray-300">·</span>
                  <span>{syncMeta.studentCount.toLocaleString()} students</span>
                  <span className="text-gray-300">·</span>
                  <Badge
                    variant={syncMeta.status === 'success' ? 'success' : syncMeta.status === 'partial' ? 'warning' : 'error'}
                    className="text-[10px] px-2 py-0.5"
                  >
                    {syncMeta.status}
                  </Badge>
                </>
              )}
            </div>
            {!syncMeta && (
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                No sync has been run yet. Click &quot;Sync Now&quot; to populate the repository.
              </p>
            )}
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="shrink-0 flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Quick System Stats - Waiting for Firebase Integration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-5 md:p-6 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 md:p-3 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded-xl shrink-0">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Total Synced</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)]">
                {studentsLoading ? '—' : students.length.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-5 md:p-6 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 md:p-3 bg-green-50 text-green-600 rounded-xl border border-green-100 shrink-0">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Cleared Profiles</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)]">
                {studentsLoading ? '—' : students.filter(s => s.profileComplete).length.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-5 md:p-6 relative overflow-hidden backdrop-blur-sm cursor-pointer hover:border-[var(--color-primary)]/30 transition-colors" onClick={() => navigate('/admin/lecturers')}>
          <div className="flex items-center gap-4">
            <div className="p-2 md:p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 shrink-0">
              <Shield className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Active Staff</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)]">0</h2>
              </div>
              <span className="text-xs font-medium text-gray-400">Manage →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Students Directory */}
      <div className="flex flex-col lg:flex-row gap-8 pt-4">
        {/* Left Column: Filters */}
        <div className="lg:w-1/4 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[var(--color-primary)] to-red-600"></div>
            
            <h3 className="font-bold text-[var(--color-primary)] font-serif mb-6 flex items-center gap-2 mt-2">
              <Filter className="w-5 h-5" /> Global Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)] mb-2 block uppercase tracking-wider">Department</label>
                <div className="relative">
                  <select
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-sm font-medium transition-all"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--color-primary)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Search & Cards */}
        <div className="lg:w-3/4 flex-1 space-y-6">
          <Input 
            className="mb-0 w-full rounded-2xl bg-white shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] py-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all text-base"
            placeholder="Search global repository by student name or matric number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.matricNo} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl shadow-[var(--color-primary)]/5 hover:shadow-2xl hover:border-[var(--color-primary)]/30 hover:-translate-y-1 transition-all relative group flex flex-col items-center backdrop-blur-sm">
                <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-bold font-serif text-2xl border-4 border-white shadow-sm mb-4">
                  {student.fullName.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] text-center tracking-tight leading-tight">{student.fullName}</h3>
                <p className="text-sm font-bold text-[var(--color-gold)] mb-5">{student.matricNo}</p>
                
                <div className="w-full space-y-3 text-sm text-[var(--color-text-secondary)] flex-1">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100/80 gap-2">
                    <span>Department</span>
                    <span className="font-semibold text-gray-700 text-right truncate max-w-[130px]" title={student.department}>{student.department}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
                    <span>Level</span>
                    <span className="font-semibold text-gray-700">{student.level}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
                    <span>CGPA</span>
                    <span className="font-bold text-[var(--color-primary)]">{student.cgpa.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 mb-4">
                    <span>Status</span>
                    {student.profileComplete ? (
                      <Badge variant="success" className="text-[10px] px-2.5 py-0.5 shadow-sm font-semibold">Complete</Badge>
                    ) : (
                      <Badge variant="error" className="text-[10px] px-2.5 py-0.5 shadow-sm font-semibold">Incomplete</Badge>
                    )}
                  </div>
                </div>

                <Link 
                  to={`/admin/student/${encodeURIComponent(student.matricNo)}`}
                  className="w-full mt-6 py-2.5 px-4 bg-gray-50 group-hover:bg-[var(--color-primary)] text-[var(--color-text-primary)] group-hover:text-white font-semibold rounded-xl transition-colors flex items-center justify-center text-sm shadow-sm"
                >
                  Inspect Profile
                </Link>
              </div>
            ))}
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
              <BookOpen className="w-12 h-12 text-[var(--color-primary)]/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">No students found</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">Try adjusting your search criteria across the synced UMIS database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};