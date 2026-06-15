import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useApiFetch } from '../hooks/useApiFetch';

const schema = yup.object({
  content: yup
    .string()
    .trim()
    .required('Post content cannot be blank.')
    .max(2000, 'Post cannot be longer than 2000 characters.'),
});

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const [postIsLoading, setPostIsLoading] = useState(false);
  const [postError, setPostError] = useState(null);

  const { apiFetch } = useApiFetch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (formData) => {
    try {
      setPostIsLoading(true);
      setPostError(null);

      const response = await apiFetch('/api/post/create', {
        method: 'POST',
        body: JSON.stringify({
          content: formData.content.trim(),
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setPostError(data.error || 'Failed to create post.');
        return;
      }

      onPostCreated?.(data.post);
      reset();
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3>Create a new post</h3>

          <textarea
            placeholder="What do you have in mind?"
            disabled={postIsLoading}
            {...register('content')}
          />

          <div className="modal-error">{errors.content?.message}</div>

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
