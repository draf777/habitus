import { linkify } from './linkify.util';

const LINK_STYLE = 'color: var(--ion-color-primary); text-decoration: underline;';

function link(url: string, label = url): string {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="${LINK_STYLE}">${label}</a>`;
}

describe('linkify', () => {
  it('leaves plain text without a URL unchanged', () => {
    expect(linkify('Einkaufen gehen')).toBe('Einkaufen gehen');
  });

  it('turns an http(s) URL into a clickable link', () => {
    expect(linkify('Siehe https://example.com/path')).toBe(`Siehe ${link('https://example.com/path')}`);
  });

  it('turns a www. URL into a link pointing at https://', () => {
    expect(linkify('Siehe www.example.com')).toBe(`Siehe ${link('https://www.example.com', 'www.example.com')}`);
  });

  it('links multiple URLs in the same text', () => {
    const result = linkify('a https://one.com b https://two.com c');
    expect(result).toContain('href="https://one.com"');
    expect(result).toContain('href="https://two.com"');
  });

  it('keeps trailing punctuation outside the link', () => {
    expect(linkify('Siehe https://example.com.')).toBe(`Siehe ${link('https://example.com')}.`);
  });

  it('keeps a URL in parentheses clickable without swallowing the closing paren', () => {
    expect(linkify('(https://example.com)')).toBe(`(${link('https://example.com')})`);
  });

  it('escapes HTML-special characters in plain text', () => {
    expect(linkify('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes HTML-special characters around a URL', () => {
    expect(linkify('<b>https://example.com</b>')).toBe(`&lt;b&gt;${link('https://example.com')}&lt;/b&gt;`);
  });

  it('handles an empty string', () => {
    expect(linkify('')).toBe('');
  });
});
