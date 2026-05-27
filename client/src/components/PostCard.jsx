import styles from './PostCard.module.css';
import LikeButton from './LikeButton';

const PostCard = ({ post }) => {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <img
          className={styles.avatar}
          src={
            post.user.profile_picture_url ||
            'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
          }
          alt={`${post.user.username}'s profile picture`}
        />

        <div className={styles.userInfo}>
          <div className={styles.username}>{post.user.username}</div>

          <div className={styles.timestamp}>{post.updated_at}</div>
        </div>
      </div>

      <div className={styles.content}>{post.content}</div>

      <div className={styles.footer}>
        <button className={styles.commentsButton}>
          View comments ({post.commentCount})
        </button>

        <LikeButton
          target={'post'}
          targetId={post.id}
          likedByMe={post.likedByMe}
          likeCount={post.likeCount}
        />
      </div>
    </article>
  );
};

export default PostCard;
