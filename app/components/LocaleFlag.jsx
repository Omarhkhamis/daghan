export default function LocaleFlag({ code, className = "" }) {
  if (code === "ru") {
    return (
      <svg
        aria-hidden="true"
        className={`h-3.5 w-5 rounded-sm ${className}`.trim()}
        viewBox="0 0 3 2"
      >
        <rect width="3" height="2" fill="#fff" />
        <rect width="3" height="1.333" y="0.667" fill="#0039a6" />
        <rect width="3" height="0.667" y="1.333" fill="#d52b1e" />
      </svg>
    );
  }

  if (code === "tr") {
    return (
      <svg
        aria-hidden="true"
        className={`h-3.5 w-5 rounded-sm ${className}`.trim()}
        viewBox="0 0 28 20"
      >
        <rect width="28" height="20" fill="#e30a17" />
        <circle cx="11" cy="10" r="5.2" fill="#fff" />
        <circle cx="12.4" cy="10" r="4.2" fill="#e30a17" />
        <polygon
          fill="#fff"
          points="17.4,10 19.6,10.7 18.2,8.9 18.3,11.1 16.9,9.3"
          transform="scale(1.2) translate(2.5,0.8)"
        />
      </svg>
    );
  }

  if (code === "ar") {
    return (
      <svg
        aria-hidden="true"
        className={`h-3.5 w-5 rounded-sm ${className}`.trim()}
        viewBox="0 0 28 20"
      >
        <rect width="28" height="20" fill="#006c35" />
        <rect y="13.5" width="28" height="1" fill="#fff" opacity="0.85" />
        <rect x="8" y="8.2" width="12" height="1.2" rx="0.6" fill="#fff" opacity="0.8" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={`h-3.5 w-5 rounded-sm ${className}`.trim()}
      viewBox="0 0 60 30"
    >
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="2.5" />
      <rect x="25" width="10" height="30" fill="#fff" />
      <rect y="10" width="60" height="10" fill="#fff" />
      <rect x="27" width="6" height="30" fill="#C8102E" />
      <rect y="12" width="60" height="6" fill="#C8102E" />
    </svg>
  );
}
