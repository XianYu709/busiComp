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
  <AddQuestion :onAddQuestion :onEditQuestion :onCloseEditDialog="handleCloseEditDialog" />
</template>

<script setup lang="tsx">
import { computed, inject, nextTick, ref, watch } from "vue";
import { Bottom, Delete, EditPen, Plus, Top } from "@element-plus/icons-vue";
import { ElIcon, ElMessage } from "element-plus";
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
const rightSetting = inject<any>("AnswerCardSetting", null);

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

const normalizeScore = (value: unknown) => {
  const score = Number(value);
  return Number.isFinite(score) ? score : 0;
};

const normalizeTitleWithScore = (title: unknown, score: number) => {
  const text = typeof title === "string" ? title : "";
  const baseTitle = stripTitleScore(text);
  return `${baseTitle}（${score}分）`;
};

const stripTitleScore = (title: unknown) => {
  const text = typeof title === "string" ? title : "";
  // 去掉所有位置的分值括号（全角和半角），保留其他内容
  return text.replace(/[（(]\s*-?\d+(?:\.\d+)?\s*分\s*[）)]/g, "").trim();
};

const sumFillBlankScore = (question: any): number => {
  if (!question || typeof question !== "object") return 0;
  if (Array.isArray(question.childs) && question.childs.length > 0) {
    return question.childs.reduce((sum: number, child: any) => sum + sumFillBlankScore(child), 0);
  }
  if (Array.isArray(question.block) && question.block.length > 0) {
    return question.block.reduce(
      (sum: number, block: any) => sum + normalizeScore(block?.score),
      0,
    );
  }
  return normalizeScore(question.score);
};

const sumBriefScore = (question: any): number => {
  if (!question || typeof question !== "object") return 0;
  if (Array.isArray(question.childs) && question.childs.length > 0) {
    return question.childs.reduce((sum: number, child: any) => sum + sumBriefScore(child), 0);
  }
  if (Array.isArray(question.block) && question.block.length > 0) {
    return question.block.reduce(
      (sum: number, block: any) => sum + normalizeScore(block?.score),
      0,
    );
  }
  return normalizeScore(question.score);
};

const sumWithQuestionDetailScore = (question: any): number => {
  if (!question || typeof question !== "object") return 0;
  const children = Array.isArray(question.children) ? question.children : [];
  if (children.length === 0) {
    return normalizeScore(
      question.score ?? question.blockScore ?? question?.resQuestionContentVo?.score,
    );
  }
  return children.reduce((sum: number, child: any) => sum + sumWithQuestionDetailScore(child), 0);
};

const countWithQuestionDetailLeafQuestion = (question: any): number => {
  if (!question || typeof question !== "object") return 0;
  const children = Array.isArray(question.children) ? question.children : [];
  if (children.length === 0) return 1;
  return children.reduce(
    (sum: number, child: any) => sum + countWithQuestionDetailLeafQuestion(child),
    0,
  );
};

const getWithQuestionDetailGroupKey = (item: any, index: number) => {
  const bigQuestionNumber =
    item?.model?.item?.bigQuestionNumber ??
    item?.model?.bigQuestionNumber ??
    item?.props?.bigQuestionNumber ??
    "";
  const baseTitle = stripTitleScore(
    item?.model?.title ?? item?.model?.type ?? `第${index + 1}大题`,
  );
  return `${bigQuestionNumber}#${baseTitle}`;
};

const calcItemTotalScore = (item: any) => {
  const model = item?.model || {};
  switch (item?.type) {
    case "ChoiceQuestion":
      return (Array.isArray(model.childs) ? model.childs : []).reduce(
        (sum: number, child: any) => sum + normalizeScore(child?.score),
        0,
      );
    case "FillBlankQuestion":
      return (Array.isArray(model.childs) ? model.childs : []).reduce(
        (sum: number, child: any) => sum + sumFillBlankScore(child),
        0,
      );
    case "BriefQuestion":
      return (Array.isArray(model.childs) ? model.childs : []).reduce(
        (sum: number, child: any) => sum + sumBriefScore(child),
        0,
      );
    case "ArticleQuestion":
      return normalizeScore(model?.articleSetting?.score ?? model?.score);
    case "WithQustionDetail":
      return sumWithQuestionDetailScore(model?.item);
    default:
      return normalizeScore(model?.totalScore);
  }
};

const getItemQuestionCount = (item: any) => {
  const model = item?.model || {};
  if (item.type === "ChoiceQuestion") return model.childs?.length || 0;
  if (item.type === "FillBlankQuestion") return model.childs?.length || 0;
  if (item.type === "BriefQuestion") return model.childs?.length || 0;
  if (item.type === "ArticleQuestion") return 1;
  if (item.type === "WithQustionDetail") {
    const root = model.item;
    if (!root) return 0;
    return countWithQuestionDetailLeafQuestion(root);
  }
  return 0;
};

// 防止 watch 写回 title 时触发自身循环
let _suppressTitleWrite = false;

const isPaginationSuffixItem = (item: any) => {
  const id = String(item?.id || "");
  return item?.isSuffix || /_sf_\d+$/.test(id);
};

const getQuestionBarList = computed(() => {
  let current = 1;
  fixedIndexs = [];
  const sourceItems = data
    .value!.filter(it => !it.isMerge)
    .filter(it => !isPaginationSuffixItem(it));
  const withQuestionDetailGroupMap = new Map<
    string,
    {
      totalScore: number;
      title: string;
    }
  >();

  sourceItems.forEach((item, index) => {
    if (item?.type !== "WithQustionDetail") return;
    const key = getWithQuestionDetailGroupKey(item, index);
    const totalScore = calcItemTotalScore(item);
    const baseTitle = stripTitleScore(
      item?.model?.title ?? item?.model?.type ?? `第${index + 1}大题`,
    );
    const group = withQuestionDetailGroupMap.get(key) ?? {
      totalScore: 0,
      title: baseTitle,
    };
    group.totalScore += totalScore;
    withQuestionDetailGroupMap.set(key, group);
  });

  withQuestionDetailGroupMap.forEach(group => {
    group.title = normalizeTitleWithScore(group.title, group.totalScore);
  });

  const useful = sourceItems
    .map((item, index) => {
      item.selftIndex = index;
      if (["TopInfoHomework", "TopInfo"].includes(item.type)) {
        fixedIndexs.push(index);
        return;
      }
      const model = item.model;
      const withQuestionDetailGroup =
        item?.type === "WithQustionDetail"
          ? withQuestionDetailGroupMap.get(getWithQuestionDetailGroupKey(item, index))
          : undefined;
      const totalScore = withQuestionDetailGroup?.totalScore ?? calcItemTotalScore(item);

      const count = getItemQuestionCount(item);
      const start = current;
      const end = current + count - 1;
      model.range = [start, end];
      model.selftIndex = index;
      model.id = item?.id || "";
      current += count;
      // 把计算结果附在返回对象上，由 watch 负责写回 model，避免 computed 内产生副作用
      return {
        ...model,
        rawOptions: item.rawOptions,
        _computedTotalScore: totalScore,
        _computedTitle:
          withQuestionDetailGroup?.title ??
          normalizeTitleWithScore(stripTitleScore(model.title), totalScore),
        _modelRef: model,
      };
    })
    .filter(Boolean);

  maxQuestionNumber.value = current - 1;
  return useful;
});

// 将计算好的 title/totalScore 写回 model，避免在 computed 内产生副作用循环
watch(
  getQuestionBarList,
  list => {
    if (_suppressTitleWrite) return;
    _suppressTitleWrite = true;
    try {
      list.forEach((item: any) => {
        if (!item?._modelRef) return;
        item._modelRef.totalScore = item._computedTotalScore;
        item._modelRef.title = item._computedTitle;
      });
    } finally {
      _suppressTitleWrite = false;
    }
  },
  { deep: false },
);

const moveQuestionPosition = (direction: "up" | "down", targetIndex: number) => {
  const list = data.value!.filter(it => !isPaginationSuffixItem(it));
  moveArrayElement(list, targetIndex, direction, 1, true, fixedIndexs);
  data.value = list;
  emitEvent("reflowPages", { reason: "sort-question", flush: true });
};

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
            AddQuestionIns.edit({
              ...(props.rawOptions || {}),
              id: props?.rawOptions?.id || props?.id,
            });
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
  emitEvent("reflowPages", { reason: "add-question", flush: true });
};

const markForRenderRefresh = (item: any) => {
  Object.defineProperty(item, "_renderKey", {
    value: `${Date.now()}_${Math.random()}`,
    enumerable: false,
    configurable: true,
  });
};

const onEditQuestion = (edited: any) => {
  if (!data.value?.length) return false;
  const rootId = String(edited?.id || "");
  if (!rootId) {
    ElMessage.warning("编辑失败，缺少题目ID");
    return false;
  }

  const old = data.value.find(it => String(it.id) === rootId && !it.isSuffix && !it._isCloneHeader);
  if (!old) {
    ElMessage.warning("编辑失败，未找到题目");
    return false;
  }

  const transformed: any = transform(edited, rootId, props.nextPage);
  if (transformed?.type === "FillBlankQuestion") {
    const oldData = old?.model?.data;
    if (oldData) {
      transformed.model.data = oldData;
    }
  }

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

  if (nextItem.type === "FillBlankQuestion" && !nextItem?.model?.data) {
    markForRenderRefresh(nextItem);
  }

  if (nextItem.props) {
    if (nextItem.props.breakPoint) delete nextItem.props.breakPoint;
    if (nextItem.props.originalHeight) delete nextItem.props.originalHeight;
  }

  let replaced = false;
  data.value = data.value
    .filter(it => {
      if (it.isHeader) return true;
      return !String(it.id).startsWith(`${rootId}_sf_`);
    })
    .map(it => {
      if (!replaced && String(it.id) === rootId && !it.isSuffix && !it._isCloneHeader) {
        replaced = true;
        return nextItem;
      }
      return it;
    });

  if (!replaced) {
    ElMessage.warning("编辑失败，题目替换未生效");
    return false;
  }

  emitEvent("reflowPages", { id: rootId });
  return true;
};

const handleCloseEditDialog =async () => {
  if (!rightSetting?.value || !("objectiveMerge" in rightSetting.value)) {
    return;
  }
  const current = !!rightSetting.value.objectiveMerge;
  rightSetting.value.objectiveMerge = !current;
  await nextTick();
  rightSetting.value.objectiveMerge = current;
};
</script>

<style lang="scss" scoped></style>
