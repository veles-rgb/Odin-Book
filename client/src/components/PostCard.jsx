import { useState } from 'react';
import styles from './PostCard.module.css';
import LikeButton from './LikeButton';
import { useAuthContext } from '../hooks/useAuthContext';

import CommentSection from './CommentSection';
import OptionsMenu from './OptionsMenu';

const PostCard = ({ post }) => {
  const [viewComments, setViewComments] = useState(false);

  const { user } = useAuthContext();

  const HandleShowComments = () => {
    setViewComments((prev) => !prev);
  };

  const userOwnsPost = () => {
    return user.id === post.user_id;
  };

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

        {userOwnsPost() && (
          <OptionsMenu className={styles.dropdown}>
            <div>Test</div>
            <div>Test</div>
          </OptionsMenu>
        )}
      </div>

      <div className={styles.content}>{post.content}</div>

      <div className={styles.footer}>
        <button className={styles.commentsButton} onClick={HandleShowComments}>
          {post.commentCount > 0
            ? `View comments (${post.commentCount})`
            : 'Add comment'}
        </button>

        <LikeButton
          target={'post'}
          targetId={post.id}
          likedByMe={post.likedByMe}
          likeCount={post.likeCount}
        />
      </div>
      {viewComments && <CommentSection postId={post.id} />}
    </article>
  );
};

export default PostCard;
