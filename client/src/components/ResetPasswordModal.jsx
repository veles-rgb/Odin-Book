import styles from './styles/ResetPasswordModal.module.css';

import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useApiFetch } from '../hooks/useApiFetch';

const ResetPasswordModal = ({ onClose, onPasswordChanged }) => {
  const { apiFetch } = useApiFetch();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const schema = yup.object().shape({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .matches(/[a-z]/, 'Password must contain a lowercase letter')
      .matches(/[A-Z]/, 'Password must contain an uppercase letter')
      .matches(/[0-9]/, 'Password must contain a number'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const response = await apiFetch(`/api/auth/password`, {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || 'Failed to update password.');
        return;
      }

      onPasswordChanged?.();
      onClose();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setServerError('Something went wrong');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      <div className={`modal ${styles.resetPasswordModal}`}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <h3>Reset password</h3>

          <div className={styles.fieldGroup}>
            <label htmlFor="current-password">Current password</label>
            <input
              id="current-password"
              type="password"
              disabled={isLoading}
              {...register('currentPassword')}
            />
            <div className={styles.fieldError}>
              {errors.currentPassword?.message}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              disabled={isLoading}
              {...register('newPassword')}
            />
            <div className={styles.fieldError}>
              {errors.newPassword?.message}
            </div>
          </div>

          {serverError && <div className="modal-error">{serverError}</div>}

          <div className="modal-actions">
            <button type="submit" disabled={isLoading || isSubmitting}>
              {isSubmitting || isLoading ? 'Updating...' : 'Update password'}
            </button>

            <button type="button" disabled={isLoading} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
};

export default ResetPasswordModal;
