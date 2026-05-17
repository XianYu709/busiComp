import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  withDirectives,
  type Directive,
} from "vue";
import ToolsUI from "./ToolsUI.vue";
import { useCanvasMarking, type CanvasMarkingInstance, type MarkMode } from "./useCanvasMarking";
import { ElImageViewer, ElLoading } from "element-plus";
import previewIcon from "../img/preview.png";

// 防抖函数
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if(timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}
const MarkingTool = defineComponent({
  name: "MarkingTool",
  props: {
    canvasIns: {
      type: Object,
    },
  },
  setup(props) {
    return () => h(ToolsUI, { canvasIns: props.canvasIns });
  },
});

const MarkingBoard = defineComponent({
  name: "MarkingBoard",
  props: {
    jsonData: {
      type: String,
      default: "",
    },
    imgUrl: {
      type: String,
      default: "",
    },
    rootClass: {
      type: String,
      default: "",
    },
    rootStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["getCanvasIns", "delete"],
  setup(props, { emit }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const containerRef = ref<HTMLDivElement | null>(null);
    let distoryFn: any;
    let canvasIns: CanvasMarkingInstance | null = null;

    const loading = ref(false);

    // 调整 canvas 尺寸以适应新的容器宽度
    const handleResize = (newWidth: number) => {
      if(!canvasIns || !canvasRef.value) return;
      canvasIns.resize(newWidth);
    };

    // 防抖后的 resize 函数
    const debouncedResize = debounce(handleResize, 300);
    onMounted(async () => {
      loading.value = true;
      const ins = useCanvasMarking({
        canvasDom: canvasRef.value,
        onDelete: (text: string) => {
          emit("delete", text);
        },
      });
      canvasIns = ins;
      const { loadImg, load, distory } = ins;
      await loadImg(props.imgUrl);
      if (props.jsonData) {
        await load(props.jsonData);
      }
      emit("getCanvasIns", ins);
      loading.value = false;
      distoryFn = distory;

      // 添加 ResizeObserver 监听容器宽度变化
      if(containerRef.value) {
        const observer = new ResizeObserver((entries) => {
          for(const entry of entries) {
            const newWidth = Math.round(entry.contentRect.width);
            // 只有宽度变化超过 10px 时才调整
            const canvasWidth = canvasRef.value?.offsetWidth || 0;
            if(Math.abs(newWidth - canvasWidth) > 10) {
              debouncedResize(newWidth);
            }
          }
        });
        observer.observe(containerRef.value);

        // 在组件卸载时停止监听
        distoryFn = () => {
          observer.disconnect();
          distory();
        }
      }
    });

    onBeforeUnmount(() => {
      distoryFn?.();
    });

    const showViewer = ref(false);
    return () =>
      withDirectives(
        <div
          ref={containerRef}
          class={props.rootClass}
          style={{ ...props.rootStyle, overflow: "hidden", position: "relative" }}>
          <canvas
            style={{
              width: "100%",
              boxSizing: "border-box",
            }}
            ref={canvasRef}></canvas>
          <img
            src={previewIcon}
            class='absolute bottom-0 right-0 w-25px h-25px cursor-pointer'
            onClick={() => {
              showViewer.value = true;
            }}
          />
          {showViewer.value && (
            <ElImageViewer
              onClose={() => {
                showViewer.value = false;
              }}
              url-list={[props.imgUrl]}
            />
          )}
        </div>,
        [[ElLoading.directive as Directive, loading.value]],
      );
  },
});

const useVirtualComp = async ({
  imgUrl,
  JsonData,
  correctionContent,
  width,
  height,
  type = "png",
  quality = 1,
}: any) => {
  const CanvasDOM = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!CanvasDOM || !imgUrl) {
    return {
      CanvasDOM,
      MarkendImg: "",
    };
  }

  const targetWidth = Number(width);
  const targetHeight = Number(height);
  if (targetWidth > 0) {
    CanvasDOM.width = targetWidth;
  }
  if (targetHeight > 0) {
    CanvasDOM.height = targetHeight;
  }

  const ins = useCanvasMarking({
    canvasDom: CanvasDOM,
  });
  try {
    const realJsonData = JsonData ?? correctionContent;
    let onlyMarkJson: Record<string, any> | null = null;
    if (realJsonData) {
      try {
        let parsed = typeof realJsonData === "string" ? JSON.parse(realJsonData) : realJsonData;
        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
        if (Array.isArray(parsed?.objects)) {
          const objects = parsed.objects.filter((obj: any) => obj?.type !== "image");
          if (objects.length) {
            onlyMarkJson = {
              ...parsed,
              objects,
            };
          }
        }
      } catch (error) {
        console.error("解析标注 JSON 失败：", error);
      }
    }

    if (onlyMarkJson) {
      await ins.load(onlyMarkJson);
    } else {
      await ins.loadImg(imgUrl);
      if (realJsonData) {
        await ins.load(realJsonData);
      }
    }

    try {
      const MarkendImg = ins.saveToStatic(type, quality);
      return {
        CanvasDOM,
        MarkendImg,
      };
    } catch (error) {
      // 跨域图片会污染 canvas，导出时会抛 SecurityError。
      if (error instanceof DOMException && error.name === "SecurityError") {
        console.error("导出标注图片失败（跨域污染）:", imgUrl, error);
        return {
          CanvasDOM,
          MarkendImg: "",
        };
      }
      throw error;
    }
  } finally {
    ins.distory();
  }
};

export {
  useCanvasMarking,
  MarkingBoard,
  MarkingTool,
  type CanvasMarkingInstance,
  type MarkMode,
  useVirtualComp,
};