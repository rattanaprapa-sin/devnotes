import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../config/supabase';
import useEscape from '../../../../shared/hooks/useEscape';

export default function EditProfileModal({ show, onClose, user }) {
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (show && user) {
      setDisplayName(user.user_metadata?.display_name || '');
      setPassword('');
      setConfirmPassword('');
      setPassword('');
      setConfirmPassword('');
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
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        updates.password = password;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        onClose(); // No changes made
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow border-0">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold">Edit Profile</h5>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-4">
              <div className="mb-4">
                <label className="form-label text-secondary small fw-medium">Display Name</label>
                <input
                  type="text"
                  className="form-control rounded-3 py-2 shadow-none border-secondary"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                />
              </div>

              <hr className="text-secondary opacity-25 my-4" />
              <p className="text-secondary small fw-semibold mb-3">Change Password (Optional)</p>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-medium">New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control py-2 shadow-none border-secondary border-end-0"
                    style={{ borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                  <span 
                    className="input-group-text bg-transparent border-secondary text-secondary border-start-0" 
                    style={{ cursor: 'pointer', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label text-secondary small fw-medium">Confirm New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control py-2 shadow-none border-secondary border-end-0"
                    style={{ borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={!password}
                  />
                  <span 
                    className="input-group-text bg-transparent border-secondary text-secondary border-start-0" 
                    style={{ 
                      cursor: password ? 'pointer' : 'default', 
                      opacity: password ? 1 : 0.5,
                      borderTopRightRadius: '0.5rem', 
                      borderBottomRightRadius: '0.5rem' 
                    }}
                    onClick={() => password && setShowPassword(!showPassword)}
                  >
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
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
                disabled={loading}
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
  );
}
