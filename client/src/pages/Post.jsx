import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApiFetch } from '../hooks/useApiFetch';
import PostCard from '../components/PostCard';

import styles from './styles/Post.module.css';

const Post = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { apiFetch } = useApiFetch();

  useEffect(() => {
    const getPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch(`/api/post/${postId}`);

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
          return;
        }
        setPost(data.post);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setError('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    getPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return (
    <main className={styles.postPage}>
      {error && <div className={styles.error}>{error}</div>}

      {isLoading && <div className={styles.loading}>Loading post...</div>}

      {!isLoading && post && <PostCard post={post} />}
    </main>
  );
};

export default Post;
