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
import { useCanvasMarking, type CanvasMarkingInstance } from "./useCanvasMarking";
import { ElLoading } from "element-plus";

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
  emits: ["getCanvasIns"],
  setup(props, { emit }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    let distoryFn: any;

    const loading = ref(false);
    onMounted(async () => {
      loading.value = true;
      const ins = useCanvasMarking({
        canvasDom: canvasRef.value,
      });
      const { loadImg, distory } = ins;
      await loadImg(props.imgUrl);
      emit("getCanvasIns", ins);
      loading.value = false;
      distoryFn = distory;
    });

    onBeforeUnmount(() => {
      distoryFn();
    });

    return () =>
      withDirectives(
        <div class={props.rootClass} style={{ ...props.rootStyle, overflow: "hidden" }}>
          <canvas
            style={{
              width: "100%",
              boxSizing: "border-box",
            }}
            ref={canvasRef}></canvas>
        </div>,
        [[ElLoading.directive as Directive, loading.value]],
      );
  },
});

export { useCanvasMarking, MarkingBoard, MarkingTool, type CanvasMarkingInstance };
