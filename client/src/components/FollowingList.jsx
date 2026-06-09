import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApiFetch } from '../hooks/useApiFetch';
import { useParams, Link } from 'react-router-dom';

const FollowingList = ({ onClose }) => {
  const { identifier } = useParams();

  const [following, setFollowing] = useState([]);
  const [loadingUserId, setLoadingUserId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { apiFetch } = useApiFetch();

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch(`/api/follow/${identifier}/following`);

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
          return;
        }

        setFollowing(data.following);
      } catch {
        setError('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  const handleFollow = async (userId) => {
    try {
      setLoadingUserId(userId);

      const response = await apiFetch(`/api/follow/${userId}/request`, {
        method: 'POST',
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setFollowing((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, outgoingRequestPending: true } : user,
        ),
      );
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      setLoadingUserId(userId);

      const response = await apiFetch(`/api/follow/${userId}/request`, {
        method: 'DELETE',
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setFollowing((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, outgoingRequestPending: false }
            : user,
        ),
      );
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleUnfollow = async (userId, username) => {
    const confirmed = window.confirm(`Unfollow @${username}?`);

    if (!confirmed) return;

    try {
      setLoadingUserId(userId);

      const response = await apiFetch(`/api/follow/${userId}`, {
        method: 'DELETE',
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setFollowing((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isFollowing: false } : user,
        ),
      );
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoadingUserId(null);
    }
  };

  const renderActionButton = (user) => {
    if (user.isCurrentUser) return null;

    if (user.isFollowing) {
      return (
        <button
          type="button"
          className="user-list-secondary-button"
          disabled={loadingUserId === user.id}
          onClick={() => handleUnfollow(user.id, user.username)}
        >
          {loadingUserId === user.id ? 'Loading...' : 'Following'}
        </button>
      );
    }

    if (user.outgoingRequestPending) {
      return (
        <button
          type="button"
          className="user-list-secondary-button"
          disabled={loadingUserId === user.id}
          onClick={() => handleCancelRequest(user.id)}
        >
          {loadingUserId === user.id ? 'Loading...' : 'Request sent'}
        </button>
      );
    }

    return (
      <button
        type="button"
        className="user-list-primary-button"
        disabled={loadingUserId === user.id}
        onClick={() => handleFollow(user.id)}
      >
        {loadingUserId === user.id ? 'Loading...' : 'Follow'}
      </button>
    );
  };

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal">
        <div className="modal-header">
          <h3>Following</h3>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {isLoading && <div>Loading following...</div>}

        {error && <div className="modal-error">{error}</div>}

        {!isLoading && !error && following.length === 0 && (
          <div>Not following anyone yet.</div>
        )}

        {!isLoading && !error && following.length > 0 && (
          <ul className="user-list">
            {following.map((user) => (
              <li className="user-list-item" key={user.id}>
                <Link
                  to={`/profile/${user.username}`}
                  className="user-list-user"
                  onClick={onClose}
                >
                  <img
                    className="user-list-avatar"
                    src={
                      user.profile_picture_url ||
                      'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                    }
                    alt={`${user.username}'s profile`}
                  />

                  <div className="user-list-info">
                    <div className="user-list-name">
                      {user.first_name} {user.last_name}
                    </div>

                    <div className="user-list-username">@{user.username}</div>
                  </div>
                </Link>

                {renderActionButton(user)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>,
    document.body,
  );
};

export default FollowingList;
