import styles from './styles/EditProfileModal.module.css';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

const DEFAULT_AVATAR =
  'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';

const schema = yup.object({
  first_name: yup
    .string()
    .trim()
    .required('First name is required')
    .min(1, 'First name must be at least 1 character')
    .max(20, 'First name cannot be longer than 20 characters'),

  last_name: yup
    .string()
    .trim()
    .required('Last name is required')
    .min(1, 'Last name must be at least 1 character')
    .max(40, 'Last name cannot be longer than 40 characters'),

  username: yup
    .string()
    .trim()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username cannot exceed 20 characters')
    .matches(
      /^[a-zA-Z0-9._]+$/,
      'Username can only contain letters, numbers, periods, and underscores',
    ),

  profile_picture_url: yup
    .string()
    .trim()
    .url('Profile picture must be a valid URL')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
});

const EditProfileModal = ({ profile, onUpdate, onClose }) => {
  const { user } = useAuthContext();
  const { apiFetch } = useApiFetch();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      username: profile.username || '',
      profile_picture_url: profile.profile_picture_url || '',
    },
  });

  const profilePictureUrl = useWatch({
    control,
    name: 'profile_picture_url',
  });

  const onSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const response = await apiFetch(`/api/user/update/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          username: formData.username.trim(),
          profile_picture_url: formData.profile_picture_url || null,
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || 'Failed to update profile.');
        return;
      }

      onUpdate?.(data.user);
      onClose();
    } catch {
      setServerError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className={`modal ${styles.editProfileModal}`}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <h3>Edit Profile</h3>

          <div className={styles.avatarPreviewWrapper}>
            <img
              className={styles.avatarPreview}
              src={profilePictureUrl || DEFAULT_AVATAR}
              alt="Profile preview"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="first-name">First name</label>
            <input
              id="first-name"
              type="text"
              disabled={isLoading}
              {...register('first_name')}
            />
            <div className={styles.fieldError}>
              {errors.first_name?.message}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="last-name">Last name</label>
            <input
              id="last-name"
              type="text"
              disabled={isLoading}
              {...register('last_name')}
            />
            <div className={styles.fieldError}>{errors.last_name?.message}</div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              disabled={isLoading}
              {...register('username')}
            />
            <div className={styles.fieldError}>{errors.username?.message}</div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="profile-picture-url">Profile picture URL</label>
            <input
              id="profile-picture-url"
              type="url"
              disabled={isLoading}
              placeholder="https://example.com/avatar.jpg"
              {...register('profile_picture_url')}
            />
            <div className={styles.fieldError}>
              {errors.profile_picture_url?.message}
            </div>
          </div>

          {serverError && <div className="modal-error">{serverError}</div>}

          <div className="modal-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>

            <button type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
};

export default EditProfileModal;
