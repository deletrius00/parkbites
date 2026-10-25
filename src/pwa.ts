/**
 * Registers the offline service worker. Only in production builds: in dev a service worker
 * would cache stale modules and make hot reload confusing.
 * Takes its dependencies as arguments so it can be unit tested without a browser.
 */
export function registerServiceWorker(
  nav: Pick<Navigator, 'serviceWorker'> | { serviceWorker?: undefined },
  isProd: boolean,
): Promise<boolean> {
  if (!isProd || !nav.serviceWorker) return Promise.resolve(false);
  return nav.serviceWorker.register('/sw.js').then(() => true, () => false);
}
