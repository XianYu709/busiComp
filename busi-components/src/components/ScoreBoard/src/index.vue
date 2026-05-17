<template>
  <div ref="scoreBoardRef" :class="drageable ? 'score-board--floating' : ''">
    <Card :body-style="{ padding: '0', overflow: 'hidden' }">
      <!-- 仅此处作为拖拽把手，避免与折叠项标题 .right-title 重复导致 querySelector 选错节点 -->
      <div
        ref="draggableAreaRef"
        class="right-title score-board-drag-handle"
        style="border-bottom: 1px solid #ebeef5; flex-shrink: 0">
        批阅操作
      </div>
      <div class="score-board-scroll-body">
        <ElCollapse style="width: 100%" :model-value="['list', 'mark', 'markboard', 'submit']">
        <el-collapse-item name="list" v-if="props.showMoudle.includes('list')">
          <template #title>
            <div class="right-title">批阅</div>
          </template>
          <div class="flex flex-col px-20px -mb-15px">
            <StudentMark v-for="(stu, index) in endList" :stu="stu" :index="index" />
          </div>
        </el-collapse-item>
        <ElCollapseItem name="mark" v-if="props.showMoudle.includes('mark')">
          <template #title>
            <div class="right-title">打分栏</div>
          </template>
          <div class="flex flex-col items-center">
            <div style="transform: scale(0.9); width: 100%">
              <ButtonTab
                v-model="markType"
                :items="[
                  {
                    label: '键盘打分',
                    value: 1,
                  },
                  {
                    label: '分步赋分',
                    value: 2,
                  },
                ]"
                @on-change="markTypeChange" />
            </div>
            <div class="self-start pt-20px px-20px -mb-15px">
              <StudentMark v-for="(stu, index) in currentList" :stu="stu" :index="index" />
            </div>
            <div
              v-if="markType == 2"
              class="bg-#E7EFF9 p-4px w-88.5% mt-25px flex justify-center items-center">
              <ElRadioGroup v-model="stepPrefix" @change="stepPrefixChange">
                <ElRadio value="+">加分模式</ElRadio>
                <ElRadio value="-">减分模式</ElRadio>
              </ElRadioGroup>
            </div>
          </div>
        </ElCollapseItem>
        <ElCollapseItem name="markboard" v-if="props.showMoudle.includes('markboard')">
          <template #title>
            <div class="right-title">打分板</div>
          </template>
          <div class="px-20px -mb-15px">
            <div class="flex justify-between mb-15px">
              步长：
              <ElSelect
                v-model="step"
                style="width: 100px"
                size="small"
                placeholder="选择步长"
                :options="stepList"
                @change="stepChange" />
            </div>
            <div class="flex flex-wrap pt-5px -ml-10px">
              <ElButton
                class="mb-3"
                style="margin-left: 10px"
                v-for="item in (stepScoreList.slice() || []).reverse()"
                @click="scoreHanlder(item)">
                {{ item.label }}
              </ElButton>
            </div>
          </div>
        </ElCollapseItem>
        <ElCollapseItem name="submit" v-if="props.showMoudle.includes('submit')">
          <template #title>
            <div class="right-title">分数提交</div>
          </template>
          <div class="score-board-submit-inner px-20px flex flex-wrap content-start items-center gap-x-10px gap-y-10px w-full min-w-0">
            <slot name="submit" :submit="() => submitHander(currentList, true)">
              <ElButton
                type="primary"
                class="mr-20px"
                style="width: 100px"
                @click="submitHander(currentList, true)">
                提交
              </ElButton>
              <ToggleRadio v-model="autoSubmit">自动提交</ToggleRadio>
            </slot>
          </div>
        </ElCollapseItem>
      </ElCollapse>
      </div>
    </Card>
  </div>
</template>

<script setup name="ScoreBoard" lang="tsx">
import type { MarkMode } from "@/components/MarkingBoard/src";
import { ToggleRadio, Card, ButtonTab } from "@sjjb/components";
import { useDraggable } from "@sjjb/utils";
import { ElButton, ElInput, ElCollapse, ElMessage } from "element-plus";
import { computed, onMounted, ref, watch } from "vue";

type StepScoreItem = {
  label: string;
  value: number;
};

type MarkValueClickHandler = (text: string) => boolean | void;

const props = withDefaults(
  defineProps<{
    fieldsMap: {
      name: string;
      score: string;
      totalScore: string;
    };
    setMarkMode?: (mode: MarkMode) => void;
    setMarkValue?: (text: string, onClick?: MarkValueClickHandler) => void;
    resetMarkValue?: () => void;
    maxScore?: number;
    showMoudle?: ("list" | "mark" | "markboard" | "submit")[];
  }>(),
  {
    // @ts-ignore
    showMoudle: ["list", "mark", "markboard", "submit"],
  },
);
const emits = defineEmits(["submit"]);

const scoreBoardRef = ref<HTMLElement | null>(null);

const drageable = defineModel<boolean>("drageable", {
  default: false,
});
const draggableIns = useDraggable(scoreBoardRef, {
  handle: ".score-board-drag-handle",
  // 不设 bounds：避免视口钳制导致「再往左拖不动」；需要时可改为自定义边界
});
onMounted(() => {
  draggableIns.disable();
});

watch(
  () => drageable.value,
  val => {
    if (val) {
      draggableIns && draggableIns.enable();
    } else {
      draggableIns && draggableIns.disable();
      const el = scoreBoardRef.value;
      if (el) {
        el.style.transform = "";
      }
    }
  },
  { immediate: true },
);

const endList = defineModel<any[] | undefined>("endList");
const currentList = defineModel<any[]>("currentList");
const autoSubmit = defineModel<boolean>("autoSubmit", {
  default: false,
});
const markTypeModel = defineModel<number>("markType", {
  default: 1,
});

const maxScore = computed(() => {
  const totalKey = props.fieldsMap["totalScore"];
  return props?.maxScore || currentList.value?.[0]?.[totalKey] || 0;
});

const stepList = [
  { label: "0.5", value: 0.5 },
  {
    label: "1",
    value: 1.0,
  },
  {
    label: "1.5",
    value: 1.5,
  },
  {
    label: "2",
    value: 2.0,
  },
  {
    label: "3",
    value: 3.0,
  },
  {
    label: "4",
    value: 4.0,
  },
  {
    label: "5",
    value: 5.0,
  },
];
const step = ref<number | null>(stepList[0]?.value ?? null);

const stepScoreList = ref<StepScoreItem[]>([]);
const stepPrefix = ref<"+" | "-" | "">("");
const pendingStepMarkText = ref("");
const markType = markTypeModel;
const localScoredItems = new WeakSet<object>();
type StepScoreSnapshot = {
  score: any;
  locallyScored: boolean;
};
let stepScoreSnapshots = new WeakMap<object, StepScoreSnapshot>();
let hasStepScoreSnapshots = false;
let hasStepScoreHistory = false;

const markItemScored = (item: any) => {
  if (item && typeof item === "object") {
    localScoredItems.add(item);
  }
};

const unmarkItemScored = (item: any) => {
  if (item && typeof item === "object") {
    localScoredItems.delete(item);
  }
};

const setClickAddTextMode = () => {
  props.setMarkMode?.("clickAddText");
};

const clearPendingStepMarkValue = () => {
  pendingStepMarkText.value = "";
  props.setMarkValue?.("");
};

const setPendingStepMarkValue = (text: string) => {
  pendingStepMarkText.value = text;
  props.setMarkValue?.(text, clickedText => {
    return applyStepScoreText(clickedText);
  });
};

/** 仅根据步长 / 满分刷新打分板按钮列表，不清空已选中的分步赋分待点击文案（供 currentList 变化时复用，避免画布连点一次就丢选中分） */
const rebuildStepScoreList = (val: number | null) => {
  if (!val) {
    stepScoreList.value = [];
    return;
  }
  const max = Number(maxScore.value);
  if (val <= 0 || max <= 0) {
    stepScoreList.value = [];
    return;
  }

  const countDecimals = (n: number) => {
    const s = String(n);
    return s.includes(".") ? s.split(".")[1].length : 0;
  };
  const decimals = Math.max(countDecimals(val), countDecimals(max));
  const factor = Math.pow(10, decimals);

  const intVal = Math.round(val * factor);
  const intMax = Math.round(max * factor);

  const n = Math.floor(intMax / intVal);
  const arr: number[] = [];

  for (let i = 1; i <= n; i++) {
    arr.push((i * intVal) / factor);
  }

  if (n === 0 || n * intVal !== intMax) {
    arr.push(intMax / factor);
  }

  stepScoreList.value = arr.map(item => {
    return {
      label: stepPrefix.value + item.toString(),
      value: item,
    };
  });
};

const stepChange = (val: number | null) => {
  clearPendingStepMarkValue();
  if (markType.value === 2) {
    setClickAddTextMode();
  }
  rebuildStepScoreList(val);
};

let isInternalMarkTypeChange = false;

const markTypeChange = (val: number) => {
  const type = Number(val);
  isInternalMarkTypeChange = true;
  markType.value = type;
  isInternalMarkTypeChange = false;
  clearPendingStepMarkValue();
  props.resetMarkValue?.();
  if (type === 1) {
    stepPrefix.value = "";
    props.setMarkMode?.("none");
  }
  if (type === 2) {
    stepPrefix.value = "+";
    setClickAddTextMode();
    captureStepScoreSnapshots();
  }
  stepChange(step.value);
};

const stepPrefixChange = () => {
  // 260501自动提交减分模式判断：切换加分/减分模式时不再自动提交，只重置历史快照和步长列表
  // resetStepScoreHistory(); // 原逻辑：重置历史时会触发 restoreStepScoreSnapshots → submitHander 自动提交
  // initializeStepModeBaseScores(); // 原逻辑：初始化基础分时会触发 submitHander 自动提交
  clearPendingStepMarkValue();
  props.resetMarkValue?.();
  // 切换到减分模式时，将键盘打分栏分数置为满分（与「满分」按钮一致）
  if (stepPrefix.value === "-" && markType.value === 2) {
    const rows = getCurrentRows();
    let hasChanged = false;
    rows.forEach(item => {
      if (!item || typeof item !== "object") return;
      const itemMaxScore = getItemMaxScore(item);
      if (itemMaxScore <= 0) return;
      const cur = Number(item[keyMap.score]);
      if (Number.isFinite(cur) && normalizeScore(cur) === normalizeScore(itemMaxScore)) return;
      item[keyMap.score] = normalizeScore(itemMaxScore);
      markItemScored(item);
      hasChanged = true;
    });
    if (hasChanged) submitHander(rows);
  }
  captureStepScoreSnapshots();
  stepChange(step.value);
};

watch(
  () => maxScore.value,
  () => {
    stepChange(step.value);
  },
  { immediate: true },
);

// 新增：监听currentList深度变化，确保分数归零后及时检测
watch(
  () => currentList.value,
  () => {
    if (markType.value !== 2) return;
    captureStepScoreSnapshots();
    rebuildStepScoreList(step.value);
  },
  { flush: "post", deep: true }
);

const keyMap = props.fieldsMap || {
  name: "name",
  score: "score",
  totalScore: "totalScore",
};

const getCurrentRows = () => currentList.value ?? [];

const captureStepScoreSnapshots = () => {
  stepScoreSnapshots = new WeakMap<object, StepScoreSnapshot>();
  getCurrentRows().forEach(item => {
    if (!item || typeof item !== "object") return;
    stepScoreSnapshots.set(item, {
      score: item[keyMap.score],
      locallyScored: localScoredItems.has(item),
    });
  });
  hasStepScoreSnapshots = true;
  hasStepScoreHistory = false;
};

const ensureStepScoreSnapshots = () => {
  if (!hasStepScoreSnapshots) {
    captureStepScoreSnapshots();
  }
};

const restoreStepScoreSnapshots = () => {
  const rows = getCurrentRows();
  if (!hasStepScoreSnapshots || rows.length === 0) return false;

  rows.forEach(item => {
    if (!item || typeof item !== "object") return;
    const snapshot = stepScoreSnapshots.get(item);
    if (!snapshot) return;

    item[keyMap.score] = snapshot.score;
    if (snapshot.locallyScored) {
      markItemScored(item);
    } else {
      unmarkItemScored(item);
    }
  });
  submitHander(rows);
  return true;
};

const resetStepScoreHistory = () => {
  clearPendingStepMarkValue();
  props.resetMarkValue?.();
  if (hasStepScoreHistory) {
    restoreStepScoreSnapshots();
  }
  captureStepScoreSnapshots();
};

const initializeStepModeBaseScores = () => {
  if (stepPrefix.value !== "+" && stepPrefix.value !== "-") return;

  const rows = getCurrentRows();
  let hasChanged = false;

  rows.forEach(item => {
    if (!item || typeof item !== "object") return;

    const itemMaxScore = getItemMaxScore(item);
    if (itemMaxScore <= 0) return;

    const baseScore = stepPrefix.value === "-" ? normalizeScore(itemMaxScore) : 0;
    const currentScore = Number(item[keyMap.score]);
    if (Number.isFinite(currentScore) && normalizeScore(currentScore) === baseScore) return;

    item[keyMap.score] = baseScore;
    markItemScored(item);
    hasChanged = true;
  });

  if (!hasChanged) return;

  hasStepScoreHistory = true;
  // 260501自动提交减分模式判断：切换加分/减分模式初始化基础分时不自动提交，等用户点击打分板分值后再提交
  // submitHander(rows);
};

const submitHander = (list?: any[], submit: boolean = false) => {
  if (list?.length === 0) return ElMessage.warning("暂无批阅数据");
  if (!list || list.length === 0) return;
  setTimeout(() => {
    emits("submit", {
      process: list,
      isFinish: currentList.value && currentList.value.length == 0,
      submit,
    });
  }, 0);
};

const StudentMark = (opt: { index: number; stu: any }) => {
  if (!opt.stu) return null;

  return (
    <div class='flex items-center justify-between mb-10px'>
      <div class={"w-25%  text-left"}>{opt.stu[keyMap.name]}</div>
      <ElInput
        v-model={opt.stu[keyMap.score]}
        class='mx-3 el-input-score'
        style='width: 40%;'
        onChange={v => {
          const maxV = opt.stu[keyMap.totalScore] || maxScore.value || 0;
          if (!maxV) return ElMessage.warning("未设置题目分值");
          const numV = Number(v);
          if (numV > maxV) {
            ElMessage.warning("超出分数范围");
            opt.stu[keyMap.score] = opt.stu[keyMap.totalScore] || maxScore.value || 0;
          } else if (numV < 0) {
            ElMessage.warning("分数不能为负数");
            opt.stu[keyMap.score] = 0;
          } else {
            opt.stu[keyMap.score] = numV;
            markItemScored(opt.stu);
            submitHander([opt.stu]);
          }
          // 新增：触发stepChange，实时更新减分模式显示
          stepChange(step.value);
        }}
      />
      <ElButton
        type='primary'
        class='active:opacity-50 hover:opacity-80'
        style={{ background: "#E7EFF9 ", border: "none", color: "#0E5FC7" }}
        onClick={() => {
          opt.stu[keyMap.score] = opt.stu[keyMap.totalScore] || maxScore.value || 0;
          markItemScored(opt.stu);
          submitHander([opt.stu]);
          // 新增：触发stepChange，实时更新减分模式显示
          stepChange(step.value);
        }}>
        满分
      </ElButton>
      <ElButton
        type='danger'
        class=' active:opacity-50 hover:opacity-80'
        style={{ background: "#FDE8E8", border: "none", color: "#EB1919" }}
        onClick={() => {
          opt.stu[keyMap.score] = 0;
          markItemScored(opt.stu);
          submitHander([opt.stu]);
          // 新增：触发stepChange，实时更新减分模式显示
          stepChange(step.value);
        }}>
        零分
      </ElButton>
    </div>
  );
};

const normalizeScore = (score: number) => Number(score.toFixed(10));

const getItemMaxScore = (item: any) => Number(item?.[keyMap.totalScore] || maxScore.value || 0);

const isReviewedItem = (item: any) => {
  if (item && typeof item === "object" && localScoredItems.has(item)) return true;
  return (
    item?.marked === true ||
    item?.isMarked === true ||
    item?.markingStatus === 1 ||
    item?.markingStatus === "1"
  );
};

const isUnreviewedScore = (item: any) => {
  const rawScore = item?.[keyMap.score];
  if (rawScore === undefined || rawScore === null || rawScore === "") return true;
  return Number(rawScore) === 0 && !isReviewedItem(item);
};

const parseStepMarkText = (text: string) => {
  const matched = text.trim().match(/^([+-])(\d+(?:\.\d+)?)$/);
  if (!matched) return null;

  const value = Number(matched[2]);
  if (!Number.isFinite(value)) return null;

  return {
    sign: matched[1] as "+" | "-",
    value,
  };
};

const getNextStepScore = (
  item: any,
  stepMark: NonNullable<ReturnType<typeof parseStepMarkText>>,
  reverse = false,
) => {
  const direction = stepMark.sign === "+" ? 1 : -1;
  const itemMaxScore = getItemMaxScore(item);
  const currentScore =
    !reverse && direction < 0 && isUnreviewedScore(item)
      ? itemMaxScore
      : Number(item?.[keyMap.score] || 0);
  const factor = reverse ? -1 : 1;
  return normalizeScore(currentScore + direction * stepMark.value * factor);
};

const validateStepScoreText = (text: string) => {
  const rows = getCurrentRows();
  if (rows.length === 0) {
    ElMessage.warning("暂无批阅数据");
    return false;
  }

  const stepMark = parseStepMarkText(text);
  if (!stepMark) return false;

  const isOutOfRange = rows.some(item => {
    const nextScore = getNextStepScore(item, stepMark);
    const itemMaxScore = getItemMaxScore(item);
    return nextScore < 0 || nextScore > itemMaxScore;
  });

  if (isOutOfRange) {
    ElMessage.warning("超出分数范围");
    return false;
  }

  return true;
};

const applyStepScoreText = (text: string, reverse = false) => {
  const rows = getCurrentRows();
  if (rows.length === 0) return false;

  const stepMark = parseStepMarkText(text);
  if (!stepMark) return false;

  if (!reverse) {
    ensureStepScoreSnapshots();
    if (!validateStepScoreText(text)) return false;
  }

  rows.forEach(item => {
    const itemMaxScore = getItemMaxScore(item);
    const nextScore = getNextStepScore(item, stepMark, reverse);
    item[keyMap.score] = reverse ? Math.min(Math.max(nextScore, 0), itemMaxScore) : nextScore;
    markItemScored(item);
  });
  if (!reverse) {
    hasStepScoreHistory = true;
  }
  submitHander(rows);
  return true;
};

const handleDeleteMarkValue = (text: string) => {
  applyStepScoreText(text, true);
};

defineExpose({
  handleDeleteMarkValue,
});

watch(
  () => props.setMarkMode,
  setMarkMode => {
    if (markType.value === 2) {
      setMarkMode?.("clickAddText");
    }
  },
);

// 当父组件从外部恢复 markType（切换学生时），触发对应副作用
watch(
  () => markType.value,
  (val, oldVal) => {
    if (val === oldVal || isInternalMarkTypeChange) return;
    if (val === 1) {
      stepPrefix.value = "";
      props.setMarkMode?.("none");
    } else if (val === 2) {
      if (!stepPrefix.value) stepPrefix.value = "+";
      setClickAddTextMode();
    }
    stepChange(step.value);
  },
);

watch(
  () => props.setMarkValue,
  setMarkValue => {
    if (markType.value !== 2) return;
    ensureStepScoreSnapshots();
    if (!pendingStepMarkText.value) {
      setMarkValue?.("");
      return;
    }
    setMarkValue?.(pendingStepMarkText.value, clickedText => applyStepScoreText(clickedText));
  },
);

const scoreHanlder = (e: StepScoreItem) => {
  const rows = getCurrentRows();
  if (rows.length === 0) return ElMessage.warning("暂无批阅数据");

  if (markType.value === 1) {
    rows.forEach(item => {
      item[keyMap.score] = e.value;
      markItemScored(item);
    });
    submitHander(rows);
    return;
  }

  if (!props.setMarkMode || !props.setMarkValue) {
    return ElMessage.warning("请选择作答图片");
  }

  if (!validateStepScoreText(e.label)) return;

  setClickAddTextMode();
  setPendingStepMarkValue(e.label);
};
</script>
<style lang="scss" scoped>
.score-board--floating {
  position: fixed;
  right: 40px;
  top: 140px;
  z-index: 200;
  max-width: 420px;
}

.score-board-scroll-body {
  max-height: calc(100vh - 220px);
  overflow-x: hidden;
  overflow-y: auto;
}

.score-board-submit-inner {
  box-sizing: border-box;
}

.score-board-drag-handle {
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.score-board-drag-handle:active {
  cursor: grabbing;
}

.right-title {
  cursor: pointer;
  padding: 15px;
  font-family:
    Source Han Sans,
    Source Han Sans;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

:deep(.el-collapse-item__header) {
  width: 98%;
  // border-bottom: 1px solid #d8d8d8;
}
</style>
<style lang="scss">
.el-input-score {
  .el-input__inner {
    text-align: center;
  }
}

.el-table tbody tr:hover > td {
  background-color: #fff !important;
}
</style>