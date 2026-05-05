import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AppShell } from '../components/layout/AppShell';
import { NotFound } from '../pages/NotFound';
import { LoadingPage } from '../pages/Loading';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

const StudentLogin = React.lazy(() => import('../pages/auth/StudentLogin').then(m => ({ default: m.StudentLogin })));
const StaffLogin = React.lazy(() => import('../pages/auth/StaffLogin').then(m => ({ default: m.StaffLogin })));
const AdminLogin = React.lazy(() => import('../pages/auth/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminRegister = React.lazy(() => import('../pages/auth/AdminRegister').then(m => ({ default: m.AdminRegister })));
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

const getRoleHome = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'lecturer':
      return '/lecturer/dashboard';
    case 'student':
      return '/student/profile';
  }
};

const getLoginRoute = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return '/login/admin';
    case 'lecturer':
      return '/login/staff';
    case 'student':
      return '/login/student';
  }
};

const RequireRole: React.FC<{ allowedRoles: UserRole[]; children: React.ReactElement }> = ({
  allowedRoles,
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to={getLoginRoute(allowedRoles[0])} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
};

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
    // ⚠️  TEMPORARY — delete after first admin is created
    path: '/admin/register',
    element: withSuspense(AdminRegister),
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        path: 'student/profile',
        element: <RequireRole allowedRoles={['student']}>{withSuspense(StudentProfile)}</RequireRole>,
      },
      {
        path: 'lecturer/dashboard',
        element: <RequireRole allowedRoles={['lecturer']}>{withSuspense(LecturerDashboard)}</RequireRole>,
      },
      {
        path: 'lecturer/student/:matricNo',
        element: <RequireRole allowedRoles={['lecturer']}>{withSuspense(StudentDetail)}</RequireRole>,
      },
      {
        path: 'admin/dashboard',
        element: <RequireRole allowedRoles={['admin']}>{withSuspense(AdminDashboard)}</RequireRole>,
      },
      {
        path: 'admin/student/:matricNo',
        element: <RequireRole allowedRoles={['admin']}>{withSuspense(StudentDetail)}</RequireRole>,
      },
      {
        path: 'admin/lecturers',
        element: <RequireRole allowedRoles={['admin']}>{withSuspense(ManageLecturers)}</RequireRole>,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
