import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { supabase } from '../../../../config/supabase';
import AppModal from '../../../../shared/ui/AppModal';
import AppInput from '../../../../shared/ui/AppInput';
import AppButton from '../../../../shared/ui/AppButton';

export default function EditProfileModal({ show, onClose, user }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      displayName: '',
      currentPassword: '',
      password: '',
      confirmPassword: ''
    }
  });

  const watchAll = watch();
  const currentPasswordValue = watchAll.currentPassword;
  const passwordValue = watchAll.password;

  useEffect(() => {
    if (show && user) {
      reset({
        displayName: user.user_metadata?.display_name || '',
        currentPassword: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [show, user, reset]);

  if (!show) return null;

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const updates = {};
      
      // Update display name if changed
      if (data.displayName !== (user.user_metadata?.display_name || '')) {
        updates.data = { display_name: data.displayName };
      }

      // Update password if provided
      if (data.password) {
        if (!data.currentPassword) {
          throw new Error("Please enter your current password");
        }
        if (data.password !== data.confirmPassword) {
          throw new Error("New passwords do not match");
        }

        // Verify current password first to ensure security
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: data.currentPassword
        });

        if (verifyError) {
          throw new Error("Current password is incorrect");
        }

        updates.password = data.password;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase.auth.updateUser(updates);
        if (updateError) throw updateError;
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

  const hasDisplayNameChanged = watchAll.displayName?.trim() !== (user?.user_metadata?.display_name || '');
  const hasAnyPasswordInput = !!(watchAll.currentPassword?.trim() || watchAll.password?.trim() || watchAll.confirmPassword?.trim());
  const isPasswordComplete = !!(watchAll.currentPassword?.trim() && watchAll.password?.trim() && watchAll.confirmPassword?.trim());

  const canSubmit = 
    (!hasAnyPasswordInput && hasDisplayNameChanged && watchAll.displayName?.trim() !== '') || 
    (isPasswordComplete);

  const footer = (
    <div className="w-100 d-flex gap-2">
      <AppButton 
        variant="outline-secondary" 
        className="fw-medium rounded-pill flex-grow-1" 
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </AppButton>
      <AppButton 
        type="submit" 
        form="edit-profile-form"
        variant="dark" 
        className="fw-medium rounded-pill flex-grow-1"
        disabled={loading || !canSubmit}
        isLoading={loading}
        loadingText="Saving..."
      >
        {loading ? '' : 'Save Changes'}
      </AppButton>
    </div>
  );

  return (
    <AppModal
      show={show}
      onClose={onClose}
      title="Edit Profile"
      footer={footer}
    >
      <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
        <AppInput
          label="Display Name"
          placeholder="How should we call you?"
          {...register('displayName', {
            required: 'Display name is required',
            minLength: { value: 2, message: 'Must be at least 2 characters' }
          })}
          error={errors.displayName?.message}
        />

        <hr className="text-secondary opacity-25 my-4" />
        <p className="text-secondary small fw-semibold mb-3">Change Password (Optional)</p>

        <AppInput
          type="password"
          label="Current Password"
          placeholder="Current password"
          {...register('currentPassword')}
          error={errors.currentPassword?.message}
        />

        <AppInput
          type="password"
          label="New Password"
          placeholder="New password"
          {...register('password', {
            validate: (value) => {
              if (currentPasswordValue && !value) return 'New password is required';
              if (value && value.length < 6) return 'Must be at least 6 characters';
              return true;
            }
          })}
          error={errors.password?.message}
          disabled={!currentPasswordValue?.trim()}
        />

        <AppInput
          type="password"
          label="Confirm New Password"
          placeholder="Confirm password"
          {...register('confirmPassword', {
            validate: (value) => {
              if (passwordValue && !value) return 'Please confirm your new password';
              if (passwordValue && value !== passwordValue) return 'Passwords do not match';
              return true;
            }
          })}
          error={errors.confirmPassword?.message}
          disabled={!passwordValue?.trim()}
        />
      </form>
    </AppModal>
  );
}
