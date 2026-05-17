import { useFunComp } from "@sjjb/utils";
import { ElButton, ElDialog, ElRadio, ElRadioGroup } from "element-plus";
import { computed, createVNode, defineComponent, render, type PropType } from "vue";

export type ResizeDialogLayout = "A4_1" | "A3_2" | "A3_3";

type PaperSizeOption = {
  label: string;
  value: ResizeDialogLayout;
};

const STYLE_ID = "__answer-card-resize-dialog-style__";

export const paperSizeList: PaperSizeOption[] = [
  { value: "A4_1", label: "A4" },
  { value: "A3_2", label: "A3(双栏)" },
  { value: "A3_3", label: "A3(三栏)" },
];

const ensureDialogStyle = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.answer-card-resize-dialog__group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.answer-card-resize-dialog__item {
  margin-right: 0 !important;
}
.answer-card-resize-dialog__item .el-radio__input {
  display: none;
}
.answer-card-resize-dialog__item .el-radio__label {
  padding-left: 0;
}
.answer-card-resize-dialog__card {
  box-sizing: border-box;
  width: 100px;
  height: 100px;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.answer-card-resize-dialog__card:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}
.answer-card-resize-dialog__card.is-checked {
  border-color: #409eff;
  background-color: #f5f7fa;
}
.answer-card-resize-dialog__card.is-checked .answer-card-resize-dialog__icon {
  filter: brightness(1.2);
}
.answer-card-resize-dialog__card.is-checked .answer-card-resize-dialog__label {
  color: #409eff;
}
.answer-card-resize-dialog__icon {
  width: 60px;
  height: 50px;
  object-fit: contain;
}
.answer-card-resize-dialog__label {
  font-size: 12px;
  color: #666;
}
`;

  document.head.appendChild(style);
};

const normalizeLayout = (value?: string): ResizeDialogLayout => {
  if (paperSizeList.some(item => item.value === value)) {
    return value as ResizeDialogLayout;
  }
  return "A4_1";
};

const getIconPath = (value: ResizeDialogLayout, layout: ResizeDialogLayout) => {
  const isSelected = layout === value;
  let fileName = "";

  if (value.includes("_2")) {
    fileName = isSelected ? "doubleColumn-select.png" : "doubleColumn-Unselected.png";
  } else if (value.includes("_3")) {
    fileName = isSelected ? "Sanlan-select.png" : "Sanlan-Unselected.png";
  } else {
    fileName = isSelected ? "singleColumn-select.png" : "singleColumn-Unselected.png";
  }

  return new URL(`../../../Card/images/${fileName}`, import.meta.url).href;
};

export const ResizeDialog = defineComponent({
  name: "ResizeDialog",

  props: {
    open: {
      type: Boolean,
      default: false,
    },
    layout: {
      type: String as PropType<ResizeDialogLayout>,
      default: "A4_1",
    },
    title: {
      type: String,
      default: "答题卡布局",
    },
    confirmText: {
      type: String,
      default: "确定",
    },
    width: {
      type: [String, Number],
      default: 490,
    },
  },

  emits: ["update:open", "update:layout", "confirm", "cancel"],

  setup(props, { emit, expose }) {
    ensureDialogStyle();

    const dialogVisible = computed({
      get: () => props.open,
      set: (value: boolean) => {
        emit("update:open", value);
      },
    });

    const currentLayout = computed<ResizeDialogLayout>({
      get: () => normalizeLayout(props.layout),
      set: value => {
        emit("update:layout", normalizeLayout(value));
      },
    });

    const close = () => {
      dialogVisible.value = false;
    };

    const open = () => {
      dialogVisible.value = true;
    };

    const handleDialogVisibleChange = (value: boolean) => {
      if (!value && dialogVisible.value) {
        emit("cancel");
      }
      dialogVisible.value = value;
    };

    const handleConfirm = () => {
      emit("confirm", currentLayout.value);
    };

    expose({
      open,
      close,
    });

    return () => (
      <ElDialog
        modelValue={dialogVisible.value}
        width={props.width}
        destroyOnClose
        onUpdate:modelValue={handleDialogVisibleChange}>
        {{
          header: () => (
            <>
              <div class='text-h4'>{props.title}</div>
              <div class='divider my-20px' />
            </>
          ),
          default: () => (
            <div class='flex justify-center my-4'>
              <ElRadioGroup
                modelValue={currentLayout.value}
                class='answer-card-resize-dialog__group'
                onUpdate:modelValue={value => {
                  currentLayout.value = normalizeLayout(value);
                }}>
                {paperSizeList.map(size => {
                  const selected = currentLayout.value === size.value;

                  return (
                    <ElRadio
                      key={size.value}
                      label={size.value}
                      class='answer-card-resize-dialog__item'>
                      <div
                        class={[
                          "answer-card-resize-dialog__card",
                          selected && "is-checked",
                        ]}>
                        <div class='icon-wrapper'>
                          <img
                            src={getIconPath(size.value, currentLayout.value)}
                            alt='纸张样式'
                            class='answer-card-resize-dialog__icon'
                          />
                        </div>
                        <span class='answer-card-resize-dialog__label'>{size.label}</span>
                      </div>
                    </ElRadio>
                  );
                })}
              </ElRadioGroup>
            </div>
          ),
          footer: () => (
            <ElButton type='primary' class="mt-3"  onClick={handleConfirm}>
              {props.confirmText}
            </ElButton>
          ),
        }}
      </ElDialog>
    );
  },
});

export const ResizeModal = ResizeDialog;

export const useResizeDialog = (props?: InstanceType<typeof ResizeDialog>["$props"]) => {
  return useFunComp(ResizeDialog, props);
};

export const selectLayout = async (
  props?: Partial<InstanceType<typeof ResizeDialog>["$props"]>,
) => {
  ensureDialogStyle();

  return await new Promise<ResizeDialogLayout | null>(resolve => {
    const refEl = document.createElement("div");
    document.body.appendChild(refEl);

    let dialogOpen = true;
    let currentLayout = normalizeLayout(props?.layout);
    let settled = false;

    const cleanup = () => {
      render(null, refEl);
      refEl.remove();
    };

    const finish = (value: ResizeDialogLayout | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    const mount = () => {
      const vnode = createVNode(ResizeDialog, {
        ...props,
        open: dialogOpen,
        layout: currentLayout,
        "onUpdate:open": (value: boolean) => {
          dialogOpen = value;
          if (!value) {
            finish(null);
          }
        },
        "onUpdate:layout": (value: ResizeDialogLayout) => {
          currentLayout = normalizeLayout(value);
          if (!settled) mount();
        },
        onConfirm: (value: ResizeDialogLayout) => {
          finish(normalizeLayout(value));
        },
        onCancel: () => {
          finish(null);
        },
      });

      render(vnode, refEl);
    };

    mount();
  });
};

export const useResizeModal = useResizeDialog;
   
