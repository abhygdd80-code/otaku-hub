import { cn } from '@/utils/cn';

export interface BlogPostContentProps {
  /** Rendered HTML (from Shopify `contentHtml` or local markup). */
  contentHtml?: string;
  /** Plain-text fallback when `contentHtml` is absent. */
  content: string;
  className?: string;
}

/**
 * Render the body of a blog post.
 *
 * When `contentHtml` is present (Shopify articles, local posts with
 * pre-rendered markup) it is rendered as-is — Shopify's content is
 * trusted CMS content. Otherwise the plain text is split into paragraphs
 * at blank lines and wrapped in `<p>` tags.
 */
export function BlogPostContent({
  contentHtml,
  content,
  className,
}: BlogPostContentProps) {
  // If we have HTML, render it directly.
  if (contentHtml) {
    return (
      <div
        className={cn(
          'prose prose-invert prose-zinc max-w-none',
          'prose-headings:text-white prose-p:text-zinc-400',
          'prose-a:text-accent prose-a:no-underline hover:prose-a:underline',
          'prose-strong:text-white prose-img:rounded-xl',
          'prose-li:text-zinc-400 prose-code:text-accent/80',
          className
        )}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  // Plain text → paragraphs.
  const paragraphs = content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <div className={cn('space-y-5', className)}>
      {paragraphs.map((para, i) => {
        // Detect headers that are ALL-CAPS or start with a line like "BUILD\n" / "FIT NOTES\n".
        const isHeading =
          /^[A-Z][A-Z &]{3,}$/.test(para) ||
          (para.split('\n').length === 1 && /^[A-Z][A-Z &]{2,}$/.test(para));

        if (isHeading) {
          return (
            <h3
              key={i}
              className="text-lg font-display font-extrabold tracking-tight text-white pt-2"
            >
              {para}
            </h3>
          );
        }

        // Multi-line sub-section (e.g. "BUILD\n..." where first line is a heading).
        const lines = para.split('\n');
        if (lines.length >= 2 && /^[A-Z][A-Z &]{2,}$/.test(lines[0])) {
          return (
            <div key={i} className="pt-2">
              <h3 className="text-lg font-display font-extrabold tracking-tight text-white mb-2">
                {lines[0]}
              </h3>
              {lines.slice(1).map((line, j) => (
                <p key={j} className="text-sm leading-relaxed text-zinc-400">
                  {line}
                </p>
              ))}
            </div>
          );
        }

        return (
          <p
            key={i}
            className="text-sm sm:text-base leading-relaxed text-zinc-400"
          >
            {para}
          </p>
        );
      })}
    </div>
  );
}
