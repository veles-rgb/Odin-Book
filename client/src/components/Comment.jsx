import styles from './styles/Comment.module.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

import OptionsMenu from './OptionsMenu';
import CommentReplySection from './CommentReplySection';
import LikeButton from './LikeButton';
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

const Comment = ({ comment, onCommentDelete, onCommentEdited }) => {
  const { user } = useAuthContext();

  const [viewReplies, setViewReplies] = useState(false);
  const [viewReplyBox, setViewReplyBox] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [userReplyLoading, setUserReplyLoading] = useState(false);
  const [userReplyError, setUserReplyError] = useState(null);

  const [replyRefreshKey, setReplyRefreshKey] = useState(0);

  const { apiFetch } = useApiFetch();

  const userOwnsComment = user.id === comment.user_id;
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

  const handleViewReplies = () => {
    setViewReplies((prev) => !prev);
  };

  const handleViewReplyBox = () => {
    setViewReplyBox((prev) => !prev);
    setUserReplyError(null);
  };

  const handleReplySubmit = async (formData) => {
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

      setViewReplyBox(false);
      setViewReplies(true);
      setReplyRefreshKey((prev) => prev + 1);
    } catch {
      setUserReplyError('Something went wrong.');
    } finally {
      setUserReplyLoading(false);
    }
  };

  return (
    <article className={styles.comment}>
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

        {userOwnsComment && (
          <OptionsMenu>
            <button type="button" onClick={() => setShowEditModal(true)}>
              Edit
            </button>

            <DeleteComment
              onCommentDeleted={onCommentDelete}
              comment={comment}
            />
          </OptionsMenu>
        )}
      </div>

      <div className={styles.content}>{comment.content}</div>

      <div className={styles.actions}>
        {comment.replyCount > 0 && (
          <button className={styles.replyButton} onClick={handleViewReplies}>
            {viewReplies
              ? 'Hide replies'
              : `View replies (${comment.replyCount})`}
          </button>
        )}

        <button type="button" onClick={handleViewReplyBox}>
          Reply
        </button>

        <LikeButton
          target="comment"
          targetId={comment.id}
          likedByMe={comment.likedByMe}
          likeCount={comment.likeCount}
        />
      </div>

      {viewReplyBox && (
        <form
          className={styles.replyForm}
          onSubmit={handleSubmit(handleReplySubmit)}
        >
          <textarea
            className={styles.replyTextarea}
            placeholder="Type your reply..."
            disabled={userReplyLoading}
            {...register('content')}
          />

          <div className={styles.replyError}>{errors.content?.message}</div>

          {userReplyError && (
            <div className={styles.replyError}>{userReplyError}</div>
          )}

          <button
            className={styles.replySubmitButton}
            type="submit"
            disabled={userReplyLoading}
          >
            {userReplyLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      )}

      {viewReplies && (
        <CommentReplySection
          commentId={comment.id}
          refreshKey={replyRefreshKey}
        />
      )}

      {showEditModal && (
        <EditCommentModal
          comment={comment}
          onClose={() => setShowEditModal(false)}
          onCommentEdited={onCommentEdited}
        />
      )}
    </article>
  );
};

export default Comment;
