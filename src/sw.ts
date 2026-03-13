/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

// Precache all assets built by Vite
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Runtime caching for Open-Meteo weather API
registerRoute(
  /^https:\/\/api\.open-meteo\.com\/.*/i,
  new NetworkFirst({
    cacheName: "weather-api-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Runtime caching for Open-Meteo marine API
registerRoute(
  /^https:\/\/marine-api\.open-meteo\.com\/.*/i,
  new NetworkFirst({
    cacheName: "marine-api-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Navigation fallback to index.html for SPA
import { createHandlerBoundToURL } from "workbox-precaching";
import { NavigationRoute } from "workbox-routing";
registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));

// --- Weather notification scheduling ---

let weatherNotificationTimer: ReturnType<typeof setTimeout> | null = null;

self.addEventListener("message", (event) => {
  const { type } = event.data;

  if (type === "SCHEDULE_WEATHER_NOTIFICATION") {
    const { delayMs } = event.data;

    // Clear any existing timer
    if (weatherNotificationTimer) {
      clearTimeout(weatherNotificationTimer);
    }

    // Keep the SW alive while waiting, then show notification
    event.waitUntil(
      new Promise<void>((resolve) => {
        weatherNotificationTimer = setTimeout(async () => {
          weatherNotificationTimer = null;
          try {
            await self.registration.showNotification(
              "Time for a weather check! 🌤",
              {
                body: "It's been 30 minutes. Tap to log current conditions.",
                icon: "/pwa-192.png",
                tag: "weather-reminder",
                renotify: true,
              }
            );
          } catch {
            // Notification may fail if permission revoked
          }
          resolve();
        }, delayMs);
      })
    );
  }

  if (type === "CANCEL_WEATHER_NOTIFICATION") {
    if (weatherNotificationTimer) {
      clearTimeout(weatherNotificationTimer);
      weatherNotificationTimer = null;
    }
  }
});

// Handle notification click: focus existing window or open new one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Try to focus an existing window
      for (const client of windowClients) {
        if ("focus" in client) {
          client.focus();
          client.postMessage({ type: "NAVIGATE_TO_WEATHER" });
          return;
        }
      }
      // No existing window — open a new one
      return self.clients.openWindow("/?tab=weather");
    })
  );
});

// Activate immediately
self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
