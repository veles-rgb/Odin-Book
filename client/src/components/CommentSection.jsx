import { useState, useEffect } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import Comment from './Comment';
import styles from './CommentSection.module.css';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <section className={styles.commentSection}>
      <h3 className={styles.title}>Comments</h3>

      {error && <div className={styles.error}>{error}</div>}
      {isLoading && <div className={styles.loading}>Loading comments...</div>}

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
