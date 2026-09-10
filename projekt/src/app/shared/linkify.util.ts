const URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/;
const TRAILING_PUNCTUATION = /[.,;:!?)"'\]]+$/;

/** Escapes HTML-special characters so plain text can be safely inserted via `innerHTML`. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Splits a matched URL from any trailing punctuation, e.g. so "(https://x.com)." keeps the link clean. */
function splitTrailingPunctuation(url: string): readonly [string, string] {
  const match = url.match(TRAILING_PUNCTUATION);
  if (!match || match[0].length >= url.length) {
    return [url, ''];
  }
  return [url.slice(0, -match[0].length), match[0]];
}

/**
 * Renders plain text as HTML with any http(s)/www URLs turned into clickable
 * links; everything else is HTML-escaped first, so the result is safe to
 * bind via `[innerHTML]`.
 */
export function linkify(text: string): string {
  return text
    .split(URL_PATTERN)
    .map((part, index) => {
      if (index % 2 === 0) {
        return escapeHtml(part);
      }
      const [url, trailing] = splitTrailingPunctuation(part);
      const href = url.startsWith('www.') ? `https://${url}` : url;
      // Styled inline rather than via component CSS: content inserted through `[innerHTML]`
      // isn't covered by Angular's emulated style encapsulation, so a scoped stylesheet
      // rule wouldn't reliably reach it.
      const style = 'color: var(--ion-color-primary); text-decoration: underline;';
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="${style}">${escapeHtml(url)}</a>${escapeHtml(trailing)}`;
    })
    .join('');
}
