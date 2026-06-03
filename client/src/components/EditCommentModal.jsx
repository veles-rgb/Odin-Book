import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

const EditCommentModal = ({ comment, onClose, onCommentEdited }) => {
  const [editedContent, setEditedContent] = useState(comment.content);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthContext();
  const { apiFetch } = useApiFetch();

  const userOwnsComment = user.id === comment.user_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      if (!userOwnsComment) {
        setError('You cannot edit this comment.');
        return;
      }

      const trimmedContent = editedContent.trim();

      if (!trimmedContent) {
        setError('Comment cannot be blank.');
        return;
      }

      const response = await apiFetch(`/api/comment/edit/${comment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: trimmedContent }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      onCommentEdited?.(data.comment);
      onClose();
    } catch {
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
          <h3>Edit Comment</h3>

          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Edit your comment..."
          />

          {error && <div className="modal-error">{error}</div>}

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

export default EditCommentModal;
