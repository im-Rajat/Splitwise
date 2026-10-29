import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GroupsListPage } from './pages/GroupsListPage';
import { GroupDetailPage } from './pages/GroupDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/groups" element={<GroupsListPage />} />
                <Route path="/groups/:groupId" element={<GroupDetailPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/groups" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" toastOptions={{ success: { duration: 4000 } }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
