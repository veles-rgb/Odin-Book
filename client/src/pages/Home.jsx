import { useState, useEffect } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

import styles from './Home.module.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showCreatePost, setShowCreatePost] = useState(false);

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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
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
    <main className={styles.homePage}>
      <div>
        <button type="button" onClick={handleShowCreatePost}>
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

      {error && <div className={styles.error}>{error}</div>}

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
          />
        ))}
      </div>

      {hasNextPage && (
        <button type="button" onClick={handleShowMore} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Show More'}
        </button>
      )}
    </main>
  );
};

export default Home;
