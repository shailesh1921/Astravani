/**
 * Disposable email domains list to prevent spam, throwaway accounts, and bot abuse
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'trashmail.com',
  'dispostable.com',
  'yopmail.com',
  'getairmail.com',
  'fakeinbox.com',
  'throwawaymail.com',
  'temp-mail.org',
  'burnermail.io',
  'mytemp.email',
  'maildrop.cc'
]);

/**
 * Checks if the email domain belongs to a known temporary/disposable provider
 */
export const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return DISPOSABLE_DOMAINS.has(domain);
};
