import { useState, useEffect } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import Comment from './Comment';
import styles from './CommentSection.module.css';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userComment, setUserComment] = useState('');
  const [userCommentLoading, setUserCommentLoading] = useState(false);
  const [userCommentError, setUserCommentError] = useState(null);

  const { apiFetch } = useApiFetch();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch(`/api/post/${postId}/comments`);

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
          return;
        }

        setComments(data.comments);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setError('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    try {
      setUserCommentLoading(true);
      setUserCommentError(null);

      const response = await apiFetch(`/api/comment/create/${postId}`, {
        method: 'POST',
        body: JSON.stringify({ content: userComment }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setUserCommentError(data.error);
        return;
      }

      setComments((prev) => [...prev, data.comment]);
      setUserComment('');
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setUserCommentError('Something went wrong');
      return;
    } finally {
      setUserCommentLoading(false);
    }
  };

  return (
    <section className={styles.commentSection}>
      <h3 className={styles.title}>Comments</h3>

      {error && <div className={styles.error}>{error}</div>}
      {isLoading && <div className={styles.loading}>Loading comments...</div>}

      {!isLoading && !error && (
        <div>
          <form onSubmit={handleSubmitComment}>
            <label>Leave a comment</label>
            <textarea
              name="comment"
              id="comment"
              placeholder="Say something..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
            ></textarea>
            <button type="submit" disabled={userCommentLoading}>
              Send
            </button>
            {userCommentError && <div>{userCommentError}</div>}
          </form>
        </div>
      )}

      {!isLoading && comments.length > 0 && (
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <Comment comment={comment} key={comment.id} />
          ))}
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <div className={styles.empty}>No comments yet.</div>
      )}
    </section>
  );
};

export default CommentSection;
