import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

const schema = yup.object({
  content: yup
    .string()
    .trim()
    .required('Post content cannot be blank.')
    .max(2000, 'Post cannot be longer than 2000 characters.'),
});

const EditPostModal = ({ post, onClose, onPostEdited }) => {
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthContext();
  const { apiFetch } = useApiFetch();

  const userOwnsPost = user.id === post.user_id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      content: post.content || '',
    },
  });

  const onSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      if (!userOwnsPost) {
        setServerError('You cannot edit this post.');
        return;
      }

      const confirmed = window.confirm(
        'Are you sure you want to edit this post?',
      );

      if (!confirmed) return;

      const response = await apiFetch(`/api/post/edit/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content: formData.content.trim(),
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || 'Failed to edit post.');
        return;
      }

      onPostEdited?.(data.post);
      onClose();
    } catch {
      setServerError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3>Edit Post</h3>

          <textarea
            placeholder="What's on your mind?"
            disabled={isLoading}
            {...register('content')}
          />

          <div className="modal-error">{errors.content?.message}</div>

          {serverError && <div className="modal-error">{serverError}</div>}

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
