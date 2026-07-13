import { useEffect, useRef } from 'react';
import PostCard from './PostCard.jsx';

export default function PostGrid({ posts, onOpenPost, onLoadMore, loading, hasMore, error }) {
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { root, rootMargin: '400px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="post-scroll" ref={scrollRef}>
      <div className="post-scroll__inner">
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={onOpenPost} />
          ))}

          {posts.length === 0 && !loading && (
            <p className="status-row">
              {error ? 'Could not load posts.' : 'Nothing published yet.'}
            </p>
          )}
        </div>

        <div className="post-grid__sentinel" ref={sentinelRef}>
          {loading && <span className="spinner" aria-label="Loading more posts" />}
          {!hasMore && posts.length > 0 && (
            <span className="status-row status-row--inline">End of dispatch</span>
          )}
        </div>
      </div>
    </div>
  );
}
