import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { TableSkeleton } from '@/components/skeleton/TableSkeleton';
import { RouteErrorBoundary } from '@/pages/_error/RouteErrorBoundary';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

// Landing page
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));

// Lazy load page components
const Overview = lazy(() => import('@/pages/Overview'));
const Proposals = lazy(() => import('@/pages/proposals/ProposalsPage'));
const ProposalDetail = lazy(() => import('@/pages/proposals/ProposalDetail'));
const DAOs = lazy(() => import('@/pages/daos/DaosPage'));
const Notifications = lazy(
  () => import('@/pages/notifications/NotificationsPage')
);
const Runtime = lazy(() => import('@/pages/runtime/RuntimePage'));
const Balances = lazy(() => import('@/pages/balances/BalancesPage'));
const Errors = lazy(() => import('@/pages/errors/ErrorsPage'));
const Settings = lazy(() => import('@/pages/settings/SettingsPage'));
const ErrorTest = lazy(() => import('@/pages/test/ErrorTestPage'));
const NotFound = lazy(() => import('@/pages/_error/NotFound'));

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
    <RouteErrorBoundary>
      <Routes>
        {/* Landing page */}
        <Route
          path="/"
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
              <LandingPage />
            </Suspense>
          }
        />

        {/* Main app routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <Overview />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="proposals"
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <Proposals />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="proposals/:id"
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <ProposalDetail />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="daos"
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <DAOs />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="notifications"
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <Notifications />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="runtime"
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <Runtime />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="balances"
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <Balances />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="errors"
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <Errors />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <Settings />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="test"
            element={
              <Suspense fallback={<PageLoading />}>
                <RouteErrorBoundary>
                  <ErrorTest />
                </RouteErrorBoundary>
              </Suspense>
            }
          />
        </Route>

        {/* 404 Route - Must be last */}
        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoading />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </RouteErrorBoundary>
  );
}
