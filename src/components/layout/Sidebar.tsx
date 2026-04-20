import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Users, BookOpen } from 'lucide-react';

export const Sidebar: React.FC = () => {
  // In a real app, this would come from AuthContext
  const role = 'student'; // mock role

  return (
    <aside className="w-64 bg-white border-r border-[var(--color-border)] hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)] gap-3 shadow-sm">
        <img src="/logo.png" alt="BUREF" className="h-8 w-auto" />
        <span className="font-bold text-[var(--color-text-primary)] text-xl font-serif">BUREF</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {role === 'student' && (
          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)]' 
                  : 'text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            <User className="w-5 h-5" />
            My Profile
          </NavLink>
        )}

        {(role === 'lecturer' || role === 'admin') && (
          <>
            <NavLink
              to="/lecturer/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)]' 
                    : 'text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]'
                }`
              }
            >
              <BookOpen className="w-5 h-5" />
              Student Repository
            </NavLink>
            
            {role === 'admin' && (
              <NavLink
                to="/admin/lecturers"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)]' 
                      : 'text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]'
                  }`
                }
              >
                <Users className="w-5 h-5" />
                Manage Staff
              </NavLink>
            )}
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="text-xs text-center text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} Babcock University
        </div>
      </div>
    </aside>
  );
};
