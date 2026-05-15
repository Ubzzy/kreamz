# API Billing, Key Restrictions, and Proxy

This document shows recommended steps to avoid unexpected API charges and how to run the bundled proxy that centralizes requests and caches map images.

## Key recommendations
- Restrict API keys: in your cloud console (Google Cloud -> Credentials) restrict keys by:
  - HTTP referrers for browser usage (list allowed domains)
  - IP addresses for server keys (the proxy server)
  - Enable only required APIs (Maps JavaScript, Static Maps, Geocoding) per key
- Create separate keys for client-side (limited referrers) and server-side (IP-restricted) use.
- Set daily and monthly billing alerts in the Billing console and create an automated alert (email + webhook) for spikes.

## Use the proxy (centralize and cache)
- Place the server in a small VM or serverless container near your users.
- Set environment variables:

```
SERVER_GOOGLE_MAPS_API_KEY=YOUR_SERVER_SIDE_KEY
PORT=8080
MAX_REQUESTS_PER_MIN=120
```

- Install and run the proxy:

```
cd server/proxy
npm install
npm start
```

- Frontend: call `/maps/static?...` on your proxy instead of directly calling Google Static Maps. Example:

```
/maps/static?center=-15.4167,28.2833&zoom=12&size=1200x500
```

## Monitoring and metrics
- The proxy exposes `/metrics` with simple counters for total requests, per-endpoint, per-key, and per-IP.
- For long-term monitoring, ship logs/metrics to a real metrics backend (Prometheus, Datadog, Cloud Monitoring).

## Additional cost-saving tips
- Cache heavily-requested images on a CDN in front of the proxy.
- Prefer static map snapshots for list/detail pages; use interactive maps only where necessary.
- Cache geocoding results (we already added Firestore caching in the frontend) and do reverse geocode sparingly.
