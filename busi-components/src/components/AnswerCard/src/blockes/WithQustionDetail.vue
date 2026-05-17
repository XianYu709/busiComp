<template>
  <div
    class="group relative w-full"
    @mouseenter="handleSegmentMouseEnter"
    @mouseleave="handleSegmentMouseLeave">
    <div
      class="absolute top-100% right-0 opacity-0 group-hover:opacity-100 flex align-start z-10"></div>
    <ElButton
      v-if="continuedQuestionButton"
      :style="{
        visibility: segmentHover ? 'visible' : 'hidden',
        background: '#e7eff9',
      }"
      class="absolute right-0 top-0 z-99"
      type="primary"
      text
      plain
      @click="handleContinuedQuestionAddAnswerArea">
      {{ continuedQuestionButton.buttonText }}
    </ElButton>
    <div class="viewport-container" :style="viewportStyle">
      <div ref="contentWrapperRef" class="content-wrapper" :style="contentStyle">
        <div
          v-if="isExportMode && isFirst"
          class="text-16px font-500 text-left text-black h-30px leading-30px">
          {{ displayTitle || " " }}
        </div>
        <el-input
          v-if="!isExportMode && isFirst"
          :model-value="displayTitle"
          class="no-border-input input-title"
          @focus="handleTitleFocus"
          @blur="handleTitleBlur"
          @update:model-value="handleTitleInput"
          placeholder="请输入标题"></el-input>
        <QuestionItem v-model="item" @vue:mounted="outQuestionMounded" :is-one="true" />
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
  getCurrentInstance,
  inject,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  useAttrs,
  watch,
  type CSSProperties,
} from "vue";
import Block from "../base/Block.vue";
import { emitEvent, formatAnswer, parseOptions } from "@sjjb/utils";
import { ElButton, ElMessage } from "element-plus";
import { getPositionWithCache } from "../utils/getPosition";
import { normalizeEmptyBracket as normalizeEmptyBracketValue } from "../utils/normalizeEmptyBracket";
import { drawOnceRect, setAllBlockVisible } from "../utils/useAnswerAreaDrawer";

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
  isSuffix: Boolean,
});
const emits = defineEmits(["delete", "end"]);

type QuestionButtonEntry = {
  key: string;
  el: HTMLElement | null;
  isLeaf: boolean;
  allowShow: boolean;
  buttonText: string;
  addAnswerArea: () => Promise<void>;
};

const title = defineModel<any>("title");
const childs = defineModel<any>("childs", { default: () => ({}) });
const item = defineModel<any>("item", { default: () => ({}) });
const quesionOptionLength = defineModel<string>("quesionOptionLength", { default: "50%" });

const stripTrailingScore = (value: unknown) => {
  if (typeof value !== "string") return value;
  return value.replace(/[（(]\s*-?\d+(?:\.\d+)?\s*分\s*[）)]/g, "").trim();
};

const isFocused = ref(false);
const displayTitle = ref(String(title.value ?? ""));

const handleTitleFocus = () => {
  isFocused.value = true;
  displayTitle.value = String(stripTrailingScore(title.value) ?? "");
};

const handleTitleBlur = () => {
  isFocused.value = false;
  displayTitle.value = String(title.value ?? "");
  emitTitleReflow(true);
};

const handleTitleInput = (value: string | number) => {
  const normalized = stripTrailingScore(value);
  displayTitle.value = String(normalized ?? "");
  title.value = normalized;
};

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

const contentWrapperRef = ref<HTMLElement | null>(null);
const segmentHover = ref(false);
const continuedQuestionButton = ref<QuestionButtonEntry | null>(null);
const questionButtonEntries = ref<QuestionButtonEntry[]>([]);

const upsertQuestionButtonEntry = (entry: QuestionButtonEntry) => {
  const index = questionButtonEntries.value.findIndex(it => it.key === entry.key);
  if (index === -1) {
    questionButtonEntries.value = [...questionButtonEntries.value, entry];
    return;
  }
  questionButtonEntries.value[index] = entry;
};

const removeQuestionButtonEntry = (key: string) => {
  questionButtonEntries.value = questionButtonEntries.value.filter(it => it.key !== key);
};

const findContinuedQuestionButton = () => {
  if (!isSplitState.value || !props.originalHeight) return null;

  const segmentStart = Number(props.breakPoint?.start ?? 0);
  if (segmentStart <= 0) return null;

  const contentEl = contentWrapperRef.value;
  if (!contentEl) return null;

  const contentRect = contentEl.getBoundingClientRect();
  const segmentStartPx = props.originalHeight * segmentStart;
  const segmentTopTolerancePx = 32;

  let matched: { entry: QuestionButtonEntry; top: number } | null = null;

  questionButtonEntries.value.forEach(entry => {
    if (!entry.isLeaf || !entry.allowShow || !entry.el?.isConnected) return;

    const rect = entry.el.getBoundingClientRect();
    const top = rect.top - contentRect.top;
    const bottom = rect.bottom - contentRect.top;

    if (bottom <= segmentStartPx || top >= segmentStartPx + segmentTopTolerancePx) return;

    if (!matched || top > matched.top) {
      matched = { entry, top };
    }
  });

  return matched?.entry ?? null;
};

const refreshContinuedQuestionButton = async () => {
  await nextTick();
  continuedQuestionButton.value = findContinuedQuestionButton();
};

const handleSegmentMouseEnter = () => {
  segmentHover.value = true;
  void refreshContinuedQuestionButton();
};

const handleSegmentMouseLeave = () => {
  segmentHover.value = false;
  continuedQuestionButton.value = null;
};

const handleContinuedQuestionAddAnswerArea = () => {
  void continuedQuestionButton.value?.addAnswerArea();
};

watch(
  [
    () => props.breakPoint.start,
    () => props.breakPoint.end,
    () => props.originalHeight,
    segmentHover,
  ],
  () => {
    if (!segmentHover.value) return;
    void refreshContinuedQuestionButton();
  },
);

watch(
  questionButtonEntries,
  () => {
    if (!segmentHover.value) return;
    void refreshContinuedQuestionButton();
  },
  { deep: true },
);

const outAttrs = useAttrs();

const isExportMode = inject<any>("isExportMode");
const rightSetting = inject<any>("AnswerCardSetting");

watch(
  () => isExportMode.value,
  async newVal => {
    setAllBlockVisible(outAttrs.pageBox as HTMLElement, !newVal);
  },
);

const emitTitleReflow = (flush = false) => {
  if (isExportMode?.value) return;
  emitEvent("reflowPages", { reason: "title-edit", flush });
};

let hasInitializedTitle = false;
watch(
  () => title.value,
  value => {
    if (!isFocused.value) {
      displayTitle.value = String(value ?? "");
    }
    if (!hasInitializedTitle) {
      hasInitializedTitle = true;
      return;
    }
    emitTitleReflow();
  },
  { immediate: true },
);

const flushTitleReflow = () => emitTitleReflow(true);

const openModel = ref(false);
let emitEndTimer: ReturnType<typeof setTimeout> | null = null;
let hasInitializedQuestionOptionLength = false;

const clearEmitEndTimer = () => {
  if (!emitEndTimer) return;
  clearTimeout(emitEndTimer);
  emitEndTimer = null;
};

const scheduleEndEmit = () => {
  clearEmitEndTimer();
  emitEndTimer = setTimeout(() => {
    emitEndTimer = null;
    emits("end");
  }, 80);
};

onMounted(() => {
  scheduleEndEmit();
});

onBeforeUnmount(() => {
  clearEmitEndTimer();
});

watch(
  () => quesionOptionLength.value,
  async () => {
    if (!hasInitializedQuestionOptionLength) {
      hasInitializedQuestionOptionLength = true;
      return;
    }
    if (isExportMode?.value) return;
    await nextTick();
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    emitEvent("reflowPages", { reason: "option-layout", flush: false });
  },
  { immediate: true },
);

const ChioseOptionsBox = defineComponent({
  name: "ChioseOptionsBox",
  props: { questOption: Object, questionId: String },
  setup(props) {
    const onMouseOn = ref(false);
    const isTiantu = computed(() => rightSetting.value?.objectiveAnswerType === "tiantu");
    const optionColumnCount = computed(() => {
      const width = quesionOptionLength.value;
      return width === "100%" ? 1 : width === "50%" ? 2 : 4;
    });
    const optionRowStyle = computed<CSSProperties>(() => ({
      columnGap: optionColumnCount.value > 1 ? "12px" : "0px",
    }));
    const optionItemStyle = computed<CSSProperties>(() => {
      const perRow = optionColumnCount.value;
      const gutterPx = 12 * Math.max(0, perRow - 1);
      const basis = `calc((100% - ${gutterPx}px) / ${perRow})`;

      return {
        width: basis,
        flex: `0 0 ${basis}`,
        maxWidth: basis,
        minWidth: "0",
      };
    });

    const groupedOptions = computed(() => {
      const perRow = optionColumnCount.value;
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
          <div class='split-unit flex flex-row w-full' key={rIndex} style={optionRowStyle.value}>
            {row.map((opt, idx) => (
              <div
                key={idx}
                class='flex min-w-0 items-start font-normal text-14px color-#333333'
                style={optionItemStyle.value}>
                <span
                  class='mt-5px mb-4px shrink-0'
                  id={props.questionId + "_options_" + opt.key}>
                  {isTiantu.value ? `[ ${opt.key} ]` : opt.key}
                </span>
                <span class='mt-3px ml-3px shrink-0'>、</span>
                <Block class='min-w-0 flex-1' v-model={opt.text} border={false} />
              </div>
            ))}
          </div>
        ))}
      {
            /*     {onMouseOn.value &&
         
          <div class='absolute -top-17px right-4'>
            <ElButton
              style={{ background: "#e7eff9" }}
              type='primary'
              text
              size='small'
              plain
              onClick={() => (openModel.value = true)}>
              设置每行选项数量
            </ElButton>
          </div> }
        */  }
      </div>
    );
  },
});

const outQuestionMounded = async () => {};

const OBJECTIVE_ANSWER_TYPES = [1, 2, 3, 6];
const NORMALIZE_DELAY = 500;
const getQuestionOptionMap = (question: any) =>
  parseOptions(question?.resQuestionContentVo?.questOption);
const hasQuestionOptions = (question: any) =>
  Object.keys(getQuestionOptionMap(question)).length > 0;
const isChoiceLikeQuestion = (question: any) =>
  OBJECTIVE_ANSWER_TYPES.includes(Number(question?.answerType ?? 0)) ||
  hasQuestionOptions(question);
const normalizeEmptyBracket = (content: unknown) => {
  if (typeof content !== "string") return content;
  return content.replace(/[\(（](?:\s|\u00A0|\u3000|&nbsp;|&#160;)*[\)）]/g, "（   &nbsp;）");
};

void normalizeEmptyBracket;

const QuestionItem = defineComponent({
  name: "QuestionItem",
  props: {
    modelValue: {
      type: Object as any,
      required: true,
    },
    isOne: {
      type: Boolean,
      default: false,
    },
    parentQuestionNumber: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit: questionEmits }) {
    const currentInstance = getCurrentInstance();
    const questionButtonEntryKey = `question_button_${currentInstance?.uid ?? props.modelValue?.id ?? Math.random()}`;
    const singleQuestionType = computed(() => isChoiceLikeQuestion(props.modelValue));
    const isLeafQuestion = computed(() => !(props.modelValue?.children?.length > 0));
    const questionBoxRef = ref<HTMLElement | null>(null);
    let questTopicNormalizeTimer: ReturnType<typeof setTimeout> | null = null;
    let isApplyingNormalizedQuestTopic = false;
    let hasInitializedQuestTopic = false;
    const blockMountend = () => {
      scheduleEndEmit();
    };
    const show = ref(false);
    const prefix = computed(() =>
      props.modelValue[sortFiledKey.value] ? `${props.modelValue[sortFiledKey.value]}.` : "",
    );

    const emitQuestionReflow = (flush = false) => {
      if (isExportMode?.value) return;
      emitEvent("reflowPages", { reason: "block-edit", flush });
    };

    const applyQuestTopicNormalization = (emitReflow = true) => {
      if (!isChoiceLikeQuestion(props.modelValue)) return false;
      const questionContent = props.modelValue?.resQuestionContentVo;
      if (!questionContent) return false;

      const currentValue = questionContent.questTopic;
      const normalized = normalizeEmptyBracketValue(currentValue);
      if (normalized === currentValue) return false;

      isApplyingNormalizedQuestTopic = true;
      questionContent.questTopic = normalized;
      if (emitReflow) {
        emitQuestionReflow();
      }
      return true;
    };

    const clearQuestTopicNormalizeTimer = () => {
      if (!questTopicNormalizeTimer) return;
      clearTimeout(questTopicNormalizeTimer);
      questTopicNormalizeTimer = null;
    };

    const scheduleQuestTopicNormalize = () => {
      clearQuestTopicNormalizeTimer();
      questTopicNormalizeTimer = setTimeout(() => {
        questTopicNormalizeTimer = null;
        applyQuestTopicNormalization();
      }, NORMALIZE_DELAY);
    };

    const flushQuestTopicNormalize = () => {
      clearQuestTopicNormalizeTimer();
      applyQuestTopicNormalization();
      emitQuestionReflow(true);
    };

    watch(
      () => props.modelValue?.resQuestionContentVo?.questTopic,
      () => {
        if (!isChoiceLikeQuestion(props.modelValue)) return;
        if (isApplyingNormalizedQuestTopic) {
          isApplyingNormalizedQuestTopic = false;
          return;
        }
        if (!hasInitializedQuestTopic) {
          hasInitializedQuestTopic = true;
          applyQuestTopicNormalization(false);
          return;
        }
        scheduleQuestTopicNormalize();
      },
      { immediate: true },
    );

    const addAnswerArea = async (params: any) => {
      const pageBox = outAttrs.pageBox as HTMLElement;
      const pageOf = outAttrs.pageOf as number;
      const id = `${params.questionId}_answerArea_${Date.now()}`;

      await drawOnceRect({
        container: pageBox,
        id,
        prefix: props.modelValue?.bigQuestionNumber + "、" + params.prefix,
        onDelete: async ({ id }: { id: string }) => {
          questionEmits("update:modelValue", {
            ...props.modelValue,
            answerAreaIdList: (props.modelValue.answerAreaIdList || []).filter(
              (area: any) => area.id !== id,
            ),
          });
        },
      });

      questionEmits("update:modelValue", {
        ...props.modelValue,
        answerAreaIdList: [
          ...(props.modelValue.answerAreaIdList || []),
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
          (props.modelValue?.answerAreaIdList || []).length == 0
        : true,
    );
    const buttonText = computed(() =>
      singleQuestionType.value
        ? `绘制 ${props?.parentQuestionNumber}${prefix.value}  作答识别区`
        : `绘制 ${props?.parentQuestionNumber}${prefix.value} 额外作答区`,
    );
    const parsedQuestOption = computed(() => getQuestionOptionMap(props.modelValue));
    const hasQuestOptions = computed(() => Object.keys(parsedQuestOption.value).length > 0);
    const handleAddAnswerArea = () =>
      addAnswerArea({
        prefix: prefix.value,
        questionId: props.modelValue.id,
      });

    const syncQuestionButtonEntry = () => {
      upsertQuestionButtonEntry({
        key: questionButtonEntryKey,
        el: questionBoxRef.value,
        isLeaf: isLeafQuestion.value,
        allowShow: allowShow.value,
        buttonText: buttonText.value,
        addAnswerArea: handleAddAnswerArea,
      });
    };

    watch(
      [
        prefix,
        allowShow,
        buttonText,
        isLeafQuestion,
        () => props.modelValue?.id,
        () => props.parentQuestionNumber,
      ],
      () => {
        void nextTick(syncQuestionButtonEntry);
      },
      { immediate: true },
    );

    onMounted(() => {
      syncQuestionButtonEntry();
    });

    onBeforeUnmount(() => {
      clearQuestTopicNormalizeTimer();
      removeQuestionButtonEntry(questionButtonEntryKey);
    });

    return () => (
      <div
        id={`${props.modelValue.id}_${outAttrs.pageOf}_question`}
        class='flex items-start w-full relative  '
        data-pid={props.modelValue.parentId}
        ref={questionBoxRef}
        onMouseenter={() => (show.value = true)}
        onMouseleave={() => (show.value = false)}>
        {isLeafQuestion.value && (
          <ElButton
            style={{
              visibility: allowShow.value && show.value ? "visible" : "hidden",
              background: "#e7eff9",
            }}
            class='absolute right-0  top-25px -transform-translate-y-100%  z-99 '
            type='primary'
            text
            plain
            onClick={handleAddAnswerArea}>
            {buttonText.value}
          </ElButton>
        )}

        <p class='pt-5px mr-0px text-14px'>
          {/* {outAttrs.pageOf}-- */}
          {prefix.value}
        </p>
        <div class='flex-1 min-w-0 flex flex-col'>
          <Block
            class='question-topic-block mb-2 w-full min-w-0 pb-2'
            v-model={props.modelValue.resQuestionContentVo.questTopic}
            border={false}
            editViewMerge={false}
            onBlur={flushQuestTopicNormalize}
            onMount-done={blockMountend}
          />
          {singleQuestionType.value && hasQuestOptions.value && (
            <ChioseOptionsBox
              questOption={parsedQuestOption.value}
              questionId={props.modelValue.id}
            />
          )}
          {props.modelValue.children?.length > 0 && (
            <div class='mt-2 pl-4 border-l border-gray-100'>
              {props.modelValue.children.map((child: any) => (
                <QuestionItem
                  modelValue={child}
                  parentQuestionNumber={prefix.value}
                  onUpdate:modelValue={e => {
                    const updatedChildren = (props.modelValue.children || []).map((c: any) => {
                      if (String(c.id) === String(e.id)) {
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
          {props.modelValue.isOneProb == 1 && !singleQuestionType.value && (
            <div class='score-boxs flex items-center border-solid border-black border-1 text-14px w-85px h-25px  self-end -mt-8px'>
              <span class='px-5px'>得分</span>
              <div
                id={`${props.modelValue.id}_${outAttrs.pageOf}_scoreBox`}
                class=' border-l-solid border-black border-1 h-full w-50%'>
                {" "}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});

const transformQuestion = (source: any, isSuffix = false): any => {
  const getOptionKeys = (it: any) => {
    const options = getQuestionOptionMap(it);
    const keys = Object.keys(options);
    return keys.length > 0 ? keys : null;
  };
  const choiceLike = isChoiceLikeQuestion(source);

  return {
    id: source.id,
    prefix: source.prefix,
    questionId: source.id,
    score: source.score,
    isOneProb: source.isOneProb,
    isObjective: choiceLike ? 1 : source.isObjective,
    isSuffix,
    parentId: source.parentId,
    answerType: source.answerType,
    questionTypeId: source.questionType,
    answerKey: choiceLike
      ? (formatAnswer(source.resQuestionContentVo?.questAnswer || "") ?? null)
      : null,
    questionTypeName: source.questionTypeName,
    questionType: source.questionType,
    contentList: getOptionKeys(source),
    answerAreaIdList: source.answerAreaIdList || [],
    childs: Array.isArray(source.children)
      ? source.children.map((child: any) => transformQuestion(child))
      : [],
  };
};

const getInfo = async () => {
  const end = transformQuestion(item.value, props.isSuffix);

  const pageBox = outAttrs?.pageBox as HTMLElement | undefined;
  if (!end.id || !pageBox) {
    childs.value = [end];
    return;
  }
  const pageDocument = pageBox.ownerDocument;
  // const pageOf = (Number(pageBox.getAttribute("pageof")) || 0) + 1;
  const pageOf = outAttrs.pageOf as number;

  const POSITION_EPSILON = 1e-6;
  const isValidAreaPosition = (position: any) => {
    if (!position || typeof position !== "object") return false;

    const x0 = Number(position.x0);
    const y0 = Number(position.y0);
    const x1 = Number(position.x1);
    const y1 = Number(position.y1);

    if (![x0, y0, x1, y1].every(Number.isFinite)) return false;
    return x1 - x0 > POSITION_EPSILON && y1 - y0 > POSITION_EPSILON;
  };

  const dedupePositions = (positions: any[] = []) => {
    const seen = new Set<string>();
    return positions.filter(position => {
      if (!isValidAreaPosition(position)) return false;

      const key = [
        position.pageOf ?? "",
        position.x0 ?? "",
        position.y0 ?? "",
        position.x1 ?? "",
        position.y1 ?? "",
      ].join(":");

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const mergePosList = (current: any[] = [], incoming: any[] = []) => {
    return dedupePositions([...(current || []), ...(incoming || [])]);
  };

  //赋值
  const pushPos = (target: any, key: string, percentage: any, pageOf: number) => {
    target[key] = mergePosList(target[key], [{ ...percentage, pageOf: pageOf + 1 }]);
  };
  //计算坐标
  const calcPos = async (elId: string) => {
    const el = pageDocument.getElementById(elId) as HTMLElement | null;
    if (!el) return null;
    const { data } = await getPositionWithCache(pageBox, el, "none");
    if (!data?.percentage) return null;

    const result = {
      ...data.percentage,
      pageOf: pageOf + 1,
    };

    return isValidAreaPosition(result) ? result : null;
  };

  // 计算坐标并赋值
  const setMoudlePosInTarget = async (elId: string, pageOf: number, target: any) => {
    const p = await calcPos(elId);
    if (!p) return;

    const isMain = !Object.keys(target).includes("isSuffix") ? true : target.isSuffix === false;
    const hasChildQuestions = Array.isArray(target.childs) && target.childs.length > 0;
    if (
      target.isOneProb == 1 &&
      target.isObjective == 1 &&
      isMain &&
      !hasChildQuestions &&
      target?.answerAreaIdList.length == 0
    ) {
      ElMessage.warning(`请为${target.prefix}添加作答识别区`);
      return Promise.reject(`请为${target.prefix}添加作答识别区`);
    }

    pushPos(target, "infoList", p, pageOf);

    if (target.answerAreaIdList?.length) {
      const results = await Promise.all(
        target.answerAreaIdList.map(async (area: any) => ({
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

    if (
      rightSetting.value?.objectiveAnswerType == "tiantu" &&
      target.isObjective == 1 &&
      target.contentList?.length > 0
    ) {
      const optionsInfo = await Promise.all(
        target.contentList.map((key: string) => {
          return calcPos(`${target.id}_options_${key}`);
        }),
      );

      optionsInfo.forEach(item => {
        if (!item) return;
        pushPos(target, "contentInfoList", item, pageOf);
      });
    }
  };

  await setMoudlePosInTarget(`${end.id}_${outAttrs.pageOf}_block`, pageOf, end);

  const p = await calcPos(`${end.id}_${outAttrs.pageOf}_scoreBox`);
  if (p) pushPos(end, "scoreArea", p, pageOf);

  if (end.childs?.length) {
    for (const chid of end.childs) {
      await setMoudlePosInTarget(`${chid.id}_${outAttrs.pageOf}_question`, pageOf, chid);
    }
  }

  const posKeys = ["infoList", "scoreArea", "choiceArea", "contentInfoList"] as const;

  if (props.isSuffix && Array.isArray(childs.value) && childs.value.length > 0) {
    const existing = childs.value[0];
    if (existing) {
      for (const key of posKeys) {
        if (end[key]?.length) {
          existing[key] = mergePosList(existing[key], end[key]);
        }
      }
      if (end.childs?.length && existing.childs?.length) {
        for (const childEnd of end.childs) {
          const existingChild = existing.childs.find((c: any) => c.id === childEnd.id);
          if (existingChild) {
            for (const key of posKeys) {
              if (childEnd[key]?.length) {
                existingChild[key] = mergePosList(existingChild[key], childEnd[key]);
              }
            }
          }
        }
      }
    }
  } else {
    childs.value = [end];
  }
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

.question-topic-block {
  min-width: 0;

  :deep(.inline-richtext),
  :deep(.inline-editor),
  :deep(.mce-content-body),
  :deep(.mce-content-body p),
  :deep(.mce-content-body div),
  :deep(.mce-content-body span),
  :deep(.mce-content-body font),
  :deep(.mce-content-body strong),
  :deep(.mce-content-body b),
  :deep(.mce-content-body em),
  :deep(.mce-content-body i),
  :deep(.mce-content-body a) {
    max-width: 100%;
    white-space: pre-wrap !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }
}

:deep(.mce-content-body) {
  // 强制富文本内的所有图片、表格、列表项不要在中间被切断
  img,
  table,
  li,
  hr,
  .score-boxs,
  .ql-editor img {
    break-inside: avoid-page !important;
    page-break-inside: avoid !important;
    display: inline-block; // 某些浏览器下 block 元素规避效果更佳
    max-width: 100%;
  }
}

:deep(hr) {
  border: 0;
  border-top: 1px solid #333;
  display: block;
  height: 0;
  margin: 8px 0;
}

:deep(u) {
  text-decoration: none !important;
  border-bottom: 1px solid currentColor !important;
  display: inline-block !important;
  line-height: 1 !important;
  vertical-align: baseline !important;
  white-space: pre !important;
  min-width: 1em !important;
}
</style>
