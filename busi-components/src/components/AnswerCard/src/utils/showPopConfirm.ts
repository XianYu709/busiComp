import { createVNode, render, h } from "vue";
import { ElPopconfirm } from "element-plus";

export const showPopConfirm = (
  event: MouseEvent,
  options: {
    title?: string;
    onConfirm?: () => void;
  },
) => {
  const target = event.target as HTMLElement;

  const refEl = document.createElement("div");
  refEl.style.position = "absolute";

  const rect = target.getBoundingClientRect();
  refEl.style.left = rect.left + window.scrollX + "px";
  refEl.style.top = rect.top + window.scrollY + "px";

  document.body.appendChild(refEl);

  const close = () => {
    render(null, refEl);
    refEl.remove();
    document.removeEventListener('click', handleClickOutside);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (refEl.contains(e.target as Node)) {
      return;
    }
    close();
  };

  const vnode = createVNode(
    ElPopconfirm,
    {
      title: options.title || "确定删除吗？",
      confirmButtonText: "是",
      cancelButtonText: "否",
      visible: true,
      onConfirm: () => {
        options.onConfirm?.();
        close();
      },
      onHide: close,
    },
    {
      reference: () =>
        h("span", {
          style: "display:inline-block;width:1px;height:1px;",
        }),
    },
  );

  render(vnode, refEl);
  
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
};