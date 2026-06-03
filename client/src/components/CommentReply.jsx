import styles from './styles/CommentReply.module.css';
import { useState } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

import LikeButton from './LikeButton';
import OptionsMenu from './OptionsMenu';
import DeleteComment from './DeleteComment';

const CommentReply = ({ comment, onReplyCreated, onReplyDeleted }) => {
  const { user } = useAuthContext();
  const [showReply, setShowReply] = useState(false);
  const [userReply, setUserReply] = useState('');
  const [userReplyLoading, setUserReplyLoading] = useState(false);
  const [userReplyError, setUserReplyError] = useState(null);

  const { apiFetch } = useApiFetch();

  const userOwnsReply = () => {
    return user.id === comment.user_id;
  };

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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setUserReplyError('Something went wrong.');
    } finally {
      setUserReplyLoading(false);
    }
  };

  return (
    <article className={styles.reply}>
      <div className={styles.header}>
        <img
          className={styles.avatar}
          src={
            comment.user.profile_picture_url ||
            'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
          }
          alt={`${comment.user.username}'s profile picture`}
        />

        <div className={styles.userInfo}>
          <div className={styles.username}>{comment.user.username}</div>
          <div className={styles.timestamp}>{comment.updated_at}</div>
        </div>

        {userOwnsReply() && (
          <OptionsMenu>
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
    </article>
  );
};

export default CommentReply;
