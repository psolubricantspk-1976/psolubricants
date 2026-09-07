type P = { className?: string };
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** PSO roundel — blue disc, white-edged green crescent, flame sun, outlined PSO. */
export const Logo = ({ className = "h-9 w-9" }: P) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <defs>
      <clipPath id="psoDisc"><circle cx="60" cy="60" r="58" /></clipPath>
      <mask id="psoWhite"><rect width="120" height="120" fill="#fff" /><circle cx="77" cy="44" r="49" fill="#000" /></mask>
      <mask id="psoGreen"><rect width="120" height="120" fill="#fff" /><circle cx="78.5" cy="42.5" r="46" fill="#000" /></mask>
    </defs>
    <circle cx="60" cy="60" r="58" fill="#0b57a4" />
    <circle cx="60" cy="60" r="52.5" fill="#f7fbff" mask="url(#psoWhite)" />
    <circle cx="60" cy="60" r="49.5" fill="#009a44" mask="url(#psoGreen)" />
    <circle cx="78.5" cy="42.5" r="46" fill="none" stroke="#f7fbff" strokeWidth="2.6" mask="url(#psoGreen)" />
    <g fill="#ffe000" clipPath="url(#psoDisc)">
      <circle cx="81" cy="40" r="26" />
      <path d="M60 24 44 28l15 8ZM56 38 39 44l16 6ZM59 53 45 63l17 2ZM66 66 56 78l18-4Z" />
    </g>
    <text x="60" y="77" textAnchor="middle" fontSize="38" fontWeight="800" fill="#009a44" stroke="#f7fbff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round" fontFamily="Archivo, sans-serif">PSO</text>
  </svg>
);

export const Phone = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M5 4h4l1.5 4L8 10a12 12 0 0 0 6 6l2-2.5 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
);

export const Mail = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
);

export const Pin = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
);

export const Arrow = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} strokeWidth={1.9} className={className} aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);

export const Check = ({ className = "h-3.5 w-3.5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} strokeWidth={2.4} className={className} aria-hidden="true"><path d="m4.5 12.5 5 5 10-11" /></svg>
);

export const Chevron = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} strokeWidth={1.9} className={className} aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
);

export const Close = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} strokeWidth={1.9} className={className} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
);

export const Shield = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M12 3 5 5.8v5.4c0 4.4 3 8.1 7 9.8 4-1.7 7-5.4 7-9.8V5.8Z" /><path d="m9 11.6 2.2 2.2 4.2-4.3" /></svg>
);

export const Pump = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M4 20h12V9l-3-3H9l-3 3v11Z" /><path d="M4 20h12M16 14h2.5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H16M9 9V6h4v3" /></svg>
);

export const Award = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><circle cx="12" cy="9" r="5" /><path d="m8.5 13-2 7 5.5-3 5.5 3-2-7" /></svg>
);

export const Flask = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M10 3v5.2L4.6 18a2 2 0 0 0 1.8 3h11.2a2 2 0 0 0 1.8-3L14 8.2V3" /><path d="M8.5 3h7M7.2 14.5h9.6" /></svg>
);

export const Thermo = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0Z" /><path d="M11.5 18.5 12 20" /></svg>
);

export const Recycle = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M7 19h-3l4-7M17 5h3l-4 7M3 8l4 5h6l4-5M21 16l-4-5H11l-4 5" /></svg>
);

export const Car = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M5 17h14v-4l-2-4H7l-2 4v4Z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></svg>
);

export const Bike = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17 10 9h4l3 8M9 9l-2-3M14 9l3-3" /></svg>
);

export const Truck = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><rect x="2" y="7" width="11" height="8" rx="1" /><path d="M13 11h4l3 3v3h-7" /><circle cx="6" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" /></svg>
);

export const Tractor = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M6 14V7h6v7M6 14h-3v4h3M18 14a3 3 0 1 1-6 0M12 14h6" /><circle cx="6" cy="18.5" r="2" /><circle cx="18" cy="18.5" r="2" /></svg>
);

export const Grid = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
);

export const Cart = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M3 4h2l2.5 11h11L21 8H6" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></svg>
);

export const WhatsApp = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="currentColor" d="M17.5 14.5c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.2-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.5-2 0-.2.1-.4.2-.5.2-.2.4-.3.5-.4.1-.1.1-.2.1-.3 0-.1 0-.3-.1-.4-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.8 4.2.7.3 1.2.4 1.6.5.7.2 1.3.1 1.8-.1.5-.2 1-.6 1.2-1 .2-.5.3-.9.2-1.1-.1-.2-.3-.3-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 2.3.8 4.4 2.1 6.1L2 22l4-2.1c1.5.8 3.2 1.2 5 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3c-.9-1.3-1.3-2.9-1.3-4.4 0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z" />
  </svg>
);

export const Search = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
);

export const Box = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9Z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" /></svg>
);

export const MessageSquare = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 9h8M8 12h5" /></svg>
);

export const Trash = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M6.5 7l1 13h9l1-13M10 11v5M14 11v5" /></svg>
);

export const Copy = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></svg>
);

export const SendArrow = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} strokeWidth={1.8} className={className} aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
);

export const ArrowRight = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} strokeWidth={2} className={className} aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);

export const Xmark = ({ className = "h-3.5 w-3.5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} strokeWidth={2.2} className={className} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
);

export const GoogleG = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v9h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.6h7.1c4.2-3.9 6.6-9.6 6.6-16.7Z" />
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.6c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 40.9 15.4 46 24 46Z" />
    <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.7H4.5C3 17 2 20.4 2 24s1 7 4.5 9.9l7.3-5.7Z" />
    <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.4 2 8.1 7.1 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9Z" />
  </svg>
);

export const FacebookF = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z" />
  </svg>
);

export const User = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>
);

export const Eye = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);

export const EyeOff = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} className={className} aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M6.6 6.7C4.3 8.2 2.7 10.3 2 12c0 0 3.5 7 10 7 2 0 3.7-.6 5.1-1.5M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7-.4.8-1.2 2.1-2.4 3.4" /></svg>
);

export const Send = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" {...S} strokeWidth={1.8} className={className} aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
);
