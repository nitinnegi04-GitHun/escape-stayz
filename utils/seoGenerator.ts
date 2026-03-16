
import { HOTELS, DESTINATIONS, BLOG_POSTS } from '../constants';

const SITE_URL = 'https://escapestayz.com';

export const generateSitemap = () => {
  const staticPages = ['', '/about', '/hotels', '/destinations', '/gallery', '/plan-your-trip', '/blog', '/contact'];
  const hotelPages = HOTELS.map(h => `/hotels/${h.slug}`);
  const destPages = DESTINATIONS.map(d => `/destinations/${d.slug}`);
  const blogPages = BLOG_POSTS.map(b => `/blog/${b.slug}`);

  const allPages = [...staticPages, ...hotelPages, ...destPages, ...blogPages];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  allPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
};

export const generateRobots = () => {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;
};
