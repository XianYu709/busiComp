<template>
  <div v-for="(it, i) in groups" :key="it.id ?? i">
    <div class="flex items-center justify-between select-none mb-1.5">
      <div class="flex items-center">
        <el-select
          style="width: 120px"
          placeholder="题型"
          v-model="it.questionTypeId"
          :options="typeOptions"
          @change="
            () => {
              answerTypeChange(it);
              createChildQustion(it);
            }
          " />

        <span class="mx-2">从</span>
        <el-input
          type="number"
          style="width: 70px"
          v-model.number="it.startNum"
          @change="createChildQustion(it)"
          :disabled="i !== 0 || !it.questionTypeId"
          :min="0" />
        题

        <span class="mx-2">到</span>
        <el-input
          type="number"
          style="width: 70px"
          v-model.number="it.endNum"
          @change="createChildQustion(it)"
          :disabled="!it.questionTypeId"
          :min="it.startNum" />
        题

        <span class="mx-2">每题</span>
        <el-input
          type="number"
          style="width: 60px"
          v-model="it.score"
          :min="0"
          :disabled="!it.questionTypeId"
          @change="e => outScoreChange(e, it)" />
        <span class="mr-4">分</span>

        <component v-if="RightComp" :is="RightComp" :group="it" />
      </div>

      <div class="flex items-center w-60px justify-between text-20px cursor-pointer">
        <ElIcon class="hover:text-primary" @click="addHandler"><Plus /></ElIcon>
        <ElIcon class="hover:text-primary" @click="minusHandler(i)"><Minus /></ElIcon>
      </div>
    </div>
    <ElScrollbar height="300px">
      <div v-for="quest in it.questionList" :key="quest.id">
        <component v-if="NextComp" :is="NextComp" :question="quest" />
      </div>
    </ElScrollbar>
  </div>
</template>

<script setup lang="tsx">
import { SnowflakeIdGenerator } from "@sjjb/utils";
import { ElMessage } from "element-plus";
import { computed, ref, watch } from "vue";
import { createNextOptions } from "./nextOptions";
import { Minus, Plus } from "@element-plus/icons-vue";
import { getQuestionTypes } from "../api";

const props = defineProps({
  category: {
    type: Object,
    default: () => ({}),
  },
});

const groups = defineModel<any[]>("groups", {
  type: Array,
  default: () => [],
});

const typeOptions = ref<any[]>([]);

let msgHander: any;
const findAnswerType = (id: number) => {
  if (!id || typeOptions.value.length === 0) return "";
  const item = typeOptions.value.find(it => it.value === id);
  if (!item) {
    if (msgHander && msgHander?.close) msgHander.close();
    msgHander = ElMessage.error("请选择题型");
    return null;
  }
  return item.answerType;
};

watch(
  () => props.category,
  async val => {
    const urlParams = new URLSearchParams(window.location.search);
    const info = JSON.parse(urlParams.get("info") || "{}");
    typeOptions.value = await getQuestionTypes({
      ...val?.params,
      periodId: info?.period || info?.periodId,
      subjectId: info?.subject || info?.subjectId,
    });
  },
  { immediate: true, deep: true },
);

const contentMap: Record<string, number[] | string[]> = {
  number: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  letter: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  judge: ["T", "F"],
};

const answerTypeOptionsMap: Record<number, Record<string, any>> = {
  1: { contentStyle: "letter", defaultLength: 4, minOptions: 3, maxOptions: 7, single: true }, // 单选
  3: { contentStyle: "judge", defaultLength: 2, minOptions: 2, maxOptions: 2, single: true }, // 判断
  6: { contentStyle: "letter", defaultLength: 7, minOptions: 5, maxOptions: 7, single: false }, // 七选五
  2: { contentStyle: "letter", defaultLength: 5, minOptions: 4, maxOptions: 7, single: false }, // 多选
};

const setEveryFieldValue = (list: any[], field: string, value: any) => {
  list.forEach(it => {
    it[field] = value;
  });
};

const createChildQustion = (it: any) => {
  if (!it.questionTypeId) {
    ElMessage.error("请选择题型");
    return;
  }

  const len = it.endNum - it.startNum + 1;
  if (!Number.isFinite(len) || len <= 0) {
    it.questionList = [];
    return;
  }

  it.questionList = Array.from({ length: len }, (_, index) => {
    if (props.category.params.type === "ChoiceQuestion") {
      return {
        id: SnowflakeIdGenerator.generateId(),
        prefix: it.startNum + index,
        optionLength: it.optionLength,
        score: it.score,
        questionTypeId: it.questionTypeId,
        answer: "",
        answerType: undefined,
        questionTypeName: undefined,
        contentType: undefined,
        optionList: undefined,
        scoreRule: undefined,
        isOneProb: 1,
      };
    }

    if (props.category.params.type === "FillBlankQuestion") {
      return {
        id: SnowflakeIdGenerator.generateId(),
        prefix: it.startNum + index,
        width: it.width ?? "33.3%",
        score: it.score,
        blockLength: 1,
        isOneProb: 1,
        block: [
          {
            width: it.width ?? "33.3%",
            score: it.score,
            id: SnowflakeIdGenerator.generateId(),
          },
        ],
        questionTypeId: it.questionTypeId,
      };
    }

    // 简答题
    return {
      id: SnowflakeIdGenerator.generateId(),
      prefix: it.startNum + index,
      score: it.score,
      lineCount: it.lineCount ?? 0,
      isOneProb: 1,
      block: [
        {
          isOneProb: 1,
          prefix: "",
          score: it.score,
          lineCount: it.lineCount ?? 0,
          id: SnowflakeIdGenerator.generateId(),
        },
      ],
      questionTypeId: it.questionTypeId,
    };
  });
};

const outScoreChange = (e: any, it: any) => {
  setEveryFieldValue(it.questionList || [], "score", e);

  const blocks =
    (it.questionList || [])
      .map((q: any) => q?.block)
      .flat()
      .filter(Boolean) || [];

  if (props.category.params.type === "ChoiceQuestion") return;

  if (blocks.length > 0) {
    setEveryFieldValue(blocks, "score", e);
  }
};

const getDefaultOptionLength = (questionTypeId: number) => {
  const answerType = findAnswerType(questionTypeId);
  if (!answerType) return;
  return answerTypeOptionsMap[answerType]?.defaultLength;
};

const emits = defineEmits(["add", "minus", "getName"]);

const answerTypeChange = (it: any) => {
  const item = typeOptions.value.find(o => o.value == it.questionTypeId);

  emits("getName", item?.label || "");

  if (props.category.params.type === "ChoiceQuestion") {
    const defaultLength = getDefaultOptionLength(it.questionTypeId);
    if (defaultLength && !it.optionLength) it.optionLength = defaultLength;
  }

  if (props.category.params.type === "FillBlankQuestion") {
    if (!it.width) it.width = "33.3%";
  }

  if (props.category.params.type === "BriefQuestion") {
    if (it.lineCount === undefined || it.lineCount === null) it.lineCount = 0;
  }
};

const nextOptions = createNextOptions({
  typeOptions,
  findAnswerType,
  answerTypeOptionsMap,
  contentMap,
  setEveryFieldValue,
  genId: () => SnowflakeIdGenerator.generateId(),
});

const RightComp = computed(() => nextOptions[props.category.params.type]?.Right ?? null);
const NextComp = computed(() => nextOptions[props.category.params.type]?.Next ?? null);

const addHandler = () => {
  const last = groups.value.at(-1);

  const startNum = Number(last?.endNum ?? last?.startNum ?? 0) + 1;

  groups.value.push({
    id: SnowflakeIdGenerator.generateId(),
    questionTypeId: null,
    startNum,
    endNum: startNum,
    score: 0,
    questionList: [],
  });
};

const minusHandler = (index: number) => {
  if (groups.value.length <= 1) return ElMessage.warning("至少保留一个分组");
  groups.value.splice(index, 1);
};
</script>

<style lang="scss" scoped></style>

<style lang="scss">
.question-chiose-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  margin-right: 8px;
  background-color: #eee;
  border-radius: 4px;
  &.round {
    border-radius: 50%;
  }
  &.active {
    background-color: var(--el-color-primary);
    color: white;
  }
}
</style>
