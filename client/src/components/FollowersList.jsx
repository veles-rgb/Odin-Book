import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApiFetch } from '../hooks/useApiFetch';
import { useParams, Link } from 'react-router-dom';

const FollowersList = ({ onClose }) => {
  const { identifier } = useParams();

  const [followers, setFollowers] = useState([]);
  const [loadingUserId, setLoadingUserId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { apiFetch } = useApiFetch();

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch(`/api/follow/${identifier}/followers`);

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
          return;
        }

        setFollowers(data.followers);
      } catch {
        setError('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowers();
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

      setFollowers((prev) =>
        prev.map((follower) =>
          follower.id === userId
            ? { ...follower, outgoingRequestPending: true }
            : follower,
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

      setFollowers((prev) =>
        prev.map((follower) =>
          follower.id === userId
            ? { ...follower, outgoingRequestPending: false }
            : follower,
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

      setFollowers((prev) =>
        prev.map((follower) =>
          follower.id === userId
            ? { ...follower, isFollowing: false }
            : follower,
        ),
      );
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoadingUserId(null);
    }
  };

  const renderActionButton = (follower) => {
    if (follower.isCurrentUser) return null;

    if (follower.isFollowing) {
      return (
        <button
          type="button"
          className="user-list-secondary-button"
          disabled={loadingUserId === follower.id}
          onClick={() => handleUnfollow(follower.id, follower.username)}
        >
          {loadingUserId === follower.id ? 'Loading...' : 'Following'}
        </button>
      );
    }

    if (follower.outgoingRequestPending) {
      return (
        <button
          type="button"
          className="user-list-secondary-button"
          disabled={loadingUserId === follower.id}
          onClick={() => handleCancelRequest(follower.id)}
        >
          {loadingUserId === follower.id ? 'Loading...' : 'Request sent'}
        </button>
      );
    }

    return (
      <button
        type="button"
        className="user-list-primary-button"
        disabled={loadingUserId === follower.id}
        onClick={() => handleFollow(follower.id)}
      >
        {loadingUserId === follower.id ? 'Loading...' : 'Follow'}
      </button>
    );
  };

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal">
        <div className="modal-header">
          <h3>Followers</h3>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {isLoading && <div>Loading followers...</div>}

        {error && <div className="modal-error">{error}</div>}

        {!isLoading && !error && followers.length === 0 && (
          <div>No followers yet.</div>
        )}

        {!isLoading && !error && followers.length > 0 && (
          <ul className="user-list">
            {followers.map((follower) => (
              <li className="user-list-item" key={follower.id}>
                <Link
                  to={`/profile/${follower.username}`}
                  className="user-list-user"
                  onClick={onClose}
                >
                  <img
                    className="user-list-avatar"
                    src={
                      follower.profile_picture_url ||
                      'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                    }
                    alt={`${follower.username}'s profile`}
                  />

                  <div className="user-list-info">
                    <div className="user-list-name">
                      {follower.first_name} {follower.last_name}
                    </div>

                    <div className="user-list-username">
                      @{follower.username}
                    </div>
                  </div>
                </Link>

                {renderActionButton(follower)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>,
    document.body,
  );
};

export default FollowersList;
