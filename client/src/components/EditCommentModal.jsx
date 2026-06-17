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
    .required('Comment cannot be blank.')
    .max(1000, 'Comment cannot be longer than 1000 characters.'),
});

const EditCommentModal = ({ comment, onClose, onCommentEdited }) => {
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthContext();
  const { apiFetch } = useApiFetch();

  const userOwnsComment = user.id === comment.user_id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      content: comment.content || '',
    },
  });

  const onSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      if (!userOwnsComment) {
        setServerError('You cannot edit this comment.');
        return;
      }

      const response = await apiFetch(`/api/comment/edit/${comment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content: formData.content.trim(),
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || 'Failed to edit comment.');
        return;
      }

      onCommentEdited?.(data.comment);
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
          <h3>Edit Comment</h3>

          <textarea
            placeholder="Edit your comment..."
            disabled={isLoading}
            {...register('content')}
          />

          <div className="modal-error">{errors.content?.message}</div>

          {serverError && <div className="modal-error">{serverError}</div>}

          <div className="modal-actions">
            <button type="submit" disabled={isLoading} className="actionButton">
              {isLoading ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cancelButton"
            >
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
