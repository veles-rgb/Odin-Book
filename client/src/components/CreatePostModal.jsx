import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApiFetch } from '../hooks/useApiFetch';

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const [postContent, setPostContent] = useState('');
  const [postIsLoading, setPostIsLoading] = useState(false);
  const [postError, setPostError] = useState(null);

  const { apiFetch } = useApiFetch();

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    try {
      setPostIsLoading(true);
      setPostError(null);

      const response = await apiFetch('/api/post/create', {
        method: 'POST',
        body: JSON.stringify({ content: postContent }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setPostError(data.error);
        return;
      }

      onPostCreated?.(data.post);
      setPostContent('');
      onClose();
    } catch {
      setPostError('Something went wrong.');
    } finally {
      setPostIsLoading(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal">
        <form onSubmit={handlePostSubmit}>
          <h3>Create a new post</h3>

          <textarea
            placeholder="What do you have in mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />

          {postError && <div className="modal-error">{postError}</div>}

          <div className="modal-actions">
            <button type="submit" disabled={postIsLoading}>
              {postIsLoading ? 'Posting...' : 'Post'}
            </button>

            <button type="button" disabled={postIsLoading} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
};

export default CreatePostModal;
