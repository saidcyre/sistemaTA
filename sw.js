const CACHE = 'sistemaTA-v3';
const PRECACHE = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
  // Ativa imediatamente sem esperar fechar outras abas
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  // Assume controle de todas as abas imediatamente
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Sempre busca na rede primeiro, só usa cache se offline
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(res => {
        // Salva cópia atualizada no cache
        if (res && res.status === 200 && e.request.method === 'GET') {
          var clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Verifica atualizações a cada 1 hora
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
