import { toRaw } from "vue";

const findSafeOffset = (container: HTMLElement, targetPx: number): number => {
  const elements = container.querySelectorAll("p, span, img, .item-row, .chiose-option");
  const containerRect = container.getBoundingClientRect();

  let bestOffset = targetPx;

  for (const el of elements as any) {
    const rect = el.getBoundingClientRect();
    const relativeTop = rect.top - containerRect.top;
    const relativeBottom = rect.bottom - containerRect.top;

    if (relativeTop < targetPx && relativeBottom > targetPx) {
      bestOffset = relativeTop - 2;
      break;
    }
  }

  if (bestOffset < targetPx * 0.6) return targetPx;
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

export const autoPagination = (data: any, info: any, item: any, pageOf: number) => {
  const headerHeightMap: Record<string, number> = {
    ArticleQuestion: 80,
  };

  /**
   * - minRemainPx: 本页“头部最小可展示像素”，低于它 => 整块下移
   * - minSplitRatio: 本页“头部最小占比”，低于它 => 整块下移（兜底）
   */
  const policyMap: Record<string, { minSplitRatio: number; minRemainPx: number }> = {
    __default: { minSplitRatio: 0.08, minRemainPx: 60 },
    BriefQuestion: { minSplitRatio: 0.03, minRemainPx: 40 },
    ArticleQuestion: { minSplitRatio: 0.1, minRemainPx: 90 },
  };

  if (item.needCalculate === false) return;

  const type: string = info.entry.getAttribute("type");
  const itemIndex = data.value.indexOf(item);
  if (itemIndex === -1) return;

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

  let headerPx = headerHeightMap[type] || 0;
  if (originStart > 0) headerPx = 0;

  const safeRemainPx = findSafeOffset(entryEl, remainPx);

  const usableHeight = measuredElHeight - headerPx;

  // 这一页可用于显示“该段头部”的像素
  const firstPageUsable = safeRemainPx - headerPx;

  if (usableHeight <= 0) return;

  // 只要头部空间太小（例如只够一行），就整体下移到下一页
  const policy = policyMap[type] ?? policyMap.__default!;
  const HEAD_MIN_PX = policy.minRemainPx;
  const HEAD_MIN_RATIO = policy.minSplitRatio;

  // 如果 firstPageUsable <= 0，之前你是直接 return，
  // 但这会导致“上一页露头/压住/不正确” —— 应该直接下移
  const ratioRaw = Math.min(Math.max(firstPageUsable, 0) / usableHeight, 1);

  const headTooSmall = firstPageUsable < HEAD_MIN_PX || ratioRaw < HEAD_MIN_RATIO;

  if (headTooSmall) {
    const nextPageIndex = currentPage + 1;

    item.pageOf = nextPageIndex;
    item.needCalculate = true;

    const keepBp = originStart > 0 || originEnd < 1;
    item.props = {
      ...item.props,
      originalHeight,
      breakPoint: keepBp ? { start: originStart, end: originEnd } : { start: 0, end: 1 },
    };

    // 后续元素整体后移一页
    for (let i = itemIndex + 1; i < data.value.length; i++) {
      data.value[i].pageOf = (Number(data.value[i].pageOf) || 0) + 1;
    }
    return;
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
  if (currentSpan <= 0) return;

  const seg1End = originStart + currentSpan * ratio;

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

  const itemNext: any = JSON.parse(JSON.stringify(toRaw(item)));
  itemNext.id = `${item.id}_sf_${Date.now()}`;
  // 仅题卡合一：WithQustionDetail 的 suffix 不再参与分页（你原逻辑保留）
  itemNext.needCalculate = itemNext.type !== "WithQustionDetail";
  itemNext.pageOf = currentPage + 1;
  itemNext.isSuffix = true;
  itemNext.props = {
    ...itemNext.props,
    originalHeight,
    breakPoint: secondBp,
  };

  data.value.splice(itemIndex, 1, item);
  data.value.splice(itemIndex + 1, 0, itemNext);

  for (let i = itemIndex + 2; i < data.value.length; i++) {
    data.value[i].pageOf = (Number(data.value[i].pageOf) || 0) + 1;
  }
};
