<template>
  <div class="px-20px">
    <div class="grid grid-cols-4 gap-3 mb-3">
      <div v-for="button in addButtons">
        <ElButton
          :icon="Plus"
          class="w-full"
          @click="AddQuestionIns.open(button, maxQuestionNumber + 1)">
          {{ button.label }}
        </ElButton>
      </div>
    </div>
    <Table border :data="data">
      <template #default-expand="{ row }">
        <ChildsTable class="-my-10px" border :data="row.childs" :columns="colMap[row.type]" />
      </template>
    </Table>
  </div>
  <AddQuestion :onAddQuestion :onEditQuestion />
</template>

<script setup lang="tsx">
import { h, inject, ref } from "vue";
import { useTable } from "../../../../JSONComp/index";
import addQuestion from "../../add/index.vue";
import { useFunComp } from "@sjjb/utils";
import { Plus } from "@element-plus/icons-vue";
import { transformToThin } from "../../utils/addTransform";
import { ElButton } from "element-plus";
import SetInfo from "./SetInfo";

const [AddQuestion, AddQuestionIns] = useFunComp(addQuestion);
const data = inject("threeQuestionInfo") as any;
const maxQuestionNumber = defineModel("maxQuestionNumber", {
  default: 0,
});

const addButtons = ref([
  {
    label: "选择题",
    params: {
      type: "ChoiceQuestion",
      answerTypes: "1,2,3,6",
    },
  },
  {
    label: "填空题",
    params: {
      type: "FillBlankQuestion",
      answerTypes: "4",
    },
  },
  {
    label: "简答题",
    params: {
      type: "BriefQuestion",
      answerTypes: "5",
    },
  },
  {
    label: "作文",
    params: {
      type: "ArticleQuestion",
      answerTypes: "7",
    },
  },
]);

const getButtons = (scope, optionList) => {
  const comp = optionList.map((item, index) => {
    return (
      <>
        <div class='flex items-center cursor-pointer'>
          <a onClick={() => item.click(scope)}>{item.label}</a>
        </div>
        {optionList.length != index + 1 && <div class='mr-5px'></div>}
      </>
    );
  });
  return h("div", { class: "flex text-[#0E5FC7]  items-center  justify-center" }, comp);
};

const [Table] = useTable({
  columns: [
    {
      label: "",
      prop: "expand",
      width: 40,
      type: "expand",
    },
    {
      label: "题号",
      prop: "bigQuestionNumber",
      width: 60,
      align: "center",
    },
    {
      label: "题型",
      prop: "questionName",
      align: "center",
    },
    {
      label: "分值",
      prop: "totalScore",
      align: "center",
      width: 60,
    },
    {
      label: "小题数",
      prop: "childs",
      align: "center",
      width: 90,
      render: ({ row }) => {
        return row?.childs?.length || 0;
      },
    },
    {
      label: "操作",
      prop: "paperScore",
      align: "center",
      render: ({ row }) => {
        return getButtons(row, [
          {
            label: "编辑",
            click: scope => AddQuestionIns.edit(scope.rawOptions),
          },
          {
            label: "删除",
            click: scope => {
              data.value = data.value.filter(item => item.id != scope.id);
            },
          },
        ]);
      },
    },
  ],
});

const childAction = {
  label: "操作",
  prop: "paperScore",
  align: "center",
  render: ({ row }) => {
    const label = row.bigQuestionNumber + "、" + row.prefix;
    return <SetInfo label={label} type='text' v-model:infoList={row.infoIdList} />;
  },
};

const ChoiceCols = [
  {
    label: "",
    prop: "index",
    width: 40,
    type: "x",
  },
  {
    label: "题号",
    prop: "prefix",
    width: 60,
    align: "center",
  },
  {
    label: "答案",
    prop: "answerKey",
    align: "center",
  },
  {
    label: "分值",
    prop: "score",
    align: "center",
    width: 60,
  },
  {
    label: "选项数",
    prop: "contentList",
    align: "center",
    width: 90,
    render: ({ row }) => {
      return row.contentList.length;
    },
  },
  childAction,
];

const FillBlankCols = [
  {
    label: "",
    prop: "index",
    width: 40,
    type: "x",
  },
  {
    label: "题号",
    prop: "prefix",
    width: 60,
    align: "center",
  },
  {
    label: "答案",
    prop: "answerKey",
    align: "center",
    render: () => {
      return "暂无";
    },
  },
  {
    label: "分值",
    prop: "score",
    align: "center",
    width: 60,
  },
  {
    label: "空数",
    prop: "contentList",
    align: "center",
    width: 90,
    render: ({ row }) => {
      return row.block.length;
    },
  },
  childAction,
];

const BriefCols = [
  {
    label: "",
    prop: "index",
    width: 40,
    type: "x",
  },
  {
    label: "题号",
    prop: "prefix",
    width: 60,
    align: "center",
  },
  {
    label: "答案",
    prop: "answerKey",
    align: "center",
    render: () => {
      return "暂无";
    },
  },
  {
    label: "分值",
    prop: "score",
    align: "center",
    width: 60,
  },
  {
    label: "横线数",
    prop: "contentList",
    align: "center",
    width: 90,
    render: ({ row }) => {
      return row.lineCount;
    },
  },
  childAction,
];

const ArticleCols = [
  {
    label: "",
    prop: "index",
    width: 40,
    type: "x",
  },
  {
    label: "题目名称",
    prop: "questionName",
    align: "center",
  },
  {
    label: "标记间隔",
    prop: "wordMarkInterval",
    align: "center",
  },
  {
    label: "格子大小",
    prop: "gridSize",
    align: "center",
  },
  {
    label: "字数",
    prop: "wordCount",
    align: "center",
    width: 90,
  },
  childAction,
];

const colMap: Record<string, any[]> = {
  ChoiceQuestion: ChoiceCols,
  FillBlankQuestion: FillBlankCols,
  BriefQuestion: BriefCols,
  ArticleQuestion: ArticleCols,
};

const [ChildsTable] = useTable({});

const onAddQuestion = (item: any) => {
  const id = maxQuestionNumber.value + new Date().getTime().toString();
  const newQuestion = transformToThin(item, id, 0);
  data.value?.push(newQuestion);
  maxQuestionNumber.value = maxQuestionNumber.value + newQuestion.childs.length;
};

const onEditQuestion = (edited: any) => {
  const rootId = String(edited.id);

  const index = data.value.findIndex(
    it => String(it.id) === rootId && !it.isSuffix && !it._isCloneHeader,
  );
  if (index === -1) return;

  const oldQuestion = data.value[index];
  const newQuestion = transformToThin(edited, rootId, 0);

  Object.keys(oldQuestion).forEach(key => {
    delete oldQuestion[key];
  });
  Object.assign(oldQuestion, newQuestion);
};
</script>

<style lang="scss" scoped></style>
