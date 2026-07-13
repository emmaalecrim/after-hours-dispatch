import { useEffect, useRef } from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';

// Contentful's default table renderer just unwraps table nodes into plain
// text, which is why tables were showing up unformatted. These overrides
// map each table node to real table markup, styled in global.css.
const richTextOptions = {
  renderNode: {
    [BLOCKS.TABLE]: (_node, children) => (
      <div className="post-dialog__table-wrap">
        <table className="post-dialog__table">
          <tbody>{children}</tbody>
        </table>
      </div>
    ),
    [BLOCKS.TABLE_ROW]: (_node, children) => <tr>{children}</tr>,
    [BLOCKS.TABLE_CELL]: (_node, children) => <td>{children}</td>,
    [BLOCKS.TABLE_HEADER_CELL]: (_node, children) => <th>{children}</th>
  }
};

function formatKicker(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export default function PostDialog({ post, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKey(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-dialog-title"
    >
      <button
        className="dialog-close"
        onClick={onClose}
        ref={closeButtonRef}
        type="button"
      >
        <span aria-hidden="true">&times;</span> Close
      </button>

      <div className="post-dialog__scroll">
        <article className="post-dialog__inner">
          <p className="post-dialog__kicker">{formatKicker(post.date)}</p>
          <h1 className="post-dialog__title" id="post-dialog-title">
            {post.title}
          </h1>
          {post.subtitle && <p className="post-dialog__subtitle">{post.subtitle}</p>}

          <div className="post-dialog__body">
            {post.content ? (
              documentToReactComponents(post.content, richTextOptions)
            ) : (
              <p>{post.excerpt}</p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
