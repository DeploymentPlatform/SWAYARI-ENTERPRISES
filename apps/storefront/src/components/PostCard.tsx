import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BlogPost, formatPostDate, postCardImage, postImageFocus } from '../lib/blog';
import { Link } from '../lib/router';

/** A gift-guide article as a card: picture, topic, date and a short summary. */
export const PostCard: React.FC<{ post: BlogPost; priority?: boolean }> = ({ post, priority }) => (
  <Link to={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-card border border-stone-deep/80 bg-white/90 shadow-card transition-all duration-500 ease-luxury hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_24px_48px_-28px_rgba(46,12,20,0.45)]">
    <div className="relative aspect-[4/3] overflow-hidden bg-stone">
      <img
        {...postCardImage(post.image)}
        sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw"
        alt={post.imageAlt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-full w-full object-cover ${postImageFocus(post.image)} transition-transform duration-700 ease-luxury group-hover:scale-[1.05]`}
      />
      <span className="absolute left-4 top-4 rounded-full bg-ivory-light/90 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-burgundy backdrop-blur">
        {post.category}
      </span>
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <p className="text-[0.75rem] uppercase tracking-[0.14em] text-ink-faint">
        {formatPostDate(post.date)} · {post.readMinutes} min read
      </p>
      <h3 className="mt-3 font-display text-[1.35rem] leading-snug text-ink transition-colors group-hover:text-burgundy sm:text-[1.5rem]">{post.title}</h3>
      <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-relaxed text-ink-soft">{post.excerpt}</p>
      <span className="text-link mt-auto pt-5">
        Read the guide <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </div>
  </Link>
);
