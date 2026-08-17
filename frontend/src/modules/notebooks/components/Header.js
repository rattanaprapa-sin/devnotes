import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppButton from '../../../shared/ui/AppButton';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { clearNotebooks } from '../../../store/notebooksSlice';
import { clearCurrentNotebook } from '../../../store/notesSlice';
import EditProfileModal from '../../auth/profile/components/EditProfileModal';
import UserGuideModal from '../../../shared/components/UserGuideModal';
import { useTheme } from '../../../contexts/ThemeContext';
import useModal from '../../../shared/hooks/useModal';
import useClickOutside from '../../../shared/hooks/useClickOutside';

export default function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const editProfileModal = useModal(false);
  const userGuideModal = useModal(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useClickOutside(() => {
    if (showDropdown) {
      setShowDropdown(false);
    }
  });

  const handleLogout = async () => {
    dispatch(clearNotebooks());
    dispatch(clearCurrentNotebook());
    await signOut();
    navigate('/login');
  };
  return (
    <>
      <div 
        className="w-100 pt-4 pb-3 sticky-top"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: theme === 'dark' ? 'rgba(33, 37, 41, 0.75)' : (theme === 'blue' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.75)'),
          borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : (theme === 'blue' ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(0,0,0,0.05)'),
          zIndex: 1020,
          top: 0
        }}
      >
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <h1 className="fw-bolder fs-4 mb-0" style={{ letterSpacing: '-0.5px' }}>
              <span className={theme === 'dark' ? "text-white" : "text-dark"}>Dev</span>
              <span className="text-secondary opacity-75">Notes</span>
            </h1>
          </div>


        {user && (
          <div className="d-flex align-items-center gap-3">
            <AppButton 
              variant="outline"
              className={`rounded-circle d-flex align-items-center justify-content-center ${theme === 'dark' ? 'text-white border-light border-opacity-25 bg-dark hover-bg-dark-subtle' : 'text-secondary border-dark border-opacity-25 bg-white shadow-sm hover-bg-light'}`}
              onClick={() => userGuideModal.open()}
              title="DevNotes Guide"
              style={{ width: '38px', height: '38px', transition: 'all 0.2s', border: '1px solid' }}
              icon="bi-question-lg fs-5"
            />
            <div className="position-relative" ref={dropdownRef}>
              {/* Profile Button (Trigger) */}
              <div 
                className={`profile-btn d-flex align-items-center rounded-pill px-3 py-2 border ${theme === 'dark' ? 'border-light border-opacity-25 bg-dark' : 'border-dark border-opacity-25 bg-white shadow-sm'}`}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease', height: '38px' }}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <i className={`bi bi-person-circle me-2 fs-5 d-flex ${theme === 'dark' ? 'text-light' : 'text-secondary'}`}></i>
                <span className={`fw-semibold small ${theme === 'dark' ? 'text-light' : 'text-dark'}`}>
                  {user.user_metadata?.display_name || user.email}
                </span>
                <i className={`bi bi-chevron-down ms-2 small ${theme === 'dark' ? 'text-secondary' : 'text-muted'}`}></i>
              </div>

              {/* Dropdown Menu */}
              <div 
                className={`dropdown-menu shadow-lg border-0 position-absolute end-0 mt-2 py-2 ${theme === 'dark' ? 'dropdown-menu-dark bg-dark' : 'bg-white'}`}
                style={{ 
                  width: '220px', 
                  zIndex: 1050, 
                  display: 'block', 
                  borderRadius: '12px',
                  transformOrigin: 'top right',
                  opacity: showDropdown ? 1 : 0,
                  transform: showDropdown ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
                  pointerEvents: showDropdown ? 'auto' : 'none',
                  visibility: showDropdown ? 'visible' : 'hidden',
                  transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.2s'
                }}
              >
                    <li>
                      <button 
                        className="dropdown-item d-flex align-items-center py-2"
                        onClick={() => {
                          setShowDropdown(false);
                          editProfileModal.open();
                        }}
                      >
                        <i className={`bi bi-pencil-square me-3 ${theme === 'dark' ? 'text-light opacity-75' : 'text-secondary'}`}></i>
                        Edit Profile
                      </button>
                    </li>
                    <li><hr className={`dropdown-divider ${theme === 'dark' ? 'border-light border-opacity-10' : ''}`} /></li>
                    <li>
                      <div className="px-3 py-2">
                        <span className={`small fw-bold text-uppercase ${theme === 'dark' ? 'text-secondary' : 'text-muted'} mb-2 d-block`} style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Theme</span>
                        <div className="d-flex gap-2">
                          <button 
                            className={`btn rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm ${theme === 'light' ? 'border border-2 border-primary' : 'border border-dark border-opacity-25'}`}
                            style={{ width: '32px', height: '32px', background: '#ffffff' }}
                            onClick={() => setTheme('light')}
                            title="Day Mode"
                          >
                            {theme === 'light' && <i className="bi bi-check text-primary fs-6"></i>}
                          </button>
                          
                          <button 
                            className={`btn rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm ${theme === 'blue' ? 'border border-2 border-primary' : 'border border-dark border-opacity-25'}`}
                            style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #e0e7ff, #cffafe)' }}
                            onClick={() => setTheme('blue')}
                            title="Blue Mode"
                          >
                            {theme === 'blue' && <i className="bi bi-check text-primary fs-6"></i>}
                          </button>

                          <button 
                            className={`btn rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm ${theme === 'dark' ? 'border border-2 border-light border-opacity-50' : 'border border-light border-opacity-10'}`}
                            style={{ width: '32px', height: '32px', background: '#212529' }}
                            onClick={() => setTheme('dark')}
                            title="Night Mode"
                          >
                            {theme === 'dark' && <i className="bi bi-check text-white fs-6"></i>}
                          </button>
                        </div>
                      </div>
                    </li>
                    <li><hr className={`dropdown-divider ${theme === 'dark' ? 'border-light border-opacity-10' : ''}`} /></li>
                    <li>
                      <button 
                        className="dropdown-item py-2 d-flex align-items-center text-danger fw-medium" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-3"></i>
                        Sign Out
                      </button>
                    </li>
                  </div>
            </div>
          </div>
        )}
        </div>
      </div>
      
      {editProfileModal.isOpen && (
        <EditProfileModal 
          show={editProfileModal.isOpen} 
          onClose={() => editProfileModal.close()} 
          user={user} 
        />
      )}
      
      {userGuideModal.isOpen && (
        <UserGuideModal
          show={userGuideModal.isOpen}
          onClose={() => userGuideModal.close()}
        />
      )}
    </>
  );
}
