import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useApiFetch } from '../hooks/useApiFetch';
import Comment from './Comment';
import styles from './styles/CommentSection.module.css';

const schema = yup.object({
  content: yup
    .string()
    .trim()
    .required('Comment cannot be blank.')
    .max(1000, 'Comment cannot exceed 1000 characters.'),
});

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userCommentLoading, setUserCommentLoading] = useState(false);
  const [userCommentError, setUserCommentError] = useState(null);

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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch(`/api/post/${postId}/comments`);

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load comments.');
          return;
        }

        setComments(data.comments);
      } catch {
        setError('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSubmitComment = async (formData) => {
    try {
      setUserCommentLoading(true);
      setUserCommentError(null);

      const response = await apiFetch(`/api/comment/create/${postId}`, {
        method: 'POST',
        body: JSON.stringify({
          content: formData.content.trim(),
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setUserCommentError(data.error || 'Failed to create comment.');
        return;
      }

      setComments((prev) => [...prev, data.comment]);
      reset();
    } catch {
      setUserCommentError('Something went wrong.');
    } finally {
      setUserCommentLoading(false);
    }
  };

  return (
    <section className={styles.commentSection}>
      <h3 className={styles.title}>Comments</h3>

      {error && <div className={styles.error}>{error}</div>}
      {isLoading && <div className={styles.loading}>Loading comments...</div>}

      {!isLoading && !error && (
        <form
          className={styles.commentForm}
          onSubmit={handleSubmit(handleSubmitComment)}
        >
          <label htmlFor="comment">Leave a comment</label>

          <textarea
            id="comment"
            placeholder="Say something..."
            disabled={userCommentLoading}
            {...register('content')}
          />

          <div className={styles.formError}>{errors.content?.message}</div>

          {userCommentError && (
            <div className={styles.formError}>{userCommentError}</div>
          )}

          <button
            type="submit"
            disabled={userCommentLoading}
            className="actionButton"
          >
            {userCommentLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      )}

      {!isLoading && comments.length > 0 && (
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <Comment
              comment={comment}
              key={comment.id}
              onCommentDelete={(deletedCommentId) => {
                setComments((prev) =>
                  prev.filter((comment) => comment.id !== deletedCommentId),
                );
              }}
              onCommentEdited={(updatedComment) => {
                setComments((prev) =>
                  prev.map((comment) =>
                    comment.id === updatedComment.id ? updatedComment : comment,
                  ),
                );
              }}
            />
          ))}
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <div className={styles.empty}>No comments yet.</div>
      )}
    </section>
  );
};

export default CommentSection;
