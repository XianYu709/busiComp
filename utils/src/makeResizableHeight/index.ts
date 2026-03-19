export function makeResizableHeight(el, options = { minHeight: 40, maxHeight: Infinity }) {
  if (!el) throw new Error("Element is required");

  // 动态添加样式
  const style = document.createElement("style");
  style.innerHTML = `
    #${el.id} {
      position: relative;
    }
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

  // 创建拖动手柄
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

  const doc = document;

  const onStart = clientY => {
    dragging = true;
    startY = clientY;
    startHeight = el.getBoundingClientRect().height;
    document.documentElement.classList.add("no-select");
  };

  const onMove = clientY => {
    if (!dragging) return;
    const dy = clientY - startY;
    let newHeight = startHeight + dy;
    newHeight = Math.max(options.minHeight, newHeight);
    if (isFinite(options.maxHeight)) newHeight = Math.min(options.maxHeight, newHeight);
    el.style.height = Math.round(newHeight) + "px";
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    document.documentElement.classList.remove("no-select");

    // 检查是否小于内容高度
    const scrollH = el.scrollHeight;
    const currentH = el.getBoundingClientRect().height;
    if (currentH < scrollH) {
      // 恢复原高度
      el.style.height = startHeight + "px";
    }
  };

  // 鼠标事件
  handle.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    e.preventDefault();
    onStart(e.clientY);
    doc.addEventListener("mousemove", mousemove);
    doc.addEventListener("mouseup", mouseup);
  });

  const mousemove = e => {
    e.preventDefault();
    onMove(e.clientY);
  };
  const mouseup = () => {
    doc.removeEventListener("mousemove", mousemove);
    doc.removeEventListener("mouseup", mouseup);
    onEnd();
  };

  // 触摸事件
  handle.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    onStart(t.clientY);
    doc.addEventListener("touchmove", touchmove, { passive: false });
    doc.addEventListener("touchend", touchend);
    doc.addEventListener("touchcancel", touchend);
  });

  const touchmove = e => {
    e.preventDefault();
    const t = e.touches[0];
    onMove(t.clientY);
  };
  const touchend = () => {
    doc.removeEventListener("touchmove", touchmove);
    doc.removeEventListener("touchend", touchend);
    doc.removeEventListener("touchcancel", touchend);
    onEnd();
  };

  return {
    destroy() {
      handle.remove();
      style.remove(); // 清理动态添加的样式
    },
  };
}