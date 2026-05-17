<template>
  <div class="px-20px -mb-15px">
    <ScoreSet :data="scoreList" />
  </div>
</template>

<script lang="tsx" setup>
import { computed, inject, watch } from "vue";
import ScoreSet from "./scoreSet.vue";

const props = withDefaults(
  defineProps<{
    sourceData?: any[];
  }>(),
  {
    sourceData: () => [],
  },
);

const data = defineModel<any>("data", { default: () => ({}) });
const rightSetting = inject<any>("AnswerCardSetting", null);
const sortType = computed(() => rightSetting?.value?.sortType ?? "smallFollow");

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

let _suppressTitleWrite = false;

//题目分值
type QuestionScore = {
  id: string | number;
  label: string | number;
  score: number;
  unit?: string;
  raw: Record<string, any>;
  syncTargets?: Record<string, any>[];
};

type ExtractContext = {
  globalStart: number;
};

type ScoreGroup = {
  id: string | number;
  title: string;
  bigQuestionNumber?: string | number;
  childs: Array<{
    id: string | number;
    prefix: string | number;
    score: number;
    unit?: string;
    raw: Record<string, any>;
    syncTargets?: Record<string, any>[];
  }>;
  totalScore: number;
};

const mergeScoreGroupsByBigQuestionNumber = (groups: ScoreGroup[]): ScoreGroup[] => {
  const merged: ScoreGroup[] = [];
  const numberMap = new Map<string, ScoreGroup>();

  groups.forEach(group => {
    if (group.bigQuestionNumber === undefined || group.bigQuestionNumber === null) {
      merged.push(group);
      return;
    }

    const mergeKey = String(group.bigQuestionNumber);
    const target = numberMap.get(mergeKey);
    if (!target) {
      numberMap.set(mergeKey, group);
      merged.push(group);
      return;
    }

    target.childs.push(...group.childs);
    target.totalScore += group.totalScore;
  });

  return merged;
};

const getGroupTitle = (item: any, index: number) => {
  if (item?.model?.title) return item.model.title;
  if (item?.model?.type) return item.model.type;
  if (item?.rawOptions?.questionName) return item.rawOptions.questionName;
  return `第${index + 1}大题`;
};

const getBigQuestionNumber = (item: any) => {
  return (
    item?.model?.item?.bigQuestionNumber ??
    item?.model?.bigQuestionNumber ??
    item?.props?.bigQuestionNumber ??
    item?.rawOptions?.bigQuestionNumber
  );
};

const normalizeScore = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeDetailScore = (question: any) => {
  return normalizeScore(
    question?.score ?? question?.blockScore ?? question?.resQuestionContentVo?.score,
  );
};

const normalizePrefix = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value).trim();
};

const resolveSmallFollowLabel = (question: any, fallback: string | number) => {
  const normalizedPrefix = normalizePrefix(
    question?.copyIndex ?? question?.prefix ?? question?.sort ?? question?.displayPrefix,
  );
  return normalizedPrefix || fallback;
};

const resolveBigSingleLabel = (question: any, fallback: string | number) => {
  const normalizedPrefix = normalizePrefix(
    question?.bigSinglePrefix ?? question?.selftIndex ?? question?.displayPrefix,
  );
  return normalizedPrefix || fallback;
};

const getSequentialFallbackLabel = (start: number | undefined, index: number) => {
  if (typeof start === "number" && Number.isFinite(start)) {
    return start + index;
  }
  return index + 1;
};

const resolveQuestionLabel = (question: any, fallback: string | number) => {
  return sortType.value === "bigSingle"
    ? resolveBigSingleLabel(question, fallback)
    : resolveSmallFollowLabel(question, fallback);
};

const getRangeStart = (item: any, ctx?: ExtractContext) => {
  const explicitRangeStart = Number(item?.model?.range?.[0]);
  if (Number.isFinite(explicitRangeStart)) {
    return explicitRangeStart;
  }

  return typeof ctx?.globalStart === "number" && Number.isFinite(ctx.globalStart)
    ? ctx.globalStart
    : undefined;
};

const normalizeSourceItems = (source: any[]) =>
  source
    .filter(it => !it?.isMerge)
    .filter(it => !it?.isSuffix)
    .filter(it => !it?.isHeader);

const useExternalScoreSource = computed(
  () => Array.isArray(props.sourceData) && props.sourceData.length > 0,
);

const sourceItems = computed(() => {
  const source = useExternalScoreSource.value ? props.sourceData : data.value;
  return Array.isArray(source) ? normalizeSourceItems(source) : [];
});

const currentDataItems = computed(() => {
  const current = Array.isArray(data.value) ? data.value : [];
  return normalizeSourceItems(current);
});

const buildQuestionSyncKey = (question: any, fallbackLabel?: string | number) => {
  const raw =
    question && typeof question === "object" && question.raw && typeof question.raw === "object"
      ? question.raw
      : question;

  const questionScoreRuleId = raw?.questionScoreRuleId;
  if (
    questionScoreRuleId !== undefined &&
    questionScoreRuleId !== null &&
    questionScoreRuleId !== ""
  ) {
    return `rule:${String(questionScoreRuleId)}`;
  }

  const questionId = raw?.id ?? raw?.questionId;
  if (questionId !== undefined && questionId !== null && questionId !== "") {
    return `id:${String(questionId)}`;
  }

  const prefix = normalizePrefix(raw?.prefix ?? raw?.sort ?? fallbackLabel);
  const typeName = String(raw?.questionTypeName ?? raw?.questionTypeLabel ?? raw?.type ?? "");
  return `fallback:${typeName}:${prefix}`;
};

const registerSyncTargets = (
  map: Map<string, Record<string, any>[]>,
  candidates: any[],
  targets: Record<string, any>[],
  fallbackLabel?: string | number,
) => {
  const validTargets = targets.filter(target => target && typeof target === "object");
  if (!validTargets.length) return;

  candidates
    .filter(candidate => candidate && typeof candidate === "object")
    .forEach(candidate => {
      const key = buildQuestionSyncKey(candidate, fallbackLabel);
      const existedTargets = map.get(key) ?? [];
      validTargets.forEach(target => {
        if (!existedTargets.includes(target)) {
          existedTargets.push(target);
        }
      });
      map.set(key, existedTargets);
    });
};

const currentQuestionSyncTargetMap = computed(() => {
  const map = new Map<string, Record<string, any>[]>();

  currentDataItems.value.forEach((item: any) => {
    if (!item || !item.type) return;

    if (item.type === "ChoiceQuestion") {
      const children = Array.isArray(item?.model?.childs) ? item.model.childs : [];
      children.forEach((child: any, index: number) => {
        registerSyncTargets(map, [child], [child], child?.prefix ?? child?.sort ?? index + 1);
      });
      return;
    }

    if (item.type === "FillBlankQuestion" || item.type === "BriefQuestion") {
      const children = item?.model?.childs ?? item?.props?.childs;
      (Array.isArray(children) ? children : []).forEach((child: any, index: number) => {
        registerSyncTargets(
          map,
          [child, ...(Array.isArray(child?.block) ? child.block : [])],
          [child],
          child?.prefix ?? child?.sort ?? index + 1,
        );
      });
      return;
    }

    if (item.type === "ArticleQuestion") {
      const articleChild = Array.isArray(item?.model?.childs) ? item.model.childs[0] : undefined;
      const articleSetting = item?.model?.articleSetting;
      registerSyncTargets(
        map,
        [
          articleChild,
          articleSetting,
          {
            id: item?.id,
            questionId: articleChild?.questionId ?? item?.id,
            prefix: articleChild?.prefix ?? item?.model?.title,
            questionTypeName: item?.model?.questionName ?? item?.model?.title,
            questionScoreRuleId:
              articleChild?.questionScoreRuleId ?? articleSetting?.questionScoreRuleId,
          },
        ],
        [item?.model, articleSetting, articleChild].filter(Boolean),
        articleChild?.prefix ?? item?.model?.title,
      );
    }
  });

  return map;
});

const resolveQuestionSyncTargets = (question: QuestionScore) => {
  if (!useExternalScoreSource.value) return [];
  return (
    currentQuestionSyncTargetMap.value.get(buildQuestionSyncKey(question.raw, question.label)) ?? []
  );
};

const buildWithQuestionDetailLabel = (root: any, current: any, fallback: number) => {
  const rootPrefix =
    sortType.value === "bigSingle"
      ? normalizePrefix(root?.bigSinglePrefix ?? root?.selftIndex ?? root?.displayPrefix)
      : normalizePrefix(root?.copyIndex ?? root?.prefix ?? root?.sort ?? root?.displayPrefix);
  const currentPrefix =
    sortType.value === "bigSingle"
      ? normalizePrefix(current?.bigSinglePrefix ?? current?.selftIndex ?? current?.displayPrefix)
      : normalizePrefix(
          current?.copyIndex ?? current?.prefix ?? current?.sort ?? current?.displayPrefix,
        );

  if (current === root) return currentPrefix || rootPrefix || fallback;
  if (!rootPrefix) return currentPrefix || fallback;
  if (!currentPrefix) return rootPrefix;
  if (currentPrefix.startsWith(rootPrefix)) return currentPrefix;
  if (/^[\(（].*[\)）]$/.test(currentPrefix)) return `${rootPrefix}${currentPrefix}`;
  return `${rootPrefix}(${currentPrefix})`;
};

const extractWithQuestionDetail = (item: any, ctx?: ExtractContext): QuestionScore[] => {
  const current = item?.model?.item;
  if (!current) return [];

  const questions: QuestionScore[] = [];

  const walk = (question: any) => {
    if (!question || typeof question !== "object") return;

    const children = Array.isArray(question.children) ? question.children.filter(Boolean) : [];
    if (children.length === 0) {
      const index = questions.length;
      const fallback = sortType.value === "bigSingle" ? index + 1 : (ctx?.globalStart ?? 1) + index;
      questions.push({
        id: question.id ?? `${item.id || "detail"}-${fallback}`,
        label: buildWithQuestionDetailLabel(current, question, fallback),
        score: normalizeDetailScore(question),
        unit: question.unit ?? current.unit ?? "分",
        raw: question,
      });
      return;
    }

    children.forEach(child => walk(child));
  };

  walk(current);
  return questions;
};

const extractSimpleChilds = (
  children: any[] | undefined,
  fallbackPrefix: string | number = "",
  rangeStart?: number,
): QuestionScore[] => {
  const source: any[] = Array.isArray(children) ? children : [];
  return source.map((child: any, index: number) => {
    const fallbackLabel =
      sortType.value === "bigSingle" ? index + 1 : getSequentialFallbackLabel(rangeStart, index);
    const fallbackIdSuffix = typeof fallbackLabel === "number" ? fallbackLabel : index;
    return {
      id: child.id ?? `${fallbackPrefix || "child"}-${fallbackIdSuffix}`,
      label: resolveQuestionLabel(child, fallbackLabel),
      score: normalizeScore(child.score ?? child.blockScore),
      unit: child.unit ?? "分",
      raw: child,
    };
  });
};

const extractChoiceQuestion = (item: any, ctx?: ExtractContext): QuestionScore[] => {
  const source: any[] = Array.isArray(item?.model?.childs) ? item.model.childs : [];
  const rangeStart = getRangeStart(item, ctx);

  return source.map((child: any, index: number) => {
    const fallbackLabel =
      sortType.value === "bigSingle" ? index + 1 : getSequentialFallbackLabel(rangeStart, index);
    const fallbackIdSuffix = typeof fallbackLabel === "number" ? fallbackLabel : index;
    return {
      id: child.id ?? `${item?.id || "choice"}-${fallbackIdSuffix}`,
      label: resolveQuestionLabel(child, fallbackLabel),
      score: normalizeScore(child.score ?? child.blockScore),
      unit: child.unit ?? "分",
      raw: child,
    };
  });
};

const extractFillBlankOrBrief = (item: any, ctx?: ExtractContext): QuestionScore[] => {
  const childSource = item?.model?.childs ?? item?.props?.childs;
  const rangeStart = getRangeStart(item, ctx);
  return extractSimpleChilds(childSource, item?.id, rangeStart);
};

const extractArticleQuestion = (item: any, ctx?: ExtractContext): QuestionScore[] => {
  const baseScore = normalizeScore(item?.rawOptions?.score ?? item?.model?.score);
  return [
    {
      id: item?.id ?? `${item?.model?.title || "article"}-${ctx?.globalStart || 0}`,
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
  if (item.type === "WithQustionDetail") return extractWithQuestionDetail(item).length;
  if (item.type === "ArticleQuestion") return 1;
  return 0;
};

const scoreList = computed<ScoreGroup[]>(() => {
  const groups: ScoreGroup[] = [];
  const groupMap = new Map<string, ScoreGroup>();
  let globalStart = 1;

  // 收集需要写回的 title/totalScore，避免在 computed 内直接修改响应式数据
  const pendingWrites: Array<{ model: any; totalScore: number; title: string }> = [];

  sourceItems.value.forEach((item, index) => {
    if (!item || !item.type) return;

    const extractor = questionExtractors[item.type as keyof typeof questionExtractors];
    if (!extractor) return;

    const questionCount = getQuestionCount(item);
    const context: ExtractContext = { globalStart };
    const groupTitle = stripTitleScore(getGroupTitle(item, index));
    const questions = extractor(item, context);
    const itemTotalScore = questions.reduce(
      (sum, question) => sum + normalizeScore(question.score),
      0,
    );
    if (!useExternalScoreSource.value && item?.model && typeof item.model === "object") {
      if (item.type !== "WithQustionDetail") {
        pendingWrites.push({
          model: item.model,
          totalScore: itemTotalScore,
          title: normalizeTitleWithScore(groupTitle, itemTotalScore),
        });
      }
    }
    if (!questions.length) return;

    const isOneProb = item?.model?.item?.isOneProb ?? item?.model?.isOneProb ?? item?.isOneProb;
    const key = isOneProb == 2 ? `Z${groupTitle}-${item.type}` : `${groupTitle}-${item.type}`;
    let group = groupMap.get(key);
    if (!group) {
      group = {
        id: item.id ?? key,
        bigQuestionNumber: getBigQuestionNumber(item),
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
        syncTargets: resolveQuestionSyncTargets(question),
      });
      group!.totalScore += question.score;
    });

    globalStart += questionCount || questions.length;
  });

  const mergedGroups = mergeScoreGroupsByBigQuestionNumber(groups).map(group => ({
    ...group,
    title: normalizeTitleWithScore(group.title, group.totalScore),
  }));

  const detailGroupMap = new Map<string, ScoreGroup>();
  mergedGroups.forEach(group => {
    if (group.bigQuestionNumber !== undefined && group.bigQuestionNumber !== null) {
      detailGroupMap.set(String(group.bigQuestionNumber), group);
    }
  });

  if (!useExternalScoreSource.value) {
    sourceItems.value.forEach((item, index) => {
      if (item?.type !== "WithQustionDetail") return;
      if (!item?.model || typeof item.model !== "object") return;

      const bigQuestionNumber = getBigQuestionNumber(item);
      const mergedGroup =
        bigQuestionNumber === undefined || bigQuestionNumber === null
          ? undefined
          : detailGroupMap.get(String(bigQuestionNumber));

      if (mergedGroup) {
        pendingWrites.push({
          model: item.model,
          totalScore: mergedGroup.totalScore,
          title: mergedGroup.title,
        });
        return;
      }

      pendingWrites.push({
        model: item.model,
        totalScore: item.model.totalScore ?? 0,
        title: normalizeTitleWithScore(
          stripTitleScore(getGroupTitle(item, index)),
          item.model.totalScore ?? 0,
        ),
      });
    });
  }

  // 把 pendingWrites 挂在返回值上，由 watch 负责写回
  (mergedGroups as any)._pendingWrites = pendingWrites;
  return mergedGroups;
});

// 将计算好的 title/totalScore 写回 model，避免在 computed 内产生副作用循环
watch(
  scoreList,
  list => {
    if (_suppressTitleWrite) return;
    _suppressTitleWrite = true;
    try {
      const writes = (list as any)._pendingWrites;
      if (!Array.isArray(writes)) return;
      writes.forEach(({ model, totalScore, title }) => {
        model.totalScore = totalScore;
        model.title = title;
      });
    } finally {
      _suppressTitleWrite = false;
    }
  },
  { deep: false },
);
</script>

<style scoped></style>
