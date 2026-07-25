import { useState } from 'react';
import { supabase } from '../../../../config/supabase';

export default function ForgotPasswordModal({ show, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setEmail('');
    onClose();
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow border-0">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold">Reset Password</h5>
            <button type="button" className="btn-close shadow-none" onClick={handleClose}></button>
          </div>
          <div className="modal-body p-4">
            {success ? (
              <div className="text-center py-3">
                <i className="bi bi-envelope-check text-success mb-3 d-block" style={{ fontSize: '3rem' }}></i>
                <h5 className="fw-bold text-dark">Check your email</h5>
                <p className="text-secondary mb-0">
                  We've sent a password reset link to <strong>{email}</strong>.
                </p>
                <button className="btn btn-dark w-100 rounded-pill py-2 mt-4" onClick={handleClose}>
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="mb-4 text-dark opacity-75">
                  Enter your email to receive a password reset link.
                </p>

                {error && (
                  <div className="alert alert-danger rounded-3 py-2 small mb-4 d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label text-dark opacity-75 small fw-medium">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-secondary ps-3" style={{ borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input 
                      type="email" 
                      className="form-control border-start-0 ps-0 shadow-none py-2" 
                      style={{ borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-dark w-100 rounded-pill py-2"
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
