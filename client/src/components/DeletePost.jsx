import { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useApiFetch } from '../hooks/useApiFetch';

const DeletePost = ({ post, onPostDeleted }) => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { apiFetch } = useApiFetch();

  const deletePost = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const confirmed = window.confirm(
        'Are you sure you want to delete this post?',
      );

      if (!confirmed) return;

      if (user.id !== post.user_id) {
        setError('You cannot delete this post.');
        return;
      }

      const response = await apiFetch(`/api/post/delete/${post.id}`, {
        method: 'DELETE',
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete post.');
        return;
      }

      onPostDeleted?.(post.id);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={deletePost} disabled={isLoading}>
        {isLoading ? 'Deleting...' : 'Delete post'}
      </button>

      {error && <div>{error}</div>}
    </>
  );
};

export default DeletePost;
