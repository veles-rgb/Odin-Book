import { useState } from 'react';
import { BiLike, BiSolidLike } from 'react-icons/bi';

import { useApiFetch } from '../hooks/useApiFetch';
import styles from './styles/LikeButton.module.css';

const LikeButton = ({ target, targetId, likedByMe, likeCount }) => {
  const [liked, setLiked] = useState(likedByMe);
  const [likes, setLikes] = useState(likeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { apiFetch } = useApiFetch();

  const performAction = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint =
        target === 'post'
          ? `/api/like/post/${targetId}`
          : `/api/like/comment/${targetId}`;

      const method = liked ? 'DELETE' : 'POST';

      const response = await apiFetch(endpoint, { method });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update like.');
        return;
      }

      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
    } catch {
      setError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={performAction}
      disabled={isLoading}
      className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
    >
      {liked ? <BiSolidLike /> : <BiLike />}

      <span>{likes}</span>

      {error && <span className={styles.error}>{error}</span>}
    </button>
  );
};

export default LikeButton;
