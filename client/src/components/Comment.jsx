import LikeButton from './LikeButton';
import styles from './Comment.module.css';
import { useState } from 'react';
import CommentReplySection from './CommentReplySection';

const Comment = ({ comment }) => {
  const [viewReplies, setViewReplies] = useState(false);

  const handleViewReplies = () => {
    setViewReplies((prev) => !prev);
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

        <LikeButton
          target="comment"
          targetId={comment.id}
          likedByMe={comment.likedByMe}
          likeCount={comment.likeCount}
        />
      </div>
      {viewReplies && <CommentReplySection commentId={comment.id} />}
    </article>
  );
};

export default Comment;
