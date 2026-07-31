/* 青青的工作台 - Service Worker：离线缓存
 * 作用：在家首次联网打开后，把工作台所有代码/静态资源缓存进手机，
 *       之后去单位、用自己的流量都能离线打开，不再依赖网络。
 * 安全：本 SW 只缓存工作台自身的静态文件（html/js/css/图标），
 *       不涉及任何用户数据，也不会把 localStorage 里的数据上传。
 */
const CACHE = 'wq-v20260727aa';
const CORE = [
  './',
  'index.html',
  'manifest.json',
  'css/style.css',
  'data/words-data.js',
  'data/words-data2.js',
  'data/words-data3.js',
  'data/phrases-data.js',
  'js/avatar-default.js',
  'js/store.js',
  'js/ui.js',
  'js/schedule.js',
  'js/health.js',
  'js/words.js',
  'js/plan.js',
  'js/today.js',
  'js/fridge.js',
  'js/app.js',
  'icon-180.png',
  'icon-192.png',
  'lib/xlsx.full.min.js',
  'lib/mammoth.browser.min.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(CORE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 只缓存同源（工作台自身）资源，不碰外链
  // 忽略 ?v= 版本戳，使带戳/不带戳的请求命中同一份缓存
  var cacheKey = url.origin + url.pathname;
  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(cacheKey).then(function (cached) {
        var network = fetch(req).then(function (res) {
          if (res && res.status === 200) {
            cache.put(cacheKey, res.clone());
          }
          return res;
        }).catch(function () {
          return cached;
        });
        // 命中缓存立即返回（离线也能开），同时后台静默更新缓存
        return cached || network;
      });
    })
  );
});
