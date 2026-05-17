<script setup lang="ts">
import { computed, inject, ref, watch } from "vue"; // 引入 ref 和 watch
import { ElInputNumber } from "element-plus";
import Judument from "../../../../JudumentScore/index.vue";

// ... (你的类型定义保持不变) ...
type LegacyScoreGroup = {
  id?: string | number;
  title?: string;
  totalScore?: number;
  childs?: Array<{
    id?: string | number;
    prefix?: string | number;
    score?: number;
    unit?: string;
    syncTargets?: Record<string, any>[];
  }>;
};

type ScoreSettingRow = {
  id?: string | number;
  type?: string;
  score?: number;
  unit?: string;
  isGroupHeader?: boolean;
  totalScore?: number;
};

interface NormalizedGroup {
  id: string | number;
  title: string;
  header?: ScoreSettingRow | LegacyScoreGroup;
  questions: Array<{
    id: string | number;
    label: string | number;
    unit: string;
    row: Record<string, any>;
  }>;
}

const normalizeLabel = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value).trim();
};

const resolveRowLabel = (row: Record<string, any> | undefined, fallback: string | number) => {
  const raw = row?.raw && typeof row.raw === "object" ? row.raw : row;
  const label = normalizeLabel(
    row?.prefix ?? row?.sort ?? row?.type ?? raw?.displayPrefix ?? raw?.prefix ?? raw?.sort,
  );
  return label || fallback;
};

const props = withDefaults(
  defineProps<{
    data?: unknown;
  }>(),
  {
    data: () => [],
  },
);

// 1. 定义一个可修改的本地变量
const scoreGroups = ref<NormalizedGroup[]>([]);

const rawData = computed(() => {
  if (Array.isArray(props.data)) return props.data as Array<any>;
  if (props.data && typeof props.data === "object") {
    return Object.values(props.data as Record<string, any>);
  }
  return [];
});

// 2. 将原本 computed 里的逻辑提取到一个处理函数中
const initScoreGroups = () => {
  const list = rawData.value;
  if (!list.length) {
    scoreGroups.value = [];
    return;
  }

  // ScoreSettingDialog 风格
  if (list.some(item => Object.prototype.hasOwnProperty.call(item, "isGroupHeader"))) {
    const groups: NormalizedGroup[] = [];
    let currentGroup: NormalizedGroup | null = null;

    list.forEach((item: ScoreSettingRow, index: number) => {
      if (item?.isGroupHeader) {
        currentGroup = {
          id: item.id ?? `group-${index}`,
          title: item.type ?? `第${groups.length + 1}大题`,
          header: item,
          questions: [],
        };
        groups.push(currentGroup);
      } else if (currentGroup) {
        const row = item as Record<string, any>;
        currentGroup.questions.push({
          id: item.id ?? `q-${currentGroup.id}-${index}`,
          label: resolveRowLabel(row, index + 1),
          unit: item.unit ?? "分",
          row, // 注意：这里还是引用的 props 里的对象，修改 score 会直接修改原数据对象
        });
      }
    });
    scoreGroups.value = groups;
    return;
  }

  // 旧数据结构
  scoreGroups.value = (list as LegacyScoreGroup[]).map((group, groupIndex) => {
    const questions =
      group.childs?.map((child, childIndex) => ({
        id: child.id ?? `q-${groupIndex}-${childIndex}`,
        label: resolveRowLabel(child as Record<string, any>, childIndex + 1),
        unit: child.unit ?? "分",
        row: child,
      })) ?? [];

    return {
      id: group.id ?? `group-${groupIndex}`,
      title: group.title ?? `第${groupIndex + 1}大题`,
      header: group,
      questions,
    };
  });
};

// 3. 使用 watch 监听数据源变化来初始化，independent of rendering
watch(() => props.data, initScoreGroups, { immediate: true });

const getGroupQuestionCount = (group: NormalizedGroup) => group.questions.length;

const getGroupTotalScore = (group: NormalizedGroup) =>
  group.questions.reduce((sum, question) => {
    const rawScore = Number(question.row?.score ?? 0);
    return sum + (Number.isNaN(rawScore) ? 0 : rawScore);
  }, 0);

const multipleAnswerTypes = new Set([2, 6]);

const deepClone = <T,>(value: T): T => {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
};

const getRawQuestion = (question: NormalizedGroup["questions"][number]) => {
  const raw = (question.row as any)?.raw;
  if (raw && typeof raw === "object") return raw as Record<string, any>;
  return question.row;
};

const getSyncTargets = (question: NormalizedGroup["questions"][number]) => {
  const syncTargets = (question.row as any)?.syncTargets;
  if (!Array.isArray(syncTargets)) return [];
  return syncTargets.filter(target => target && typeof target === "object");
};

const applyScoreToTarget = (target: Record<string, any>, score: number) => {
  if ("score" in target) {
    target.score = score;
  }
  if ("blockScore" in target) {
    target.blockScore = score;
  }
  if (Array.isArray(target.block)) {
    target.block.forEach((block: any) => {
      if (!block || typeof block !== "object") return;
      if ("score" in block) {
        block.score = score;
      }
      if ("blockScore" in block) {
        block.blockScore = score;
      }
    });
  }
};

const isMultipleChoiceQuestion = (question: NormalizedGroup["questions"][number]) => {
  const raw = getRawQuestion(question);
  const answerType = Number(raw?.answerType ?? question.row?.answerType);

  if (multipleAnswerTypes.has(answerType)) return true;

  const typeName = String(
    raw?.questionTypeName ?? raw?.questionTypeLabel ?? question.row?.type ?? "",
  );
  return typeName.includes("多选") || typeName.includes("七选五");
};

const getQuestionScoreRule = (question: NormalizedGroup["questions"][number]) => {
  const raw = getRawQuestion(question);
  return raw?.scoreRule ?? question.row?.scoreRule;
};

const updateQuestionScoreRule = (
  question: NormalizedGroup["questions"][number],
  rules: unknown,
) => {
  const nextRules = deepClone(rules);

  question.row.scoreRule = nextRules;

  const raw = getRawQuestion(question);
  if (raw && typeof raw === "object") {
    raw.scoreRule = nextRules;
  }

  getSyncTargets(question).forEach(target => {
    target.scoreRule = nextRules;
  });
};

// 修改某一小题分值时，同时回写到原始题目对象（question.row.raw）
const updateQuestionScore = (
  question: NormalizedGroup["questions"][number],
  value: number | null,
) => {
  const v = Number(value ?? 0);
  const finalValue = Number.isNaN(v) ? 0 : v;

  // 当前行显示用
  question.row.score = finalValue;

  // 回写到底层原始题目对象，供外层保存时读取
  const raw = (question.row as any)?.raw;
  if (raw && typeof raw === "object") {
    if ("score" in raw) {
      raw.score = finalValue;
    }
    if ("blockScore" in raw) {
      raw.blockScore = finalValue;
    }
  }

  getSyncTargets(question).forEach(target => {
    applyScoreToTarget(target, finalValue);
  });
};

// 总分计算现在依赖于响应式的 scoreGroups，修改分值后会自动更新
const totalScore = computed(() =>
  scoreGroups.value.reduce((sum, group) => sum + getGroupTotalScore(group), 0),
);

const setScore = inject("setScore") as (scoreList: any[], totalScore: number) => void;
const saveHandler = () => {
  const scoreList = scoreGroups.value
    .map(it => {
      return it.questions.map(q => {
        const raw = (q.row as any)?.raw ?? q.row;
        const ruleId =
          raw?.questionScoreRuleId ?? q.row?.questionScoreRuleId ?? raw?.id ?? q.row?.id;
        if (!ruleId) return null;
        return {
          id: ruleId,
          score: q.row.score,
        };
      });
    })
    .flat()
    .filter(Boolean);
  setScore(scoreList, totalScore.value);
};
</script>

<template>
  <div class="score-set">
    <div class="score-set__header">
      <div class="score-set__total">满分：{{ totalScore }} 分</div>
      <el-button text type="primary" @click="saveHandler">保存</el-button>
    </div>

    <div v-if="!scoreGroups.length" class="score-set__empty">暂无题目，请先完成试题设置</div>

    <div v-else class="score-set__body">
      <div v-for="group in scoreGroups" :key="group.id" class="score-set__group">
        <div class="score-set__group-header">
          <div class="score-set__group-title">
            {{ group.title }}
            <span class="score-set__group-meta">
              （共{{ getGroupQuestionCount(group) }}小题，共{{ getGroupTotalScore(group) }}分）
            </span>
          </div>
        </div>

        <div class="flex flex-wrap flex-shrink-0 gap-3 p-3 j">
          <div v-for="question in group.questions" :key="question.id" class="flex items-center">
            <div class="w-35px">{{ question.label }}、</div>
            <el-input-number
              size="small"
              :model-value="question.row.score"
              :min="0"
              :max="999"
              :step="1"
              controls-position="right"
              style="width: 70px"
              @update:model-value="val => updateQuestionScore(question, val)" />
            <span class="score-set__question-unit">{{ question.unit }}</span>
            <Judument
              v-if="isMultipleChoiceQuestion(question)"
              :rules="getQuestionScoreRule(question)"
              @update:rules="rules => updateQuestionScoreRule(question, rules)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.score-set {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #333;
  }

  &__title {
    font-weight: 600;
  }

  &__total {
    color: #666;
  }

  &__empty {
    padding: 24px;
    text-align: center;
    color: #999;
    background: #f8f8f8;
    border-radius: 8px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__group {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    overflow: hidden;
  }

  &__group-header {
    padding: 12px 16px;
    background-color: #f9fafb;
    border-bottom: 1px solid #f0f0f0;
  }

  &__group-title {
    font-weight: 600;
    color: #333;
  }

  &__group-meta {
    margin-left: 8px;
    font-size: 12px;
    color: #999;
    font-weight: normal;
  }

  &__group-content {
    padding: 12px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
  }

  &__question {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #333;
  }

  &__question-label {
    margin-right: 6px;
  }

  &__input {
    width: 110px;
  }

  &__question-unit {
    margin-left: 6px;
    color: #666;
  }
}
</style>
