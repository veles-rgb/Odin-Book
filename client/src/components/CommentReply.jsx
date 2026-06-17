import styles from './styles/CommentReply.module.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

import LikeButton from './LikeButton';
import OptionsMenu from './OptionsMenu';
import DeleteComment from './DeleteComment';
import EditCommentModal from './EditCommentModal';

import Tooltip from './Tooltip';
import { FaRegClock } from 'react-icons/fa';
import { formatDateTime } from '../utils/formatDateTime';

const schema = yup.object({
  content: yup
    .string()
    .trim()
    .required('Reply cannot be blank.')
    .max(1000, 'Reply cannot exceed 1000 characters.'),
});

const CommentReply = ({
  comment,
  onReplyCreated,
  onReplyDeleted,
  onReplyEdited,
}) => {
  const { user } = useAuthContext();

  const [showReply, setShowReply] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [userReplyLoading, setUserReplyLoading] = useState(false);
  const [userReplyError, setUserReplyError] = useState(null);

  const { apiFetch } = useApiFetch();

  const userOwnsReply = user.id === comment.user_id;
  const commentHasBeenUpdated = comment.created_at !== comment.updated_at;

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

  const handleShowReply = () => {
    setShowReply((prev) => !prev);
    setUserReplyError(null);
  };

  const handleSubmitReply = async (formData) => {
    try {
      setUserReplyLoading(true);
      setUserReplyError(null);

      const response = await apiFetch(`/api/comment/reply/${comment.id}`, {
        method: 'POST',
        body: JSON.stringify({
          content: formData.content.trim(),
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setUserReplyError(data.error || 'Failed to create reply.');
        return;
      }

      reset();
      setShowReply(false);

      onReplyCreated?.(data.comment);
    } catch {
      setUserReplyError('Something went wrong.');
    } finally {
      setUserReplyLoading(false);
    }
  };

  return (
    <article className={styles.reply}>
      <div className={styles.header}>
        <a href={`/profile/${comment.user.id}`}>
          <img
            className={styles.avatar}
            src={
              comment.user.profile_picture_url ||
              'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
            }
            alt={`${comment.user.username}'s profile picture`}
          />
        </a>

        <div className={styles.userInfo}>
          <a href={`/profile/${comment.user.id}`}>
            <div className={styles.username}>{comment.user.username}</div>
          </a>

          <div className={styles.dateTimeContainer}>
            <div className={styles.timestamp}>
              {formatDateTime(comment.created_at)}
            </div>

            {commentHasBeenUpdated && (
              <Tooltip
                content={`Updated: ${formatDateTime(comment.updated_at)}`}
              >
                <FaRegClock />
              </Tooltip>
            )}
          </div>
        </div>

        {userOwnsReply && (
          <OptionsMenu>
            <button type="button" onClick={() => setShowEditModal(true)}>
              Edit
            </button>

            <DeleteComment
              comment={comment}
              onCommentDeleted={onReplyDeleted}
            />
          </OptionsMenu>
        )}
      </div>

      <div className={styles.content}>
        {comment.replyingToUser && (
          <span className={styles.replyingTo}>
            @{comment.replyingToUser.username}{' '}
          </span>
        )}

        {comment.content}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.replyButton}`}
          onClick={handleShowReply}
        >
          Reply
        </button>

        <LikeButton
          target="comment"
          targetId={comment.id}
          likedByMe={comment.likedByMe}
          likeCount={comment.likeCount}
        />
      </div>

      {showReply && (
        <div className={styles.replyFormWrapper}>
          <form
            onSubmit={handleSubmit(handleSubmitReply)}
            className={styles.replyForm}
          >
            <textarea
              className={styles.replyTextarea}
              placeholder={`Reply to ${comment.user.username}`}
              disabled={userReplyLoading}
              {...register('content')}
            />

            <div className={styles.error}>{errors.content?.message}</div>

            {userReplyError && (
              <div className={styles.error}>{userReplyError}</div>
            )}

            <button
              type="submit"
              className={`actionButton ${styles.sendButton}`}
              disabled={userReplyLoading}
            >
              {userReplyLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {showEditModal && (
        <EditCommentModal
          comment={comment}
          onClose={() => setShowEditModal(false)}
          onCommentEdited={onReplyEdited}
        />
      )}
    </article>
  );
};

export default CommentReply;
