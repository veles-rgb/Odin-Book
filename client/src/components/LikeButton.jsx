import { useState } from 'react';
import { BiLike, BiSolidLike } from 'react-icons/bi';
import { useApiFetch } from '../hooks/useApiFetch';

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
        setError(data.error);
        return;
      }

      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={performAction} disabled={isLoading} className="likeButton">
      {liked ? (
        <BiSolidLike style={{ color: 'var(--color-brand)' }} />
      ) : (
        <BiLike style={{ color: 'black' }} />
      )}
      <span style={{ color: liked ? 'var(--color-brand)' : 'black' }}>
        {likes}
      </span>
      {error && <span>{error}</span>}
    </button>
  );
};

export default LikeButton;
