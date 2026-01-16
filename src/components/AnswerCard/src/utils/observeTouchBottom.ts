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

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const { containerRect, elementRect } = getRects();

        const elHeight = elementRect.height;

        // 超出多少
        const overflowPx = Math.max(0, elementRect.bottom + offset - containerRect.bottom);

        // 元素剩余还在容器里面的像素（如果没超出 = 全高度）
        const remainPx = overflowPx > 0 ? Math.max(0, elHeight - overflowPx) : elHeight;

        const touched = overflowPx > 0;

        if (touched && onTouch) {
          onTouch({
            entry: entry.target,
            touched,
            overflowPx,
            elHeight,
            remainPx,
            containerRect,
            elementRect,
          });

          if (once) {
            observer.unobserve(targetEl);
            observer.disconnect();
          }
        }
      });
    },
    {
      root: containerEl,
      threshold: [0, 1],
    },
  );

  observer.observe(targetEl);

  return () => {
    observer.unobserve(targetEl);
    observer.disconnect();
  };
}
