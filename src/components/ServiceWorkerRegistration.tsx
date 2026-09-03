'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        // Check for updates every 60 seconds when app is active
        const updateInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 60_000);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New content available — could show a toast here
              console.info('[SW] New version available. Refresh to update.');
            }
          });
        });

        // Register background sync when online
        if ('sync' in registration) {
          window.addEventListener('online', () => {
            (registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync
              ?.register('edugenius-sync-queue')
              .catch(() => {});
          });
        }

        return () => clearInterval(updateInterval);
      } catch (err) {
        console.warn('[SW] Registration failed:', err);
      }
    };

    // Register after page load to not block initial render
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
}
