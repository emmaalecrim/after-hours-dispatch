export const CONSENT_KEY = 'afterhours-dispatch:age-consent';

export default function ContentWarningDialog({ onAccept }) {
  function handleAccept() {
    try {
      window.localStorage.setItem(CONSENT_KEY, 'true');
    } catch {
      // Storage unavailable (private browsing, etc.) — still let them in
      // for this session rather than blocking access.
    }
    onAccept();
  }

  function handleLeave() {
    window.location.href = 'https://www.google.com';
  }

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="warning-dialog-title"
    >
      <div className="warning-dialog__inner">
        <p className="warning-dialog__mark">Restricted &middot; 18+</p>
        <h1 className="warning-dialog__title" id="warning-dialog-title">
          This dispatch is for adults only.
        </h1>
        <p className="warning-dialog__body">
          The stories here deal with mature themes, explicit language, and
          adult subject matter. By entering, you confirm you are at least 18
          years old and old enough to view this content where you live.
        </p>
        <div className="warning-dialog__actions">
          <button
            className="warning-btn warning-btn--accept"
            onClick={handleAccept}
            type="button"
          >
            I'm 18 or older — enter
          </button>
          <button
            className="warning-btn warning-btn--leave"
            onClick={handleLeave}
            type="button"
          >
            Take me back
          </button>
        </div>
      </div>
    </div>
  );
}
