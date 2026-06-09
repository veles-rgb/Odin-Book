import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import styles from './styles/Profile.module.css';
import { formatDateTime } from '../utils/formatDateTime';
import { FaRegClock } from 'react-icons/fa';

import Tooltip from '../components/Tooltip';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import EditProfileModal from '../components/EditProfileModal';

const Profile = () => {
  const { identifier } = useParams();
  const { user } = useAuthContext();

  const [profile, setProfile] = useState(null);
  const [relationship, setRelationship] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);

  const [relationshipLoading, setRelationshipLoading] = useState(false);
  const [relationshipError, setRelationshipError] = useState(null);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const { apiFetch } = useApiFetch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch(`/api/user/${identifier}`);

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
          return;
        }

        setProfile(data.profileUser);
        setRelationship(data.relationship);
      } catch {
        setError('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoadingPosts(true);
        setPostsError(null);

        const response = await apiFetch(`/api/post/${identifier}/posts`);

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setPostsError(data.error);
          return;
        }

        setPosts(data.posts);
      } catch {
        setPostsError('Something went wrong.');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  const profileBelongsToUser = profile && user && profile.id === user.id;

  const getRelationshipButtonText = () => {
    if (!relationship) return null;

    if (relationship.outgoingRequestPending) return 'Request sent';
    if (relationship.isFollowing) return 'Following';

    return 'Follow';
  };

  const handleShowCreatePost = () => {
    setShowCreatePost((prev) => !prev);
  };

  const handleRelationshipClick = async () => {
    try {
      setRelationshipLoading(true);
      setRelationshipError(null);

      if (relationship.isFollowing) {
        const response = await apiFetch(`/api/follow/${profile.id}`, {
          method: 'DELETE',
        });

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setRelationshipError(data.error);
          return;
        }

        setRelationship((prev) => ({
          ...prev,
          isFollowing: false,
        }));

        setProfile((prev) => ({
          ...prev,
          followerCount: Math.max(prev.followerCount - 1, 0),
        }));

        return;
      }

      if (relationship.outgoingRequestPending) {
        const response = await apiFetch(`/api/follow/${profile.id}/request`, {
          method: 'DELETE',
        });

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setRelationshipError(data.error);
          return;
        }

        setRelationship((prev) => ({
          ...prev,
          outgoingRequestPending: false,
        }));

        return;
      }

      const response = await apiFetch(`/api/follow/${profile.id}/request`, {
        method: 'POST',
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setRelationshipError(data.error);
        return;
      }

      setRelationship((prev) => ({
        ...prev,
        outgoingRequestPending: true,
      }));
    } catch {
      setRelationshipError('Something went wrong.');
    } finally {
      setRelationshipLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      setRelationshipLoading(true);
      setRelationshipError(null);

      const response = await apiFetch(
        `/api/follow/requests/${profile.id}/accept`,
        {
          method: 'POST',
        },
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setRelationshipError(data.error);
        return;
      }

      setRelationship((prev) => ({
        ...prev,
        incomingRequestPending: false,
        isFollowedBy: true,
      }));

      setProfile((prev) => ({
        ...prev,
        followingCount: prev.followingCount + 1,
      }));
    } catch {
      setRelationshipError('Something went wrong.');
    } finally {
      setRelationshipLoading(false);
    }
  };

  const handleDenyRequest = async () => {
    try {
      setRelationshipLoading(true);
      setRelationshipError(null);

      const response = await apiFetch(
        `/api/follow/requests/${profile.id}/reject`,
        {
          method: 'DELETE',
        },
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setRelationshipError(data.error);
        return;
      }

      setRelationship((prev) => ({
        ...prev,
        incomingRequestPending: false,
      }));
    } catch {
      setRelationshipError('Something went wrong.');
    } finally {
      setRelationshipLoading(false);
    }
  };

  return (
    <main className={styles.profileMain}>
      {isLoading && <div className={styles.loading}>Loading profile...</div>}

      {error && <div className={styles.error}>{error}</div>}

      {!isLoading && !error && profile && relationship && (
        <>
          <section className={styles.profileCard}>
            <div className={styles.profileContent}>
              <img
                className={styles.avatar}
                src={
                  profile.profile_picture_url ||
                  'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                }
                alt={`${profile.username}'s profile picture`}
              />

              <div className={styles.userInfo}>
                <div className={styles.nameRow}>
                  <h1 className={styles.displayName}>
                    {profile.first_name} {profile.last_name}
                  </h1>

                  <Tooltip
                    content={`Joined: ${formatDateTime(profile.created_at)}`}
                  >
                    <FaRegClock className={styles.joinedIcon} />
                  </Tooltip>
                </div>

                <div className={styles.username}>@{profile.username}</div>

                {!profileBelongsToUser && (
                  <div className={styles.relationshipInfo}>
                    {relationship.isFollowedBy && (
                      <span className={styles.followsYou}>Follows you</span>
                    )}

                    {relationship.incomingRequestPending && (
                      <span className={styles.requestNotice}>
                        Wants to follow you
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.profileActions}>
                  {profileBelongsToUser ? (
                    <button
                      type="button"
                      className={styles.relationshipButton}
                      onClick={() => setShowEditProfile((prev) => !prev)}
                    >
                      Edit profile
                    </button>
                  ) : relationship.incomingRequestPending ? (
                    <div className={styles.requestActions}>
                      <button
                        type="button"
                        className={styles.relationshipButton}
                        onClick={handleAcceptRequest}
                        disabled={relationshipLoading}
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={handleDenyRequest}
                        disabled={relationshipLoading}
                      >
                        Deny
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.relationshipButton}
                      onClick={handleRelationshipClick}
                      disabled={relationshipLoading}
                    >
                      {relationshipLoading
                        ? 'Loading...'
                        : getRelationshipButtonText()}
                    </button>
                  )}

                  {relationshipError && (
                    <div className={styles.relationshipError}>
                      {relationshipError}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {profile.followerCount}
                  </span>
                  <span className={styles.statLabel}>Followers</span>
                </div>

                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {profile.followingCount}
                  </span>
                  <span className={styles.statLabel}>Following</span>
                </div>
              </div>
            </div>
          </section>

          {profileBelongsToUser && (
            <div className={styles.createPostWrapper}>
              <button
                type="button"
                className={styles.createPostButton}
                onClick={handleShowCreatePost}
              >
                Create Post
              </button>

              {showCreatePost && (
                <CreatePostModal
                  onClose={() => setShowCreatePost(false)}
                  onPostCreated={(newPost) => {
                    setPosts((prev) => [newPost, ...prev]);
                  }}
                />
              )}
            </div>
          )}

          {showEditProfile && (
            <EditProfileModal
              profile={profile}
              onClose={() => setShowEditProfile(false)}
              onUpdate={(updatedUser) => {
                setProfile((prev) => ({
                  ...prev,
                  ...updatedUser,
                }));

                setPosts((prev) =>
                  prev.map((post) => ({
                    ...post,
                    user: {
                      ...post.user,
                      ...updatedUser,
                    },
                  })),
                );
              }}
            />
          )}

          <section className={styles.postsSection}>
            <h2 className={styles.postsTitle}>Posts</h2>

            {isLoadingPosts && (
              <div className={styles.loading}>Loading posts...</div>
            )}

            {postsError && <div className={styles.error}>{postsError}</div>}

            {!isLoadingPosts && !postsError && posts.length > 0 && (
              <div className={styles.postsContainer}>
                {posts.map((post) => (
                  <PostCard
                    post={post}
                    key={post.id}
                    showViewPostOption={true}
                    onPostDeleted={(deletedPostId) => {
                      setPosts((prev) =>
                        prev.filter((post) => post.id !== deletedPostId),
                      );
                    }}
                    onPostEdited={(updatedPost) => {
                      setPosts((prev) =>
                        prev.map((post) =>
                          post.id === updatedPost.id ? updatedPost : post,
                        ),
                      );
                    }}
                  />
                ))}
              </div>
            )}

            {!isLoadingPosts && !postsError && posts.length === 0 && (
              <div className={styles.emptyPosts}>
                This user has not posted yet.
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default Profile;
