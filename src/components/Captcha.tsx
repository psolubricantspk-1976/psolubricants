import { Turnstile } from "@marsidev/react-turnstile";
export const captchaEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
export default function Captcha({ onToken, resetKey }: { onToken: (token: string) => void; resetKey: number }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return <div className="my-3"><Turnstile key={resetKey} siteKey={siteKey} options={{ size: "flexible" }} onSuccess={onToken} onExpire={() => onToken("")} onError={() => onToken("")} /></div>;
}
