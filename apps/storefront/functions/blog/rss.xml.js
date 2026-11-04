// RSS feed of the gift-guide articles, for feed readers and search engines that follow feeds.
import { SITE_ORIGIN as origin, absolute } from '../../src/content/seo.js';
import { BLOG_POSTS } from '../../src/content/blog-posts.js';

const escapeXml = value =>
  String(value).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

const rfc822 = date => new Date(`${date}T06:00:00+05:30`).toUTCString();

export async function onRequestGet() {
  const items = BLOG_POSTS.map(
    post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${origin}/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${origin}/blog/${escapeXml(post.slug)}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.description)}</description>
      <enclosure url="${escapeXml(absolute(post.image))}" type="image/webp" length="0" />
    </item>`
  );
  const latest = BLOG_POSTS.map(p => p.updated || p.date).sort().pop();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SWAYARI Gift Guides</title>
    <link>${origin}/blog</link>
    <atom:link href="${origin}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Devotional return gift ideas, vratam and festival guides, and how to choose and care for silver foil gifts.</description>
    <language>en-in</language>
    ${latest ? `<lastBuildDate>${rfc822(latest)}</lastBuildDate>` : ''}
${items.join('\n')}
  </channel>
</rss>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}
