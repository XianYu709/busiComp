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
        <div class="expand-wrap">
          <ChildsTable border :data="getTableChilds(row)" :columns="colMap[row.type]" />
        </div>
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
import { ElButton, ElMessage } from "element-plus";
import SetInfo from "./SetInfo";
import { showPopConfirm } from "../../utils/showPopConfirm";

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
          <a onClick={e => item.click(scope, e)}>{item.label}</a>
        </div>
        {optionList.length != index + 1 && <div class='mr-5px'></div>}
      </>
    );
  });
  return h("div", { class: "flex text-[#0E5FC7]  items-center  justify-center" }, comp);
};

const markFuns = inject<any>("markFuns");

const getFillParentRow = (row: any) => {
  const list = Array.isArray(data?.value) ? data.value : [];

  for (const question of list) {
    if (question?.type !== "FillBlankQuestion") continue;
    const questionList = Array.isArray(question?.childs) ? question.childs : [];

    for (const parent of questionList) {
      const childs = Array.isArray(parent?.childs) ? parent.childs : [];
      if (childs.some((child: any) => String(child?.id) === String(row?.id))) {
        return parent;
      }
    }
  }

  return null;
};

const getTableChilds = (row: any) => {
  if (row?.type !== "FillBlankQuestion") return row?.childs || [];

  const source = Array.isArray(row?.childs) ? row.childs : [];
  const out: any[] = [];

  source.forEach((item: any) => {
    if (item.childs?.length) {
      item.childs = [];
    }
    if (Number(item?.isOneProb) === 2 && Array.isArray(item?.childs) && item.childs.length > 0) {
      item.childs.forEach((sub: any, idx: number) => {
        if (!sub.prefix) sub.prefix = `${item.prefix}（${idx + 1}）`;
        if (sub.bigQuestionNumber === undefined) sub.bigQuestionNumber = row.bigQuestionNumber;
        sub.parentPrefix = item.prefix;
        out.push(sub);
      });
      return;
    }

    if (item.bigQuestionNumber === undefined) item.bigQuestionNumber = row.bigQuestionNumber;
    item.parentPrefix = item.prefix;
    out.push(item);
  });
  return out;
};

const [Table] = useTable({
  rowKey: "id",
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
        return getTableChilds(row).length;
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
            click: scope =>
              AddQuestionIns.edit({
                ...(scope.rawOptions || {}),
                id: scope?.rawOptions?.id || scope?.id,
              }),
          },
          {
            label: "删除",
            click: (scope, e) => {
              scope.childs.forEach(it => {
                const label = scope.bigQuestionNumber + "、" + it.prefix;
                markFuns.deleteAllByLabel(label);
              });
              data.value = data.value.filter(item => item.id != scope.id);
            },
          },
        ]);
      },
    },
  ],
});

const creatChildAction = (more = false, questionType?: string) => {
  return {
    label: "操作",
    prop: "paperScore",
    align: "center",
    render: ({ row }) => {
      let bindRow = row;
      if (questionType === "FillBlankQuestion") {
        const parentRow = getFillParentRow(row);
        if (parentRow) bindRow = parentRow;
      }

      bindRow.infoIdList ||= [];
      const label = row.bigQuestionNumber + "、" + bindRow.prefix;
      return (
        <SetInfo label={label} type='text' v-model:infoList={bindRow.infoIdList} more={more} />
      );
    },
  };
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
  creatChildAction(false, "ChoiceQuestion"),
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
    render: ({ row }) => {
      return row.parentPrefix ?? row.prefix;
    },
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
      return Array.isArray(row?.block) ? row.block.length : Number(row?.blockLength) || 1;
    },
  },
  creatChildAction(true, "FillBlankQuestion"),
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
  creatChildAction(true, "BriefQuestion"),
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
    width: 100,
  },
  {
    label: "字数",
    prop: "wordCount",
    align: "center",
    width: 70,
  },
  creatChildAction(true, "ArticleQuestion"),
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
  if (!data.value?.length) return false;
  const rootId = String(edited.id);
  if (!rootId) {
    ElMessage.warning("编辑失败，缺少题目ID");
    return false;
  }

  const index = data.value.findIndex(
    it => String(it.id) === rootId && !it.isSuffix && !it._isCloneHeader,
  );
  if (index === -1) {
    ElMessage.warning("编辑失败，未找到题目");
    return false;
  }

  const oldQuestion = data.value[index];
  const newQuestion = transformToThin(edited, rootId, 0);

  Object.keys(oldQuestion).forEach(key => {
    delete oldQuestion[key];
  });
  Object.assign(oldQuestion, newQuestion);
  return true;
};
</script>

<style lang="scss" scoped>
/* expand 单元格 element-plus 默认有 padding，会配合你负 margin/高度计算出“1px 溢出” */
:deep(.el-table__expanded-cell) {
  padding: 0 !important;
}

/* expand 内容区域：不要写死高度，避免 90% 这种误差；同时不让它产生滚动条 */
.expand-wrap {
  margin: 0;
  height: auto;
  overflow: hidden; /* 关键：直接杜绝那种 1px 的溢出滚动条 */
}
</style>
