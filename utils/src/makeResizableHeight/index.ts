type ResizeEndContext = {
  element: HTMLElement;
  previousHeight: number;
  height: number;
  changed: boolean;
};

type MakeResizableHeightOptions = {
  minHeight?: number;
  maxHeight?: number;
  getMaxHeight?: () => number;
  onResizeEnd?: (context: ResizeEndContext) => void;
};

type ResizableHeightController = {
  destroy: () => void;
};

const RESIZABLE_HEIGHT_INSTANCE_KEY = Symbol("makeResizableHeight.instance");
let resizeStyleInjected = false;

const ensureResizeStyle = () => {
  if (resizeStyleInjected) return;

  resizeStyleInjected = true;
  const style = document.createElement("style");
  style.innerHTML = `
    .resize-handle {
      position: absolute;
      left: 0;
      right: 0;
      height: 12px;
      bottom: 0;
      cursor: ns-resize;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      user-select: none;
    }

    .resize-corner {
      width: 20px;
      height: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 6px;
      opacity: 0.7;
      pointer-events: none;
    }

    .resize-corner svg {
      width: 12px;
      height: 12px;
    }

    .no-select {
      user-select: none !important;
      -webkit-user-select: none !important;
    }
  `;
  document.head.appendChild(style);
};

export function makeResizableHeight(
  el: HTMLElement,
  options: MakeResizableHeightOptions = {},
): ResizableHeightController {
  if (!el) throw new Error("Element is required");

  const target = el as HTMLElement & {
    [RESIZABLE_HEIGHT_INSTANCE_KEY]?: ResizableHeightController;
  };
  target[RESIZABLE_HEIGHT_INSTANCE_KEY]?.destroy();

  ensureResizeStyle();

  const { minHeight = 40, maxHeight = Infinity, getMaxHeight, onResizeEnd } = options;
  if (getComputedStyle(el).position === "static") {
    el.style.position = "relative";
  }

  const handle = document.createElement("div");
  handle.className = "resize-handle";
  handle.innerHTML = `
    <div class="resize-corner">
      <!--<svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 10 L10 2 M5 10 L10 5 M8 10 L10 8" stroke="#555" stroke-width="1.2" stroke-linecap="round" fill="none"/>
      </svg>-->
    </div>`;
  el.appendChild(handle);

  let dragging = false;
  let startY = 0;
  let startHeight = 0;
  let contentMinHeight = minHeight;
  let runtimeMaxHeight = maxHeight;
  const doc = document;

  const clearSelectionState = () => {
    document.documentElement.classList.remove("no-select");
  };

  const measureContentMinHeight = () => {
    const prevHeight = el.style.height;
    el.style.height = "auto";
    const measured = Math.ceil(el.getBoundingClientRect().height);
    el.style.height = prevHeight;
    return Math.max(minHeight, measured);
  };

  const onStart = (clientY: number) => {
    dragging = true;
    startY = clientY;
    startHeight = el.getBoundingClientRect().height;
    contentMinHeight = measureContentMinHeight();
    runtimeMaxHeight = getMaxHeight ? Math.max(contentMinHeight, minHeight, getMaxHeight()) : maxHeight;
    document.documentElement.classList.add("no-select");
  };

  const onMove = (clientY: number) => {
    if (!dragging) return;
    const dy = clientY - startY;
    let newHeight = startHeight + dy;
    newHeight = Math.max(contentMinHeight, newHeight);
    const effectiveMaxHeight = isFinite(runtimeMaxHeight)
      ? Math.max(contentMinHeight, runtimeMaxHeight)
      : maxHeight;
    if (isFinite(effectiveMaxHeight)) newHeight = Math.min(effectiveMaxHeight, newHeight);
    el.style.height = `${Math.round(newHeight)}px`;
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    clearSelectionState();

    const previousHeight = startHeight;
    const nextHeight = el.getBoundingClientRect().height;
    onResizeEnd?.({
      element: el,
      previousHeight,
      height: nextHeight,
      changed: Math.abs(nextHeight - previousHeight) >= 1,
    });
  };

  const mousemove = (e: MouseEvent) => {
    e.preventDefault();
    onMove(e.clientY);
  };

  const mouseup = () => {
    doc.removeEventListener("mousemove", mousemove);
    doc.removeEventListener("mouseup", mouseup);
    onEnd();
  };

  const touchmove = (e: TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;
    onMove(t.clientY);
  };

  const touchend = () => {
    doc.removeEventListener("touchmove", touchmove);
    doc.removeEventListener("touchend", touchend);
    doc.removeEventListener("touchcancel", touchend);
    onEnd();
  };

  handle.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    e.preventDefault();
    onStart(e.clientY);
    doc.addEventListener("mousemove", mousemove);
    doc.addEventListener("mouseup", mouseup);
  });

  handle.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (!t) return;
    onStart(t.clientY);
    doc.addEventListener("touchmove", touchmove, { passive: false });
    doc.addEventListener("touchend", touchend);
    doc.addEventListener("touchcancel", touchend);
  });

  const controller: ResizableHeightController = {
    destroy() {
      dragging = false;
      clearSelectionState();
      doc.removeEventListener("mousemove", mousemove);
      doc.removeEventListener("mouseup", mouseup);
      doc.removeEventListener("touchmove", touchmove);
      doc.removeEventListener("touchend", touchend);
      doc.removeEventListener("touchcancel", touchend);
      handle.remove();

      if (target[RESIZABLE_HEIGHT_INSTANCE_KEY] === controller) {
        delete target[RESIZABLE_HEIGHT_INSTANCE_KEY];
      }
    },
  };

  target[RESIZABLE_HEIGHT_INSTANCE_KEY] = controller;
  return controller;
}
