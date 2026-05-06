import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, BookOpen, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useStudent } from '../../hooks/useStudent';
import type { LecturerProfile } from '../../types';

export const LecturerDashboard: React.FC = () => {
  const { user } = useAuth();
  const profile = user?.profile as LecturerProfile;
  const lecturerSchool = profile?.school;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedGradYear, setSelectedGradYear] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCgpa, setSelectedCgpa] = useState('All');
  
  const { students, searchStudents, loading } = useStudent();

  // Load students scoped to this lecturer's school
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchStudents(searchTerm, lecturerSchool);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, lecturerSchool]);

  const departments = useMemo(() => {
    const deps = new Set(students.map(s => s.department).filter(Boolean));
    return ['All', ...Array.from(deps).sort()];
  }, [students]);

  const levels = useMemo(() => {
    const lvls = new Set(students.map(s => s.level).filter(Boolean));
    return ['All', ...Array.from(lvls).sort()];
  }, [students]);

  const gradYears = useMemo(() => {
    const yrs = new Set(students.map(s => s.graduationYear).filter(Boolean) as string[]);
    return ['All', ...Array.from(yrs).sort()];
  }, [students]);

  const activeFilterCount = [selectedDepartment, selectedLevel, selectedGradYear, selectedStatus, selectedCgpa].filter(v => v !== 'All').length;

  const clearFilters = () => {
    setSelectedDepartment('All');
    setSelectedLevel('All');
    setSelectedGradYear('All');
    setSelectedStatus('All');
    setSelectedCgpa('All');
  };

  const filteredStudents = students.filter(student => {
    const matchesDept     = selectedDepartment === 'All' || student.department === selectedDepartment;
    const matchesLevel    = selectedLevel === 'All' || student.level === selectedLevel;
    const matchesGradYear = selectedGradYear === 'All' || String(student.graduationYear) === selectedGradYear;
    const matchesStatus   = selectedStatus === 'All' ||
      (selectedStatus === 'Complete' ? student.profileComplete : !student.profileComplete);
    const cgpa = Number(student.cgpa);
    const matchesCgpa = selectedCgpa === 'All' ||
      (selectedCgpa === 'first'        && cgpa >= 4.50) ||
      (selectedCgpa === 'second_upper' && cgpa >= 3.50 && cgpa < 4.50) ||
      (selectedCgpa === 'second_lower' && cgpa >= 2.40 && cgpa < 3.50) ||
      (selectedCgpa === 'third'        && cgpa < 2.40);
    return matchesDept && matchesLevel && matchesGradYear && matchesStatus && matchesCgpa;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary)] font-serif tracking-tight">
             Welcome, {profile?.fullName || 'Lecturer'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Lecturer Portal
            {lecturerSchool && (
              <> &mdash; <span className="font-semibold text-[var(--color-primary)]">{lecturerSchool}</span></>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Filters */}
        <div className="lg:w-1/4 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)]"></div>
            
            <div className="flex items-center justify-between mt-2 mb-6">
              <h3 className="font-bold text-[var(--color-primary)] font-serif flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 text-[10px] font-bold bg-[var(--color-primary)] text-white rounded-full px-1.5 py-0.5">{activeFilterCount}</span>
                )}
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">Clear all</button>
              )}
            </div>

            <div className="space-y-5">
              {([
                { label: 'Department',       value: selectedDepartment, set: setSelectedDepartment, options: departments,  placeholder: 'All Departments' },
                { label: 'Level',            value: selectedLevel,      set: setSelectedLevel,      options: levels,       placeholder: 'All Levels' },
                { label: 'Graduation Year',  value: selectedGradYear,   set: setSelectedGradYear,   options: gradYears,    placeholder: 'All Years' },
              ] as const).map(({ label, value, set, options, placeholder }) => (
                <div key={label}>
                  <label className="text-xs font-bold text-[var(--color-text-secondary)] mb-2 block uppercase tracking-wider">{label}</label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-sm font-medium transition-all"
                      value={value}
                      onChange={(e) => (set as (v: string) => void)(e.target.value)}
                    >
                      {options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt === 'All' ? placeholder : opt}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--color-primary)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)] mb-2 block uppercase tracking-wider">CGPA Class</label>
                <div className="relative">
                  <select
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-sm font-medium transition-all"
                    value={selectedCgpa}
                    onChange={(e) => setSelectedCgpa(e.target.value)}
                  >
                    <option value="All">All Classes</option>
                    <option value="first">First Class (≥ 4.50)</option>
                    <option value="second_upper">Second Class Upper (3.50 – 4.49)</option>
                    <option value="second_lower">Second Class Lower (2.40 – 3.49)</option>
                    <option value="third">Third Class / Pass (&lt; 2.40)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--color-primary)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)] mb-2 block uppercase tracking-wider">Profile Status</label>
                <div className="relative">
                  <select
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-sm font-medium transition-all"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Complete">Complete</option>
                    <option value="Incomplete">Incomplete</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--color-primary)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
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
