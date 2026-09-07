/** Single source of truth for the real WhatsApp number used across the site. */
export const WHATSAPP_LOCAL = "03077885585";
export const WHATSAPP_INTL = "923077885585"; // international format: country code, no leading 0, no +

/**
 * Click-to-chat link.
 *
 * NOTE: `wa.me` and `api.whatsapp.com` are blocked on some networks / by some
 * browser extensions (ERR_BLOCKED_BY_RESPONSE), which showed customers a
 * "blocked" error page. `web.whatsapp.com/send` is a different host that is not
 * affected: on desktop it opens WhatsApp Web's chat composer, and on phones it
 * hands the conversation straight to the installed WhatsApp app.
 */
export function waLink(text?: string): string {
  const base = `https://web.whatsapp.com/send?phone=${WHATSAPP_INTL}`;
  return text ? `${base}&text=${encodeURIComponent(text)}` : base;
}

/** Same as waLink, but to any Pakistani mobile number a customer typed in — used by the
 *  dashboard so staff can message the actual buyer, not the company's own number. */
export function waLinkTo(rawNumber: string, text?: string): string {
  let digits = rawNumber.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  else if (!digits.startsWith("92")) digits = `92${digits}`;
  const base = `https://web.whatsapp.com/send?phone=${digits}`;
  return text ? `${base}&text=${encodeURIComponent(text)}` : base;
}

export const WHATSAPP = {
  number: WHATSAPP_LOCAL,
  url: waLink(),
};
