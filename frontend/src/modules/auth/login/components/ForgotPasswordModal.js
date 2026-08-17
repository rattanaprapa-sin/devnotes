import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../../config/supabase';
import AppModal from '../../../../shared/ui/AppModal';
import AppInput from '../../../../shared/ui/AppInput';
import AppButton from '../../../../shared/ui/AppButton';

export default function ForgotPasswordModal({ show, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '' }
  });

  const emailValue = watch('email');

  if (!show) return null;

  const onSubmit = async (data) => {
    if (!data.email?.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(data.email.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (supabaseError) throw supabaseError;
      
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
    reset();
    onClose();
  };

  return (
    <AppModal
      show={show}
      onClose={handleClose}
      title="Reset Password"
    >
      {success ? (
        <div className="text-center py-3">
          <i className="bi bi-envelope-check text-success mb-3 d-block" style={{ fontSize: '3rem' }}></i>
          <h5 className="fw-bold text-dark">Check your email</h5>
          <p className="text-secondary mb-0">
            We've sent a password reset link to <strong>{emailValue}</strong>
          </p>
          <AppButton variant="dark" className="w-100 rounded-pill py-2 mt-4" onClick={handleClose}>
            Back to Login
          </AppButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="mb-4 text-dark opacity-75 lh-base">
            Enter your email address below and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="alert alert-danger rounded-3 py-2 small mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          <AppInput 
            type="email"
            label="Email Address"
            placeholder="Enter your email"
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
            icon="bi-envelope"
          />

          <AppButton 
            type="submit" 
            variant="dark"
            className="w-100 rounded-pill py-2 mt-2"
            disabled={loading || !emailValue?.trim()}
            isLoading={loading}
            loadingText="Sending..."
          >
            Send Reset Link
          </AppButton>
        </form>
      )}
    </AppModal>
  );
}
