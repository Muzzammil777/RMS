import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy-load each app shell
const AdminApp = lazy(() => import('@/admin/App'));
const ClientApp = lazy(() => import('@/client/ClientApp'));

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
    <div className="animate-pulse text-[#8B5A2B] text-lg font-medium">Loading…</div>
  </div>
);

const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/client" replace /> },
    {
      path: '/admin/*',
      element: (
        <Suspense fallback={<Fallback />}>
          <AdminApp />
        </Suspense>
      ),
    },
    {
      path: '/client/*',
      element: (
        <Suspense fallback={<Fallback />}>
          <ClientApp />
        </Suspense>
      ),
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

export default function App() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
