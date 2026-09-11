import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { NoteContentPipe, renderNoteContent } from './note-content.pipe';

describe('renderNoteContent', () => {
  it('handles an empty string', () => {
    expect(renderNoteContent('')).toBe('');
  });

  it('leaves normal text unchanged (wrapped as a plain line)', () => {
    expect(renderNoteContent('Ein ganz normaler Satz.')).toBe('<div>Ein ganz normaler Satz.</div>');
  });

  it('keeps several plain lines as separate lines', () => {
    expect(renderNoteContent('Erste Zeile\nZweite Zeile')).toBe('<div>Erste Zeile</div><div>Zweite Zeile</div>');
  });

  it('renders a blank line as an empty line instead of collapsing it', () => {
    expect(renderNoteContent('Vorher\n\nNachher')).toBe('<div>Vorher</div><div>&nbsp;</div><div>Nachher</div>');
  });

  it('recognizes a "- " line as an indented, bulleted list item', () => {
    const result = renderNoteContent('- Milch kaufen');
    expect(result).toContain('text-indent');
    expect(result).toContain('• Milch kaufen');
  });

  it('recognizes several "- " lines as separate list items', () => {
    const result = renderNoteContent('- Milch\n- Brot');
    expect(result.match(/•/g)).toHaveLength(2);
    expect(result).toContain('• Milch');
    expect(result).toContain('• Brot');
  });

  it('does not treat a line with a mid-text hyphen as a list item', () => {
    expect(renderNoteContent('Das ist - so gesehen - normaler Text')).toBe(
      '<div>Das ist - so gesehen - normaler Text</div>',
    );
  });

  it('does not treat "-" without a following space as a list item', () => {
    expect(renderNoteContent('-kein Leerzeichen danach')).toBe('<div>-kein Leerzeichen danach</div>');
  });

  it('recognizes a URL in a plain line and turns it into a clickable link', () => {
    const result = renderNoteContent('Siehe https://example.com');
    expect(result).toContain('<a href="https://example.com"');
    expect(result).toContain('target="_blank"');
  });

  it('recognizes a URL inside a list line and turns it into a clickable link', () => {
    const result = renderNoteContent('- Siehe https://example.com');
    expect(result).toContain('• Siehe');
    expect(result).toContain('<a href="https://example.com"');
  });

  it('escapes HTML-special characters in plain text', () => {
    expect(renderNoteContent('<b>fett</b>')).toBe('<div>&lt;b&gt;fett&lt;/b&gt;</div>');
  });
});

describe('NoteContentPipe', () => {
  it("trusts renderNoteContent's output as HTML, so [innerHTML] does not strip the inline styles/links it relies on", () => {
    TestBed.configureTestingModule({});
    const pipe = TestBed.runInInjectionContext(() => new NoteContentPipe());
    const sanitizer = TestBed.inject(DomSanitizer);

    const result = pipe.transform('- Milch');

    // A plain (non-trusted) string would come back stripped of the style attribute here;
    // getting it back unchanged confirms the pipe marked it as trusted.
    expect(sanitizer.sanitize(SecurityContext.HTML, result)).toBe(renderNoteContent('- Milch'));
  });
});
