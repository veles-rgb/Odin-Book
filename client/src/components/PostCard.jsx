import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import styles from './styles/PostCard.module.css';
import { FaRegClock } from 'react-icons/fa';

import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import OptionsMenu from './OptionsMenu';
import DeletePost from './DeletePost';
import EditPostModal from './EditPostModal';
import Tooltip from './Tooltip';

import { formatDateTime } from '../utils/formatDateTime';

const PostCard = ({
  post,
  onPostDeleted,
  onPostEdited,
  showViewPostOption = true,
}) => {
  const [viewComments, setViewComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { user } = useAuthContext();
  const navigate = useNavigate();

  const HandleShowComments = () => {
    setViewComments((prev) => !prev);
  };

  const userOwnsPost = user.id === post.user_id;
  const postHasBeenUpdated = post.created_at !== post.updated_at;

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

          <div className={styles.dateTimeContainer}>
            <div className={styles.timestamp}>
              {formatDateTime(post.created_at)}
            </div>
            {postHasBeenUpdated && (
              <Tooltip content={`Updated: ${formatDateTime(post.updated_at)}`}>
                <FaRegClock />
              </Tooltip>
            )}
          </div>
        </div>

        <OptionsMenu>
          {showViewPostOption && (
            <button type="button" onClick={() => navigate(`/post/${post.id}`)}>
              View
            </button>
          )}

          {userOwnsPost && (
            <>
              <button type="button" onClick={() => setShowEditModal(true)}>
                Edit
              </button>

              <DeletePost post={post} onPostDeleted={onPostDeleted} />
            </>
          )}
        </OptionsMenu>
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
