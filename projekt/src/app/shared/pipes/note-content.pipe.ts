import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { linkify } from '../linkify.util';

const LIST_LINE = /^- (.*)$/;
// Hanging indent (negative text-indent pulls just the bullet back into the padding) so
// wrapped list lines still line up under the text, not under the bullet.
const LIST_ITEM_STYLE = 'padding-left: 1.25rem; text-indent: -1.25rem;';

/**
 * Renders a note's raw text as HTML for the read-only view: a line starting
 * with "- " becomes an indented line with a bullet in front, every other
 * line is kept as its own line, and any http(s)/www URL is turned into a
 * clickable link (via `linkify`, which also escapes everything else, so the
 * only unescaped markup here is the fixed wrapper tags this function itself
 * adds — the result is safe to trust as HTML).
 *
 * Purely for display — the edit form always shows/edits the raw text, so
 * there is no live rendering while typing.
 */
export function renderNoteContent(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .split('\n')
    .map((line) => {
      const listMatch = line.match(LIST_LINE);
      if (listMatch) {
        return `<div style="${LIST_ITEM_STYLE}">• ${linkify(listMatch[1])}</div>`;
      }
      return `<div>${linkify(line) || '&nbsp;'}</div>`;
    })
    .join('');
}

/**
 * Wraps `renderNoteContent` for template binding. Angular's default
 * `[innerHTML]` sanitizer strips `style` attributes outright (and would
 * strip the `<a>` tags `linkify` produces too, in older Angular versions),
 * so the result is explicitly trusted — safe here because `renderNoteContent`
 * only ever emits its own fixed wrapper markup around HTML-escaped text.
 */
@Pipe({ name: 'noteContent' })
export class NoteContentPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(renderNoteContent(text));
  }
}
