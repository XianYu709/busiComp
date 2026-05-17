import { toRaw } from "vue";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

const SAFE_SPLIT_EPSILON = 0.5;
const BRIEF_SPLIT_BUFFER_PX = 4;

const getProtectedSplitBlock = (el: Element | null): HTMLElement | null => {
  if (!(el instanceof HTMLElement)) return null;
  return (el.closest(".score-boxs") || el.closest(".split-unit")) as HTMLElement | null;
};

const nudgeOffsetBefore = (offset: number) => Math.max(0, offset - SAFE_SPLIT_EPSILON);

const findTextLineBreakOffset = (
  element: HTMLElement,
  containerRect: DOMRect,
  targetPx: number,
): number | null => {
  const ownerDocument = element.ownerDocument;
  const lineRects: Array<{ top: number; bottom: number }> = [];
  const LINE_TOLERANCE = 1;

  const pushLineRect = (top: number, bottom: number) => {
    if (!Number.isFinite(top) || !Number.isFinite(bottom)) return;
    if (bottom - top <= LINE_TOLERANCE) return;

    const existing = lineRects.find(
      line =>
        Math.abs(line.top - top) <= LINE_TOLERANCE &&
        Math.abs(line.bottom - bottom) <= LINE_TOLERANCE,
    );

    if (existing) {
      existing.top = Math.min(existing.top, top);
      existing.bottom = Math.max(existing.bottom, bottom);
      return;
    }

    lineRects.push({ top, bottom });
  };

  const walker = ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent?.replace(/\u00a0/g, " ").trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      const parentEl = node.parentElement;
      if (!parentEl) return NodeFilter.FILTER_REJECT;

      const style = getComputedStyle(parentEl);
      if (style.display === "none" || style.visibility === "hidden") {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = walker.nextNode();
  while (currentNode) {
    const range = ownerDocument.createRange();
    range.selectNodeContents(currentNode);

    Array.from(range.getClientRects()).forEach(rect => {
      if (rect.width <= 0 || rect.height <= 0) return;
      pushLineRect(rect.top - containerRect.top, rect.bottom - containerRect.top);
    });

    currentNode = walker.nextNode();
  }

  if (lineRects.length === 0) return null;

  lineRects.sort((a, b) => a.top - b.top || a.bottom - b.bottom);

  let bestBottom = -1;
  for (const lineRect of lineRects) {
    if (lineRect.bottom <= targetPx + SAFE_SPLIT_EPSILON && lineRect.bottom > bestBottom) {
      bestBottom = lineRect.bottom;
    }
  }

  return bestBottom > 0 ? bestBottom : null;
};

const findSafeOffset = (container: HTMLElement, targetPx: number): number => {
  const elements = container.querySelectorAll(
    "p, span, img, .item-row, .chiose-option .split-unit, .score-boxs, .inline-display, .inline-editor, .mce-content-body, .question-topic-block",
  );
  const containerRect = container.getBoundingClientRect();

  let bestOffset = targetPx;
  let bestCandidateTop = -1;
  let bestEl: Element | null = null;
  let protectedOffset = targetPx;
  let protectedCandidateTop = -1;
  let imageProtectedOffset = targetPx;
  let imageProtectedCandidateTop = -1;

  for (const rawEl of elements as any) {
    const protectedBlock = getProtectedSplitBlock(rawEl);
    const el = protectedBlock || rawEl;
    const rect = el.getBoundingClientRect();
    const relativeTop = rect.top - containerRect.top;
    const relativeBottom = rect.bottom - containerRect.top;

    // 找所有跨越切割点的元素，取 relativeTop 最大的（最接近切割点的内层元素）
    if (relativeTop < targetPx && relativeBottom > targetPx && relativeTop > bestCandidateTop) {
      bestCandidateTop = relativeTop;
      bestEl = el;
      bestOffset = nudgeOffsetBefore(relativeTop);
    }

    if (protectedBlock && relativeTop < targetPx && relativeBottom > targetPx) {
      if (relativeTop > protectedCandidateTop) {
        protectedCandidateTop = relativeTop;
        protectedOffset = nudgeOffsetBefore(relativeTop);
      }
    }

    if (
      (el as HTMLElement).tagName === "IMG" &&
      relativeTop < targetPx &&
      relativeBottom > targetPx
    ) {
      if (relativeTop > imageProtectedCandidateTop) {
        imageProtectedCandidateTop = relativeTop;
        imageProtectedOffset = nudgeOffsetBefore(relativeTop);
      }
    }
  }

  if (protectedCandidateTop >= 0) {
    // 得分框不允许被切开，命中后直接把整个得分框移到下一页。
    return protectedOffset;
  }

  if (imageProtectedCandidateTop >= 0) {
    // 图片不允许被切开，命中后将整张图片下移。
    return imageProtectedOffset;
  }

  if (bestEl && bestCandidateTop >= 0 && (bestEl as HTMLElement).tagName !== "IMG") {
    const el = bestEl as HTMLElement;
    const style = getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    const fontSize = parseFloat(style.fontSize) || 14;
    const fontFamily = style.fontFamily || "sans-serif";
    const elWidth = el.getBoundingClientRect().width;
    const text = el.textContent?.trim() ?? "";

    let usedPretext = false;
    const nativeLineBreakOffset = text
      ? findTextLineBreakOffset(el, containerRect, targetPx)
      : null;
    if (nativeLineBreakOffset !== null && nativeLineBreakOffset > bestCandidateTop) {
      bestOffset = nativeLineBreakOffset;
    } else if (text && elWidth > 0 && lineHeight > 0) {
      try {
        const prepared = prepareWithSegments(text, `${fontSize}px ${fontFamily}`);
        const { lines } = layoutWithLines(prepared, elWidth, lineHeight);
        let accY = bestCandidateTop;
        for (const _line of lines) {
          const nextY = accY + lineHeight;
          if (nextY > targetPx) break;
          accY = nextY;
        }
        if (accY > bestCandidateTop && accY <= targetPx) {
          bestOffset = accY;
          usedPretext = true;
        }
      } catch {}
    }

    if (nativeLineBreakOffset === null && !usedPretext && lineHeight > 0 && lineHeight < targetPx) {
      const linesFromElTop = Math.floor((targetPx - bestCandidateTop) / lineHeight);
      if (linesFromElTop > 0) {
        const lineAligned = bestCandidateTop + linesFromElTop * lineHeight;
        if (lineAligned > bestCandidateTop && lineAligned <= targetPx) {
          bestOffset = lineAligned;
        }
      }
    }
  }

  if (bestOffset < targetPx * 0.6) {
    if (bestEl && (bestEl as HTMLElement).tagName !== "IMG") {
      // 文本容器拿不到可靠的行边界时，宁可整块后移，也不要回退到裸像素硬切。
      return nudgeOffsetBefore(bestCandidateTop);
    }

    return targetPx;
  }
  return bestOffset;
};

const encodeBreakPoint = (start: number, end: number) => {
  let s = Number(start.toFixed(6));
  let e = Number(end.toFixed(6));

  if (s < 0) s = 0;
  if (e > 1) e = 1;
  if (e < s) [s, e] = [e, s];

  if (Math.abs(e - s) < 1e-6) {
    e = Math.min(1, s + 1e-6);
  }

  if (s <= 0 && e >= 1) return { start: 0, end: 1 };
  return { start: s, end: e };
};

const getArticleHeaderPx = (entryEl: HTMLElement, fallback: number) => {
  const gridEl = entryEl.querySelector("#articleContent .composition-grid") as HTMLElement | null;
  if (!gridEl) return fallback;

  const entryRect = entryEl.getBoundingClientRect();
  const gridRect = gridEl.getBoundingClientRect();
  const offset = gridRect.top - entryRect.top;

  if (!Number.isFinite(offset) || offset <= 0) return fallback;
  return Math.ceil(offset);
};

const getBriefQuestionBlocks = (item: any) => {
  const blocks: any[] = [];
  const childs = item?.model?.childs;
  if (!Array.isArray(childs)) return blocks;

  childs.forEach((child: any) => {
    const innerChilds = Array.isArray(child?.childs) ? child.childs : child?.block;
    if (Array.isArray(innerChilds) && innerChilds.length > 0) {
      blocks.push(...innerChilds);
    }
  });

  return blocks;
};

const getBriefQuestionSliceUnits = (block: any) => {
  const lineCount = Math.max(0, Number(block?.lineCount || 0));
  return lineCount + 1;
};

const getBriefQuestionUnitIndex = (ratio: number, totalUnits: number) => {
  return Math.floor(ratio * totalUnits + 1e-6 * totalUnits);
};

const getBriefQuestionMinSplitRatio = (item: any, originStart: number, originEnd: number) => {
  const blocks = getBriefQuestionBlocks(item);
  if (blocks.length === 0) return null;

  const totalUnits = blocks.reduce((sum, block) => sum + getBriefQuestionSliceUnits(block), 0);
  const currentSpan = originEnd - originStart;
  if (totalUnits <= 0 || currentSpan <= 0) return null;

  const startUnit = Math.min(
    totalUnits - 1,
    Math.max(0, getBriefQuestionUnitIndex(originStart, totalUnits)),
  );
  let offset = 0;

  for (const block of blocks) {
    const units = getBriefQuestionSliceUnits(block);
    const blockStart = offset;
    const blockEnd = offset + units;
    offset = blockEnd;

    if (startUnit < blockStart || startUnit >= blockEnd) continue;

    const localStart = startUnit - blockStart;
    const lineCount = units - 1;
    const requiredEndUnit =
      localStart === 0 ? (lineCount > 0 ? blockStart + 2 : blockEnd) : startUnit + 1;
    const requiredEnd = Math.min(totalUnits, requiredEndUnit) / totalUnits;

    return Math.max(0, Math.min(1, (requiredEnd - originStart) / currentSpan));
  }

  return null;
};

const getBriefQuestionSegmentUnits = (item: any, originStart: number, originEnd: number) => {
  const blocks = getBriefQuestionBlocks(item);
  if (blocks.length === 0) return null;

  const totalUnits = blocks.reduce((sum, block) => sum + getBriefQuestionSliceUnits(block), 0);
  if (totalUnits <= 0) return null;

  const startUnit = Math.min(
    totalUnits,
    Math.max(0, getBriefQuestionUnitIndex(originStart, totalUnits)),
  );
  const endUnit =
    originEnd >= 0.999
      ? totalUnits
      : Math.min(totalUnits, Math.max(0, getBriefQuestionUnitIndex(originEnd, totalUnits)));

  if (endUnit <= startUnit) return null;

  return {
    totalUnits,
    startUnit,
    endUnit,
    segmentUnits: endUnit - startUnit,
  };
};

const getBriefQuestionSplitRatioFromDom = (
  entryEl: HTMLElement,
  remainPx: number,
  item: any,
  originStart: number,
  originEnd: number,
) => {
  const segmentInfo = getBriefQuestionSegmentUnits(item, originStart, originEnd);
  if (!segmentInfo) return null;

  const blockEls = Array.from(
    entryEl.querySelectorAll<HTMLElement>(".fillBlank[data-brief-visible-units]"),
  );
  if (blockEls.length === 0) return null;

  const entryRect = entryEl.getBoundingClientRect();
  let fittedUnits = 0;

  for (const blockEl of blockEls) {
    const visibleUnits = Math.max(0, Number(blockEl.dataset.briefVisibleUnits || 0));
    if (visibleUnits <= 0) continue;

    const rect = blockEl.getBoundingClientRect();
    const relativeTop = rect.top - entryRect.top;
    const relativeBottom = rect.bottom - entryRect.top;

    if (relativeBottom <= remainPx + SAFE_SPLIT_EPSILON) {
      fittedUnits += visibleUnits;
      continue;
    }

    if (relativeTop >= remainPx - SAFE_SPLIT_EPSILON) break;

    const blockHeight = rect.height;
    if (blockHeight <= 0) break;

    const budget = Math.max(0, remainPx - relativeTop - BRIEF_SPLIT_BUFFER_PX);
    const approxUnitHeight = blockHeight / visibleUnits;
    let fitInBlock = Math.floor((budget + SAFE_SPLIT_EPSILON) / approxUnitHeight);
    fitInBlock = Math.max(0, Math.min(visibleUnits, fitInBlock));

    const hasPrefix = blockEl.dataset.briefHasPrefix === "1";
    const lineCount = Math.max(0, Number(blockEl.dataset.briefLineCount || 0));
    const minUnits = hasPrefix && lineCount > 0 ? 2 : 1;

    if (fitInBlock < minUnits) {
      break;
    }

    fittedUnits += fitInBlock;
    break;
  }

  fittedUnits = Math.min(segmentInfo.segmentUnits, fittedUnits);
  if (fittedUnits <= 0) return 0;

  return Math.max(0, Math.min(1, fittedUnits / segmentInfo.segmentUnits));
};

export const autoPagination = (data: any, info: any, item: any, pageOf: number): boolean => {
  const headerHeightMap: Record<string, number> = {
    ArticleQuestion: 90,
  };

  /**
   * - minRemainPx: 本页“头部最小可展示像素”，低于它 => 整块下移
   * - minSplitRatio: 本页“头部最小占比”，低于它 => 整块下移（兜底）
   */
  const policyMap: Record<string, { minSplitRatio: number; minRemainPx: number }> = {
    __default: { minSplitRatio: 0.08, minRemainPx: 60 },
    BriefQuestion: { minSplitRatio: 0.005, minRemainPx: 20 },
    ArticleQuestion: { minSplitRatio: 0.1, minRemainPx: 90 },
  };

  if (item.needCalculate === false) return false;

  const splitDepth = item.props?.splitDepth || 0;
  const MAX_SPLIT_DEPTH = 10;
  if (splitDepth >= MAX_SPLIT_DEPTH) return false;

  const type: string = info.entry.getAttribute("type");
  const itemIndex = data.value.indexOf(item);
  if (itemIndex === -1) return false;

  const currentPage = Number(pageOf);

  const entryEl: HTMLElement = info.entry as HTMLElement;

  const measuredElHeight = Math.max(
    Number(info.elHeight || 0),
    Number(entryEl?.scrollHeight || 0),
    Number(entryEl?.offsetHeight || 0),
    Number(entryEl?.getBoundingClientRect?.().height || 0),
  );

  const remainPx: number = Number(info.remainPx || 0);
  const originalHeight = item.props?.originalHeight || measuredElHeight;

  const prevBp = item.props?.breakPoint ?? { start: 0, end: 1 };
  const originStart = Number(prevBp.start ?? 0);
  const originEnd = Number(prevBp.end ?? 1);
  const keepCurrentBreakPoint = originStart > 0 || originEnd < 1;

  const moveFollowingCurrentPageItemsToNextPage = (startIndex: number, nextPageIndex: number) => {
    for (let i = startIndex; i < data.value.length; i++) {
      const followingItemPage = Number(data.value[i].pageOf) || 0;
      if (followingItemPage === currentPage) {
        data.value[i].pageOf = nextPageIndex;
      }
    }
  };

  const moveItemToNextPage = () => {
    const nextPageIndex = currentPage + 1;

    item.pageOf = nextPageIndex;
    item.needCalculate = true;
    item.props = {
      ...item.props,
      originalHeight,
      breakPoint: keepCurrentBreakPoint
        ? { start: originStart, end: originEnd }
        : { start: 0, end: 1 },
    };

    moveFollowingCurrentPageItemsToNextPage(itemIndex + 1, nextPageIndex);
  };

  let headerPx = headerHeightMap[type] || 0;
  if (type === "ArticleQuestion" && originStart <= 0) {
    headerPx = getArticleHeaderPx(entryEl, headerPx);
  }
  if (originStart > 0) headerPx = 0;

  const safeRemainPx = findSafeOffset(entryEl, remainPx);

  const usableHeight = measuredElHeight - headerPx;

  // 这一页可用于显示“该段头部”的像素
  const firstPageUsable = safeRemainPx - headerPx;

  if (usableHeight <= 0) return false;

  // 只要头部空间太小（例如只够一行），就整体下移到下一页
  const policy = policyMap[type] ?? policyMap.__default!;
  const HEAD_MIN_PX = policy.minRemainPx;
  const HEAD_MIN_RATIO = policy.minSplitRatio;

  // 如果 firstPageUsable <= 0，之前你是直接 return，
  // 但这会导致“上一页露头/压住/不正确” —— 应该直接下移
  const briefRatioRaw =
    type === "BriefQuestion"
      ? getBriefQuestionSplitRatioFromDom(entryEl, safeRemainPx, item, originStart, originEnd)
      : null;
  const ratioRaw = briefRatioRaw ?? Math.min(Math.max(firstPageUsable, 0) / usableHeight, 1);

  const briefMinSplitRatio =
    type === "BriefQuestion" ? getBriefQuestionMinSplitRatio(item, originStart, originEnd) : null;

  const headTooSmall =
    firstPageUsable < HEAD_MIN_PX ||
    ratioRaw < HEAD_MIN_RATIO ||
    (briefMinSplitRatio !== null && ratioRaw + 1e-6 < briefMinSplitRatio);

  if (headTooSmall) {
    moveItemToNextPage();
    return true;
  }

  // 屁股剩一点分页
  let ratio = ratioRaw;

  const EPS_PX = 2;
  const nearOverflow = safeRemainPx <= EPS_PX;

  if (nearOverflow && ratio >= 0.999) {
    ratio = (Math.max(firstPageUsable, 0) - 1) / usableHeight;
    ratio = Math.max(0, Math.min(ratio, 0.999));
  }

  // 当前段范围
  const currentSpan = originEnd - originStart;
  if (currentSpan <= 0) return false;

  const seg1End = originStart + currentSpan * ratio;
  const firstSegmentRatio = (seg1End - originStart) / currentSpan;

  if (type === "ArticleQuestion" && firstSegmentRatio + 1e-6 < policy.minSplitRatio) {
    moveItemToNextPage();
    return true;
  }

  const firstBp = encodeBreakPoint(originStart, seg1End);
  const secondBp = encodeBreakPoint(seg1End, originEnd);

  // 更新当前段
  item.needCalculate = true;
  item.pageOf = currentPage;
  item.props = {
    ...item.props,
    originalHeight,
    breakPoint: firstBp,
  };

  const itemRaw = toRaw(item);
  const { model, ...rest } = itemRaw;
  const itemNext: any = JSON.parse(JSON.stringify(rest));
  itemNext.model = item.model;
  itemNext.id = `${item.id}_sf_${Date.now()}`;
  itemNext.needCalculate = true;
  itemNext.pageOf = currentPage + 1;
  itemNext.isSuffix = true;
  itemNext.props = {
    ...itemNext.props,
    originalHeight,
    breakPoint: secondBp,
    splitDepth: splitDepth + 1,
  };

  data.value.splice(itemIndex, 1, item);
  data.value.splice(itemIndex + 1, 0, itemNext);

  moveFollowingCurrentPageItemsToNextPage(itemIndex + 2, currentPage + 1);
  return true;
};
