import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, BookOpen, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useStudent } from '../../hooks/useStudent';

export const LecturerDashboard: React.FC = () => {
  const { user } = useAuth();
  const profile = user?.profile as any;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  
  const { students, searchStudents, loading } = useStudent();

  // Load initial students (empty search term maps to all in our simple implementation or 
  // you might want a default specific query. For now we fetch "all" on mount if searchTerm is empty)
  useEffect(() => {
    // Fire off a search to hydrate list
    const delayDebounceFn = setTimeout(() => {
      searchStudents(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const departments = useMemo(() => {
    const deps = new Set(students.map(s => s.department));
    return ['All', ...Array.from(deps)];
  }, [students]);

  const filteredStudents = students.filter(student => {
    const matchesDept = selectedDepartment === 'All' || student.department === selectedDepartment;
    return matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary)] font-serif tracking-tight">
             Welcome, {profile?.fullName || 'Lecturer'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Lecturer Portal • Manage standard clearance for your assignees</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Filters */}
        <div className="lg:w-1/4 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)]"></div>
            
            <h3 className="font-bold text-[var(--color-primary)] font-serif mb-6 flex items-center gap-2 mt-2">
              <Filter className="w-5 h-5" /> Filters
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
          {/* Search Bar */}
          <Input 
            className="mb-0 w-full rounded-2xl bg-white shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] py-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all text-base"
            placeholder="Search students by name or matric number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading && students.length === 0 ? (
               <div className="col-span-3 flex justify-center py-10">
                 <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
               </div>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.matricNo} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl shadow-[var(--color-primary)]/5 hover:shadow-2xl hover:border-[var(--color-primary)]/30 hover:-translate-y-1 transition-all relative group flex flex-col items-center backdrop-blur-sm">
                <div className="h-16 w-16 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded-full flex items-center justify-center font-bold font-serif text-2xl border-4 border-white shadow-sm mb-4 overflow-hidden">
                  {student.photoURL ? (
                    <img src={student.photoURL} alt={student.fullName} className="w-full h-full object-cover" />
                  ) : (
                    student.fullName.charAt(0)
                  )}
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
                    <span className="font-bold text-[var(--color-primary)]">{Number(student.cgpa).toFixed(2)}</span>
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
                  to={`/lecturer/student/${encodeURIComponent(student.matricNo)}`}
                  className="w-full mt-6 py-2.5 px-4 bg-gray-50 group-hover:bg-[var(--color-primary)] text-[var(--color-text-primary)] group-hover:text-white font-semibold rounded-xl transition-colors flex items-center justify-center text-sm shadow-sm"
                >
                  View Profile Details
                </Link>
              </div>
            )))}
          </div>
          
          {!loading && filteredStudents.length === 0 && (
            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
              <BookOpen className="w-12 h-12 text-[var(--color-primary)]/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">No students found</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">Try adjusting your search or department filter to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
