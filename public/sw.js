/* EiFreela — Service Worker (item 1: app instalável e com cara de aplicativo)
 * - Guarda o "esqueleto" do site (landing "/" e app "/app/") para abrir rápido e offline.
 * - Navegação: rede primeiro; sem internet, abre a última versão salva.
 * - Arquivos estáticos (/assets, /icons): cache primeiro, atualizando em segundo plano.
 * - Chamadas ao Supabase (outro domínio) NUNCA passam pelo cache.
 * - Web Push: mostra o aviso de nova vaga e abre o app ao tocar.
 */
const VERSAO = "eifreela-v2.6.0";
const CACHE_APP = `${VERSAO}-paginas`;
const CACHE_ESTATICO = `${VERSAO}-estatico`;
const ESQUELETO = ["/", "/app/", "/manifest.json", "/favicon.svg", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_APP)
      .then((c) => Promise.allSettled(ESQUELETO.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => !n.startsWith(VERSAO)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "atualizar") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, fontes externas etc.

  if (req.mode === "navigate") {
    const pagina = url.pathname.startsWith("/app") ? "/app/" : "/";
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE_APP).then((c) => c.put(pagina, copia));
          }
          return res;
        })
        .catch(() => caches.match(pagina).then((r) => r || caches.match("/")))
    );
    return;
  }

  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") || url.pathname === "/favicon.svg") {
    event.respondWith(
      caches.open(CACHE_ESTATICO).then(async (cache) => {
        const emCache = await cache.match(req);
        const daRede = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => emCache);
        return emCache || daRede;
      })
    );
  }
});

self.addEventListener("push", (event) => {
  let dados = { title: "EiFreela", body: "Nova vaga publicada!", url: "/app/" };
  try {
    if (event.data) dados = { ...dados, ...event.data.json() };
  } catch {
    if (event.data) dados.body = event.data.text();
  }
  if (!String(dados.url || "").startsWith("/app")) dados.url = "/app/";
  event.waitUntil(
    self.registration.showNotification(dados.title, {
      body: dados.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: dados.title + dados.body,
      data: { url: dados.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = new URL(event.notification.data?.url || "/app/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      for (const j of janelas) {
        if (new URL(j.url).pathname.startsWith("/app") && "focus" in j) return j.focus();
      }
      return self.clients.openWindow(destino);
    })
  );
});
