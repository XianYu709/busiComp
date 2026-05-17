type TestType = "none" | "box" | "point";

export type PositionResult = {
  percentage: { x0: string; y0: string; x1: string; y1: string };
  pixel: { top: number; left: number; width: number; height: number };
};

export type PositionReturn = {
  flag: "new" | "cache";
  data: PositionResult | null;
};

type CacheEntry = {
  rectAKey?: string;
  rectBKey?: string;
  result?: PositionResult | null;
  testType?: TestType;
  pending?: Promise<PositionReturn>;
};

const __posCache = new WeakMap<HTMLElement, WeakMap<HTMLElement, CacheEntry>>();

function getEntry(relative: HTMLElement, absolute: HTMLElement): CacheEntry {
  let inner = __posCache.get(relative);
  if (!inner) {
    inner = new WeakMap();
    __posCache.set(relative, inner);
  }
  let entry = inner.get(absolute);
  if (!entry) {
    entry = {};
    inner.set(absolute, entry);
  }
  return entry;
}

/* ================= 工具函数 ================= */

function rectKey(rect: DOMRect): string {
  const r = (n: number) => Math.round(n * 10000) / 10000;
  return `${r(rect.left)},${r(rect.top)},${r(rect.width)},${r(rect.height)}`;
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

async function waitForStableRects(
  relative: HTMLElement,
  absolute: HTMLElement,
  maxFrames = 6,
): Promise<{ rectA: DOMRect; rectB: DOMRect } | null> {
  let lastKey = "";
  let lastRects: { rectA: DOMRect; rectB: DOMRect } | null = null;

  for (let i = 0; i < maxFrames; i++) {
    await nextFrame();
    if (!relative.isConnected || !absolute.isConnected || !relative.contains(absolute)) {
      return null;
    }

    const rectA = relative.getBoundingClientRect();
    const rectB = absolute.getBoundingClientRect();
    if (rectA.width <= 0 || rectA.height <= 0 || rectB.width <= 0 || rectB.height <= 0) {
      lastKey = "";
      lastRects = { rectA, rectB };
      continue;
    }

    const key = `${rectKey(rectA)}|${rectKey(rectB)}`;
    lastRects = { rectA, rectB };
    if (key === lastKey) return lastRects;
    lastKey = key;
  }

  if (!lastRects || lastRects.rectA.width <= 0 || lastRects.rectA.height <= 0) return null;
  if (lastRects.rectB.width <= 0 || lastRects.rectB.height <= 0) return null;
  return lastRects;
}

let testMarkId = 0;

function getTestMarkOwner(element: HTMLElement) {
  if (!element.dataset.positionOwner) {
    testMarkId += 1;
    element.dataset.positionOwner = `position_${testMarkId}`;
  }
  return element.dataset.positionOwner;
}

function clearTestMark(relative: HTMLElement, absolute: HTMLElement) {
  const owner = getTestMarkOwner(absolute);
  const targetKey = getDebugTargetKey(absolute);
  relative.querySelectorAll(".__position_test_mark__").forEach(el => {
    const node = el as HTMLElement;
    if (
      node.dataset.positionOwner === owner ||
      (targetKey && node.dataset.positionTargetKey === targetKey)
    ) {
      node.remove();
    }
  });
}

function getDebugTargetKey(element: HTMLElement) {
  return element.getAttribute("data-position-debug-name") || element.id || "";
}

function getDebugTargetLabel(element: HTMLElement) {
  return (
    getDebugTargetKey(element) || element.getAttribute("class") || element.tagName.toLowerCase()
  );
}

function resolveTestType(testType: TestType): TestType {
  if (testType !== "none" || typeof window === "undefined") return testType;

  const urlDebugType = new URLSearchParams(window.location.search).get("positionDebug");
  if (urlDebugType === "box" || urlDebugType === "point") return urlDebugType;

  try {
    const storageDebugType = window.localStorage?.getItem("answer-card-position-debug");
    if (storageDebugType === "box" || storageDebugType === "point") return storageDebugType;
  } catch {
    return testType;
  }

  return testType;
}

function resolveMarkType(testType: TestType): "box" | "point" {
  return testType === "point" ? "point" : "box";
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function clipRect(
  pixel: { top: number; left: number; width: number; height: number },
  container: { width: number; height: number },
) {
  const x0 = Math.max(0, pixel.left);
  const y0 = Math.max(0, pixel.top);
  const x1 = Math.min(container.width, pixel.left + pixel.width);
  const y1 = Math.min(container.height, pixel.top + pixel.height);

  if (x1 <= x0 || y1 <= y0) return null;

  return {
    left: x0,
    top: y0,
    width: x1 - x0,
    height: y1 - y0,
  };
}

/* ================= 测试标记 ================= */

function applyTestMark(
  relative: HTMLElement,
  absolute: HTMLElement,
  testType: TestType,
  pixel: { top: number; left: number; width: number; height: number },
  rectA: DOMRect,
) {
  if (testType === "none") return;

  // 清除旧标记
  clearTestMark(relative, absolute);

  if (testType === "point") {
    // ❌ 超出直接不显示
    if (pixel.left < 0 || pixel.top < 0 || pixel.left > rectA.width || pixel.top > rectA.height) {
      return;
    }

    const dot = document.createElement("div");
    dot.className = "__position_test_mark__";
    dot.dataset.positionOwner = getTestMarkOwner(absolute);
    dot.dataset.positionTarget = getDebugTargetLabel(absolute);
    dot.dataset.positionTargetKey = getDebugTargetKey(absolute);
    dot.title = dot.dataset.positionTarget;
    dot.style.cssText = `
      position:absolute;
      width:8px;
      height:8px;
      background:red;
      border-radius:50%;
      left:${pixel.left}px;
      top:${pixel.top}px;
      z-index:999999;
    `;
    relative.appendChild(dot);
  }

  if (testType === "box") {
    const clipped = clipRect(pixel, {
      width: rectA.width,
      height: rectA.height,
    });

    // ❌ 完全在外部
    if (!clipped) return;

    const box = document.createElement("div");
    box.className = "__position_test_mark__";
    box.dataset.positionOwner = getTestMarkOwner(absolute);
    box.dataset.positionTarget = getDebugTargetLabel(absolute);
    box.dataset.positionTargetKey = getDebugTargetKey(absolute);
    box.title = box.dataset.positionTarget;
    box.style.cssText = `
      position:absolute;
      left:${clipped.left}px;
      top:${clipped.top}px;
      width:${clipped.width}px;
      height:${clipped.height}px;
      background:rgba(255,0,0,0.2);
      box-sizing:border-box;
      border:1px solid red;
      z-index:999999;
      pointer-events:none;
    `;
    relative.appendChild(box);
  }
}

/* ================= 主函数 ================= */
export function getPosition(
  relative: HTMLElement,
  absolute: HTMLElement | undefined,
  testType: "none" | "box" | "point" = "none",
) {
  return new Promise(resolve => {
    if (!relative || !absolute) return resolve(null);

    waitForStableRects(relative, absolute).then(rects => {
      if (!rects) return resolve(null);
      const { rectA, rectB } = rects;
      const resolvedTestType = resolveTestType(testType);
      //左上角x0y0
      const x_lt = ((rectB.left - rectA.left) / rectA.width).toFixed(6);
      const y_lt = ((rectB.top - rectA.top) / rectA.height).toFixed(6);
      //右下角x1y1
      const x_rb = ((rectB.width + (rectB.left - rectA.left)) / rectA.width).toFixed(6);
      const y_rb = ((rectB.height + (rectB.top - rectA.top)) / rectA.height).toFixed(6);

      const relativeTop = rectB.top - rectA.top;
      const relativeLeft = rectB.left - rectA.left;

      const result = {
        percentage: {
          x0: x_lt,
          y0: y_lt,
          x1: x_rb,
          y1: y_rb,
        },
        pixel: {
          top: relativeTop,
          left: relativeLeft,
          width: rectB.width,
          height: rectB.height,
        },
      };

      const markType = resolveMarkType(resolvedTestType);
      if (markType !== "none") {
        clearTestMark(relative, absolute);
        resolve(result);
        return;
      }

      if (markType === "point") {
        const dot = document.createElement("div");
        dot.className = "__position_test_mark__";
        dot.dataset.positionOwner = getTestMarkOwner(absolute);
        dot.dataset.positionTarget = getDebugTargetLabel(absolute);
        dot.dataset.positionTargetKey = getDebugTargetKey(absolute);
        dot.title = dot.dataset.positionTarget;
        dot.style.cssText = `
            position:absolute;
            width:8px;
            height:8px;
            background:red;
            border-radius:50%;
            left:${relativeLeft}px;
            top:${relativeTop}px;
            z-index:999999;
          `;
        relative.appendChild(dot);
      }

      if (markType === "box") {
        const box = document.createElement("div");
        box.className = "__position_test_mark__";
        box.dataset.positionOwner = getTestMarkOwner(absolute);
        box.dataset.positionTarget = getDebugTargetLabel(absolute);
        box.dataset.positionTargetKey = getDebugTargetKey(absolute);
        box.title = box.dataset.positionTarget;
        box.style.cssText = `
            position:absolute;
            left:${relativeLeft}px;
            top:${relativeTop}px;
            width:${rectB.width}px;
            height:${rectB.height}px;
            background:rgba(255,0,0,0.2);
            box-sizing:border-box;
            border:1px solid red;
            z-index:999999;
            pointer-events:none;
          `;
        relative.appendChild(box);
      }

      resolve(result);
    });
  });
}

export function getPositionWithCache(
  relative: HTMLElement,
  absolute: HTMLElement | undefined,
  testType: TestType = "none",
): Promise<PositionReturn> {
  return new Promise(resolve => {
    if (!relative || !absolute) {
      resolve({ flag: "new", data: null });
      return;
    }

    waitForStableRects(relative, absolute).then(rects => {
      if (!rects) {
        resolve({ flag: "new", data: null });
        return;
      }

      const entry = getEntry(relative, absolute);
      const resolvedTestType = resolveTestType(testType);

      // 同一对元素 + 同 testType：复用 pending
      if (entry.pending && entry.testType === resolvedTestType) {
        entry.pending.then(resolve);
        return;
      }

      entry.testType = resolvedTestType;

      entry.pending = new Promise<PositionReturn>(innerResolve => {
        const { rectA, rectB } = rects;

        const rectAKey = rectKey(rectA);
        const rectBKey = rectKey(rectB);

        // ✅ 命中缓存
        if (
          entry.result !== undefined &&
          entry.rectAKey === rectAKey &&
          entry.rectBKey === rectBKey
        ) {
          if (entry.result)
          innerResolve({ flag: "cache", data: entry.result });
          return;
        }

        /* ===== 坐标计算 ===== */

        const rawX0 = (rectB.left - rectA.left) / rectA.width;
        const rawY0 = (rectB.top - rectA.top) / rectA.height;
        const rawX1 = (rectB.left - rectA.left + rectB.width) / rectA.width;
        const rawY1 = (rectB.top - rectA.top + rectB.height) / rectA.height;

        const result: PositionResult = {
          percentage: {
            x0: clamp01(rawX0).toFixed(6),
            y0: clamp01(rawY0).toFixed(6),
            x1: clamp01(rawX1).toFixed(6),
            y1: clamp01(rawY1).toFixed(6),
          },
          pixel: {
            top: rectB.top - rectA.top,
            left: rectB.left - rectA.left,
            width: rectB.width,
            height: rectB.height,
          },
        };

        // 写入缓存
        entry.rectAKey = rectAKey;
        entry.rectBKey = rectBKey;
        entry.result = result;

        innerResolve({ flag: "new", data: result });
      }).finally(() => {
        entry.pending = undefined;
      });

      entry.pending.then(resolve);
    });
  });
}

export function getElementRealHeight(element) {
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error("参数必须是一个有效的DOM元素");
  }

  // 保存原始样式
  const originalStyles = {
    height: element.style.height,
    overflow: element.style.overflow,
    display: element.style.display,
  };

  // 临时修改样式以确保获取完整高度
  element.style.height = "auto";
  element.style.overflow = "visible";
  element.style.display = "block";

  // 获取各种高度
  const clientHeight = element.clientHeight;
  const offsetHeight = element.offsetHeight;
  const scrollHeight = element.scrollHeight;

  // 恢复原始样式
  element.style.height = originalStyles.height;
  element.style.overflow = originalStyles.overflow;
  element.style.display = originalStyles.display;

  // 获取计算样式
  const computedStyle = window.getComputedStyle(element);
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
  const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
  const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;

  // 计算内容高度（去除内边距和边框）
  const contentHeight = scrollHeight - paddingTop - paddingBottom;

  return {
    clientHeight,
    offsetHeight,
    scrollHeight,
    contentHeight,
    padding: paddingTop + paddingBottom,
    border: borderTop + borderBottom,
  };
}

export function getRelativePercentageByDirectionalPoint(
  container: HTMLElement,
  point: { x: number; y: number },
  anchor: "lt" | "rt" | "lb" | "rb" = "lt",
) {
  if (!container || !(container instanceof HTMLElement)) {
    throw new Error("container 必须是有效 DOM");
  }

  const rect = container.getBoundingClientRect();
  const { width, height } = rect;

  let offsetX = 0;
  let offsetY = 0;

  switch (anchor) {
    case "lt": // 左上角
      offsetX = point.x;
      offsetY = point.y;
      break;

    case "rt": // 右上角
      offsetX = width - point.x;
      offsetY = point.y;
      break;

    case "lb": // 左下角
      offsetX = point.x;
      offsetY = height - point.y;
      break;

    case "rb": // 右下角
      offsetX = width - point.x;
      offsetY = height - point.y;
      break;
  }

  return {
    percentage: {
      x: (offsetX / width).toFixed(6),
      y: (offsetY / height).toFixed(6),
    },
    pixelFromLT: { x: offsetX, y: offsetY },
    originalPoint: point,
    anchor,
    container: { width, height },
  };
}
