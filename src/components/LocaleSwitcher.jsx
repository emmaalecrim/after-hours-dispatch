export default function LocaleSwitcher({ locales, activeLocale, onChange }) {
  if (locales.length <= 1) return null;

  return (
    <div className="edition-switcher" role="group" aria-label="Edition">
      {locales.map((item) => (
        <button
          key={item.code}
          type="button"
          className={
            item.code === activeLocale
              ? 'edition-switcher__btn is-active'
              : 'edition-switcher__btn'
          }
          onClick={() => onChange(item.code)}
          aria-pressed={item.code === activeLocale}
          title={item.name}
        >
          {item.code}
        </button>
      ))}
    </div>
  );
}
