SEO checklist and how-to for Kreams

1. Verify ownership in Google Search Console
   - Add your preferred domain (example.com or www.example.com)
   - Upload/confirm sitemap: https://example.com/sitemap.xml

2. Update `index.html` and per-page meta
   - Ensure each public page has unique `<title>` and `<meta name="description">`.
   - Use Open Graph and Twitter Card tags for rich sharing.

3. Structured data
   - We added a basic JSON-LD for `FoodEstablishment` in `index.html`.
   - Expand with `hasOfferCatalog` or `Event` for scheduled appearances if useful.

4. Sitemap & robots
   - Replace `https://example.com/` in `public/sitemap.xml` and `public/robots.txt` with your canonical domain.
   - Submit sitemap in Search Console.

5. Rendering & indexing
   - Public pages should be server-rendered or prerendered where possible so Googlebot sees content without JS.
   - For Vite React apps consider:
     - Vite SSR (full SSR)
     - prerendering (prerender-spa-plugin or `vite-plugin-prerender`)

6. Performance
   - Run Lighthouse and target: Performance >= 90, CLS < 0.1, LCP < 2.5s.
   - Optimize images (AVIF/WebP), use CDN, lazy-load offscreen images.

7. Monitoring
   - Connect Search Console + Analytics.
   - Monitor impressions, clicks, index coverage, and fix errors.

8. Next work I can do for you
   - Replace example.com with your domain and submit sitemap.
   - Add per-page meta in `Index.tsx` and other public pages using `react-helmet` or a head management library.
   - Implement prerendering for public routes.

