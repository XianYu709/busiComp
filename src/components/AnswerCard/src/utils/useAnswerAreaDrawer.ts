type DrawOnceOptions = {
  container: HTMLElement;
  id: string;
  prefix: string;
  minSizePx?: number;
  // 返回 false 可阻止删除（可选）
  onDelete?: (ctx: {
    id: string;
    rectEl: HTMLDivElement;
  }) => void | boolean | Promise<void | boolean>;
};

type DrawOnceResult = {
  rectEl: HTMLDivElement;
  remove: () => void;
};

let __drawStyleInjected = false;
function ensureDrawStyle() {
  if (__drawStyleInjected) return;
  __drawStyleInjected = true;

  const style = document.createElement("style");
  style.textContent = `
.__draw_container{position:relative;}
.__draw_container[data-draw="1"]{cursor:crosshair;user-select:none;touch-action:none;}
.__draw_container[data-draw="1"] *{pointer-events:none;}
.__draw_container[data-draw="1"] .__draw_rect,
.__draw_container[data-draw="1"] .__draw_rect *{pointer-events:auto;}
.__draw_container[data-rect-visible="0"] .__draw_rect{ display:none !important; }
`;
  document.head.appendChild(style);
}

export function drawOnceRect(opts: DrawOnceOptions): Promise<DrawOnceResult> {
  ensureDrawStyle();

  const container = opts.container;
  const rectId = opts.id;
  const prefix = opts.prefix ?? "";
  const minSizePx = opts.minSizePx ?? 8;
  const onDelete = opts.onDelete;

  if (!container || !(container instanceof HTMLElement)) {
    return Promise.reject(new Error("drawOnceRect: container 必须是 HTMLElement"));
  }

  container.classList.add("__draw_container");
  const computedPos = getComputedStyle(container).position;
  if (computedPos === "static") container.style.position = "relative";

  container.setAttribute("data-draw", "1");
  (document.activeElement as HTMLElement | null)?.blur?.();

  let drawing = false;
  let activePointerId: number | null = null;
  let sx = 0,
    sy = 0;

  let createdRect: HTMLDivElement | null = null;

  const getBox = () => container.getBoundingClientRect();
  const toLocal = (clientX: number, clientY: number) => {
    const r = getBox();
    return {
      x: Math.max(0, Math.min(r.width, clientX - r.left)),
      y: Math.max(0, Math.min(r.height, clientY - r.top)),
      r,
    };
  };

  const cleanup = () => {
    container.removeAttribute("data-draw");

    container.removeEventListener("pointerdown", onDown, true as any);
    container.removeEventListener("pointermove", onMove, true as any);
    container.removeEventListener("pointerup", onUp, true as any);
    container.removeEventListener("pointercancel", onCancel, true as any);

    container.removeEventListener("wheel", stopAll, true as any);
    container.removeEventListener("contextmenu", stopAll, true as any);
    container.removeEventListener("click", stopAll, true as any);
    container.removeEventListener("dblclick", stopAll, true as any);
  };

  const stopAll = (e: Event) => {
    if (container.getAttribute("data-draw") !== "1") return;
    e.preventDefault();
    e.stopPropagation();
  };

  const setRectBox = (rect: HTMLDivElement, x0: number, y0: number, x1: number, y1: number) => {
    const left = Math.min(x0, x1);
    const top = Math.min(y0, y1);
    const right = Math.max(x0, x1);
    const bottom = Math.max(y0, y1);

    rect.style.left = `${left}px`;
    rect.style.top = `${top}px`;
    rect.style.width = `${right - left}px`;
    rect.style.height = `${bottom - top}px`;
  };

  const createRectEl = () => {
    const exist = document.getElementById(rectId);
    if (exist?.parentElement === container) exist.remove();

    const rect = document.createElement("div");
    rect.id = rectId;
    rect.className = "__draw_rect";
    rect.style.position = "absolute";
    rect.style.left = "0px";
    rect.style.top = "0px";
    rect.style.width = "0px";
    rect.style.height = "0px";

    rect.style.borderRadius = "0";

    rect.style.background = "rgba(64,158,255,0.18)";
    rect.style.border = "1px solid rgba(64,158,255,0.9)";
    rect.style.boxSizing = "border-box";
    rect.style.zIndex = "2";

    const label = document.createElement("div");
    label.textContent = prefix;
    label.style.position = "absolute";
    label.style.left = "0px";
    label.style.top = "0px";
    label.style.transform = "translateY(-110%)";
    label.style.fontSize = "12px";
    label.style.padding = "0";
    label.style.borderRadius = "0";
    label.style.whiteSpace = "nowrap";
    label.style.background = "transparent"; // ✅ 去背景
    label.style.border = "none";
    label.style.color = "#1f2937";

    // 删除按钮：先创建但默认隐藏（绘制结束才显示）
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "删除";
    del.style.position = "absolute";
    del.style.right = "4px";
    del.style.bottom = "4px";
    del.style.height = "22px";
    del.style.padding = "0 8px";
    del.style.borderRadius = "0";
    del.style.border = "1px solid rgba(239,68,68,0.9)";
    del.style.background = "rgba(239,68,68,0.10)";
    del.style.color = "#b91c1c";
    del.style.cursor = "pointer";
    del.style.fontSize = "12px";
    del.style.display = "none";

    rect.addEventListener("mouseenter", () => {
      // drawing=true 时不要显示，避免影响拖拽体验
      if (drawing) return;
      del.style.display = "block";
    });
    rect.addEventListener("mouseleave", () => {
      del.style.display = "none";
    });

    del.addEventListener("click", async ev => {
      ev.preventDefault();
      ev.stopPropagation();

      if (onDelete) {
        const r = await onDelete({ id: rectId, rectEl: rect });
        if (r === false) return;
      }
      rect.remove();
    });

    del.addEventListener("click", async ev => {
      ev.preventDefault();
      ev.stopPropagation();

      if (onDelete) {
        const r = await onDelete({ id: rectId, rectEl: rect });
        if (r === false) return;
      }
      rect.remove();
    });

    rect.appendChild(label);
    rect.appendChild(del);

    // 挂到 rect 上，结束时用于显示
    (rect as any).__delBtn = del;

    container.appendChild(rect);
    return rect;
  };

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    const { x, y } = toLocal(e.clientX, e.clientY);
    sx = x;
    sy = y;

    drawing = true;
    activePointerId = e.pointerId;
    container.setPointerCapture?.(e.pointerId);

    createdRect = createRectEl();
    setRectBox(createdRect, sx, sy, sx, sy);
  };

  const onMove = (e: PointerEvent) => {
    if (!drawing) return;
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    if (!createdRect) return;

    e.preventDefault();
    e.stopPropagation();

    const { x, y } = toLocal(e.clientX, e.clientY);
    setRectBox(createdRect, sx, sy, x, y);
  };

  const finish = (e: PointerEvent) => {
    if (!drawing) return;
    if (activePointerId !== null && e.pointerId !== activePointerId) return;

    e.preventDefault();
    e.stopPropagation();

    drawing = false;
    activePointerId = null;

    if (createdRect) {
      const w = parseFloat(createdRect.style.width || "0");
      const h = parseFloat(createdRect.style.height || "0");
      if (w < minSizePx || h < minSizePx) {
        createdRect.remove();
        createdRect = null;
        cleanup();
        return rejectOnce(new Error("drawOnceRect: 绘制区域过小，已取消"));
      }

      const delBtn: HTMLButtonElement | undefined = (createdRect as any).__delBtn;
    }

    cleanup();

    if (createdRect) {
      const rectEl = createdRect;
      resolveOnce({
        rectEl,
        remove: () => rectEl.remove(),
      });
    } else {
      rejectOnce(new Error("drawOnceRect: 未生成识别区"));
    }
  };

  const onUp = (e: PointerEvent) => finish(e);
  const onCancel = (e: PointerEvent) => finish(e);

  let done = false;
  let _resolve!: (v: DrawOnceResult) => void;
  let _reject!: (err: any) => void;

  const resolveOnce = (v: DrawOnceResult) => {
    if (done) return;
    done = true;
    _resolve(v);
  };
  const rejectOnce = (err: any) => {
    if (done) return;
    done = true;
    _reject(err);
  };

  container.addEventListener("pointerdown", onDown, { passive: false, capture: true });
  container.addEventListener("pointermove", onMove, { passive: false, capture: true });
  container.addEventListener("pointerup", onUp, { passive: false, capture: true });
  container.addEventListener("pointercancel", onCancel, { passive: false, capture: true });

  container.addEventListener("wheel", stopAll, { passive: false, capture: true });
  container.addEventListener("contextmenu", stopAll, { passive: false, capture: true });
  container.addEventListener("click", stopAll, { passive: false, capture: true });
  container.addEventListener("dblclick", stopAll, { passive: false, capture: true });

  return new Promise<DrawOnceResult>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });
}

export const setAllBlockVisible = (container: HTMLElement, visible: boolean) => {
  if (!container || !(container instanceof HTMLElement)) {
    throw new Error("createRectController: container 必须是 HTMLElement");
  }
  if (!container.classList.contains("__draw_container")) {
    container.classList.add("__draw_container");
  }
  container.setAttribute("data-rect-visible", visible ? "1" : "0");
};
