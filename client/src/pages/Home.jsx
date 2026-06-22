import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiFetch } from '../hooks/useApiFetch';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

import styles from './styles/Home.module.css';

const Home = () => {
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
        `/api/post/home?page=${pageToFetch}&limit=10`,
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
    <div className={styles.homePage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Explore</h1>
          <p className={styles.subtitle}>See the latest posts from everyone.</p>
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
            className={styles.myFeedBtn}
            onClick={() => navigate('/feed')}
          >
            My Feed
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
        <div className={styles.emptyHome}>No posts yet.</div>
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

export default Home;
