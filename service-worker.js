const CACHE_NAME = 'ecard-online-v18-10-6-random-bgm-20261003';
const APP_SHELL = [
  './',
  './index.html',
  './style.css?v=18.10.6',
  './script.js?v=18.10.6',
  './manifest.json',
  './audio/The_Final_Ante.mp3?v=18.10.6',
  './audio/The_Heavy_Hand.mp3?v=18.10.6',
  './audio/The_Midnight_Wager.mp3?v=18.10.6',
  './audio/The_Final_Gambit.mp3?v=18.10.6',
  './audio/Margin_of_Error.mp3?v=18.10.6',
  './images/back.webp',
  './images/citizen.webp',
  './images/emperor.webp',
  './images/slave.webp',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function makeRangeResponse(request, response) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader || !response) return Promise.resolve(response);

  return response.arrayBuffer().then((buffer) => {
    const size = buffer.byteLength;
    const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
    if (!match) return response;

    let start = match[1] ? Number(match[1]) : 0;
    let end = match[2] ? Number(match[2]) : size - 1;
    if (!match[1] && match[2]) {
      const suffixLength = Number(match[2]);
      start = Math.max(0, size - suffixLength);
      end = size - 1;
    }
    start = Math.max(0, Math.min(start, size - 1));
    end = Math.max(start, Math.min(end, size - 1));

    const headers = new Headers(response.headers);
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', String(end - start + 1));
    if (!headers.get('Content-Type')) headers.set('Content-Type', 'audio/mpeg');

    return new Response(buffer.slice(start, end + 1), {
      status: 206,
      statusText: 'Partial Content',
      headers,
    });
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Safari / iPhone PWAのMP3はRangeリクエストになることがある。
  // 5曲すべてを同じ方式でオフライン再生できるよう、audio/*.mp3を汎用処理する。
  if (url.pathname.includes('/audio/') && url.pathname.endsWith('.mp3')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      let cached = await cache.match(request, { ignoreSearch: true });

      if (request.headers.has('range') && cached) {
        return makeRangeResponse(request, cached.clone());
      }

      try {
        const network = await fetch(request);
        if (network && network.status === 200) cache.put(request, network.clone());
        return network;
      } catch (error) {
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
