function formatKicker(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export default function PostCard({ post, onOpen }) {
  return (
    <button className="post-card" onClick={() => onOpen(post)} type="button">
      <p className="post-card__kicker">{formatKicker(post.date)}</p>
      <h2 className="post-card__title">{post.title}</h2>
      {post.subtitle && <p className="post-card__subtitle">{post.subtitle}</p>}
      <p className="post-card__excerpt">{post.excerpt}</p>
    </button>
  );
}
