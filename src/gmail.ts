/** Opens Gmail's web compose window (not the OS mail client) pre-addressed and pre-filled. */
export function gmailComposeLink(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
