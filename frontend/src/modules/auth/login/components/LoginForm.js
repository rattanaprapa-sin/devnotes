import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../../config/supabase';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../../../../shared/components/SuccessModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import useModal from '../../../../shared/hooks/useModal';
import AppInput from '../../../../shared/ui/AppInput';
import AppButton from '../../../../shared/ui/AppButton';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const successModal = useModal(false);
  const forgotModal = useModal(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    clearErrors,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    }
  });

  const passwordValue = watch('password');

  useEffect(() => {
    // Clear errors when toggling sign in / sign up
    clearErrors();
    setError(null);
  }, [isSignUp, clearErrors]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (data.password !== data.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              display_name: data.displayName,
            }
          }
        });
        if (error) throw error;
        successModal.open();
        setIsSignUp(false);
        reset();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      if (err.message === 'Invalid login credentials') {
        setError('Incorrect email or password. Please try again.');
      } else if (err.message === 'User already registered') {
        setError('An account with this email already exists.');
      } else {
        setError(err.message);
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
            onClick={() => setIsSignUp(false)}
            style={{ zIndex: 1 }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`btn flex-grow-1 border-0 rounded-pill position-relative fw-semibold py-2 ${isSignUp ? 'text-dark' : 'text-secondary'}`}
            onClick={() => setIsSignUp(true)}
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div 
            className="overflow-hidden"
            style={{ 
              maxHeight: isSignUp ? '100px' : '0', 
              opacity: isSignUp ? 1 : 0, 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            <AppInput
              label="Display Name"
              placeholder="How should we call you?"
              {...register('displayName', {
                required: isSignUp ? 'Display name is required' : false,
                minLength: { value: 2, message: 'Must be at least 2 characters' }
              })}
              error={errors.displayName?.message}
              tabIndex={isSignUp ? 0 : -1}
              className="border-dark"
            />
          </div>
          
          <AppInput
            label="Email address"
            type="email"
            placeholder="name@example.com"
            {...register('email', {
              required: 'Email is required',
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9@._%+-]/g, '');
              },
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message}
            className="border-dark"
          />

          <AppInput
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            error={errors.password?.message}
            className="border-dark"
          />
          
          <div 
            className="overflow-hidden"
            style={{ 
              maxHeight: isSignUp ? '100px' : '0', 
              opacity: isSignUp ? 1 : 0, 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            <AppInput
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: isSignUp ? 'Confirm password is required' : false,
                validate: (value) => {
                  if (!isSignUp) return true;
                  return value === passwordValue || 'Passwords do not match';
                }
              })}
              error={errors.confirmPassword?.message}
              tabIndex={isSignUp ? 0 : -1}
              className="border-dark"
            />
          </div>

          <AppButton
            type="submit"
            variant="dark"
            className="w-100 py-2 mb-2"
            isLoading={loading}
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </AppButton>
          
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
              onClick={() => forgotModal.open()}
              tabIndex="-1"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
      <SuccessModal 
        show={successModal.isOpen} 
        onClose={() => successModal.close()}
        title="Account Created!"
        message={
          <>
            Check your email for the login link<br />
            <span className="opacity-75">(if email confirmation is required)</span><br />
            <br />
            or sign in directly to get started.
          </>
        }
      />
      <ForgotPasswordModal 
        show={forgotModal.isOpen} 
        onClose={() => forgotModal.close()} 
      />
    </>
  );
}

