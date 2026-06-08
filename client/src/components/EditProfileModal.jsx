import styles from './styles/EditProfileModal.module.css';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

const EditProfileModal = ({ profile, onUpdate, onClose }) => {
  const { user } = useAuthContext();
  const [firstName, setFirstName] = useState(profile.first_name || '');
  const [lastName, setLastName] = useState(profile.last_name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    profile.profile_picture_url || '',
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { apiFetch } = useApiFetch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedUsername = username.trim();
      const trimmedProfilePictureUrl = profilePictureUrl.trim();

      if (!trimmedFirstName) {
        setError('First name is required.');
        return;
      }

      if (!trimmedLastName) {
        setError('Last name is required.');
        return;
      }

      if (!trimmedUsername) {
        setError('Username is required.');
        return;
      }

      const response = await apiFetch(`/api/user/update/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          username: trimmedUsername,
          profile_picture_url: trimmedProfilePictureUrl || null,
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      onUpdate?.(data.user);
      onClose();
    } catch {
      setError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className={`modal ${styles.editProfileModal}`}>
        <form onSubmit={handleSubmit}>
          <h3>Edit Profile</h3>

          <div className={styles.avatarPreviewWrapper}>
            <img
              className={styles.avatarPreview}
              src={
                profilePictureUrl ||
                'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
              }
              alt="Profile preview"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="first-name">First name</label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="last-name">Last name</label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="profile-picture-url">Profile picture URL</label>
            <input
              id="profile-picture-url"
              type="url"
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
              disabled={isLoading}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

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
