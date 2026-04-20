import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AppShell } from '../components/layout/AppShell';
import { NotFound } from '../pages/NotFound';
import { LoadingPage } from '../pages/Loading';

const StudentLogin = React.lazy(() => import('../pages/auth/StudentLogin').then(m => ({ default: m.StudentLogin })));
const StaffLogin = React.lazy(() => import('../pages/auth/StaffLogin').then(m => ({ default: m.StaffLogin })));
const AdminLogin = React.lazy(() => import('../pages/auth/AdminLogin').then(m => ({ default: m.AdminLogin })));
const StudentProfile = React.lazy(() => import('../pages/student/StudentProfile').then(m => ({ default: m.StudentProfile })));
const LecturerDashboard = React.lazy(() => import('../pages/lecturer/LecturerDashboard').then(m => ({ default: m.LecturerDashboard })));
const StudentDetail = React.lazy(() => import('../pages/lecturer/StudentDetail').then(m => ({ default: m.StudentDetail })));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ManageLecturers = React.lazy(() => import('../pages/admin/ManageLecturers').then(m => ({ default: m.ManageLecturers })));

const withSuspense = (Element: React.FC) => (
  <Suspense fallback={<LoadingPage />}>
    <Element />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login/student" replace />,
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      { path: 'student', element: withSuspense(StudentLogin) },
      { path: 'staff', element: withSuspense(StaffLogin) },
      { path: 'admin', element: withSuspense(AdminLogin) },
    ],
  },
  {
    path: '/loading',
    element: <LoadingPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { path: 'student/profile', element: withSuspense(StudentProfile) },
      { path: 'lecturer/dashboard', element: withSuspense(LecturerDashboard) },
      { path: 'lecturer/student/:matricNo', element: withSuspense(StudentDetail) },
      { path: 'admin/dashboard', element: withSuspense(AdminDashboard) },
      { path: 'admin/student/:matricNo', element: withSuspense(StudentDetail) },
      { path: 'admin/lecturers', element: withSuspense(ManageLecturers) },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
