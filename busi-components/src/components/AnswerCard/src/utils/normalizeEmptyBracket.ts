export const EMPTY_BRACKET_PLACEHOLDER = "（&nbsp;&nbsp;&nbsp;&nbsp;）";

const EMPTY_BRACKET_INNER_PATTERN = /^(?:\s|&nbsp;|&#160;|\u00A0|\u3000)*$/i;

export const isEmptyBracketInner = (content: string) => {
  const stripped = content.replace(/<[^>]*>/g, "");
  return EMPTY_BRACKET_INNER_PATTERN.test(stripped);
};

export const normalizeEmptyBracket = (content: unknown) => {
  if (typeof content !== "string") return content;

  return content.replace(/[\(（]([\s\S]*?)[\)）]/g, (match, inner: string) =>
    isEmptyBracketInner(inner) ? EMPTY_BRACKET_PLACEHOLDER : match,
  );
};
