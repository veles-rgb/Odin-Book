import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/ActivityModal.module.css';
import { useApiFetch } from '../hooks/useApiFetch';

const ActivityModal = ({ onClose, onReceivedCountChange }) => {
  const [activeTab, setActiveTab] = useState('received');

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [error, setError] = useState(null);

  const { apiFetch } = useApiFetch();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [receivedResponse, sentResponse] = await Promise.all([
          apiFetch('/api/follow/requests/received'),
          apiFetch('/api/follow/requests/sent'),
        ]);

        if (!receivedResponse || !sentResponse) return;

        const receivedData = await receivedResponse.json();
        const sentData = await sentResponse.json();

        if (!receivedResponse.ok) {
          setError(receivedData.error || receivedData.message);
          return;
        }

        if (!sentResponse.ok) {
          setError(sentData.error || sentData.message);
          return;
        }

        const received = receivedData.received_follow_requests || [];
        const sent = sentData.sent_follow_requests || [];

        setReceivedRequests(received);
        setSentRequests(sent);
        onReceivedCountChange?.(received.length);
      } catch {
        setError('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async (requestId) => {
    try {
      setLoadingRequestId(requestId);

      const response = await apiFetch(
        `/api/follow/requests/${requestId}/accept`,
        { method: 'POST' },
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message);
        return;
      }

      setReceivedRequests((prev) => {
        const updated = prev.filter((request) => request.id !== requestId);
        onReceivedCountChange?.(updated.length);
        return updated;
      });
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleDeny = async (requestId) => {
    try {
      setLoadingRequestId(requestId);

      const response = await apiFetch(
        `/api/follow/requests/${requestId}/reject`,
        { method: 'DELETE' },
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message);
        return;
      }

      setReceivedRequests((prev) => {
        const updated = prev.filter((request) => request.id !== requestId);
        onReceivedCountChange?.(updated.length);
        return updated;
      });
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleCancelSentRequest = async (receiverId, requestId) => {
    try {
      setLoadingRequestId(requestId);

      const response = await apiFetch(`/api/follow/${receiverId}/request`, {
        method: 'DELETE',
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message);
        return;
      }

      setSentRequests((prev) =>
        prev.filter((request) => request.id !== requestId),
      );
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoadingRequestId(null);
    }
  };

  return (
    <div className={styles.activityModal}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h3 className={styles.title}>Activity</h3>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${
              activeTab === 'received' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('received')}
          >
            Received
          </button>

          <button
            type="button"
            className={`${styles.tab} ${
              activeTab === 'sent' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('sent')}
          >
            Sent
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading && <div className={styles.loading}>Loading activity...</div>}

        {error && <div className={styles.error}>{error}</div>}

        {!isLoading && !error && activeTab === 'received' && (
          <>
            {receivedRequests.length === 0 ? (
              <div className={styles.emptyState}>No received requests yet.</div>
            ) : (
              <div className={styles.requestList}>
                {receivedRequests.map((request) => (
                  <div className={styles.requestCard} key={request.id}>
                    <Link
                      to={`/profile/${request.requester.username}`}
                      className={styles.requestUser}
                      onClick={onClose}
                    >
                      <img
                        className={styles.avatar}
                        src={
                          request.requester.profile_picture_url ||
                          'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                        }
                        alt={`${request.requester.username}'s profile`}
                      />

                      <div className={styles.userInfo}>
                        <div className={styles.name}>
                          {request.requester.first_name}{' '}
                          {request.requester.last_name}
                        </div>

                        <div className={styles.username}>
                          @{request.requester.username}
                        </div>
                      </div>
                    </Link>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.acceptButton}
                        disabled={loadingRequestId === request.id}
                        onClick={() => handleAccept(request.id)}
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        className={styles.denyButton}
                        disabled={loadingRequestId === request.id}
                        onClick={() => handleDeny(request.id)}
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && !error && activeTab === 'sent' && (
          <>
            {sentRequests.length === 0 ? (
              <div className={styles.emptyState}>No sent requests.</div>
            ) : (
              <div className={styles.requestList}>
                {sentRequests.map((request) => (
                  <div className={styles.requestCard} key={request.id}>
                    <Link
                      to={`/profile/${request.receiver.username}`}
                      className={styles.requestUser}
                      onClick={onClose}
                    >
                      <img
                        className={styles.avatar}
                        src={
                          request.receiver.profile_picture_url ||
                          'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                        }
                        alt={`${request.receiver.username}'s profile`}
                      />

                      <div className={styles.userInfo}>
                        <div className={styles.name}>
                          {request.receiver.first_name}{' '}
                          {request.receiver.last_name}
                        </div>

                        <div className={styles.username}>
                          @{request.receiver.username}
                        </div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      className={styles.cancelButton}
                      disabled={loadingRequestId === request.id}
                      onClick={() =>
                        handleCancelSentRequest(request.receiver.id, request.id)
                      }
                    >
                      {loadingRequestId === request.id
                        ? 'Cancelling...'
                        : 'Cancel'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityModal;
