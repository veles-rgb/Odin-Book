import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

const EditPostModal = ({ post, onClose, onPostEdited }) => {
  const [editedContent, setEditedContent] = useState(post.content);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();

  const { apiFetch } = useApiFetch();

  const userOwnsPost = user.id === post.user_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      if (!userOwnsPost) {
        setError('You cannot edit this post.');
        return;
      }

      const confirmed = window.confirm(
        'Are you sure you want to edit this post?',
      );

      if (!confirmed) return;

      const trimmedContent = editedContent.trim();

      if (!trimmedContent) {
        setError('Post content cannot be blank.');
        return;
      }

      const response = await apiFetch(`/api/post/edit/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: trimmedContent }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      onPostEdited?.(data.post);
      onClose();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal">
        <form onSubmit={handleSubmit}>
          <h3>Edit Post</h3>

          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="What's on your mind?"
          />

          {error && <div>{error}</div>}

          <div className="modal-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>

            <button type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
};

export default EditPostModal;
