<template>
  <div class="group relative w-full">
    <div
      class="absolute top-100% right-0 opacity-0 group-hover:opacity-100 flex align-start z-10"></div>
    <div class="viewport-container" :style="viewportStyle">
      <div class="content-wrapper" :style="contentStyle">
        <div
          v-if="isExportMode && isFirst"
          class="text-16px font-500 text-left text-black h-30px leading-30px">
          {{ title || " " }}
        </div>
        <el-input
          v-if="!isExportMode && isFirst"
          v-model="title"
          class="no-border-input input-title"
          placeholder="请输入标题"></el-input>
        <QuestionItem v-model="item" @vue:mounted="outQuestionMounded" />
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
import { getPositionWithCache } from "../utils/getPosition";
import { Plus } from "@element-plus/icons-vue";
import { drawOnceRect, setAllBlockVisible } from "../utils/useAnswerAreaDrawer";
import { log } from "fabric/fabric-impl";

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
const quesionOptionLength = defineModel<string>("quesionOptionLength", { default: "50%" });

const sortType = computed(() => rightSetting.value?.sortType);
const sortFiledKey = computed(() =>
  sortType.value === "smallFollow" ? "prefix" : "bigSinglePrefix",
);
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

const outAttrs = useAttrs();

const isExportMode = inject<any>("isExportMode");
const rightSetting = inject<any>("AnswerCardSetting");

watch(
  () => isExportMode.value,
  async newVal => {
    setAllBlockVisible(outAttrs.pageBox as HTMLElement, !newVal);
  },
);

const openModel = ref(false);

const ChioseOptionsBox = defineComponent({
  name: "ChioseOptionsBox",
  props: { questOption: Object, questionId: String },
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
        class='flex flex-col space-y-2 w-full relative p-2  group/option chiose-option '
        onMouseenter={() => (onMouseOn.value = true)}
        onMouseleave={() => (onMouseOn.value = false)}>
        {groupedOptions.value.map((row, rIndex) => (
          <div class='flex flex-row w-full' key={rIndex}>
            {row.map((opt, idx) => (
              <div
                key={idx}
                class='flex items-start font-normal text-14px color-#333333'
                style={{ width: quesionOptionLength.value }}>
                <span class='mt-5px mb-4px' id={props.questionId + "_options_" + opt.key}>
                  {isTiantu.value ? `[ ${opt.key} ]` : opt.key}
                </span>
                <span class='mt-3px ml-3px'>、</span>
                <Block class='flex-1' v-model={opt.text} border={false} />
              </div>
            ))}
          </div>
        ))}
        {onMouseOn.value && (
          <div class='absolute bottom-full right-4'>
            <ElButton type='primary' link size='small' onClick={() => (openModel.value = true)}>
              设置每行选项数量
            </ElButton>
          </div>
        )}
      </div>
    );
  },
});

const outQuestionMounded = async () => {};

const QuestionItem = defineComponent({
  name: "QuestionItem",
  props: {
    modelValue: {
      type: Object as any,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit: questionEmits }) {
    const singleQuestionType = computed(() => [1, 2, 3, 6].includes(props.modelValue.answerType));
    const questionBoxRef = ref<HTMLElement | null>(null);
    const blockMountend = async () => {
      await nextTick();
      emits("end");
    };
    const show = ref(false);
    const prefix = computed(() =>
      props.modelValue[sortFiledKey.value] ? `${props.modelValue[sortFiledKey.value]}.` : "",
    );

    const addAnswerArea = async (params: any) => {
      const pageBox = outAttrs.pageBox as HTMLElement;
      const pageOf = outAttrs.pageOf;
      const id = `${params.questionId}_answerArea_${Date.now()}`;

      await drawOnceRect({
        container: pageBox,
        id,
        prefix: props.modelValue?.bigQuestionNumber + "、" + params.prefix,
        onDelete: async ({ id }: { id: string }) => {
          questionEmits("update:modelValue", {
            ...props.modelValue,
            answerAreaList: (props.modelValue.answerAreaList || []).filter(item => item.id !== id),
          });
        },
      });

      questionEmits("update:modelValue", {
        ...props.modelValue,
        answerAreaList: [
          ...(props.modelValue.answerAreaList || []),
          {
            id,
            label: params.prefix,
            pageOf,
            ...params,
            type: singleQuestionType.value ? "objective" : "subjective",
          },
        ],
      });
    };

    const allowShow = computed(() =>
      singleQuestionType.value
        ? rightSetting.value?.objectiveAnswerType === "shouxie" &&
          (props.modelValue?.answerAreaList || []).length == 0
        : true,
    );

    return () => (
      <div
        id={`${props.modelValue.id}_${outAttrs.pageOf}_question`}
        class='mb-4 flex items-start w-full relative  '
        data-pid={props.modelValue.parentId}
        ref={questionBoxRef}
        onMouseenter={() => (show.value = true)}
        onMouseleave={() => (show.value = false)}>
        <ElButton
          style={{ visibility: allowShow.value && show.value ? "visible" : "hidden" }}
          class='absolute right-0  top-0 -transform-translate-y-100%  z-99 '
          text
          link
          type='primary'
          icon={Plus}
          onClick={() =>
            addAnswerArea({
              prefix: prefix.value,
              questionId: props.modelValue.id,
            })
          }>
          绘制作答识别区
        </ElButton>

        <p class='pt-5px mr-0px text-14px'>
          {/* {outAttrs.pageOf}-- */}
          {prefix.value}
        </p>
        <div class='flex-1'>
          <Block
            class='mb-2 w-full'
            v-model={props.modelValue.resQuestionContentVo.questTopic}
            activeBorder
            border={false}
            editViewMerge={false}
            onMount-done={blockMountend}
          />
          {singleQuestionType.value && props.modelValue.resQuestionContentVo.questOption && (
            <ChioseOptionsBox
              questOption={JSON.parse(props.modelValue.resQuestionContentVo.questOption)}
              questionId={props.modelValue.id}
            />
          )}
          {props.modelValue.children?.length > 0 && (
            <div class='mt-2 pl-4 border-l border-gray-100'>
              {props.modelValue.children.map((child: any) => (
                <QuestionItem
                  modelValue={child}
                  onUpdate:modelValue={e => {
                    const updatedChildren = (props.modelValue.children || []).map((c: any) => {
                      if (c.id === e.id) {
                        return e;
                      }
                      return c;
                    });
                    questionEmits("update:modelValue", {
                      ...props.modelValue,
                      children: updatedChildren,
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
});

const transformQuestion = (item: any): any => {
  const getOptionKeys = (it: any) => {
    if (![1, 2, 3].includes(it.answerType)) return null;
    const raw = JSON.parse(it?.resQuestionContentVo?.questOption || "[]");
    return raw.map(it => it.key);
  };
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
    contentList: getOptionKeys(item),
    answerAreaList: item.answerAreaList || [],
    childs: Array.isArray(item.children)
      ? item.children.map((child: any) => transformQuestion(child))
      : [],
  };
};

const getInfo = async () => {
  const end = transformQuestion(item.value);

  const pageBox = outAttrs?.pageBox as HTMLElement | undefined;
  if (!end.id || !pageBox) {
    childs.value = [end];
    return;
  }
  const pageDocument = pageBox.ownerDocument;
  // const pageOf = (Number(pageBox.getAttribute("pageof")) || 0) + 1;
  const pageOf = outAttrs.pageOf;
  const pushPos = (target: any, key: string, percentage: any, pageOf: number) => {
    target[key] = [...(target[key] || []), { ...percentage, pageOf }];
  };
  const calcPos = async (elId: string) => {
    const el = pageDocument.getElementById(elId) as HTMLElement | null;
    if (!el) return null;
    const { flag, data } = await getPositionWithCache(pageBox, el, "none");
    if (!data || flag !== "new") return null;

    return data.percentage;
  };

  const setMoudlePosInTarget = async (elId: string, pageOf: number, target: any) => {
    const p = await calcPos(elId);
    if (p) pushPos(target, "infoList", p, pageOf);

    if (target.answerAreaList?.length) {
      const results = await Promise.all(
        target.answerAreaList.map(async (area: any) => ({
          area,
          p: await calcPos(area.id),
        })),
      );

      for (const { area, p } of results) {
        if (!p) continue;
        if (area.type === "subjective") pushPos(target, "infoList", p, pageOf);
        if (area.type === "objective") pushPos(target, "choiceArea", p, pageOf);
      }
    }
    if ([1, 2, 3, 6].includes(target.answerType) && target.contentList?.length > 0) {
      const optionsInfo = await Promise.all(
        target.contentList.map(key => {
          return calcPos(`${target.id}_options_${key}`);
        }),
      );

      optionsInfo.forEach(item => {
        pushPos(target, "contentInfoList", item, pageOf);
      });
    }
  };

  await setMoudlePosInTarget(`${end.id}_${outAttrs.pageOf}_block`, pageOf, end);

  if (end.childs?.length) {
    for (const chid of end.childs) {
      await setMoudlePosInTarget(`${chid.id}_${outAttrs.pageOf}_question`, pageOf, chid);
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
