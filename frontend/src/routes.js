import { createBrowserRouter, Navigate } from 'react-router-dom';
import Home from './pages/home';
import NotebookDetail from './pages/notebooks';
import Login from './pages/auth/login';
import ResetPassword from './pages/auth/reset-password';
import ProtectedRoute from './shared/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notebook/:id',
    element: (
      <ProtectedRoute>
        <NotebookDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
