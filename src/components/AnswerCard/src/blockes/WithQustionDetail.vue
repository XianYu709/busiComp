<template>
  <div class="group relative w-full">
    <div
      class="absolute top-100% right-0 opacity-0 group-hover:opacity-100 flex align-start z-10"></div>
    <div class="viewport-container" :style="viewportStyle">
      <div class="content-wrapper" :style="contentStyle">
        <el-input
          v-if="isFirst"
          v-model="title"
          class="no-border-input input-title"
          placeholder="请输入标题"></el-input>
        <QuestionItem
          v-bind="item"
          :isEnd="props.isEnd"
          :breakPoint="{ start: 0, end: 1 }"
          @vue:mounted="outQuestionMounded" />
      </div>
    </div>
    <el-dialog v-model="openModel" width="500" title="每行选择题个数" destroy-on-close>
      <div class="flex items-center p-4">
        <el-radio-group v-model="quesionOptionLength">
          <el-radio value="100%">1个</el-radio>
          <el-radio value="50%">2个</el-radio>
          <el-radio value="25%">4个</el-radio>
        </el-radio-group>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="tsx" setup>
import {
  computed,
  defineComponent,
  inject,
  nextTick,
  ref,
  useAttrs,
  watch,
  type CSSProperties,
} from "vue";
import Block from "../base/Block.vue";
import { parseOptions } from "@sjjb/utils";
import { ElButton } from "element-plus";
import { getPosition, getPositionWithCache } from "../utils/getPosition";

const props = defineProps({
  isFirst: Boolean,
  isEnd: Boolean,
  originalHeight: {
    type: Number,
    default: 0,
  },
  breakPoint: {
    type: Object,
    default: () => ({ start: 0, end: 1 }),
  },
});

const emits = defineEmits(["delete", "end"]);
const title = defineModel<any>("title");
const childs = defineModel<any>("childs", { default: () => ({}) });
const item = defineModel<any>("item", { default: () => ({}) });

const sortType = computed(() => rightSetting.value?.sortType);
const sortFiledKey = computed(() =>
  sortType.value === "smallFollow" ? "prefix" : "bigSinglePrefix",
);
const rightSetting = inject<any>("AnswerCardSetting");

const openModel = ref(false);
const quesionOptionLength = defineModel<string>("quesionOptionLength", { default: "50%" });

const isSplitState = computed(() => {
  const { start, end } = props.breakPoint;
  return start > 0 || (end < 1 && end > 0);
});

const viewportStyle = computed<CSSProperties>(() => {
  if (!isSplitState.value || !props.originalHeight) return { width: "100%" };

  const { start, end } = props.breakPoint;
  const currentViewHeight = props.originalHeight * (end - start);

  return {
    height: `${currentViewHeight}px`,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  };
});

const contentStyle = computed<CSSProperties>(() => {
  if (!isSplitState.value || !props.originalHeight) return { width: "100%" };

  const { start } = props.breakPoint;
  // 这里的偏移量必须基于原始高度
  const offsetY = props.originalHeight * start;

  return {
    transform: `translateY(-${offsetY}px)`,
    height: `${props.originalHeight}px`,
    width: "100%",
  };
});

const ChioseOptionsBox = defineComponent({
  name: "ChioseOptionsBox",
  props: { questOption: Object },
  setup(props) {
    const onMouseOn = ref(false);
    const isTiantu = computed(() => rightSetting.value?.objectiveAnswerType === "tiantu");

    const groupedOptions = computed(() => {
      const width = quesionOptionLength.value;
      const perRow = width === "100%" ? 1 : width === "50%" ? 2 : 4;
      const raw = parseOptions(props.questOption);
      const entries = Object.keys(raw).map(key => ({ key, text: raw[key] }));

      const groups: any[][] = [];
      for (let i = 0; i < entries.length; i += perRow) {
        groups.push(entries.slice(i, i + perRow));
      }
      return groups;
    });

    return () => (
      <div
        class='flex flex-col space-y-2 w-full relative p-2  group/option'
        onMouseenter={() => (onMouseOn.value = true)}
        onMouseleave={() => (onMouseOn.value = false)}>
        {groupedOptions.value.map((row, rIndex) => (
          <div class='flex flex-row w-full' key={rIndex}>
            {row.map((opt, idx) => (
              <div
                key={idx}
                class='flex items-start font-normal text-14px color-#333333'
                style={{ width: quesionOptionLength.value }}>
                <span class='mt-4px'>{isTiantu.value ? `[${opt.key}]` : opt.key}</span>
                <span class='mt-3px ml-3px'>、</span>
                <Block class='flex-1' v-model={opt.text} border={false} />
              </div>
            ))}
          </div>
        ))}
        {onMouseOn.value && (
          <div class='absolute bottom-full right-0'>
            <ElButton type='primary' link size='small' onClick={() => (openModel.value = true)}>
              设置每行数量
            </ElButton>
          </div>
        )}
      </div>
    );
  },
});

const outAttrs = useAttrs();
const outQuestionMounded = async () => {};

const QuestionItem = defineComponent({
  name: "QuestionItem",
  props: {
    id: [String, Number],
    parentId: [String, Number],
    prefix: [String, Number],
    bigSinglePrefix: [String, Number],
    resQuestionContentVo: { type: Object, default: () => ({}) },
    isObjective: [Number, String],
    children: { type: Array, default: () => [] },
    childs: { type: Array, default: () => [] },
    answerType: Number,
    isEnd: Boolean,
  },
  setup(props) {
    const questionBoxRef = ref<HTMLElement | null>(null);
    const blockMountend = async () => {
      await nextTick();
      emits("end");
    };

    return () => (
      <div
        id={`${props.id}_${outAttrs.pageOf}_question`}
        class='mb-4 flex items-start w-full relative'
        data-pid={props.parentId}
        ref={questionBoxRef}>
        <p class='pt-5px mr-0px text-14px'>
          {props[sortFiledKey.value] ? `${props[sortFiledKey.value]}.` : ""}
        </p>
        <div class='flex-1'>
          <Block
            class='mb-2 w-full'
            v-model={props.resQuestionContentVo.questTopic}
            activeBorder
            border={false}
            editViewMerge={false}
            onMount-done={blockMountend}
          />
          {props.answerType == 1 && props.resQuestionContentVo.questOption && (
            <ChioseOptionsBox questOption={JSON.parse(props.resQuestionContentVo.questOption)} />
          )}
          {props.children?.length > 0 && (
            <div class='mt-2 pl-4 border-l border-gray-100'>
              {props.children.map((child: any) => (
                <QuestionItem {...child} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
});

const transformQuestion = (item: any): any => {
  return {
    id: item.id,
    questionId: item.id,
    score: item.score,
    isOneProb: item.isOneProb,
    isObjective: item.isObjective,
    parentId: item.parentId,
    answerType: item.answerType,
    answer: item.resQuestionContentVo?.questAnswer ?? null,
    questionTypeName: item.questionTypeName,
    questionType: item.questionType,
    childs: Array.isArray(item.children)
      ? item.children.map((child: any) => transformQuestion(child))
      : [],
  };
};

const getInfo = async () => {
  const end = transformQuestion(item.value);
  if (end.id && outAttrs?.pageBox) {
    const pageBox = outAttrs.pageBox as HTMLElement;
    const questionBlock = pageBox.ownerDocument.getElementById(
      `${end.id}_${outAttrs.pageOf}_block`,
    ) as HTMLElement;
    const { flag, data } = await getPositionWithCache(pageBox, questionBlock, "none");
    if (data && flag == "new") {
      end.infoList = [
        {
          ...data!.percentage,
          pageOf: (outAttrs?.pageOf as number) + 1,
        },
      ];
    }
    if (end?.childs && end?.childs.length > 0) {
      for (const chid of end.childs) {
        const questionBox = pageBox.ownerDocument.getElementById(
          `${chid.id}_${outAttrs.pageOf}_question`,
        ) as HTMLElement;
        const { flag, data } = await getPositionWithCache(pageBox, questionBox, "none");
        if (data && flag == "new") {
          chid.infoList = [
            {
              ...data!.percentage,
              pageOf: (outAttrs?.pageOf as number) + 1,
            },
          ];
        }
      }
    }
  }
  childs.value = [end];
};

defineExpose({
  getInfo,
});
</script>

<style lang="scss" scoped>
.viewport-container {
  -webkit-print-color-adjust: exact;
}

.content-wrapper {
  > * {
    box-sizing: border-box;
  }
  :deep(.block-content),
  :deep(.item-row) {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
.no-border-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  padding: 0;
}

.no-border-input :deep(.el-input__wrapper.is-focus) {
  border: 1px solid #409eff !important;
}

.input-title :deep(.el-input__inner) {
  font-weight: bold;
  color: #333;
}
:deep(.mce-content-body) {
  // 强制富文本内的所有图片、表格、列表项不要在中间被切断
  img,
  table,
  li,
  .ql-editor img {
    break-inside: avoid-page !important;
    page-break-inside: avoid !important;
    display: inline-block; // 某些浏览器下 block 元素规避效果更佳
    max-width: 100%;
  }
}
</style>
