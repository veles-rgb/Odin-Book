import { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useApiFetch } from '../hooks/useApiFetch';

const DeleteComment = ({ comment, onCommentDeleted }) => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiFetch } = useApiFetch();

  const deleteComment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (user.id !== comment.user_id) {
        setError('You cannot delete this comment.');
        return;
      }

      const response = await apiFetch(`/api/comment/delete/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      onCommentDeleted?.(comment.id);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setError('Something went wrong.');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={deleteComment} disabled={isLoading}>
        {isLoading ? 'Deleting...' : 'Delete'}
      </button>

      {error && <div>{error}</div>}
    </>
  );
};

export default DeleteComment;
