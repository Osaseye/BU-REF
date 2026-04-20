import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const isStudentRoute = location.pathname.startsWith('/student');
  const isLecturerRoute = location.pathname.startsWith('/lecturer');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const hideSidebar = isStudentRoute || isLecturerRoute || isAdminRoute;

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      {/* Sidebar - Hidden for students, lecturers, and admins */}
      {!hideSidebar && <Sidebar />}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        
        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${hideSidebar ? 'p-4 md:p-8' : 'p-6 md:p-8'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
