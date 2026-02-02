<template>
  <div class="px-20px -mb-15px">
    <QuestBar v-for="(it, _) in getQuestionBarList" :="it" :itemIndex="it.selftIndex" />
    <div class="grid grid-cols-3 gap-3 mt-4">
      <div v-for="button in addButtons">
        <ElButton
          class="w-full"
          :icon="Plus"
          @click="AddQuestionIns.open(button, maxQuestionNumber + 1)">
          {{ button.label }}
        </ElButton>
      </div>
    </div>
  </div>
  <AddQuestion :onAddQuestion :onEditQuestion />
</template>

<script setup lang="tsx">
import { computed, ref } from "vue";
import { Bottom, Delete, EditPen, Plus, Top } from "@element-plus/icons-vue";
import { ElIcon } from "element-plus";
import { moveArrayElement, useFunComp } from "@sjjb/utils";
import { ElButton, ElPopconfirm } from "element-plus";
import addQuestion from "../../add/index.vue";
import { emitEvent } from "@sjjb/utils";
import { transform } from "../../utils/addTransform";
import { useRoute } from "vue-router";

const [AddQuestion, AddQuestionIns] = useFunComp(addQuestion);

const data = defineModel<any>("data", { default: () => ({}) });
const maxQuestionNumber = defineModel("maxQuestionNumber", {
  default: 0,
});

const props = withDefaults(
  defineProps<{
    nextPage?: number;
  }>(),
  {
    nextPage: 0,
  },
);

let fixedIndexs: number[] = [];

const route = useRoute();
const routerInfo = computed(() => {
  return JSON.parse((route.query?.info as string) || "{}");
});
const onlyArticle = computed(() => {
  return route.query?.onlyArticle === "true";
});

const addButtons = computed(() => {
  return [
    {
      show: () => !onlyArticle.value,
      label: "选择题",
      params: {
        type: "ChoiceQuestion",
        answerTypes: "1,2,3,6",
      },
    },
    {
      show: () => !onlyArticle.value,
      label: "填空题",
      params: {
        type: "FillBlankQuestion",
        answerTypes: "4",
      },
    },
    {
      show: () => !onlyArticle.value,
      label: "简答题",
      params: {
        type: "BriefQuestion",
        answerTypes: "5",
      },
    },
    {
      show: () => onlyArticle.value && routerInfo.value?.subject == "3",
      label: "英语作文",
      params: {
        type: "BriefQuestion",
        answerTypes: "7",
      },
    },
    {
      show: () => routerInfo.value?.subject == "1",
      label: "作文",
      params: {
        type: "ArticleQuestion",
        answerTypes: "7",
      },
    },
  ].filter(it => it?.show?.());
});

const getQuestionBarList = computed(() => {
  let current = 1;
  const useful = data
    .value!.filter(it => !it.isMerge)
    .filter(it => !it.isSuffix)
    .map((item, index) => {
      item.selftIndex = index;
      if (["TopInfoHomework", "TopInfo"].includes(item.type)) {
        fixedIndexs.push(index);
        return;
      }
      const model = item.model;
      let count = 0;
      if (item.type === "ChoiceQuestion") {
        count = model.childs?.length || 0;
      } else if (item.type === "FillBlankQuestion") {
        count = item.model?.childs?.length || 0;
      } else if (item.type === "BriefQuestion") {
        count = item.model?.childs?.length || 0;
      } else if (item.type === "ArticleQuestion") {
        count = 1;
      }
      const start = current;
      const end = current + count - 1;
      model.range = [start, end];
      model.selftIndex = index;
      model.id = item?.id || "";
      current += count;
      return { ...model, rawOptions: item.rawOptions };
    })
    .filter(Boolean);

  maxQuestionNumber.value = current - 1; // 保存最大题号
  return useful;
});

const moveQuestionPosition = (direction: "up" | "down", targetIndex: number) =>
  moveArrayElement(data.value!, targetIndex, direction, 1, true, fixedIndexs);

const QuestBar = props => {
  return (
    <div
      class='flex items-center justify-between pb-7px mb-5px'
      style='border-bottom: 1px solid #dcdfe6;'>
      <div class='mr-10px w-120px overflow-hidden whitespace-nowrap text-ellipsis '>
        {props?.title}
      </div>
      <div class='mr-3'>
        {props?.range?.[0]}-{props?.range?.[1]}
      </div>
      <div class='flex items-center justify-between w-100px text-16px cursor-pointer  opacity-70'>
        <ElIcon
          onClick={() => {
            moveQuestionPosition("up", props.itemIndex);
          }}>
          <Top />
        </ElIcon>
        <ElIcon
          onClick={() => {
            moveQuestionPosition("down", props.itemIndex);
          }}>
          <Bottom />
        </ElIcon>
        <ElIcon
          onClick={() => {
            AddQuestionIns.edit(props.rawOptions);
          }}>
          <EditPen />
        </ElIcon>
        <ElPopconfirm
          title='确定删除该题吗'
          confirmButtonText='是'
          cancelButtonText='否'
          onConfirm={() => {
            emitEvent("deleteById", { id: props.id });
          }}>
          {{
            reference: () => (
              <ElIcon>
                <Delete />
              </ElIcon>
            ),
          }}
        </ElPopconfirm>
      </div>
    </div>
  );
};

const onAddQuestion = (item: any) => {
  const id = maxQuestionNumber.value + new Date().getTime().toString();
  data.value?.push(transform(item, id, props.nextPage));
};

const onEditQuestion = (edited: any) => {
  if (!data.value?.length) return;
  const rootId = String(edited.id);
  const index = data.value.findIndex(
    it => String(it.id) === rootId && !it.isSuffix && !it._isCloneHeader,
  );
  if (index === -1) return;

  const old = data.value[index];
  const transformed: any = transform(edited, rootId, props.nextPage);

  data.value = data.value.filter(it => {
    if (it.isHeader) return true;
    const id = String(it.id);
    if (id.startsWith(`${rootId}_sf_`)) return false;
    return true;
  });

  const nextItem = {
    ...old,
    ...transformed,
    isSuffix: false,
    pageOf: 0,
    props: {
      ...(old.props || {}),
      ...(transformed.props || {}),
    },
  } as any;

  if (nextItem.props) {
    if (nextItem.props.breakPoint) delete nextItem.props.breakPoint;
    if (nextItem.props.originalHeight) delete nextItem.props.originalHeight;
  }

  data.value[index] = nextItem;

  emitEvent("reflowPages", { id: rootId });
};
</script>

<style lang="scss" scoped></style>
