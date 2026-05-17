import { describe, expect, it } from "vitest";

import {
  EMPTY_BRACKET_PLACEHOLDER,
  normalizeEmptyBracket,
} from "./normalizeEmptyBracket";

describe("normalizeEmptyBracket", () => {
  it("normalizes empty bracket pairs", () => {
    expect(normalizeEmptyBracket("()")).toBe(EMPTY_BRACKET_PLACEHOLDER);
    expect(normalizeEmptyBracket("（）")).toBe(EMPTY_BRACKET_PLACEHOLDER);
    expect(normalizeEmptyBracket("( \u00A0 )")).toBe(EMPTY_BRACKET_PLACEHOLDER);
    expect(normalizeEmptyBracket("（&nbsp; &#160; \u3000）")).toBe(EMPTY_BRACKET_PLACEHOLDER);
  });

  it("keeps non-empty bracket pairs unchanged", () => {
    expect(normalizeEmptyBracket("（A）")).toBe("（A）");
    expect(normalizeEmptyBracket("(1)")).toBe("(1)");
    expect(normalizeEmptyBracket("（  A  ）")).toBe("（  A  ）");
    expect(normalizeEmptyBracket("（公式）")).toBe("（公式）");
  });

  it("treats html-wrapped empty content as empty", () => {
    expect(normalizeEmptyBracket("（<span>&nbsp;</span>）")).toBe(EMPTY_BRACKET_PLACEHOLDER);
    expect(normalizeEmptyBracket("（<span> </span><em>&#160;</em>）")).toBe(
      EMPTY_BRACKET_PLACEHOLDER,
    );
  });

  it("keeps html-wrapped non-empty content unchanged", () => {
    expect(normalizeEmptyBracket("（<span>A</span>）")).toBe("（<span>A</span>）");
  });

  it("normalizes multiple empty bracket pairs independently", () => {
    expect(normalizeEmptyBracket("题目（）答案()补充（A）")).toBe(
      `题目${EMPTY_BRACKET_PLACEHOLDER}答案${EMPTY_BRACKET_PLACEHOLDER}补充（A）`,
    );
  });

  it("returns non-string values as-is", () => {
    expect(normalizeEmptyBracket(undefined)).toBeUndefined();
    expect(normalizeEmptyBracket(null)).toBeNull();
  });
});
