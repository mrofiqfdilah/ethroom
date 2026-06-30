// sw.js - Service Worker untuk ETH ROOM PWA

const CACHE_NAME = 'eth-room-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/home-guru.html',
    '/lkm.html',
    '/lkm-siswa-list.html',
    '/kelola-soal.html',
    '/css/style.css',
    '/images/auth-logo.png',
    '/images/foto-guru.jpg',
    '/images/foto-siswa.jpg',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
    'https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css'
];

// Install Service Worker
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    return self.clients.claim();
});

// Fetch - serve from cache first, then network
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                // Otherwise fetch from network
                return fetch(e.request)
                    .then(response => {
                        // Cache new responses
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(e.request, responseClone);
                            });
                        return response;
                    })
                    .catch(() => {
                        // Fallback for offline
                        return caches.match('/offline.html');
                    });
            })
    );
});