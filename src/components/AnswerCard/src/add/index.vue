<template>
  <el-dialog
    v-model="visible"
    width="900"
    :title="`${isEdit ? '编辑' : '添加'}${params.fixedData.label}`"
    destroy-on-close
    append-to-body>
    <el-form label-width="70px">
      <el-form-item label="大题号" style="width: 200px">
        <el-select
          placeholder="请选择大题号"
          v-model="params.bigQuestionNumber"
          :options="
            titleNumber.map(item => {
              return {
                label: item,
                value: item,
              };
            })
          "></el-select>
      </el-form-item>
      <el-form-item label="题目名称">
        <el-input v-model="params.questionName" style="width: 200px"></el-input>
      </el-form-item>
      <template v-if="params.fixedData.params.answerTypes == '7'">
        <el-form-item label="分数">
          <el-input v-model="params.score" style="width: 200px" type="number" :min="0"></el-input>
        </el-form-item>
        <ArticleSettingView v-model="params.articleSetting" />
      </template>
      <AddQuestionLine
        v-else
        v-model:groups="params.groups"
        :category="params.fixedData"
        @get-name="e => (params.questionName = e)" />
    </el-form>
    <div class="flex justify-center mb-10px mt-20px">
      <el-button class="mr-20px w-100px" type="primary" @click="confirmHandler">确认</el-button>
      <el-button plain type="primary" class="w-100px" @click="visible = false">返回</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { inject, onBeforeUnmount, ref } from "vue";
import AddQuestionLine from "./AddQuestionLine.vue";
import ArticleSettingView from "../blockes/ArticleSettingView.vue";

const titleNumber = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
];

const visible = ref(false);
const isEdit = ref(false);
const lastBigNumber = ref("");

const params = ref<any>({
  bigQuestionNumber: "",
  questionName: "",
  fixedData: {},
  articleSetting: {},
  groups: [
    {
      questionType: null,
      startNum: "",
      endNum: "",
    },
  ],
  score: 0,
});

const articleSetting = {
  wordCount: 800,
  wordMarkInterval: 100,
  wordMarkType: "every", // 'every' 或 'min'
  minWordCount: 10,
  gridSize: "较大",
  lineHeight: "1mm",
};

const createEmptyParams = () => ({
  bigQuestionNumber: "",
  questionName: "",
  fixedData: {},
  articleSetting: {},
  groups: [
    {
      id: Date.now(),
      questionType: null,
      startNum: "",
      endNum: "",
      score: 0,
      questionList: [],
    },
  ],
  score: 0,
});

const open = async (typeItem: any, maxCount: number) => {
  params.value = createEmptyParams();
  if (lastBigNumber.value && lastBigNumber.value.trim()) {
    const lastIndex = titleNumber.findIndex(it => it === lastBigNumber.value);
    const nextNumber = titleNumber[lastIndex + 1];
    params.value.bigQuestionNumber = nextNumber ? nextNumber : "一";
  }

  if (typeItem.params.answerTypes == "7") {
    params.value.articleSetting = {
      ...articleSetting,
      score: params.value.score,
    };
  }

  params.value.fixedData = typeItem;
  params.value.questionName = typeItem.label;
  params.value.groups[0] = {
    questionType: null,
    startNum: maxCount,
    endNum: "",
    score: "",
  };
  visible.value = true;
  isEdit.value = false;
};

const edit = async p => {
  if (!p || Object.keys(p).length === 0) {
    ElMessage.warning("数据损坏");
    return;
  }
  isEdit.value = true;
  Object.assign(params.value, p);
  visible.value = true;
};
const close = () => {
  lastBigNumber.value = params.value.bigQuestionNumber;
  params.value = {
    bigQuestionNumber: "",
    questionName: "",
    fixedData: {},
    groups: [
      {
        questionType: null,
        startNum: "",
        endNum: "",
      },
    ],
  };
  visible.value = false;
  isEdit.value = false;
};

const props = defineProps({
  onAddQuestion: {
    type: Function,
    default: () => {},
  },
  onEditQuestion: {
    type: Function,
    default: () => {},
  },
});

// const AddSingleQuestionNeedAnswer = inject("AddSingleQuestionNeedAnswer");

const confirmHandler = async () => {
  const data = params.value;

  if (!data.bigQuestionNumber) {
    ElMessage.error("请填写大题号");
    return;
  }

  if (!data.questionName) {
    ElMessage.error("请填写题目名称");
    return;
  }

  if (!["作文", "选择题"].includes(data.fixedData.label)) {
    if (!data.groups?.length || !data.groups[0]?.questionList?.length) {
      ElMessage.error("请配置题目");
      return;
    }
  }

  for (const group of data.groups || []) {
    for (const question of group.questionList || []) {
      if (!question.score || question.score <= 0) {
        ElMessage.error(`请填写第 ${question.prefix} 题的分数`);
        return;
      }

      if (Array.isArray(question.block)) {
        for (let i = 0; i < question.block.length; i++) {
          const block = question.block[i];
          if (!block.score || block.score <= 0) {
            ElMessage.error(
              `请填写第 ${question.prefix} 题` +
                (question.block.length > 1 ? `第 ${i + 1} 空` : "") +
                " 的分数",
            );
            return;
          }
        }
      }
      if (data.fixedData.label === "选择题" && true) {
        const ans = question.answer;
        const hasAnswer =
          (typeof ans === "string" && ans !== "") || (Array.isArray(ans) && ans.length > 0);

        if (!hasAnswer) {
          ElMessage.error(`请选择第 ${question.prefix} 题的正确答案`);
          return;
        }
      }
    }
  }
  const handler = isEdit.value ? props.onEditQuestion : props.onAddQuestion;
  await handler(data);

  ElMessage.success("操作成功");
  visible.value = false;
  lastBigNumber.value = data.bigQuestionNumber;
};

defineExpose({
  open,
  close,
  edit,
});

onBeforeUnmount(close);
</script>

<style lang="scss" scoped></style>
