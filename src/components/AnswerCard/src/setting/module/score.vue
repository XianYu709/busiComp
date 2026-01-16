<template>
  <div class="px-20px -mb-15px">
    <ScoreSet :data="scoreList" />
  </div>
</template>

<script lang="tsx" setup>
import { computed } from "vue";
import ScoreSet from "./scoreSet.vue";

const data = defineModel<any>("data", { default: () => ({}) });

const scoreList = computed<ScoreGroup[]>(() => {
  const groups: ScoreGroup[] = [];
  const groupMap = new Map<string, ScoreGroup>();
  let globalStart = 1;

  const sourceItems = (data.value || [])
    .filter(it => !it.isMerge)
    .filter(it => !it.isSuffix)
    .filter(it => !it.isHeader);

  sourceItems.forEach((item, index) => {
    if (!item || !item.type) return;

    const extractor = questionExtractors[item.type as keyof typeof questionExtractors];
    if (!extractor) return;

    const questionCount = getQuestionCount(item);
    const context: ExtractContext = { globalStart };
    const groupTitle = getGroupTitle(item, index);
    const questions = extractor(item, context);
    if (!questions.length) return;

    const key = item.isOneProb == 2 ? `Z${groupTitle}-${item.type}` : `${groupTitle}-${item.type}`;
    let group = groupMap.get(key);
    if (!group) {
      group = {
        id: item.id ?? key,
        title: groupTitle,
        childs: [],
        totalScore: 0,
      };
      groupMap.set(key, group);
      groups.push(group);
    }

    questions.forEach(question => {
      group!.childs.push({
        id: question.id,
        prefix: question.label,
        score: question.score,
        unit: question.unit ?? "分",
        raw: question.raw,
      });
      group!.totalScore += question.score;
    });

    globalStart += questionCount || questions.length;
  });

  return groups;
});
//题目分值
type QuestionScore = {
  id: string | number;
  label: string | number;
  score: number;
  unit?: string;
  raw: Record<string, any>;
};

type ExtractContext = {
  globalStart: number;
};

type ScoreGroup = {
  id: string | number;
  title: string;
  childs: Array<{
    id: string | number;
    prefix: string | number;
    score: number;
    unit?: string;
    raw: Record<string, any>;
  }>;
  totalScore: number;
};

const getGroupTitle = (item: any, index: number) => {
  if (item?.model?.title) return item.model.title;
  if (item?.model?.type) return item.model.type;
  if (item?.rawOptions?.questionName) return item.rawOptions.questionName;
  return `第${index + 1}大题`;
};

const normalizeScore = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const extractWithQuestionDetail = (item: any, ctx?: ExtractContext): QuestionScore[] => {
  const current = item?.model?.item;
  if (!current) return [];

  const children =
    Array.isArray(current.children) && current.children.length ? current.children : [current];

  return children.map((child, index) => {
    const fallback = ctx?.globalStart ? ctx.globalStart + index : index + 1;
    const label =
      child.prefix ||
      `${current.prefix}${child.selftIndex ? `(${child.selftIndex})` : ""}` ||
      fallback;
    return {
      id: child.id ?? `${item.id || "detail"}-${index}`,
      label,
      score: normalizeScore(child.score ?? current.score),
      unit: child.unit ?? "分",
      raw: child,
    };
  });
};

const extractSimpleChilds = (
  children: any[] | undefined,
  fallbackPrefix: string | number = "",
): QuestionScore[] => {
  const source: any[] = Array.isArray(children) ? children : [];
  return source.map((child: any, index: number) => ({
    id: child.id ?? `${fallbackPrefix || "child"}-${index}`,
    label: child.prefix ?? child.sort ?? index + 1,
    score: normalizeScore(child.score ?? child.blockScore),
    unit: child.unit ?? "分",
    raw: child,
  }));
};

const extractChoiceQuestion = (item: any, ctx?: ExtractContext): QuestionScore[] => {
  const source: any[] = Array.isArray(item?.model?.childs) ? item.model.childs : [];
  const rangeStart = ctx?.globalStart ?? Number(item?.model?.range?.[0]);
  const hasRange = Number.isFinite(rangeStart);

  return source.map((child: any, index: number) => ({
    id: child.id ?? `${item?.id || "choice"}-${index}`,
    label: hasRange ? rangeStart + index : (child.prefix ?? child.sort ?? index + 1),
    score: normalizeScore(child.score ?? child.blockScore),
    unit: child.unit ?? "分",
    raw: child,
  }));
};

const extractFillBlankOrBrief = (item: any, ctx?: ExtractContext): QuestionScore[] => {
  const childSource = item?.model?.childs ?? item?.props?.childs;
  const rangeStart = ctx?.globalStart ?? Number(item?.model?.range?.[0]);
  const hasRange = Number.isFinite(rangeStart);
  return extractSimpleChilds(childSource, item?.id).map((question, index) => ({
    ...question,
    label: hasRange ? rangeStart + index : question.label,
  }));
};

const extractArticleQuestion = (item: any, _ctx?: ExtractContext): QuestionScore[] => {
  const baseScore = normalizeScore(item?.rawOptions?.score ?? item?.model?.score);
  return [
    {
      id: item?.id ?? `${item?.model?.title || "article"}`,
      label: item?.model?.title || "作文",
      score: baseScore,
      unit: "分",
      raw: item,
    },
  ];
};

const questionExtractors: Record<string, (item: any, ctx?: ExtractContext) => QuestionScore[]> = {
  WithQustionDetail: extractWithQuestionDetail,
  ChoiceQuestion: extractChoiceQuestion,
  FillBlankQuestion: extractFillBlankOrBrief,
  BriefQuestion: extractFillBlankOrBrief,
  ArticleQuestion: extractArticleQuestion,
};

const getQuestionCount = (item: any): number => {
  if (!item) return 0;
  if (item.type === "ChoiceQuestion") return item?.model?.childs?.length || 0;
  if (["FillBlankQuestion", "BriefQuestion"].includes(item.type))
    return item?.props?.childs?.length || item?.model?.childs?.length || 0;
  if (item.type === "WithQustionDetail") {
    const current = item?.model?.item;
    if (!current) return 0;
    const children =
      Array.isArray(current.children) && current.children.length ? current.children : [current];
    return children.length;
  }
  if (item.type === "ArticleQuestion") return 1;
  return 0;
};
</script>

<style scoped></style>
