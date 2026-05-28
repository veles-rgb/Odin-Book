import LikeButton from './LikeButton';
import styles from './Comment.module.css';

const Comment = ({ comment }) => {
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
        <button className={styles.replyButton}>
          View replies ({comment.replyCount})
        </button>

        <LikeButton
          target="comment"
          targetId={comment.id}
          likedByMe={comment.likedByMe}
          likeCount={comment.likeCount}
        />
      </div>
    </article>
  );
};

export default Comment;
