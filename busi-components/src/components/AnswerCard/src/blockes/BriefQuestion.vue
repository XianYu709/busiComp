<template>
  <div id="fillBlankQuestion" ref="rootRef" :class="props.breakPoint.start != 0 ? 'mt-10px' : ''">
    <div class="group relative w-full">
      <div
        v-if="props.breakPoint.start == 0"
        class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex align-start z-2">
        <div>
          <el-button @click="e => $emit('delete', e)" text type="danger">删除</el-button>
        </div>
      </div>

      <div>
        <template v-if="props.breakPoint.start == 0">
          <div
            v-if="isExportMode"
            class="text-16px font-500 text-left text-black leading-30px whitespace-pre-wrap">
            {{ title || " " }}
          </div>
          <el-input
            v-else
            type="textarea"
            :autosize="{ minRows: 1 }"
            :model-value="displayTitle"
            class="no-border-input input-title"
            @focus="handleTitleFocus"
            @blur="handleTitleBlur"
            @update:model-value="handleTitleInput"></el-input>
        </template>

        <div
          v-for="(it, index) in getCurrentPageOptions"
          :key="it.__renderKey"
          :ref="el => setFillBlankRef(it.__domId, el as HTMLElement | null)"
          class="border flex relative fillBlank px-8px pt-5px"
          :id="it.__domId"
          :data-brief-visible-units="getVisibleUnitCount(it)"
          :data-brief-has-prefix="it.__isFirstSegment ? '1' : '0'"
          :data-brief-line-count="it.__lineCountForRender"
          style="border-bottom: 1px solid #000"
          :style="{
            borderTop: index == 0 ? '1px solid #000' : 'none',
            borderBottom: it.hideBottomLine ? 'none' : '',
            height: getAnswerHeightStyle(it),
          }">
          <RightBox
            :showTopLine="it.showRitghtTop"
            v-if="$route.query?.reviewMethod == '2' && it.__isFirstSegment"
            :key="`rb_${it.__renderKey}`"
            v-model="it.step"
            :totalScore="it.score || 0"
            @complete="
              v => {
                const idx = it.__globalIndex;
                const allRaw = getAllRawBlocks();
                if (allRaw[idx]) allRaw[idx].scoreBoxList = v;
              }
            " />

          <Block
            :key="`${it.__renderKey}_${rightSetting.lineType}`"
            :border="false"
            v-model="data[it.__dataKey]"
            class="mb-5px"
            :class="it.lineCount && it.lineCount > 0 ? '' : 'h-170px'"
            @mount-done="() => getInfo(it)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from "vue";
import Block from "../base/Block.vue";
import { makeResizableHeight } from "../../../../../../utils/src/makeResizableHeight";
import RightBox from "./RightBox.vue";
import { getPosition } from "../utils/getPosition";
import { waitForElementById } from "../utils/waitForElement";
import { emitEvent } from "@sjjb/utils";

type BreakPoint = { start: number; end: number };

type OptionBlock = {
  id?: string;
  prefix?: string | number;
  copyIndex?: string | number;
  lineCount?: number;
  answerHeight?: number;
  hideBottomLine?: boolean;
  showRitghtTop?: boolean;
  step?: any;
  score?: number;
  scoreBoxList?: any;
  __globalIndex: number;
  displayPrefix?: string | number;
};

type OptionRenderBlock = OptionBlock & {
  __renderKey: string;
  __dataKey: string;
  __domId: string;
  __isFirstSegment: boolean;
  __lineStart: number;
  __lineEnd: number;
  __lineCountForRender: number;
};

const props = defineProps({
  breakPoint: {
    type: Object,
    default: () =>
      ({
        start: 0,
        end: 1,
      }) as BreakPoint,
  },
});
const emits = defineEmits(["delete", "end"]);
const rootRef = ref<HTMLElement | null>(null);
const fillBlankRefs = new Map<string, HTMLElement>();
const resizeControllers = new Map<
  string,
  { element: HTMLElement; controller: ReturnType<typeof makeResizableHeight> }
>();

onMounted(() => {
  void (async () => {
    await nextTick();
    await syncResizableBlocks();
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    emits("end");
  })();
});

onBeforeUnmount(() => {
  fillBlankRefs.clear();
  resizeControllers.forEach(({ controller }) => controller.destroy());
  resizeControllers.clear();
});

type BriefQuestionData = Record<string, string>;

const title = defineModel<any>("title");
const data = defineModel<BriefQuestionData>("data", { default: () => ({}) });
const childs = defineModel<any[]>("childs", { default: () => [] });
const generatedContentMap = ref<Record<string, string>>({});

const normalizeDataModel = () => {
  if (Array.isArray(data.value)) {
    data.value = Object.assign({}, data.value) as BriefQuestionData;
    return data.value;
  }

  if (!data.value || typeof data.value !== "object") {
    data.value = {};
  }

  return data.value as BriefQuestionData;
};

const stripTrailingScore = (value: unknown) => {
  if (typeof value !== "string") return value;
  return value.replace(/[（(]\s*-?\d+(?:\.\d+)?\s*分\s*[）)]/g, "").trim();
};

const isFocused = ref(false);
const displayTitle = ref(String(title.value ?? ""));

const handleTitleFocus = () => {
  isFocused.value = true;
  displayTitle.value = String(stripTrailingScore(title.value) ?? "");
};

const handleTitleBlur = () => {
  isFocused.value = false;
  displayTitle.value = String(title.value ?? "");
};

const handleTitleInput = (value: string | number) => {
  const normalized = stripTrailingScore(value);
  displayTitle.value = String(normalized ?? "");
  title.value = normalized;
};

watch(
  () => title.value,
  value => {
    if (!isFocused.value) {
      displayTitle.value = String(value ?? "");
    }
  },
  { immediate: true },
);

const rightSetting = inject<any>("AnswerCardSetting");
const isExportMode = inject<any>("isExportMode");
const sortType = computed(() => rightSetting.value.sortType);
const BoxWidth = inject<any>("BoxWidth");

const attrs = useAttrs();
const PAGINATION_BOTTOM_OFFSET = 20;
const BRIEF_RESIZE_BOTTOM_GUARD = 2;
const BRIEF_RESIZE_BOTTOM_MARGIN = PAGINATION_BOTTOM_OFFSET + BRIEF_RESIZE_BOTTOM_GUARD;

const shouldPaginate = computed(() => {
  return props.breakPoint && (props.breakPoint.start > 0 || props.breakPoint.end < 1);
});

const getAllRawBlocks = (): any[] => {
  const all: any[] = [];
  (childs.value || []).forEach((item: any) => {
    const innerChilds = Array.isArray(item.childs) ? item.childs : item.block;
    if (Array.isArray(innerChilds) && innerChilds.length > 0) {
      all.push(...innerChilds);
    }
  });
  return all;
};

const getAllOptions = computed<OptionBlock[]>(() => {
  if (!childs.value || childs.value.length === 0) return [];

  const st = sortType.value;

  if (st === "bigSingle") {
    const out: OptionBlock[] = [];
    let global = 0;

    (childs.value || []).forEach((item: any, bigIndex: number) => {
      const big = bigIndex + 1;
      const blocks = Array.isArray(item.childs) ? item.childs : item.block || [];

      blocks.forEach((raw: any, innerIdx: number) => {
        const b = { ...raw } as any;

        const prefixStr = String(b.prefix ?? "").trim();
        const match = prefixStr.match(/^(.*?)\s*[\(\（](.*)[\)\）]$/);
        const displayPrefix = match ? `${big}(${match[2]})` : `${big}`;

        out.push({
          ...b,
          __globalIndex: global++,
          displayPrefix,
          hideBottomLine: innerIdx !== blocks.length - 1,
          showRitghtTop: blocks.length > 1 && innerIdx !== 0,
        });
      });
    });

    return out;
  }

  const flat: any[] = [];
  (childs.value || []).forEach((item: any) => {
    const innerChilds = Array.isArray(item.childs) ? item.childs : item.block;
    if (Array.isArray(innerChilds) && innerChilds.length > 0) {
      innerChilds.forEach((b: any) => flat.push({ ...b }));
    }
  });

  return flat.map((b, i) => {
    const basePrefix = b.copyIndex ?? b.prefix;
    return {
      ...b,
      __globalIndex: i,
      displayPrefix: basePrefix,
      hideBottomLine: !!b.hideBottomLine,
      showRitghtTop: !!b.showRitghtTop,
    };
  });
});

const getOptionSliceUnits = (it: OptionBlock) => {
  const lineCount = Math.max(0, Number(it.lineCount || 0));
  return lineCount + 1;
};

const getVisibleUnitCount = (
  it: Pick<OptionRenderBlock, "__isFirstSegment" | "__lineCountForRender">,
) => (it.__isFirstSegment ? 1 : 0) + Math.max(0, Number(it.__lineCountForRender || 0));

const isHorizontalLineMode = (it: Pick<OptionBlock, "lineCount">) =>
  Math.max(0, Number(it.lineCount || 0)) > 0;

const getUnitIndex = (ratio: number, totalUnits: number) => {
  return Math.floor(ratio * totalUnits + 1e-6 * totalUnits);
};

const getCurrentPageOptions = computed<OptionRenderBlock[]>(() => {
  const allOptions = getAllOptions.value;
  if (!allOptions || allOptions.length === 0) return [];

  const totalUnits = allOptions.reduce((sum, it) => sum + getOptionSliceUnits(it), 0);
  if (totalUnits <= 0) return [];

  let startUnit = 0;
  let endUnit = totalUnits;
  const start = Number((props.breakPoint as any).start) || 0;
  const end = Number((props.breakPoint as any).end) || 0;

  if (shouldPaginate.value) {
    startUnit = Math.min(totalUnits, Math.max(0, getUnitIndex(start, totalUnits)));
    endUnit =
      end >= 0.999 ? totalUnits : Math.min(totalUnits, Math.max(0, getUnitIndex(end, totalUnits)));
    if (endUnit <= startUnit) return [];
  }

  const pageOf = Number((attrs as any).pageOf) || 0;
  let offset = 0;
  const out: OptionRenderBlock[] = [];

  allOptions.forEach(it => {
    const units = getOptionSliceUnits(it);
    const itemStart = offset;
    const itemEnd = offset + units;
    offset = itemEnd;

    const visibleStart = Math.max(startUnit, itemStart);
    const visibleEnd = Math.min(endUnit, itemEnd);
    if (visibleEnd <= visibleStart) return;

    const localStart = visibleStart - itemStart;
    const localEnd = visibleEnd - itemStart;

    const showPrefix = localStart === 0;
    const lineStart = Math.max(0, localStart - 1);
    const lineEnd = Math.max(0, localEnd - 1);
    const lineCountForRender = Math.max(0, lineEnd - lineStart);

    if (!showPrefix && lineCountForRender <= 0) return;

    const renderKey = `${it.__globalIndex}_${localStart}_${localEnd}`;
    const dataKey = `brief_${renderKey}`;
    const domId = `${it?.id || "brief"}_${renderKey}_${pageOf}`;

    out.push({
      ...it,
      __renderKey: renderKey,
      __dataKey: dataKey,
      __domId: domId,
      __isFirstSegment: showPrefix,
      __lineStart: lineStart,
      __lineEnd: lineEnd,
      __lineCountForRender: lineCountForRender,
    });
  });

  return out;
});

const getItem = () => {
  return `<span style="
    border-bottom:1px ${rightSetting.value.lineType === "dashed" ? "dashed" : "solid"} #000;
    display:inline-block;
    margin-left:7px;
    height:30px;
    width:${BoxWidth.value - 80}px;
  "> </span><br/>`;
};

const setFillBlankRef = (id: string, el: HTMLElement | null) => {
  if (!el) {
    fillBlankRefs.delete(id);
    return;
  }
  fillBlankRefs.set(id, el);
};

const getAnswerHeightStyle = (it: Pick<OptionBlock, "lineCount" | "answerHeight">) => {
  if (isHorizontalLineMode(it)) return undefined;

  const height = Number(it.answerHeight || 0);
  if (!Number.isFinite(height) || height <= 0) return undefined;

  return `${Math.round(height)}px`;
};

const generator = async (_el: any, it: OptionRenderBlock) => {
  await nextTick();
  const dataModel = normalizeDataModel();

  const prefix = it.displayPrefix ?? it.prefix ?? "";
  const head = it.__isFirstSegment ? String(prefix) + "<br/>" : "";
  const body = getItem().repeat(it.__lineCountForRender);
  const nextContent = head + body;
  const currentContent = dataModel[it.__dataKey];
  const previousGenerated = generatedContentMap.value[it.__dataKey];

  if (
    currentContent === undefined ||
    currentContent === "" ||
    currentContent === previousGenerated
  ) {
    dataModel[it.__dataKey] = nextContent;
  }

  generatedContentMap.value[it.__dataKey] = nextContent;
};

const getRawByGlobalIndex = (globalIndex: number) => {
  const allRaw = getAllRawBlocks();
  return allRaw[globalIndex] || null;
};

const updateAnswerHeight = (it: OptionRenderBlock, height: number) => {
  const nextHeight = Math.max(0, Math.round(height || 0));
  if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;

  const raw = getRawByGlobalIndex(it.__globalIndex);
  if (raw) {
    raw.answerHeight = nextHeight;
  }

  (it as any).answerHeight = nextHeight;
};

const buildInfoKey = (it: any) => {
  const pageOf = Number(it?.pageOf || 0);
  return `${pageOf}`;
};

const mergeInfoList = (oldList: any[], nextPos: any) => {
  const list = Array.isArray(oldList) ? [...oldList, nextPos] : [nextPos];
  const map = new Map<string, any>();
  list.forEach(pos => {
    map.set(buildInfoKey(pos), pos);
  });
  return Array.from(map.values()).sort((a: any, b: any) => {
    const p = Number(a?.pageOf || 0) - Number(b?.pageOf || 0);
    if (p !== 0) return p;
    return Number(a?.y0 || 0) - Number(b?.y0 || 0);
  });
};

const collectOptionInfo = async (it: OptionRenderBlock) => {
  const el = await waitForElementById(it.__domId);
  if (!el) return;

  await nextTick();
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 100));

  const rect = await getPosition(attrs.pageBox as any, el as any, "none");
  const position = Object.freeze({
    ...rect.percentage,
    pageOf: Number((attrs as any).pageOf) + 1,
  });
  const infoList = [position];

  const raw = getRawByGlobalIndex(it.__globalIndex);
  if (raw) {
    raw.infoList = mergeInfoList(raw.infoList, position);
  }

  (it as any).infoList = infoList;
};

const getInfo = async (target?: OptionRenderBlock) => {
  const options = target ? [target] : getCurrentPageOptions.value;
  for (const it of options) {
    await collectOptionInfo(it);
  }
};

const regenerateAll = () => {
  const currentOptions = getCurrentPageOptions.value;
  currentOptions.forEach(it => {
    generator(null, it);
  });
};

const syncResizableBlocks = async () => {
  await nextTick();

  const root = rootRef.value;
  if (!root) return;

  const currentIds = new Set<string>();
  getCurrentPageOptions.value.forEach(it => {
    const currentEl = fillBlankRefs.get(it.__domId);
    if (!currentEl || !root.contains(currentEl)) return;
    currentIds.add(it.__domId);

    if (isHorizontalLineMode(it)) {
      resizeControllers.get(it.__domId)?.controller.destroy();
      resizeControllers.delete(it.__domId);
      return;
    }

    const existing = resizeControllers.get(it.__domId);
    if (existing && existing.element === currentEl && currentEl.querySelector(".resize-handle")) {
      return;
    }

    existing?.controller.destroy();

    const controller = makeResizableHeight(currentEl, {
      getMaxHeight: () => {
        const contentArea = currentEl.closest('[id^="page_content_"]');
        if (!contentArea) return Infinity;

        const contentRect = contentArea.getBoundingClientRect();
        const elRect = currentEl.getBoundingClientRect();
        return contentRect.bottom - elRect.top - BRIEF_RESIZE_BOTTOM_MARGIN;
      },
      onResizeEnd: ({ changed, height }) => {
        if (!changed || isExportMode?.value) return;
        updateAnswerHeight(it, height);
        emitEvent("reflowPages", { reason: "brief-resize", flush: true });
      },
    });

    resizeControllers.set(it.__domId, {
      element: currentEl,
      controller,
    });
  });

  Array.from(resizeControllers.keys()).forEach(id => {
    if (currentIds.has(id)) return;
    resizeControllers.get(id)?.controller.destroy();
    resizeControllers.delete(id);
  });
};

watch(
  () =>
    getCurrentPageOptions.value
      .map(it => `${it.__domId}:${isHorizontalLineMode(it) ? "line" : "free"}`)
      .join("|"),
  () => {
    void syncResizableBlocks();
  },
  { immediate: true, flush: "post" },
);

watch(
  [
    () => rightSetting.value.lineType,
    () => getCurrentPageOptions.value,
    () => props.breakPoint,
    () => childs.value,
  ],
  () => regenerateAll(),
  { immediate: true, deep: true },
);

watch(
  () => data.value,
  () => {
    normalizeDataModel();
  },
  { immediate: true },
);

defineExpose({
  getInfo,
});
</script>

<style lang="scss" scoped>
.box {
  border: 1px solid black;
  margin-bottom: 10px;
  box-sizing: border-box;
  padding: 10px;
}

.border {
  border: 1px solid black;
  box-sizing: border-box;
}

.border-r {
  border-right: 1px solid black;
  box-sizing: border-box;
}

/* 去掉边框、阴影、背景 */
.no-border-input :deep(.el-textarea__inner) {
  box-shadow: none !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  margin: 0;
  padding: 0;
  resize: none;
}

/* 聚焦时也不出现边框高亮 */
.no-border-input :deep(.el-textarea__inner:focus) {
  border: 1px solid blue !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* 标题样式 */
.input-title :deep(.el-textarea__inner) {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  text-align: left;
}

/* 占位文字也变成黑色半透明 */
.no-border-input :deep(.el-textarea__inner::placeholder) {
  color: rgba(0, 0, 0, 0.4);
}
</style>
