import { useState, useEffect } from 'react';
import { supabase } from '../../../../config/supabase';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is actually in a recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Invalid or expired password reset link. Please try requesting a new one.");
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-lg border-1 border-light rounded-4 bg-white" style={{ maxWidth: '400px', width: '100%' }}>
      <div className="card-body p-5">
        <div className="text-center mb-4">
          <i className="bi bi-key-fill text-dark mb-3 d-block" style={{ fontSize: '2.5rem' }}></i>
          <h3 className="fw-bolder text-dark mb-2">Set New Password</h3>
          <p className="text-secondary small">Please enter your new password below.</p>
        </div>

        {error && (
          <div className="alert alert-danger rounded-3 py-2 small mb-4">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="alert alert-success rounded-3 py-3 mb-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              Password updated successfully!
            </div>
            <p className="text-secondary small">Redirecting to home...</p>
            <button className="btn btn-dark w-100 rounded-pill py-2" onClick={() => navigate('/')}>
              Go to Home now
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div className="mb-3">
              <label className="form-label text-dark opacity-75 small fw-medium">New Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control rounded-3 py-2 shadow-none border-secondary pe-5"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
            <div className="mb-4">
              <label className="form-label text-dark opacity-75 small fw-medium">Confirm New Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control rounded-3 py-2 shadow-none border-secondary pe-5"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 rounded-pill py-2"
              disabled={loading || !!error}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
