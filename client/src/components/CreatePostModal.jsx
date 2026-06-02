import { useState } from 'react';
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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setPostError('Something went wrong.');
      return;
    } finally {
      setPostIsLoading(false);
    }
  };

  return (
    <dialog open>
      <form onSubmit={handlePostSubmit}>
        <h3>Create a new post</h3>

        <textarea
          placeholder="What do you have in mind?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        ></textarea>

        <button type="submit" disabled={postIsLoading}>
          Post
        </button>
        <button type="button" disabled={postIsLoading} onClick={onClose}>
          Cancel
        </button>

        {postError && <div>{postError}</div>}
      </form>
    </dialog>
  );
};

export default CreatePostModal;
