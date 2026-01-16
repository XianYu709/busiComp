<script setup lang="ts">
import { computed, inject, ref, watch } from "vue"; // 引入 ref 和 watch
import { ElInputNumber } from "element-plus";

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
        currentGroup.questions.push({
          id: item.id ?? `q-${currentGroup.id}-${index}`,
          label: item.type ?? index + 1,
          unit: item.unit ?? "分",
          row: item, // 注意：这里还是引用的 props 里的对象，修改 score 会直接修改原数据对象
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
        label: child.prefix ?? childIndex + 1,
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
        return {
          id: q.row.raw.questionScoreRuleId,
          score: q.row.score,
        };
      });
    })
    .flat();
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
              style="width: 45%"
              @update:model-value="val => updateQuestionScore(question, val)" />
            <span class="score-set__question-unit">{{ question.unit }}</span>
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
