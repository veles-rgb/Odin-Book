import { useState, useEffect } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import styles from './CommentReplySection.module.css';
import CommentReply from './CommentReply';

const CommentReplySection = ({ commentId, refreshKey }) => {
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { apiFetch } = useApiFetch();

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch(`/api/comment/${commentId}/replies`);

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
          return;
        }

        setReplies(data.replies);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setError('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentId, refreshKey]);

  return (
    <section className={styles.replySection}>
      {error && <div className={styles.error}>{error}</div>}
      {isLoading && <div className={styles.loading}>Loading replies...</div>}

      {!isLoading && replies.length > 0 && (
        <div className={styles.replyList}>
          {replies.map((reply) => (
            <CommentReply
              comment={reply}
              key={reply.id}
              onReplyCreated={(newReply) => {
                setReplies((prev) => [...prev, newReply]);
              }}
              onReplyDeleted={(deletedComment) => {
                setReplies((prev) =>
                  prev.filter((reply) => reply.id != deletedComment),
                );
              }}
            />
          ))}
        </div>
      )}

      {!isLoading && replies.length === 0 && (
        <div className={styles.empty}>No replies yet.</div>
      )}
    </section>
  );
};

export default CommentReplySection;
