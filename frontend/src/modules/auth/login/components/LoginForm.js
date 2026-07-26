import { useState } from 'react';
import { supabase } from '../../../../config/supabase';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../../../../shared/components/SuccessModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            }
          }
        });
        if (error) throw error;
        setShowSuccessModal(true);
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (error) {
      if (error.message === 'Invalid login credentials') {
        setError('Incorrect email or password. Please try again.');
      } else if (error.message === 'User already registered') {
        setError('An account with this email already exists.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card auth-card shadow-lg border-1 border-light rounded-4" style={{ maxWidth: '400px', width: '100%', transition: 'all 0.3s ease' }}>
      <div className="card-body p-5">
        <div className="text-center mb-4">
          <h2 className="fw-bolder text-dark mb-2">DevNotes</h2>
          <p className="text-secondary">Your modern coding workspace</p>
        </div>

        {/* Sliding Tab Toggle */}
        <div 
          className="auth-toggle-container d-flex rounded-pill p-1 mb-4 position-relative"
          style={{ transition: 'all 0.3s ease' }}
        >
          <div 
            className="position-absolute bg-white shadow-sm rounded-pill"
            style={{ 
              width: 'calc(50% - 4px)', 
              height: 'calc(100% - 8px)', 
              top: '4px', 
              left: isSignUp ? '50%' : '4px',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          />
          <button 
            type="button" 
            className={`btn flex-grow-1 border-0 rounded-pill position-relative fw-semibold py-2 ${!isSignUp ? 'text-dark' : 'text-secondary'}`}
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            style={{ zIndex: 1 }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`btn flex-grow-1 border-0 rounded-pill position-relative fw-semibold py-2 ${isSignUp ? 'text-dark' : 'text-secondary'}`}
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            style={{ zIndex: 1 }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="alert alert-danger rounded-3 py-2 fs-6 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div 
            className="overflow-hidden"
            style={{ 
              maxHeight: isSignUp ? '90px' : '0', 
              opacity: isSignUp ? 1 : 0, 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            <div className="mb-3">
              <label className="form-label text-dark opacity-75 small fw-medium">Display Name</label>
              <input
                type="text"
                className="form-control rounded-3 py-2 shadow-none border-secondary"
                placeholder="How should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isSignUp}
                tabIndex={isSignUp ? 0 : -1}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label text-dark opacity-75 small fw-medium">Email address</label>
            <input
              type="email"
              className="form-control rounded-3 py-2 shadow-none border-secondary"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={isSignUp ? "mb-3" : "mb-4"}>
            <div className="mb-2">
              <label className="form-label text-dark opacity-75 small fw-medium mb-0">Password</label>
            </div>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control rounded-3 py-2 shadow-none border-secondary pe-5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-secondary text-decoration-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
          
          <div 
            className="overflow-hidden"
            style={{ 
              maxHeight: isSignUp ? '90px' : '0', 
              opacity: isSignUp ? 1 : 0, 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            <div className="mb-4">
              <label className="form-label text-dark opacity-75 small fw-medium">Confirm Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control rounded-3 py-2 shadow-none border-secondary pe-5"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={isSignUp}
                  tabIndex={isSignUp ? 0 : -1}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 rounded-pill py-2 mb-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
          
          <div 
            className="text-center overflow-hidden"
            style={{ 
              maxHeight: !isSignUp ? '40px' : '0', 
              opacity: !isSignUp ? 1 : 0, 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: !isSignUp ? '1rem' : '0'
            }}
          >
            <button 
              type="button" 
              className="btn btn-link p-0 text-decoration-none text-secondary"
              style={{ fontSize: '0.9rem' }}
              onClick={() => setShowForgotModal(true)}
              tabIndex="-1"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
      <SuccessModal 
        show={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Account Created!"
        message="Check your email for the login link (if email confirmation is required) or sign in directly to get started."
      />
      <ForgotPasswordModal 
        show={showForgotModal} 
        onClose={() => setShowForgotModal(false)}
      />
    </>
  );
}
