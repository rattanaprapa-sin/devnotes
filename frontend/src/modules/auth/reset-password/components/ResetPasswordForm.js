import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../../config/supabase';
import { useNavigate } from 'react-router-dom';
import AppInput from '../../../../shared/ui/AppInput';
import AppButton from '../../../../shared/ui/AppButton';

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const passwordValue = watch('password');

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

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: data.password
      });

      if (supabaseError) throw supabaseError;
      
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
          <p className="text-secondary small">Please enter your new password below</p>
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
            <AppButton variant="dark" className="w-100 rounded-pill py-2 mt-2" onClick={() => navigate('/')}>
              Go to Home now
            </AppButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <AppInput
              type="password"
              label="New Password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              error={errors.password?.message}
              className="border-secondary"
            />
            
            <AppInput
              type="password"
              label="Confirm New Password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (value) => value === passwordValue || 'Passwords do not match'
              })}
              error={errors.confirmPassword?.message}
              className="border-secondary"
            />

            <AppButton
              type="submit"
              variant="dark"
              className="w-100 rounded-pill py-2 mt-2"
              disabled={loading || !!error}
              isLoading={loading}
              loadingText="Updating..."
            >
              Update Password
            </AppButton>
          </form>
        )}
      </div>
    </div>
  );
}
