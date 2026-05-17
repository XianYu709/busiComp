<template>
  <el-dialog
    v-model="visible"
    width="900"
    :title="`${isEdit ? '编辑' : '添加'}${params.fixedData.label}`"
    destroy-on-close
    @closed="handleDialogClosed"
    append-to-body>
    <el-form label-width="70px" v-loading="loading">
      <el-form-item label="大题号">
        <el-select
          placeholder="请选择大题号"
          style="width: 200px"
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
      <el-form-item v-if="params.fixedData.label == '英语作文'" label="题目描述">
        <el-input
          v-model="params.articleSetting.questionDesc"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="请输入题目描述" />
      </el-form-item>
      <ArticleSettingView
        v-model:loading="loading"
        v-if="params?.fixedData?.params?.type == 'ArticleQuestion'"
        v-model="params.articleSetting" />
      <AddQuestionLine
        v-else
        v-model:loading="loading"
        v-model:groups="params.groups"
        :category="params?.fixedData"
        :is-english-composition="params?.fixedData.label === '英语作文'"
        @get-name="e => (params.questionName = params.questionName == '' ? e : params.questionName)" />
    </el-form>
    <div class="flex justify-center mb-10px mt-20px">
      <el-button class="mr-20px w-100px" type="primary" @click="confirmHandler">确认</el-button>
      <el-button plain type="primary" class="w-100px" @click="visible = false">返回</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onBeforeUnmount, ref } from "vue";
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
const loading = ref(true);
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
  showQuestionDesc: false,
  questionBorder: false,
  showQuestionDesc: false,
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

const normalizeGroupsScoreRule = (groups: any[] = []) => {
  return groups.map(group => {
    if (!group || typeof group !== "object") return group;
    const questionList = Array.isArray(group.questionList) ? group.questionList : [];
    if (!group.scoreRule) {
      const existedRule = questionList.find((q: any) => q?.scoreRule)?.scoreRule;
      if (existedRule) {
        group.scoreRule = JSON.parse(JSON.stringify(existedRule));
      }
    }
    return group;
  });
};

const open = async (typeItem: any, maxCount: number) => {
  params.value = createEmptyParams();
  if (lastBigNumber.value && lastBigNumber.value.trim()) {
    const lastIndex = titleNumber.findIndex(it => it === lastBigNumber.value);
    const nextNumber = titleNumber[lastIndex + 1];
    params.value.bigQuestionNumber = nextNumber ? nextNumber : "一";
  }

  if (typeItem.params.type == "ArticleQuestion") {
    params.value.articleSetting = {
      ...articleSetting,
      score: params.value.score,
    };
  }

  params.value.fixedData = typeItem;
  params.value.questionName = typeItem.label;
  params.value.groups[0] = {
    questionType: null,
    startNum: typeItem.label === "英语作文" ? 1 : maxCount,
    endNum: typeItem.label === "英语作文" ? 1 : "",
    score: "",
  };
  visible.value = true;
  isEdit.value = false;
  // console.log('params.value.fixedData === ',params.value.fixedData)
};

const edit = async p => {
  if (!p?.fixedData) {
    ElMessage.warning("由题库组卷生成的答题卡不可编辑");
    return;
  }

  if (!p || Object.keys(p).length === 0) {
    ElMessage.warning("数据损坏");
    return;
  }
  const cloned = JSON.parse(JSON.stringify(p));
  isEdit.value = true;
  params.value = {
    ...createEmptyParams(),
    ...cloned,
    groups: normalizeGroupsScoreRule(cloned.groups || []),
    id: cloned?.id ?? p?.id,
  };
  visible.value = true;
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
  onCloseEditDialog: {
    type: Function,
    default: () => {},
  },
});

const isSingleChoiceQuestion = (question: any) => {
  const typeName = String(question?.questionTypeName || question?.questionTypeLabel || "");
  return Number(question?.answerType) === 1 || typeName.includes("单选题");
};

const shouldRefreshObjectiveMerge = () => {
  if (!isEdit.value || params.value?.fixedData?.params?.type !== "ChoiceQuestion") {
    return false;
  }

  return (params.value?.groups || []).some((group: any) =>
    (group?.questionList || []).some((question: any) => isSingleChoiceQuestion(question)),
  );
};

const resetDialogState = () => {
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

const close = () => {
  resetDialogState();
};

const handleDialogClosed = () => {
  if (shouldRefreshObjectiveMerge()) {
    props.onCloseEditDialog();
  }
  resetDialogState();
};

const confirmHandler = async () => {
  const data = params.value;

  if (!data.bigQuestionNumber) {
    ElMessage.warning("请填写大题号");
    return;
  }

  if (data.fixedData.params.type === "ArticleQuestion") {
    if (!data.articleSetting.questionTypeId) {
      ElMessage.warning("请选择类型");
      return;
    }
    if (!data.articleSetting.score) {
      ElMessage.warning("请设置分值");
      return;
    }
  }

  if (!data.questionName) {
    ElMessage.warning("请填写题目名称");
    return;
  }

  if (!["ChoiceQuestion", "ArticleQuestion"].includes(data.fixedData.params.type)) {
    if (!data.groups?.length || !data.groups[0]?.questionList?.length) {
      ElMessage.warning("请配置题目");
      return;
    }
  }

  for (const group of data.groups || []) {
    for (const question of group.questionList || []) {
      const type = data.fixedData.params.type;
      const blocks = Array.isArray(question.block) ? question.block : [];
      const isBrief = type === "BriefQuestion";
      const isFill = type === "FillBlankQuestion";
      const isMultiBlank = blocks.length > 1;

      if (isBrief || isFill) {
        if (isMultiBlank) {
          for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (!block.score || block.score <= 0) {
              ElMessage.warning(`请填写第 ${question.prefix} 题第 ${i + 1} 空的分数`);
              return;
            }
          }
        } else {
          if (!question.score || question.score <= 0) {
            ElMessage.warning(`请填写第 ${question.prefix} 题的分数`);
            return;
          }
        }
      } else {
        if (!question.score || question.score <= 0) {
          ElMessage.warning(`请填写第 ${question.prefix} 题的分数`);
          return;
        }
      }

      if (type === "ChoiceQuestion") {
        const ans = question.answer;
        const hasAnswer =
          (typeof ans === "string" && ans !== "") || (Array.isArray(ans) && ans.length > 0);

        if (!hasAnswer) {
          ElMessage.warning(`请选择第 ${question.prefix} 题的正确答案`);
          return;
        }
      }
    }
  }

  const handler = isEdit.value ? props.onEditQuestion : props.onAddQuestion;
  const result = await handler(data);

  if (result === false) {
    ElMessage.warning("操作失败，请重试");
    return;
  }

  ElMessage.success("操作成功");
  visible.value = false;
  lastBigNumber.value = data.bigQuestionNumber;
};

defineExpose({
  open,
  close,
  edit,
});

onBeforeUnmount(resetDialogState);
</script>

<style lang="scss" scoped></style>
