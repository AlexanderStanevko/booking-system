import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { DashboardLayout } from './layouts/DashboardLayout/DashboardLayout';
import { NotFoundPage } from './pages/NotFoundPage';

const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'));
const RoomsPage = lazy(() => import('./pages/RoomsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/reservations" replace />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
