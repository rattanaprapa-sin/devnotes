import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import EditProfileModal from '../../auth/profile/components/EditProfileModal';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
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
          backgroundColor: theme === 'dark' ? 'rgba(33, 37, 41, 0.75)' : (theme === 'blue' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.75)'),
          borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : (theme === 'blue' ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(0,0,0,0.05)'),
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
            <div className="position-relative" ref={dropdownRef}>
              {/* Profile Button (Trigger) */}
              <div 
                className={`profile-btn d-flex align-items-center rounded-pill px-3 py-2 border ${theme === 'dark' ? 'border-secondary border-opacity-25 bg-dark' : 'border-secondary border-opacity-25 bg-white shadow-sm'}`}
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
                        className="dropdown-item py-2 d-flex align-items-center fw-medium" 
                        onClick={() => { setShowEditProfile(true); setShowDropdown(false); }}
                      >
                        <i className={`bi bi-pencil-square me-3 ${theme === 'dark' ? 'text-light opacity-75' : 'text-secondary'}`}></i>
                        Edit Profile
                      </button>
                    </li>
                    <li><hr className={`dropdown-divider ${theme === 'dark' ? 'border-secondary border-opacity-25' : ''}`} /></li>
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
                            className={`btn rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm ${theme === 'dark' ? 'border border-2 border-primary' : 'border-0'}`}
                            style={{ width: '32px', height: '32px', background: '#212529' }}
                            onClick={() => setTheme('dark')}
                            title="Night Mode"
                          >
                            {theme === 'dark' && <i className="bi bi-check text-white fs-6"></i>}
                          </button>
                        </div>
                      </div>
                    </li>
                    <li><hr className={`dropdown-divider ${theme === 'dark' ? 'border-secondary border-opacity-25' : ''}`} /></li>
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
      
      <EditProfileModal 
        show={showEditProfile} 
        onClose={() => setShowEditProfile(false)} 
        user={user} 
      />
    </>
  );
}
