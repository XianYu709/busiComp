<template>
  <div class="w-full h-full flex flex-col items-center relative">
    <div
      v-if="reflowMaskVisible"
      class="absolute inset-0 z-20 flex items-center justify-center bg-white/65">
      <div
        v-if="reflowPageLoading"
        class="flex items-center gap-10px rounded-8px bg-white px-14px py-10px text-13px text-[#606266] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <div
          class="h-16px w-16px rounded-full border-2 border-[#dcdfe6] border-t-[#409eff] animate-spin"></div>
        <span>重排中...</span>
      </div>
    </div>
    <div
      v-for="(page, pageIndex) in groups"
      class="bg-[#fff] px-10px py-10px page"
      :style="getStyle"
      :ref="el => fullPageRefsManager.setRef(el, pageIndex)">
      <!-- 鍗曢〉 -->
      <div
        :id="`page_${pageIndex}`"
        v-bind="{
          pageOf: pageIndex,
        }"
        class="relative h-full box-border"
        :ref="el => pageRefsManager.setRef(el, pageIndex)">
        <AnchorPoint
          v-bind="{
            paper: props.paperSize,
            page: pageIndex,
            position: 'top',
            pageSize: groups.length,
          }" />
        <!-- 鍐呭 -->
        <div
          class="px-10px mt-25px"
          :id="`page_content_${pageIndex}`"
          :style="{
            height: 'calc(100% - 70px)',
            border: rightSetting.contentBorder ? '1px solid #000' : '1px solid transparent',
          }"
          :ref="el => contentRefsManager.setRef(el, pageIndex)">
          <component
            v-for="{ item, itemIndex } in getVisiblePageEntries(page)"
            :id="`${item.model?.item?.id}_${pageIndex}_block` || `${pageIndex}_${itemIndex}_block`"
            :ref="el => itemRefsManager.setRef(el, pageIndex, itemIndex)"
            :key="getRenderKey(item)"
            :data-position-debug-name="`${item.type}:${item.id}`"
            :is="resolveComp(item.type)"
            v-bind="{
              ...item.props,
              ...genVModels(item.model),
              pageOf: pageIndex,
              isHeader: item?.isHeader == true,
              itemOf: itemIndex,
              type: item.type,
              paperSize: props.paperSize,
              qrCodePrefix: props.qrCodePrefix,
              qrCodeId: getQrCodeWithPageNumber(pageIndex),
            }"
            :pageBox="pageRefsManager.refs.value[pageIndex]"
            :onDelete="e => handleDelete(e, item.id)"
            :innerHeight="item?.info?.height"
            :isSuffix="item.isSuffix"
            @end="payload => updateItemInfo(item, itemIndex, pageIndex, payload)" />
        </div>
        <AnchorPoint
          v-bind="{
            paper: props.paperSize,
            page: pageIndex,
            position: 'bottom',
            pageSize: groups.length,
          }" />
      </div>
    </div>
    <div
      v-if="emptyCaptureSlots.length"
      aria-hidden="true"
      class="fixed top-0 pointer-events-none"
      style="left: -20000px">
      <div
        v-for="(slot, slotIndex) in emptyCaptureSlots"
        :key="slot.key"
        :ref="el => emptyPageRefsManager.setRef(el, slotIndex)">
        <EmptyBlock
          :paper-size="props.paperSize"
          :page="slot.pageIndex"
          :page-size="groups.length + emptyCaptureSlots.length"
          :content-border="rightSetting?.contentBorder === true" />
      </div>
    </div>
  </div>
</template>

<script lang="tsx" setup>
import {
  computed,
  inject,
  nextTick,
  provide,
  watch,
  onBeforeUnmount,
  toRaw,
  type CSSProperties,
  type Ref,
  ref,
} from "vue";
import { getPosition } from "./utils/getPosition.ts";
import { observeTouchBottomPlus } from "./utils/observeTouchBottom.ts";
import AnchorPoint from "./blockes/AnchorPoint.vue";
import EmptyBlock from "./blockes/EmptyBlock.vue";
import { SnowflakeIdGenerator, useEventBus } from "@sjjb/utils";
import { showPopConfirm } from "./utils/showPopConfirm.ts";
import { groupAndMergeCanvases, releaseCanvas } from "./utils/imageUtils.ts";
import {
  buildCaptureOutput,
  capturePageCanvas,
  DEFAULT_CAPTURE_FORMULA_POLICY,
  DEFAULT_CAPTURE_SCALE,
  destroyCaptureIframeRenderer,
  yieldToBrowser,
  type CaptureFormulaPolicy,
  type CapturePagesOptions,
} from "./utils/capturePage.ts";
import { destroyFormulaSvgExportSupport } from "./utils/exportFormulaSvg.ts";
import { createRefManager } from "./utils/refManager.ts";
import { autoPagination } from "./utils/pagination.ts";
import { resolveComp, type compTypes } from "./utils/questionComp.ts";

const props = withDefaults(
  defineProps<{
    repeatHeaderInterval?: number;
    paperSize?: "A4_1" | "A3_2" | "A3_3";
    qrCodePrefix?: string;
  }>(),
  {
    repeatHeaderInterval: -1,
  },
);

const contentWidthMap = {
  A4_1: 800,
  A3_2: 800,
  A3_3: 530,
};

const paperGroupSizeMap = {
  A4_1: 1,
  A3_2: 2,
  A3_3: 3,
} as const;

const EDIT_REFLOW_DELAY = 500;
const REFLOW_LOADING_DELAY = 180;
const REFLOW_MASK_MIN_DURATION = 120;
const REFLOW_LOADING_MIN_DURATION = 220;
const REFLOW_MEASURE_TOLERANCE = 2;
const PAGINATION_BOTTOM_OFFSET = 20;
const EDIT_REFLOW_REASONS = new Set(["block-edit", "title-edit", "option-layout"]);

type ReflowRequest = {
  reason: string;
  flush: boolean;
};

const reflowPageLoading = ref(false);
const reflowMaskVisible = ref(false);
let reflowLoadingTimer: ReturnType<typeof setTimeout> | null = null;
let reflowHideTimer: ReturnType<typeof setTimeout> | null = null;
let reflowMaskVisibleAt = 0;
let reflowLoadingVisibleAt = 0;

const hideReflowMask = () => {
  reflowPageLoading.value = false;
  reflowMaskVisible.value = false;
  reflowMaskVisibleAt = 0;
  reflowLoadingVisibleAt = 0;
};

const setReflowLoading = (loading: boolean) => {
  if (reflowLoadingTimer) {
    clearTimeout(reflowLoadingTimer);
    reflowLoadingTimer = null;
  }
  if (reflowHideTimer) {
    clearTimeout(reflowHideTimer);
    reflowHideTimer = null;
  }

  if (loading) {
    if (!reflowMaskVisible.value) {
      reflowMaskVisible.value = true;
      reflowMaskVisibleAt = Date.now();
    }
    reflowLoadingTimer = setTimeout(() => {
      reflowPageLoading.value = true;
      reflowLoadingVisibleAt = Date.now();
      reflowLoadingTimer = null;
    }, REFLOW_LOADING_DELAY);
  } else {
    const now = Date.now();
    const maskRemain = reflowMaskVisibleAt
      ? Math.max(0, REFLOW_MASK_MIN_DURATION - (now - reflowMaskVisibleAt))
      : 0;
    const loadingRemain =
      reflowPageLoading.value && reflowLoadingVisibleAt
        ? Math.max(0, REFLOW_LOADING_MIN_DURATION - (now - reflowLoadingVisibleAt))
        : 0;
    const hideDelay = Math.max(maskRemain, loadingRemain);

    if (hideDelay > 0) {
      reflowHideTimer = setTimeout(() => {
        hideReflowMask();
        reflowHideTimer = null;
      }, hideDelay);
      return;
    }

    hideReflowMask();
  }
};

const rightSetting = inject<any>("AnswerCardSetting");
const cardWidth = ref();
provide("BoxWidth", cardWidth);

const getStyle = computed<CSSProperties>(() => {
  const width = contentWidthMap[props.paperSize || "A4_1"];
  cardWidth.value = width;
  const height = 800 * 1.414;
  return {
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
    width: `${width}px`,
    minHeight: `${height}px`,
    maxHeight: `${height}px`,
    height: `${height}px`,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    // border: "1px solid yellow",
  };
});

export type item = {
  id: string;
  type: compTypes;
  model: Record<string, any>;
  props?: Record<string, any>;
  info: Record<string, any>;
  hideInView?: boolean; //是否在预览中隐藏
  isSuffix?: boolean; //是否是分页后缀
  isMerge?: boolean; //是否是合并后的
  pageOf: number;
  isHeader?: boolean;
  _isCloneHeader?: boolean;
  _renderKey?: string;
  needCalculate?: boolean;
};
export type modelType = item[];

const data = defineModel<modelType>("data", {
  type: Object,
  default: () => [],
});

const nextPage = defineModel<number>("nextPage", {
  type: Number,
  default: 0,
});

const paginationSettled = inject<Ref<boolean>>("paginationSettled", () => ref(true), true);

const PAGINATION_SETTLE_DELAY = 400;
let settleTimer: ReturnType<typeof setTimeout> | null = null;

const deferSettlePagination = () => {
  if (settleTimer) clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    paginationSettled.value = true;
    settleTimer = null;
  }, PAGINATION_SETTLE_DELAY);
};

watch(
  paginationSettled,
  settled => {
    if (!settled) {
      deferSettlePagination();
    }
  },
  { flush: "sync" },
);

const groups = computed(() => {
  const result: modelType[] = [];
  const map: Record<number, modelType> = {};

  data.value.forEach(item => {
    if (!map[item.pageOf]) {
      map[item.pageOf] = [];
      result.push(map[item.pageOf]);
    }
    map[item.pageOf]!.push(item);
  });

  return result;
});

watch(
  () => groups.value.length,
  len => {
    nextPage.value = len - 1 < 0 ? 0 : len - 1;
    if (!paginationSettled.value) {
      deferSettlePagination();
    }
  },
  { immediate: true },
);

watch(
  () => [props.paperSize, props.repeatHeaderInterval],
  ([paperSize, repeatHeaderInterval], [prevPaperSize, prevRepeatHeaderInterval]) => {
    if (paperSize === prevPaperSize && repeatHeaderInterval === prevRepeatHeaderInterval) return;
    paginationSettled.value = false;
    scheduleReflow({ reason: "paper-size-change", flush: true });
  },
);

watch(
  () => rightSetting.value.objectiveMerge,
  val => {
    if (val) {
      const choiceList = data.value.filter(it => it.type === "ChoiceQuestion" && !it.isMerge);
      if (choiceList.length > 1 && !data.value.some(it => it.isMerge)) {
        choiceList.forEach(it => (it.hideInView = true));
        const mergedChilds = choiceList.flatMap(it => it.model.childs);
        const firstChoice: any = choiceList[0];
        const mergedQuestion = {
          ...JSON.parse(JSON.stringify(firstChoice)),
          id: `${firstChoice.id}_merge`,
          isMerge: true,
          hideInView: false,
          model: {
            ...firstChoice.model,
            childs: mergedChilds,
          },
        };
        const insertIndex = data.value.findIndex(it => it.id === firstChoice.id);
        if (insertIndex !== -1) {
          data.value.splice(insertIndex + 1, 0, mergedQuestion);
        } else {
          data.value.push(mergedQuestion);
        }
      }
    } else {
      data.value = data.value.filter(it => !it.isMerge);
      data.value.forEach(it => {
        if (it.type === "ChoiceQuestion") {
          it.hideInView = false;
        }
      });
    }
  },
  { deep: true },
);

const genVModels = (model: Record<string, any>) => {
  const res: Record<string, any> = {};
  for (const key in model) {
    res[key] = model[key];
    res[`onUpdate:${key}`] = (val: any) => (model[key] = val);
  }
  return res;
};

const getRenderKey = (item: item) => {
  return item._renderKey ? `${item.id}_${item._renderKey}` : item.id;
};

const itemRefsManager = createRefManager<HTMLElement>();
const pageRefsManager = createRefManager<HTMLElement>();
const fullPageRefsManager = createRefManager<HTMLElement>();
const contentRefsManager = createRefManager<HTMLElement>();
const emptyPageRefsManager = createRefManager<HTMLElement>();

type VisiblePageEntry = {
  item: item;
  itemIndex: number;
};

type EmptyCaptureSlot = {
  key: string;
  pageIndex: number;
};

const getVisiblePageEntries = (page: modelType): VisiblePageEntry[] =>
  page.map((item, itemIndex) => ({ item, itemIndex })).filter(entry => !entry.item.hideInView);

const getVisiblePageEntriesByIndex = (pageIndex: number) =>
  getVisiblePageEntries(groups.value[pageIndex] || []);

const isCurrentItemElement = (
  pageIndex: number,
  index: number,
  page: HTMLElement,
  itemEl: HTMLElement,
  dataItem: item,
) => {
  return (
    page.isConnected &&
    itemEl.isConnected &&
    page.contains(itemEl) &&
    Number(dataItem.pageOf || 0) === pageIndex &&
    groups.value[pageIndex]?.[index] === dataItem
  );
};

const setListInfo = async (
  pageIndex: number,
  index: number,
  page: HTMLElement,
  itemEl: HTMLElement,
  dataItem: item,
  options: {
    skipWait?: boolean;
  } = {},
) => {
  if (!options.skipWait) {
    await waitForLayoutMeasurement();
  }
  if (!isCurrentItemElement(pageIndex, index, page, itemEl, dataItem)) return;

  const rect: any = await getPosition(page, itemEl, "none");
  if (!rect?.percentage) return;
  if (!isCurrentItemElement(pageIndex, index, page, itemEl, dataItem)) return;

  dataItem.info = [
    {
      ...rect.percentage,
      pageOf: pageIndex + 1,
    },
  ];
};

const rebuildHeaders = () => {
  if (props.repeatHeaderInterval <= 0) return;

  const header = data.value.find(it => it.isHeader === true && it._isCloneHeader !== true);
  if (!header) return;

  const interval = props.repeatHeaderInterval;

  const normalizePage = (value: unknown) => {
    const page = Number(value ?? 0);
    return Number.isFinite(page) && page >= 0 ? page : 0;
  };

  const cleanedData = data.value.filter(it => !it._isCloneHeader);
  const contentPages = Array.from(
    new Set(
      cleanedData
        .filter(it => !it.isHeader)
        .map(it => normalizePage(it.pageOf))
        .filter(page => page >= 0),
    ),
  ).sort((a, b) => a - b);

  const pagesWithHeader = new Set(
    cleanedData.filter(it => it.isHeader || it._isCloneHeader).map(it => normalizePage(it.pageOf)),
  );

  const clonedHeaders: item[] = [];
  contentPages.forEach(page => {
    if (page % interval !== 0) return;
    if (pagesWithHeader.has(page)) return;

    const cloned = JSON.parse(JSON.stringify(header));
    cloned._isCloneHeader = true;
    cloned.id = SnowflakeIdGenerator.generateId();
    cloned.pageOf = page;
    cloned.props = {
      ...(cloned.props || {}),
    };

    clonedHeaders.push(cloned);
    pagesWithHeader.add(page);
  });

  const stableOrder = new Map<string, number>();
  cleanedData.forEach((it, index) => stableOrder.set(String(it.id), index));

  const mergedData = [...cleanedData, ...clonedHeaders];
  mergedData.sort((a, b) => {
    const pageDiff = normalizePage(a.pageOf) - normalizePage(b.pageOf);
    if (pageDiff !== 0) return pageDiff;

    const aHeaderPriority = a.isHeader || a._isCloneHeader ? 0 : 1;
    const bHeaderPriority = b.isHeader || b._isCloneHeader ? 0 : 1;
    if (aHeaderPriority !== bHeaderPriority) return aHeaderPriority - bHeaderPriority;

    const aOrder = stableOrder.get(String(a.id)) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = stableOrder.get(String(b.id)) ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });

  data.value = mergedData;
};

// 浠嶇劧淇濈暀锛氶〉鏁板彉鍖栧氨灏濊瘯琛ュご
watch(
  () => groups.value.length,
  () => {
    nextTick(() => rebuildHeaders());
  },
  { immediate: true },
);

watch(
  () =>
    data.value
      .filter(it => !it.isHeader && !it._isCloneHeader)
      .map(it => `${it.id}:${Number(it.pageOf || 0)}`)
      .sort()
      .join("|"),
  () => {
    nextTick(() => rebuildHeaders());
  },
  { immediate: true },
);

let observers: any[] = [];
const updateItemInfo = (
  item: any,
  index: number,
  pageIndex: number,
  payload?: { info?: Record<string, any>[] },
) => {
  if (Array.isArray(payload?.info) && payload.info.length > 0) {
    item.info = payload.info;
  }
  if (item.needCalculate === false) return;
  nextTick(async () => {
    if (isReflowing || !data.value.includes(item) || Number(item.pageOf || 0) !== pageIndex) {
      return;
    }

    const component = itemRefsManager.getRef(pageIndex, index);
    const content = contentRefsManager.getRef(pageIndex);

    if (component?.$el && content) {
      const stop = observeTouchBottomPlus(
        content,
        component.$el,
        info => {
          if (isReflowing || !data.value.includes(item) || Number(item.pageOf || 0) !== pageIndex) {
            return;
          }

          const changed = autoPagination(data, info, item, pageIndex);
          if (changed) {
            paginationSettled.value = false;
            schedulePaginationSettle();
          }
          deferSettlePagination();
          nextTick(() => rebuildHeaders());
        },
        {
          offset: PAGINATION_BOTTOM_OFFSET,
          once: true,
        },
      );
      observers.push(stop);
    }
  });
};

const clearObservers = () => {
  observers.forEach(stop => stop && stop());
  observers = [];
};

const waitForLayoutMeasurement = async () => {
  await nextTick();
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve());
  });
};

const resolveItemElement = (target: unknown): HTMLElement | null => {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  if ((target as any).$el instanceof HTMLElement) return (target as any).$el as HTMLElement;
  return null;
};

const getOuterHeight = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const marginTop = parseFloat(style.marginTop || "0") || 0;
  const marginBottom = parseFloat(style.marginBottom || "0") || 0;
  return rect.height + marginTop + marginBottom;
};

const getTouchBottomInfo = (containerEl: HTMLElement, targetEl: HTMLElement) => {
  const containerRect = containerEl.getBoundingClientRect();
  const elementRect = targetEl.getBoundingClientRect();
  const elHeight = elementRect.height;
  const overflowPx = Math.max(
    0,
    elementRect.bottom + PAGINATION_BOTTOM_OFFSET - containerRect.bottom,
  );
  if (overflowPx <= 0) return null;

  return {
    entry: targetEl,
    touched: true,
    overflowPx,
    elHeight,
    remainPx: Math.max(0, elHeight - overflowPx),
    containerRect,
    elementRect,
  };
};

const getPageRemainingSpace = (pageIndex: number) => {
  const contentEl = contentRefsManager.getRef(pageIndex) as HTMLElement | undefined;
  if (!contentEl) return 0;

  const visibleEntries = getVisiblePageEntriesByIndex(pageIndex);
  for (let index = visibleEntries.length - 1; index >= 0; index--) {
    const itemEl = resolveItemElement(
      itemRefsManager.getRef(pageIndex, visibleEntries[index].itemIndex),
    );
    if (!itemEl) continue;

    const contentRect = contentEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();
    const style = getComputedStyle(itemEl);
    const marginBottom = parseFloat(style.marginBottom || "0") || 0;
    const usedHeight = itemRect.bottom - contentRect.top + marginBottom;
    return Math.max(0, contentRect.height - usedHeight);
  }

  return contentEl.clientHeight;
};

const getFirstMovableItemOuterHeight = (pageIndex: number) => {
  const visibleEntries = getVisiblePageEntriesByIndex(pageIndex);
  for (let index = 0; index < visibleEntries.length; index++) {
    const { item: currentItem, itemIndex } = visibleEntries[index];
    if (currentItem.isHeader || currentItem._isCloneHeader || currentItem.hideInView) continue;

    const itemEl = resolveItemElement(itemRefsManager.getRef(pageIndex, itemIndex));
    if (!itemEl) return null;

    return getOuterHeight(itemEl);
  }

  return null;
};

const hasOverflowingPage = () => {
  for (let pageIndex = 0; pageIndex < groups.value.length; pageIndex++) {
    const contentEl = contentRefsManager.getRef(pageIndex) as HTMLElement | undefined;
    if (!contentEl) continue;
    if (contentEl.scrollHeight > contentEl.clientHeight + REFLOW_MEASURE_TOLERANCE) {
      return true;
    }
  }
  return false;
};

const hasBackflowCandidate = () => {
  for (let pageIndex = 0; pageIndex < groups.value.length - 1; pageIndex++) {
    const remainingSpace = getPageRemainingSpace(pageIndex);
    if (remainingSpace <= REFLOW_MEASURE_TOLERANCE) continue;

    const nextItemOuterHeight = getFirstMovableItemOuterHeight(pageIndex + 1);
    if (nextItemOuterHeight == null) continue;

    if (nextItemOuterHeight <= remainingSpace + REFLOW_MEASURE_TOLERANCE) {
      return true;
    }
  }

  return false;
};

const needsMeasuredReflow = async () => {
  await waitForLayoutMeasurement();
  return hasOverflowingPage() || hasBackflowCandidate();
};

const settlePaginationLayout = async (
  maxPasses = Math.min(160, Math.max(40, data.value.length * 2)),
) => {
  let changedAny = false;

  for (let pass = 0; pass < maxPasses; pass++) {
    await waitForLayoutMeasurement();

    let changedThisPass = false;

    pageLoop: for (let pageIndex = 0; pageIndex < groups.value.length; pageIndex++) {
      const pageElement = pageRefsManager.getRef(pageIndex) as HTMLElement | undefined;
      const contentEl = contentRefsManager.getRef(pageIndex) as HTMLElement | undefined;
      if (!pageElement || !contentEl) continue;

      const visibleEntries = getVisiblePageEntriesByIndex(pageIndex);
      for (const { item: currentItem, itemIndex } of visibleEntries) {
        const itemElement = resolveItemElement(itemRefsManager.getRef(pageIndex, itemIndex));
        if (!itemElement) continue;
        if (!isCurrentItemElement(pageIndex, itemIndex, pageElement, itemElement, currentItem)) {
          continue;
        }

        const info = getTouchBottomInfo(contentEl, itemElement);
        if (!info) continue;

        const changed = autoPagination(data, info, currentItem, pageIndex);
        if (!changed) continue;

        changedAny = true;
        changedThisPass = true;
        paginationSettled.value = false;
        await nextTick();
        break pageLoop;
      }
    }

    if (!changedThisPass) break;

    if (pass === maxPasses - 1) {
      console.warn("AnswerCard pagination did not settle within max passes");
    }
  }

  return changedAny;
};

const settlePaginationAndHeaders = async (maxPasses = 4) => {
  for (let pass = 0; pass < maxPasses; pass++) {
    await settlePaginationLayout();
    rebuildHeaders();
    await waitForLayoutMeasurement();

    if (!hasOverflowingPage()) break;
  }
};

let isSettlingPagination = false;
let pendingPaginationSettle = false;

const schedulePaginationSettle = () => {
  if (isExportMode.value) return;

  if (isSettlingPagination) {
    pendingPaginationSettle = true;
    return;
  }

  isSettlingPagination = true;
  void (async () => {
    try {
      do {
        pendingPaginationSettle = false;
        await settlePaginationAndHeaders();
        rebuildPaginationObservers();
      } while (pendingPaginationSettle);
    } finally {
      isSettlingPagination = false;
      deferSettlePagination();
    }
  })();
};

const rebuildPaginationObservers = () => {
  clearObservers();

  pageRefsManager.refs.value.forEach((pageEl, pageIndex) => {
    const resolvedPageEl = pageEl as unknown as HTMLElement | undefined;
    const contentEl = contentRefsManager.refs.value[pageIndex] as unknown as
      | HTMLElement
      | undefined;
    if (!resolvedPageEl || !contentEl) return;

    const visibleEntries = getVisiblePageEntriesByIndex(pageIndex);
    visibleEntries.forEach(({ item: currentItem, itemIndex }) => {
      const itemElement = resolveItemElement(itemRefsManager.getRef(pageIndex, itemIndex));
      if (!itemElement) return;

      const stop = observeTouchBottomPlus(
        contentEl,
        itemElement,
        info => {
          if (
            isReflowing ||
            !data.value.includes(currentItem) ||
            Number(currentItem.pageOf || 0) !== pageIndex
          ) {
            return;
          }

          const changed = autoPagination(data, info, currentItem, pageIndex);
          if (changed) {
            paginationSettled.value = false;
            schedulePaginationSettle();
          }
          deferSettlePagination();
          nextTick(() => rebuildHeaders());
        },
        {
          offset: PAGINATION_BOTTOM_OFFSET,
          once: true,
        },
      );
      observers.push(stop);
    });
  });
};

const normalizeReflowRequest = (
  payload?: Partial<ReflowRequest> | string | null,
): ReflowRequest => {
  if (typeof payload === "string") {
    return {
      reason: payload,
      flush: false,
    };
  }

  return {
    reason: payload?.reason || "eventbus",
    flush: payload?.flush === true,
  };
};

onBeforeUnmount(() => {
  clearObservers();
  if (reflowTimer) clearTimeout(reflowTimer);
  if (reflowLoadingTimer) clearTimeout(reflowLoadingTimer);
  if (reflowHideTimer) clearTimeout(reflowHideTimer);
  if (settleTimer) clearTimeout(settleTimer);
  destroyCaptureIframeRenderer();
  destroyFormulaSvgExportSupport();
});

let reflowTimer: ReturnType<typeof setTimeout> | null = null;
let isReflowing = false;
let pendingReflow: ReflowRequest | null = null;

const runReflowIfNeeded = async (request: ReflowRequest) => {
  if (isReflowing) {
    pendingReflow = request;
    return;
  }

  isReflowing = true;
  try {
    cleanupEmptyState();

    const shouldReflow = EDIT_REFLOW_REASONS.has(request.reason)
      ? await needsMeasuredReflow()
      : true;

    if (!shouldReflow) return;

    await reflowPages();
    if (request.reason === "brief-resize") {
      await getAllQuestionInfo();
    }
  } finally {
    isReflowing = false;
    if (pendingReflow) {
      const nextRequest = pendingReflow;
      pendingReflow = null;
      scheduleReflow(nextRequest);
    }
  }
};

const scheduleReflow = (payload?: Partial<ReflowRequest> | string | null) => {
  // 瀵煎嚭涓埆閲嶆帓锛岄伩鍏嶇敾甯冨鍑烘姈鍔?
  if (isExportMode.value) return;

  const request = normalizeReflowRequest(payload);
  if (reflowTimer) {
    clearTimeout(reflowTimer);
  }
  const delay = request.flush ? 0 : EDIT_REFLOW_REASONS.has(request.reason) ? EDIT_REFLOW_DELAY : 0;

  reflowTimer = setTimeout(() => {
    reflowTimer = null;
    void runReflowIfNeeded(request);

    // 绛変竴甯ц甯冨眬绋冲畾锛堝瘜鏂囨湰/鍥剧墖鍥炴祦鏇寸ǔ锛?
  }, delay);
};

const forceCaptureReflow = async () => {
  if (reflowTimer) {
    clearTimeout(reflowTimer);
    reflowTimer = null;
  }
  pendingReflow = null;

  while (isReflowing) {
    await waitForLayoutMeasurement();
  }

  await reflowPages();
  await waitForLayoutMeasurement();
};

const reflowPages = async () => {
  setReflowLoading(true);
  try {
    // 鍏堟竻鐞嗗巻鍙插垎椤靛悗缂€锛岄伩鍏嶉噸鎺掓椂閲嶅鐢熸垚
    data.value = data.value.filter(it => {
      if (it.isHeader || it._isCloneHeader) return true;
      const id = String(it?.id || "");
      const isLegacySuffixId = /_sf_\d+$/.test(id);
      return !it.isSuffix && !isLegacySuffixId;
    });

    nextPage.value = 0;
    data.value.forEach(it => {
      if (!it.isHeader) {
        it.pageOf = 0;
        if (it.props) {
          delete it.props.breakPoint;
          delete it.props.originalHeight;
          delete it.props.splitDepth;
        }
        if (it.type === "BriefQuestion") clearBriefQuestionInfoList(it);
        it.isSuffix = false;
        it.needCalculate = true;
      }
    });

    await waitForLayoutMeasurement();
    clearObservers();

    await settlePaginationAndHeaders();
    rebuildPaginationObservers();
  } finally {
    setReflowLoading(false);
  }
};

const cleanupEmptyState = () => {
  const hasRealContent = data.value.some(it => !it._isCloneHeader && !it.isHeader);
  if (!hasRealContent) {
    const header = data.value.find(it => it.isHeader);

    if (header) {
      header.pageOf = 0;
      data.value = [header];
    } else {
      data.value = [];
    }
    nextPage.value = 0;
  }
};

const clearBriefQuestionInfoList = (item: any) => {
  const clearNode = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node.infoList)) node.infoList = [];

    const nested = Array.isArray(node.childs) ? node.childs : node.block;
    if (Array.isArray(nested)) nested.forEach(clearNode);
  };

  if (Array.isArray(item?.model?.childs)) {
    item.model.childs.forEach(clearNode);
  }
};

const deleteById = (id: any) => {
  const rootId = String(id).split("_sf_")[0];
  data.value = data.value.filter(it => {
    if (it.isHeader) return true;
    const currentId = String(it.id);
    const isTarget = currentId === rootId || currentId.startsWith(`${rootId}_sf_`);
    return !isTarget;
  });

  nextTick(() => {
    cleanupEmptyState();
    scheduleReflow({ reason: "delete", flush: true });
  });
};

const handleDelete = (event: MouseEvent, id: string) => {
  showPopConfirm(event, {
    onConfirm: () => {
      deleteById(id);
    },
  });
};

useEventBus("reflowPages", payload => {
  scheduleReflow(payload as Partial<ReflowRequest> | string | null);
});

useEventBus("deleteById", data => {
  deleteById((data as any).id);
});

const qrCodeId = ref("");
const getQrCodeList = async () => {
  qrCodeId.value = SnowflakeIdGenerator.generateId();
  await nextTick();
  await new Promise(r => requestAnimationFrame(r));
  const headers = groups.value.flat().filter(it => it.isHeader);
  return headers.map(it => {
    const page = it.pageOf + 1;
    return {
      pageOf: page,
      content: it?.model?.qrCodeParams || "",
      pageRange: [page, groups.value.length == page ? null : page + 1].filter(Boolean).toString(),
      info: toRaw(it.model.qrCodeInfo),
    };
  });
};
const getQrCodeWithPageNumber = (pageIndex: number) => {
  if (!qrCodeId.value) return "";
  return qrCodeId.value.replace(/\d$/, String(pageIndex));
};

const getAllData = () => {
  const all = groups.value
    .flat()
    .filter(item => !item?._isCloneHeader)
    .map(it => toRaw(it));
  return all;
};

const getAllFilterData = () => {
  const all = groups.value
    .flat()
    .filter(item => !item?.isSuffix)
    .filter(item => !item.hideInView)
    .map(it => toRaw(it));
  return all;
};

const getViewInfo = () => {
  if (pageRefsManager.refs.value.length > 0 && pageRefsManager.refs.value[0])
    return pageRefsManager.refs.value[0].getBoundingClientRect();
};

const isExportMode = ref(false);
const exportFormulaPolicy = ref<CaptureFormulaPolicy>(DEFAULT_CAPTURE_FORMULA_POLICY);
provide("isExportMode", isExportMode);
provide("answerCardExportFormulaPolicy", exportFormulaPolicy);

const setAnchorPointVisibility = (visible: boolean) => {
  const points = document.getElementsByClassName("point");
  Array.from(points).forEach(point => {
    (point as HTMLElement).style.visibility = visible ? "visible" : "hidden";
  });
};

const waitForReflowIdle = async () => {
  if (reflowTimer) {
    clearTimeout(reflowTimer);
    reflowTimer = null;
  }
  pendingReflow = null;

  while (isReflowing) {
    await waitForLayoutMeasurement();
  }

  await waitForLayoutMeasurement();
};

const withExportCaptureSession = async <T,>(
  task: () => Promise<T>,
  options: {
    formulaPolicy?: CaptureFormulaPolicy;
  } = {},
) => {
  if (isExportMode.value) {
    return await task();
  }

  const previousFormulaPolicy = exportFormulaPolicy.value;
  exportFormulaPolicy.value = options.formulaPolicy ?? DEFAULT_CAPTURE_FORMULA_POLICY;
  isExportMode.value = true;
  await nextTick();
  setAnchorPointVisibility(true);
  await waitForReflowIdle();

  try {
    return await task();
  } finally {
    setAnchorPointVisibility(false);
    isExportMode.value = false;
    exportFormulaPolicy.value = previousFormulaPolicy;
    await nextTick();
    await waitForLayoutMeasurement();
  }
};

const pagelToCanvas = async (page: any) => {
  const pageElement = page as HTMLElement | null;
  if (!pageElement) return null;

  try {
    return await withExportCaptureSession(async () => {
      return await capturePageCanvas(pageElement, {
        formulaPolicy: DEFAULT_CAPTURE_FORMULA_POLICY,
      });
    });
  } catch (err) {
    console.error("pagelToCanvas:", err);
    return null;
  }
};

const getPaperGroupSize = () => {
  return paperGroupSizeMap[props.paperSize || "A4_1"] || 1;
};

const emptyCaptureSlots = computed<EmptyCaptureSlot[]>(() => {
  const groupSize = getPaperGroupSize();
  if (groupSize <= 1) return [];

  const pageCount = groups.value.length;
  if (pageCount <= 0) return [];

  const remainder = pageCount % groupSize;
  if (remainder === 0) return [];

  const missingCount = groupSize - remainder;
  return Array.from({ length: missingCount }, (_, offset) => ({
    key: `empty-capture-${pageCount + offset}`,
    pageIndex: pageCount + offset,
  }));
});

const capturePages = async ({
  output = "file",
  formulaPolicy = DEFAULT_CAPTURE_FORMULA_POLICY,
  scale = DEFAULT_CAPTURE_SCALE,
  onProgress,
}: CapturePagesOptions = {}) => {
  const pageCanvases: HTMLCanvasElement[] = [];
  let capturePageTotal = 0;
  let mergedCanvases: HTMLCanvasElement[] = [];

  try {
    await withExportCaptureSession(
      async () => {
        const pageElements = fullPageRefsManager.refs.value.filter(Boolean) as HTMLElement[];
        const emptyPageElements = emptyCaptureSlots.value
          .map((_, index) => emptyPageRefsManager.getRef(index))
          .filter(Boolean) as HTMLElement[];
        capturePageTotal = pageElements.length + emptyPageElements.length;

        for (let pageIndex = 0; pageIndex < pageElements.length; pageIndex++) {
          const pageElement = pageElements[pageIndex];
          const canvas = await capturePageCanvas(pageElement, {
            formulaPolicy,
            onProgress,
            pageIndex: pageIndex + 1,
            pageTotal: capturePageTotal,
            scale,
          });
          pageCanvases.push(canvas);
          await yieldToBrowser();
        }

        for (let emptyIndex = 0; emptyIndex < emptyPageElements.length; emptyIndex++) {
          const emptyPageElement = emptyPageElements[emptyIndex];
          const canvas = await capturePageCanvas(emptyPageElement, {
            formulaPolicy,
            onProgress,
            pageIndex: pageElements.length + emptyIndex + 1,
            pageTotal: capturePageTotal,
            scale,
          });
          pageCanvases.push(canvas);
          await yieldToBrowser();
        }
      },
      {
        formulaPolicy,
      },
    );

    onProgress?.({
      phase: "merge-pages",
      pageTotal: capturePageTotal,
    });
    mergedCanvases = groupAndMergeCanvases(pageCanvases, getPaperGroupSize(), "horizontal");

    const outputs = [];
    for (let index = 0; index < mergedCanvases.length; index++) {
      outputs.push(await buildCaptureOutput(mergedCanvases[index], index, output));
    }

    return outputs;
  } finally {
    pageCanvases.forEach(canvas => {
      if (!mergedCanvases.includes(canvas)) {
        releaseCanvas(canvas);
      }
    });
    mergedCanvases.forEach(releaseCanvas);
  }
};

const getImageList = async (isFile: boolean = true) => {
  return await capturePages({
    output: isFile ? "file" : "dataUrl",
  });
};

const measureAllItemInfo = async () => {
  await waitForLayoutMeasurement();

  for (let pageIndex = 0; pageIndex < groups.value.length; pageIndex++) {
    const pageElement = pageRefsManager.getRef(pageIndex) as HTMLElement | undefined;
    if (!pageElement) continue;

    const visibleEntries = getVisiblePageEntriesByIndex(pageIndex);
    for (const { item: currentItem, itemIndex } of visibleEntries) {
      const itemElement = resolveItemElement(itemRefsManager.getRef(pageIndex, itemIndex));
      if (!itemElement) continue;
      await setListInfo(pageIndex, itemIndex, pageElement, itemElement, currentItem, {
        skipWait: true,
      });
    }
  }
};

const getAllQuestionInfo = async () => {
  await measureAllItemInfo();
  // 获取当前所有有效的 item id
  const validItemIds = new Set(data.value.filter(it => !it.isHeader).map(it => String(it.id)));
  for (let pageIndex = 0; pageIndex < itemRefsManager.refs.value.length; pageIndex++) {
    const arr = itemRefsManager.refs.value[pageIndex];
    if (!arr) continue;
    for (let itemIndex = 0; itemIndex < arr.length; itemIndex++) {
      const it = arr[itemIndex];
      if (!it) continue;
      const itemEl = resolveItemElement(it);
      // 检查组件是否已从 DOM 移除
      if (itemEl && !itemEl.isConnected) continue;
      // 检查组件对应的 item 是否仍存在于数据源中
      const compItem = (it as any)?.item;
      const compId = compItem?.value?.id || compItem?.id;
      if (compId && !validItemIds.has(String(compId))) {
        continue;
      }
      const currentItem = groups.value[pageIndex]?.[itemIndex];
      if ((it as any)?.getInfo) {
        const info = await (it as any).getInfo();
        if (currentItem && Array.isArray(info) && info.length > 0) {
          currentItem.info = info;
        }
      }
    }
  }
};

defineExpose({
  getQrCodeList,
  getAllData,
  getAllFilterData,
  getViewInfo,
  capturePages,
  pagelToCanvas,
  getImageList,
  getAllQuestionInfo,
});
</script>
