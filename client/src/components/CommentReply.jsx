import styles from './styles/CommentReply.module.css';
import { useState } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

import LikeButton from './LikeButton';
import OptionsMenu from './OptionsMenu';
import DeleteComment from './DeleteComment';
import EditCommentModal from './EditCommentModal';

import Tooltip from './Tooltip';
import { FaRegClock } from 'react-icons/fa';
import { formatDateTime } from '../utils/formatDateTime';

const CommentReply = ({
  comment,
  onReplyCreated,
  onReplyDeleted,
  onReplyEdited,
}) => {
  const { user } = useAuthContext();
  const [showReply, setShowReply] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [userReply, setUserReply] = useState('');
  const [userReplyLoading, setUserReplyLoading] = useState(false);
  const [userReplyError, setUserReplyError] = useState(null);

  const { apiFetch } = useApiFetch();

  const userOwnsReply = user.id === comment.user_id;
  const commentHasBeenUpdated = comment.created_at !== comment.updated_at;

  const handleShowReply = () => {
    setShowReply((prev) => !prev);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    try {
      setUserReplyLoading(true);
      setUserReplyError(null);

      const response = await apiFetch(`/api/comment/reply/${comment.id}`, {
        method: 'POST',
        body: JSON.stringify({
          content: userReply,
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setUserReplyError(data.error);
        return;
      }

      setUserReply('');
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
          className={styles.replyButton}
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
          <form onSubmit={handleSubmitReply} className={styles.replyForm}>
            <textarea
              className={styles.replyTextarea}
              placeholder={`Reply to ${comment.user.username}`}
              value={userReply}
              onChange={(e) => setUserReply(e.target.value)}
            />

            <button
              type="submit"
              className={styles.sendButton}
              disabled={userReplyLoading}
            >
              Send
            </button>

            {userReplyError && (
              <div className={styles.error}>{userReplyError}</div>
            )}
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
