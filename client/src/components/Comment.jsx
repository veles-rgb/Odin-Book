import styles from './Comment.module.css';
import { useState } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';

import OptionsMenu from './OptionsMenu';
import CommentReplySection from './CommentReplySection';
import LikeButton from './LikeButton';
import DeleteComment from './DeleteComment';

const Comment = ({ comment, onCommentDelete }) => {
  const { user } = useAuthContext();
  const [viewReplies, setViewReplies] = useState(false);
  const [viewReplyBox, setViewReplyBox] = useState(false);

  const [userReply, setUserReply] = useState('');
  const [userReplyLoading, setUserReplyLoading] = useState(false);
  const [userReplyError, setUserReplyError] = useState(null);

  const [replyRefreshKey, setReplyRefreshKey] = useState(0);

  const { apiFetch } = useApiFetch();

  const userOwnsComment = () => {
    return user.id === comment.user_id;
  };

  const handleViewReplies = () => {
    setViewReplies((prev) => !prev);
  };

  const handleViewReplyBox = () => {
    setViewReplyBox((prev) => !prev);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    try {
      setUserReplyLoading(true);
      setUserReplyError(null);

      const response = await apiFetch(`/api/comment/reply/${comment.id}`, {
        method: 'POST',
        body: JSON.stringify({ content: userReply }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUserReplyError(data.error);
      }

      setUserReply('');
      setViewReplyBox(false);
      setViewReplies(true);
      setReplyRefreshKey((prev) => prev + 1);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setUserReplyError('Something went wrong.');
      return;
    } finally {
      setUserReplyLoading(false);
    }
  };

  return (
    <article className={styles.comment}>
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

        {userOwnsComment() && (
          <OptionsMenu>
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

        <button onClick={handleViewReplyBox}>Reply</button>

        <LikeButton
          target="comment"
          targetId={comment.id}
          likedByMe={comment.likedByMe}
          likeCount={comment.likeCount}
        />
      </div>

      {viewReplyBox && (
        <form onSubmit={handleReplySubmit}>
          <textarea
            value={userReply}
            onChange={(e) => setUserReply(e.target.value)}
            placeholder="Type your reply..."
          ></textarea>
          <button type="submit" disabled={userReplyLoading}>
            Send
          </button>

          {userReplyError && <div>{userReplyError}</div>}
        </form>
      )}
      {viewReplies && (
        <CommentReplySection
          commentId={comment.id}
          refreshKey={replyRefreshKey}
        />
      )}
    </article>
  );
};

export default Comment;
