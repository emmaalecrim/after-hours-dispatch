function formatKicker(dateString, locale) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date
    .toLocaleDateString(locale || 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    .toUpperCase();
}

export default function PostCard({ post, onOpen, locale }) {
  return (
    <button className="post-card" onClick={() => onOpen(post)} type="button">
      <p className="post-card__kicker">{formatKicker(post.date, locale)}</p>
      <h2 className="post-card__title">{post.title}</h2>
      {post.subtitle && <p className="post-card__subtitle">{post.subtitle}</p>}
      <p className="post-card__excerpt">{post.excerpt}</p>
    </button>
  );
}
