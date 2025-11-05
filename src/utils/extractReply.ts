// Utility to extract the reply portion from an email body (text or html).
// Re-uses the heuristics previously inline in the imap-check route.

export const extractReply = (text?: string | null, html?: string | null): string | null => {
  if (!text && !html) return null;

  const normalize = (s: string) => s.replace(/\r/g, "");

  // Try text first
  let raw = text ? normalize(text) : null;

  const separatorPatterns = [
    /^_{2,}\s*$/m.source,
    /^-{2,}\s*$/m.source,
    /^From:\s.*$/mi.source,
    /^De:\s.*$/mi.source,
    /^On\s.+wrote:$/mi.source,
    /^>+/m.source,
    /^Reply sent on\s.*$/mi.source,
    /^Summary of the original message$/mi.source,
    /^Received on\s.*$/mi.source,
    /^Assunto:\s.*$/mi.source,
    /^Enviado:\s.*$/mi.source
  ];
  const splitter = new RegExp(separatorPatterns.join('|'), 'mi');

  if (raw) {
    const parts = raw.split(splitter);
    const first = (parts[0] || '').trim();
    if (first) return first;
  }

  // Fallback to HTML parsing via simple removals if available
  if (html) {
    try {
      // remove common quoted containers
      let stripped = html.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '');
      stripped = stripped.replace(/<div class=("|')?gmail_quote("|')?[\s\S]*?<\/div>/gi, '');
      // remove HTML tags
      const asText = normalize(stripped).replace(/<[^>]+>/g, '');
      const parts = asText.split(splitter);
      const first = (parts[0] || '').trim();
      if (first) return first;
    } catch (e) {
      // ignore HTML fallback errors
    }
  }

  // as a final fallback, return a cleaned-up original text (if any) or null
  if (raw) return raw.trim();
  return html ? html.replace(/<[^>]+>/g, '').trim() : null;
};
