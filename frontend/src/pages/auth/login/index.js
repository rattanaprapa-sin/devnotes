import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LoginForm } from '../../../modules/auth/login';

export default function Login() {
  const { user } = useAuth();

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-100 d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="container d-flex justify-content-center">
        <LoginForm />
      </div>
    </div>
  );
}
