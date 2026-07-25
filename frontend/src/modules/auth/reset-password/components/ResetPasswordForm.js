import { useState, useEffect } from 'react';
import { supabase } from '../../../../config/supabase';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
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
              <input
                type="password"
                className="form-control rounded-3 py-2 shadow-none border-secondary"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-dark opacity-75 small fw-medium">Confirm New Password</label>
              <input
                type="password"
                className="form-control rounded-3 py-2 shadow-none border-secondary"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
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
