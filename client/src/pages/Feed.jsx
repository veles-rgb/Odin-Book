import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiFetch } from '../hooks/useApiFetch';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

import styles from './styles/Feed.module.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showCreatePost, setShowCreatePost] = useState(false);

  const navigate = useNavigate();
  const { apiFetch } = useApiFetch();

  const fetchPosts = async (pageToFetch) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiFetch(
        `/api/post/feed?page=${pageToFetch}&limit=10`,
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      if (pageToFetch === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setHasNextPage(data.hasNextPage);
    } catch {
      setError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts(1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShowCreatePost = () => {
    setShowCreatePost((prev) => !prev);
  };

  const handleShowMore = async () => {
    const nextPage = page + 1;

    await fetchPosts(nextPage);

    setPage(nextPage);
  };

  return (
    <div className={styles.feedPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Feed</h1>
          <p className={styles.subtitle}>
            Posts from you and people you follow.
          </p>
        </div>

        <div className={styles.headerBtns}>
          <button
            type="button"
            className={styles.createPostBtn}
            onClick={handleShowCreatePost}
          >
            Create Post
          </button>

          <button
            type="button"
            className={styles.homeBtn}
            onClick={() => navigate('/')}
          >
            Explore
          </button>
        </div>
      </div>

      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPostCreated={(newPost) => {
            setPosts((prev) => [newPost, ...prev]);
          }}
        />
      )}

      {error && <div className={styles.error}>{error}</div>}

      {!isLoading && !error && posts.length === 0 && (
        <div className={styles.emptyFeed}>
          No feed posts yet. Follow some users or create a post.
        </div>
      )}

      <div className={styles.postsContainer}>
        {posts.map((post) => (
          <PostCard
            post={post}
            key={post.id}
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

      {hasNextPage && (
        <button
          type="button"
          className={styles.showMoreBtn}
          onClick={handleShowMore}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default Feed;
