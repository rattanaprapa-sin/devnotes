import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../config/supabase';
import useEscape from '../../../../shared/hooks/useEscape';

export default function EditProfileModal({ show, onClose, user }) {
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (show && user) {
      setDisplayName(user.user_metadata?.display_name || '');
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [show, user]);

  useEscape(show, onClose);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoading(true);

    try {
      const updates = {};
      
      // Update display name if changed
      if (displayName !== (user.user_metadata?.display_name || '')) {
        updates.data = { display_name: displayName };
      }

      // Update password if provided
      if (password) {
        if (!currentPassword) {
          throw new Error("Please enter your current password");
        }
        if (password !== confirmPassword) {
          throw new Error("New passwords do not match");
        }

        // Verify current password first to ensure security
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        });

        if (verifyError) {
          throw new Error("Current password is incorrect");
        }

        updates.password = password;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        toast.success('Profile updated successfully!', { style: { textAlign: 'center' } });
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        onClose(); // No changes made
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile', { style: { textAlign: 'center' } });
    } finally {
      setLoading(false);
    }
  };

  const hasDisplayNameChanged = displayName.trim() !== (user?.user_metadata?.display_name || '');
  const hasAnyPasswordInput = currentPassword.trim() !== '' || password.trim() !== '' || confirmPassword.trim() !== '';
  const isPasswordComplete = currentPassword.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '';

  const canSubmit = 
    (!hasAnyPasswordInput && hasDisplayNameChanged && displayName.trim() !== '') || 
    (isPasswordComplete);

  return (
    <>
      {show && <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>}
      <div 
        className={`modal fade ${show ? 'show d-block' : ''}`} 
        tabIndex="-1"
        style={{ zIndex: 1055 }}
        aria-hidden={!show}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold">Edit Profile</h5>
                <button 
                  type="button" 
                  className="btn-close shadow-none" 
                  onClick={onClose}
                  aria-label="Close"
                ></button>
              </div>
              
              <div className="modal-body px-4 py-4">
                <div className="mb-2">
                  <label className="form-label text-secondary small fw-medium">Display Name</label>
                  <input
                    type="text"
                    className="form-control rounded-3 py-2 shadow-none"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should we call you?"
                  />
                </div>

                <hr className="text-secondary opacity-25 my-4" />
                <p className="text-secondary small fw-semibold mb-3">Change Password (Optional)</p>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-medium">Current Password</label>
                  <div className="position-relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="form-control rounded-3 py-2 shadow-none pe-5"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                    />
                    <span 
                      className="position-absolute top-50 translate-middle-y end-0 pe-3 text-secondary d-flex align-items-center" 
                      style={{ cursor: 'pointer', zIndex: 10 }}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <i className={`bi bi-eye${showCurrentPassword ? '-slash' : ''}`}></i>
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-medium">New Password</label>
                  <div className="position-relative" style={{ pointerEvents: currentPassword.trim() === '' ? 'none' : 'auto' }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control rounded-3 py-2 shadow-none pe-5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New password"
                      disabled={currentPassword.trim() === ''}
                      readOnly={currentPassword.trim() === ''}
                      tabIndex={currentPassword.trim() === '' ? -1 : 0}
                      onFocus={(e) => {
                        if (currentPassword.trim() === '') e.target.blur();
                      }}
                    />
                    <span 
                      className="position-absolute top-50 translate-middle-y end-0 pe-3 text-secondary d-flex align-items-center" 
                      style={{ 
                        cursor: currentPassword.trim() ? 'pointer' : 'default',
                        opacity: currentPassword.trim() ? 1 : 0.5,
                        zIndex: 10 
                      }}
                      onClick={() => currentPassword.trim() && setShowNewPassword(!showNewPassword)}
                    >
                      <i className={`bi bi-eye${showNewPassword ? '-slash' : ''}`}></i>
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label text-secondary small fw-medium">Confirm New Password</label>
                  <div className="position-relative" style={{ pointerEvents: password.trim() === '' ? 'none' : 'auto' }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control rounded-3 py-2 shadow-none pe-5"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      disabled={password.trim() === ''}
                      readOnly={password.trim() === ''}
                      tabIndex={password.trim() === '' ? -1 : 0}
                      onFocus={(e) => {
                        if (password.trim() === '') e.target.blur();
                      }}
                    />
                    <span 
                      className="position-absolute top-50 translate-middle-y end-0 pe-3 text-secondary d-flex align-items-center" 
                      style={{ 
                        cursor: password.trim() ? 'pointer' : 'default', 
                        opacity: password.trim() ? 1 : 0.5,
                        zIndex: 10 
                      }}
                      onClick={() => password.trim() && setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary fw-medium rounded-pill px-4 flex-grow-1" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-dark fw-medium rounded-pill px-4 flex-grow-1"
                  disabled={loading || !canSubmit}
                >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  'Save Changes'
                )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
