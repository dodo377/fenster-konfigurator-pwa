const CACHE_NAME = `fenster-konfigurator-${new Date().getTime()}`;
const STATIC_ASSETS = [
    "./index.html",
    "./styles.css",
    "./app.js",
    "./materials.json",
    "./manifest.json",
    "./vendor/xlsx.full.min.js",
    "./images/icon-192.png",
    "./images/icon-512.png",
    "./images/apple-touch-icon.png",
    "./images/LOGO_HR.png",
    "./images/dreh.png",
    "./images/kipp.png",
    "./images/dreh_kipp.png",
    "./images/stulp.svg",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    
    // Keine Extension-URLs oder URLs ohne http/https cachen
    if (!event.request.url.startsWith("http")) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request)
                .then((response) => {
                    // Nur erfolgreiches Cachen von http/https Requests
                    if (response.ok && event.request.url.startsWith("http")) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match("./index.html"));
        })
    );
});
