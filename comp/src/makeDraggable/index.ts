import { onMounted, onBeforeUnmount, watch, type Ref } from "vue";

export interface UseDraggableOptions {
  /** 拖拽触发区域 */
  handle?: string | HTMLElement | null;
  /** 拖拽边界约束 */
  bounds?:
    | "parent"
    | "window"
    | { left?: number; top?: number; right?: number; bottom?: number }
    | null;
  /** 回调：开始拖拽 */
  onDragStart?: (info: DragEventInfo) => void;
  /** 回调：拖拽中 */
  onDrag?: (info: DragEventInfo) => void;
  /** 回调：结束拖拽 */
  onDragEnd?: (info: DragEventInfo) => void;
  /** 是否使用 transform (默认 true) */
  useTransform?: boolean;
}

export interface DragEventInfo {
  el: HTMLElement;
  x: number;
  y: number;
  originalEvent: PointerEvent;
}

export interface DraggableController {
  destroy(): void;
  enable(): void;
  disable(): void;
}

export function useDraggable(
  targetRef: Ref<HTMLElement | null>,
  options: UseDraggableOptions = {},
): DraggableController {
  let controller: DraggableController | null = null;

  onMounted(() => {
    if (targetRef.value) {
      controller = makeDraggable(targetRef.value, options);
    }
  });

  onBeforeUnmount(() => {
    controller?.destroy();
    controller = null;
  });

  // 可响应 props 更新（比如 handle、bounds 动态变化）
  watch(
    () => ({ ...options }),
    () => {
      if (!targetRef.value) return;
      controller?.destroy();
      controller = makeDraggable(targetRef.value, options);
    },
    { deep: true },
  );

  return {
    destroy: () => controller?.destroy(),
    enable: () => controller?.enable(),
    disable: () => controller?.disable(),
  };
}

function makeDraggable(el: HTMLElement, options: UseDraggableOptions = {}): DraggableController {
  if (!(el instanceof HTMLElement)) throw new Error("makeDraggable: el 必须是 HTMLElement");

  const cfg = {
    handle: null,
    bounds: null,
    onDragStart: undefined,
    onDrag: undefined,
    onDragEnd: undefined,
    useTransform: true,
    ...options,
  };

  const handleEl =
    typeof cfg.handle === "string"
      ? (el.querySelector(cfg.handle) as HTMLElement | null)
      : cfg.handle instanceof HTMLElement
        ? cfg.handle
        : el;

  if (!handleEl) throw new Error("makeDraggable: 找不到 handle 元素");

  let dragging = false;
  let pressed = false;
  let startPointer = { x: 0, y: 0 };
  let startPos = { x: 0, y: 0 };
  let current = { x: 0, y: 0 };
  const threshold = 3; // 超过3px才判定为拖拽

  /** 获取当前 translate 偏移 */
  function getTranslate(el: HTMLElement) {
    const st = window.getComputedStyle(el);
    const tr = st.transform || st.webkitTransform;
    if (tr && tr !== "none") {
      const m = tr.match(/matrix.*\((.+)\)/);
      if (m) {
        const values = m[1].split(",").map(v => parseFloat(v));
        if (values.length === 6) return { x: values[4], y: values[5] };
        if (values.length === 16) return { x: values[12], y: values[13] };
      }
    }
    return { x: 0, y: 0 };
  }

  /** 应用边界约束 */
  function applyBounds(x: number, y: number) {
    if (!cfg.bounds) return { x, y };

    const rect = el.getBoundingClientRect();
    let leftBound = -Infinity,
      topBound = -Infinity,
      rightBound = Infinity,
      bottomBound = Infinity;

    if (cfg.bounds === "parent" && el.parentElement) {
      const p = el.parentElement.getBoundingClientRect();
      ({ left: leftBound, top: topBound, right: rightBound, bottom: bottomBound } = p);
    } else if (cfg.bounds === "window") {
      leftBound = 0;
      topBound = 0;
      rightBound = window.innerWidth;
      bottomBound = window.innerHeight;
    } else if (typeof cfg.bounds === "object") {
      leftBound = cfg.bounds.left ?? leftBound;
      topBound = cfg.bounds.top ?? topBound;
      rightBound = cfg.bounds.right ?? rightBound;
      bottomBound = cfg.bounds.bottom ?? bottomBound;
    }

    const newLeft = rect.left + x;
    const newTop = rect.top + y;
    const newRight = rect.right + x;
    const newBottom = rect.bottom + y;

    let dx = x,
      dy = y;
    if (newLeft < leftBound) dx += leftBound - newLeft;
    if (newRight > rightBound) dx -= newRight - rightBound;
    if (newTop < topBound) dy += topBound - newTop;
    if (newBottom > bottomBound) dy -= newBottom - bottomBound;

    return { x: dx, y: dy };
  }

  /** pointerDown */
  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pressed = true;

    const t = getTranslate(el);
    startPos = { ...t };
    startPointer = { x: e.clientX, y: e.clientY };
    current = { ...t };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  /** pointerMove */
  function onPointerMove(e: PointerEvent) {
    if (!pressed) return;

    const dx = e.clientX - startPointer.x;
    const dy = e.clientY - startPointer.y;

    // 小于阈值，不算拖拽
    if (!dragging && Math.hypot(dx, dy) < threshold) return;

    // 第一次超过阈值 → 开始拖拽
    if (!dragging) {
      dragging = true;
      handleEl.setPointerCapture?.(e.pointerId);
      document.body.style.userSelect = "none";
      document.body.style.touchAction = "none";
      cfg.onDragStart?.({ el, x: current.x, y: current.y, originalEvent: e });
    }

    let nx = startPos.x + dx;
    let ny = startPos.y + dy;
    ({ x: nx, y: ny } = applyBounds(nx, ny));
    current = { x: nx, y: ny };

    if (cfg.useTransform) {
      el.style.transform = `translate(${nx}px, ${ny}px)`;
    } else {
      el.style.position = el.style.position || "absolute";
      el.style.left = `${nx}px`;
      el.style.top = `${ny}px`;
    }

    cfg.onDrag?.({ el, x: nx, y: ny, originalEvent: e });
  }

  /** pointerUp */
  function onPointerUp(e: PointerEvent) {
    if (dragging) {
      cfg.onDragEnd?.({ el, x: current.x, y: current.y, originalEvent: e });
    }

    dragging = false;
    pressed = false;

    handleEl.releasePointerCapture?.(e.pointerId);
    document.body.style.userSelect = "";
    document.body.style.touchAction = "";

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  }

  handleEl.style.touchAction ||= "none";
  handleEl.addEventListener("pointerdown", onPointerDown);

  return {
    destroy() {
      handleEl.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    },
    enable() {
      handleEl.addEventListener("pointerdown", onPointerDown);
    },
    disable() {
      handleEl.removeEventListener("pointerdown", onPointerDown);
    },
  };
}
