export function observeTouchBottomPlus(
  containerEl: HTMLElement | null,
  targetEl: HTMLElement | null,
  onTouch:
    | ((info: {
        entry: Element;
        touched: boolean;
        overflowPx: number;
        elHeight: number;
        remainPx: number;
        containerRect: DOMRect;
        elementRect: DOMRect;
      }) => void)
    | undefined,
  options: { offset?: number; once?: boolean } = {},
): () => void {
  const { offset = 0, once = true } = options;

  if (!containerEl || !targetEl) {
    console.warn("observeTouchBottomPlus: containerEl 或 targetEl 为空");
    return () => {};
  }

  const getRects = () => ({
    containerRect: containerEl.getBoundingClientRect(),
    elementRect: targetEl.getBoundingClientRect(),
  });

  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    observer.unobserve(targetEl);
    observer.disconnect();
  };

  const notifyTouch = (entry: Element) => {
    if (stopped || !onTouch) return false;

    const { containerRect, elementRect } = getRects();
    const elHeight = elementRect.height;
    const overflowPx = Math.max(0, elementRect.bottom + offset - containerRect.bottom);
    const remainPx = overflowPx > 0 ? Math.max(0, elHeight - overflowPx) : elHeight;
    const touched = overflowPx > 0;

    if (!touched) return false;

    onTouch({
      entry,
      touched,
      overflowPx,
      elHeight,
      remainPx,
      containerRect,
      elementRect,
    });

    if (once) {
      stop();
    }

    return true;
  };

  const observer = new IntersectionObserver(
    entries => {
      if (stopped) return;
      entries.forEach(entry => {
        notifyTouch(entry.target);
      });
    },
    {
      root: containerEl,
      threshold: [0, 1],
    },
  );

  observer.observe(targetEl);

  // 首次观测时题块可能已经完全落在分页容器外，此时不会稳定依赖到交叉状态变化。
  queueMicrotask(() => {
    notifyTouch(targetEl);
  });
  requestAnimationFrame(() => {
    notifyTouch(targetEl);
  });

  return stop;
}
