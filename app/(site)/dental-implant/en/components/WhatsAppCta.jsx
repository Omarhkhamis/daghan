const DEFAULT_WHATSAPP_LINK = "https://wa.me/+905465266449";

export default function WhatsAppCta({
  href = DEFAULT_WHATSAPP_LINK,
  className = "",
  ariaLabel = "WhatsApp",
  iconClassName = "text-[15px]",
  children
}) {
  return (
    <a
      href={href || DEFAULT_WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-2.5 ${className}`.trim()}
    >
      <i
        className={`fa-brands fa-whatsapp ${iconClassName}`.trim()}
        aria-hidden="true"
      ></i>
      {children}
    </a>
  );
}
