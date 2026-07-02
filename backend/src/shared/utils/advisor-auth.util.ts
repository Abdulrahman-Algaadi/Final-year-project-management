/** Auth helpers for advisor staff login via email. */

export function defaultAdvisorUsername(email: string): string {
  const local = email.split('@')[0].toLowerCase();
  const safe = local.replace(/[^a-z0-9._-]/g, '.');
  return safe.length >= 3 ? safe : `adv.${safe}`;
}
