import { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import styles from './styles/PostCard.module.css';

import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import OptionsMenu from './OptionsMenu';
import DeletePost from './DeletePost';
import EditPostModal from './EditPostModal';

const PostCard = ({ post, onPostDeleted, onPostEdited }) => {
  const [viewComments, setViewComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { user } = useAuthContext();

  const HandleShowComments = () => {
    setViewComments((prev) => !prev);
  };

  const userOwnsPost = user.id === post.user_id;

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

        {userOwnsPost && (
          <OptionsMenu>
            <button type="button" onClick={() => setShowEditModal(true)}>
              Edit post
            </button>
            <DeletePost post={post} onPostDeleted={onPostDeleted} />
          </OptionsMenu>
        )}
      </div>

      <div className={styles.content}>{post.content}</div>

      <div className={styles.footer}>
        <button className={styles.commentsButton} onClick={HandleShowComments}>
          {viewComments
            ? 'Hide comments'
            : post.commentCount > 0
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

      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onPostEdited={onPostEdited}
        />
      )}
    </article>
  );
};

export default PostCard;
