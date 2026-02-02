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
import { ElImageViewer, ElLoading } from "element-plus";
import previewIcon from "../img/preview.png";

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

    const showViewer = ref(false);
    return () =>
      withDirectives(
        <div
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

export { useCanvasMarking, MarkingBoard, MarkingTool, type CanvasMarkingInstance };
