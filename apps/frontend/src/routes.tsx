import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { TableSkeleton } from '@/components/skeleton/TableSkeleton';

// Lazy load page components
const Overview = lazy(() => import('@/pages/Overview'));
const Proposals = lazy(() => import('@/pages/proposals/ProposalsPage'));
const ProposalDetail = lazy(() => import('@/pages/proposals/ProposalDetail'));
const DAOs = lazy(() => import('@/pages/daos/DaosPage'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Runtime = lazy(() => import('@/pages/Runtime'));
const Balances = lazy(() => import('@/pages/Balances'));
const Errors = lazy(() => import('@/pages/Errors'));
const Settings = lazy(() => import('@/pages/Settings'));

// Loading component
function PageLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <TableSkeleton />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageLoading />}>
              <Overview />
            </Suspense>
          }
        />
        <Route
          path="proposals"
          element={
            <Suspense fallback={<PageLoading />}>
              <Proposals />
            </Suspense>
          }
        />
        <Route
          path="proposals/:id"
          element={
            <Suspense fallback={<PageLoading />}>
              <ProposalDetail />
            </Suspense>
          }
        />
        <Route
          path="daos"
          element={
            <Suspense fallback={<PageLoading />}>
              <DAOs />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<PageLoading />}>
              <Notifications />
            </Suspense>
          }
        />
        <Route
          path="runtime"
          element={
            <Suspense fallback={<PageLoading />}>
              <Runtime />
            </Suspense>
          }
        />
        <Route
          path="balances"
          element={
            <Suspense fallback={<PageLoading />}>
              <Balances />
            </Suspense>
          }
        />
        <Route
          path="errors"
          element={
            <Suspense fallback={<PageLoading />}>
              <Errors />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoading />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
