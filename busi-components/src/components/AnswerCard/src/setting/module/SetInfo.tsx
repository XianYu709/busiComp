import { ElButton } from "element-plus";
import { computed, defineComponent, inject } from "vue";

export default defineComponent({
  name: "SetInfo",
  props: {
    showSetInfo: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      required: true,
    },
    infoList: {
      type: Array as () => any[],
      default: () => [],
    },
    allowClick: {
      type: Boolean,
      default: true,
    },
    more: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String as () => "button" | "text",
      default: "button",
      validator: (val: string) => ["button", "text"].includes(val),
    },
  },

  emits: ["update:infoList"],

  setup(props, { emit }) {
    const markFuns = inject<any>("markFuns");
    if (!markFuns) {
      throw new Error("SetInfo: markFuns not provided");
    }
    const infoList = computed<any[]>({
      get() {
        return props.infoList;
      },
      set(val) {
        emit("update:infoList", val);
      },
    });

    const have = computed(() => infoList.value.length > 0);

    const onSelect = async () => {
      if (!props.allowClick) return;

      if (have.value && !props.more) {
        markFuns.deleteAllByLabel(props.label);
      }

      const id = await markFuns.markingWithLabel(props.label);
      infoList.value = props.more ? infoList.value.concat(id) : [id];
    };

    const onRemove = () => {
      if (!have.value) return;
      markFuns.deleteAllByLabel(props.label);
      infoList.value = [];
    };

    const selectText = computed(() => {
      if (!have.value) return "框选";
      return props.more ? "继续框选" : "重新框选";
    });

    return () => {
      if (!props.showSetInfo) return null;

      if (props.type === "button") {
        return (
          <div class='set-info'>
            <ElButton
              size='small'
              plain
              disabled={!props.allowClick}
              type={have.value ? "info" : "primary"}
              onClick={onSelect}>
              {selectText.value}
            </ElButton>

            <ElButton size='small' plain type='danger' disabled={!have.value} onClick={onRemove}>
              移除
            </ElButton>
          </div>
        );
      }

      return (
        <div class='set-info-text'>
          <a
            style={{
              color: props.allowClick ? "#409EFF" : "#C0C4CC",
              cursor: props.allowClick ? "pointer" : "not-allowed",
              marginRight: "5px",
            }}
            onClick={onSelect}>
            {selectText.value}
          </a>

          <a
            style={{
              color: have.value ? "#F56C6C" : "#C0C4CC",
              cursor: have.value ? "pointer" : "not-allowed",
            }}
            onClick={onRemove}>
            移除
          </a>
        </div>
      );
    };
  },
});
