import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate } from '@/lib/utils';
import type { BlogPost } from '@/data/blog';

export interface BlogCardProps {
  post: BlogPost;
  className?: string;
  /** Larger, full-width variant for the featured post. */
  featured?: boolean;
}

/**
 * Blog post card used on the /blog index.
 *
 * Server-compatible (no client hooks) so it renders inside streaming
 * Suspense without a hydration boundary. Links through to
 * `/blog/[slug]` and displays cover, tags, title, excerpt, author,
 * publish date, and read time.
 */
export function BlogCard({ post, className, featured = false }: BlogCardProps) {
  const href = `/blog/${post.slug}`;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface/40 transition-colors duration-300 hover:border-accent/40',
        className
      )}
    >
      {/* ── Cover ─────────────────────────────────────────────── */}
      <Link
        href={href}
        className={cn(
          'relative block overflow-hidden bg-background',
          featured ? 'aspect-[16/9] sm:aspect-[21/9]' : 'aspect-[16/10]'
        )}
        aria-label={post.title}
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt ?? post.title}
            fill
            sizes={
              featured
                ? '(max-width: 640px) 100vw, (max-width: 1280px) 75vw, 60vw'
                : '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
            }
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '2.5rem 2.5rem',
            }}
            aria-hidden="true"
          />
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.featured && (
          <span className="absolute right-3 top-3 z-10 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Featured
          </span>
        )}
      </Link>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3
          className={cn(
            'font-display font-extrabold tracking-tight text-white transition-colors group-hover:text-accent',
            featured ? 'text-xl sm:text-3xl' : 'text-lg sm:text-xl'
          )}
        >
          <Link
            href={href}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-zinc-400">
          {post.excerpt}
        </p>

        {/* Meta row */}
        <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readingTime} min read
          </span>
        </div>

        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          By <span className="text-accent">{post.author}</span>
        </p>
      </div>
    </article>
  );
}
