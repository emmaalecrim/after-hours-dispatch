import LocaleSwitcher from './LocaleSwitcher.jsx';

export default function Masthead({ title, subtitle, issueLabel, locales, activeLocale, onLocaleChange }) {
  return (
    <header className="masthead">
      <div className="masthead__heading">
        {issueLabel && <p className="masthead__eyebrow">{issueLabel}</p>}
        <h1 className="masthead__title">{title}</h1>
        <p className="masthead__subtitle">{subtitle}</p>
      </div>

      {locales && locales.length > 1 && (
        <LocaleSwitcher
          locales={locales}
          activeLocale={activeLocale}
          onChange={onLocaleChange}
        />
      )}
    </header>
  );
}
