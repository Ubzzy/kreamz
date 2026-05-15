const express = require('express');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const url = require('url');

const app = express();
const cache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 120 });
const stats = { total: 0, byEndpoint: {}, byKey: {}, byIp: {} };

const SERVER_KEY = process.env.SERVER_GOOGLE_MAPS_API_KEY || '';
const MAX_PER_MIN = Number(process.env.MAX_REQUESTS_PER_MIN || 120);
const rateWindow = new Map(); // ip -> {count, ts}

function recordStat(endpoint, key, ip) {
  stats.total += 1;
  stats.byEndpoint[endpoint] = (stats.byEndpoint[endpoint] || 0) + 1;
  if (key) stats.byKey[key] = (stats.byKey[key] || 0) + 1;
  if (ip) stats.byIp[ip] = (stats.byIp[ip] || 0) + 1;
}

function checkRateLimit(ip) {
  const now = Date.now();
  const win = rateWindow.get(ip) || { count: 0, ts: now };
  if (now - win.ts > 60_000) {
    win.count = 0;
    win.ts = now;
  }
  win.count += 1;
  rateWindow.set(ip, win);
  return win.count <= MAX_PER_MIN;
}

// allow only Google Maps API hosts
function allowedHost(hostname) {
  const allowed = ["maps.googleapis.com", "maps.gstatic.com"];
  return allowed.includes(hostname);
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/metrics', (req, res) => {
  res.json({ stats, uptime: process.uptime() });
});

// Serve static maps via server-side key and cache responses
app.get('/maps/static', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).send('rate limit');

  const query = new url.URLSearchParams(req.query).toString();
  const cacheKey = `static:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    recordStat('static', 'server-key', ip);
    res.set('X-Cache', 'HIT');
    res.set('Content-Type', 'image/png');
    return res.send(Buffer.from(cached, 'base64'));
  }

  const target = `https://maps.googleapis.com/maps/api/staticmap?${query}&key=${encodeURIComponent(SERVER_KEY)}`;
  try {
    const r = await fetch(target);
    if (!r.ok) return res.status(r.status).send(await r.text());
    const buf = await r.arrayBuffer();
    const b = Buffer.from(buf);
    cache.set(cacheKey, b.toString('base64'), 60 * 60);
    recordStat('static', 'server-key', ip);
    res.set('X-Cache', 'MISS');
    res.set('Content-Type', r.headers.get('content-type') || 'image/png');
    return res.send(b);
  } catch (e) {
    return res.status(502).send('proxy error');
  }
});

// Generic proxy for allowed hosts (use sparingly)
app.get('/proxy', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).send('rate limit');
  const target = req.query.url;
  if (!target) return res.status(400).send('missing url');
  let parsed;
  try { parsed = new url.URL(String(target)); } catch { return res.status(400).send('invalid url'); }
  if (!allowedHost(parsed.hostname)) return res.status(403).send('host not allowed');

  const cacheKey = `proxy:${parsed.href}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    recordStat('proxy', 'server-key', ip);
    res.set('X-Cache', 'HIT');
    return res.send(cached);
  }

  try {
    const r = await fetch(parsed.href);
    const text = await r.text();
    cache.set(cacheKey, text, 60 * 5);
    recordStat('proxy', 'server-key', ip);
    res.set('X-Cache', 'MISS');
    res.send(text);
  } catch (e) {
    res.status(502).send('proxy error');
  }
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Proxy running on ${port}`));
