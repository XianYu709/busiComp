<template>
  <div class="w-full h-full flex flex-col items-center">
    <div
      v-for="(page, pageIndex) in groups"
      class="bg-[#fff] px-10px py-10px page"
      :style="getStyle"
      :ref="el => fullPageRefsManager.setRef(el, pageIndex)">
      <!-- 单页 -->
      <div
        id="page"
        class="relative h-full box-border"
        :ref="el => pageRefsManager.setRef(el, pageIndex)">
        <AnchorPoint
          v-bind="{
            paper: props.paperSize,
            page: pageIndex,
            position: 'top',
            pageSize: groups.length,
          }" />
        <!-- 内容 -->
        <div
          class="px-10px mt-25px"
          :id="`page_content_${pageIndex}`"
          :style="{
            height: 'calc(100% - 70px)',
            border: rightSetting.contentBorder ? '1px solid #000' : '1px solid transparent',
          }"
          :ref="el => contentRefsManager.setRef(el, pageIndex)">
          <component
            v-for="(item, itemIndex) in page.filter(it => !it.hideInView)"
            :id="`${item.model?.item?.id}_${pageIndex}_block` || `${pageIndex}_${itemIndex}_block`"
            :ref="el => itemRefsManager.setRef(el, pageIndex, itemIndex)"
            :key="item.id"
            :is="typeCompMaps[item.type] || h('div', {}, '暂不支持该组件')"
            v-bind="{
              ...item.props,
              ...genVModels(item.model),
              pageOf: pageIndex,
              isHeader: item?.isHeader == true,
              itemOf: itemIndex,
              type: item.type,
              paperSize: props.paperSize,
              qrCodePrefix: props.qrCodePrefix,
            }"
            :pageBox="pageRefsManager.refs.value[pageIndex]"
            :onDelete="e => handleDelete(e, item.id)"
            :innerHeight="item.info.height"
            @end="updateItemInfo(item, itemIndex, pageIndex)" />
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
  </div>
</template>
<script lang="tsx" setup>
import {
  computed,
  inject,
  nextTick,
  provide,
  watch,
  h,
  onBeforeUnmount,
  toRaw,
  type CSSProperties,
  ref,
} from "vue";
import ChoiceQuestion from "./blockes/ChoiceQuestion.vue";
import FillBlankQuestion from "./blockes/FillBlankQuestion.vue";
import ArticleQuestion from "./blockes/ArticleQuestion.vue";
import BriefQuestion from "./blockes/BriefQuestion.vue";
import TopInfo from "./blockes/TopInfo.vue";
import TopInfoHomework from "./blockes/TopInfoHomework.vue";
import Block from "./base/Block.vue";
import WithQustionDetail from "./blockes/WithQustionDetail.vue";
import { getPosition } from "./utils/getPosition.ts";
import { observeTouchBottomPlus } from "./utils/observeTouchBottom.ts";
import AnchorPoint from "./blockes/AnchorPoint.vue";
import { SnowflakeIdGenerator, useEventBus } from "@sjjb/utils";
import { showPopConfirm } from "./utils/showPopConfirm.ts";
import html2canvas from "html2canvas";
import { base64ToFile, groupAndMergeImages } from "./utils/imageUtils.ts";
import { createRefManager } from "./utils/refManager.ts";
import { autoPagination } from "./utils/pagination.ts";

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

export type compTypes =
  | "EditBlock"
  | "ChoiceQuestion"
  | "BriefQuestion"
  | "ArticleQuestion"
  | "FillBlankQuestion"
  | "WithQustionDetail"
  | "TopInfo"
  | "TopInfoHomework";

/* 组件映射 */
const typeCompMaps: Record<compTypes, any> = {
  EditBlock: Block /* 编辑块 */,
  TopInfo: TopInfo /* 顶部信息 */,
  TopInfoHomework: TopInfoHomework /* 顶部信息作业版 */,
  ChoiceQuestion: ChoiceQuestion /* 选择题 */,
  BriefQuestion: BriefQuestion /* 简答题 */,
  FillBlankQuestion: FillBlankQuestion /* 填空 */,
  ArticleQuestion: ArticleQuestion /*作文题 */,
  WithQustionDetail: WithQustionDetail /* 含题 */,
};

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
  nextPage.value = result.length - 1 < 0 ? 0 : result.length - 1;
  return result;
});

watch(
  () => rightSetting.value.objectiveMerge,
  val => {
    if (val) {
      const choiceList = data.value.filter(it => it.type === "ChoiceQuestion" && !it.isMerge);
      if (choiceList.length > 1) {
        choiceList.forEach(it => (it.hideInView = true));
        // 生成新的合并题
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

const itemRefsManager = createRefManager<HTMLElement>();
const pageRefsManager = createRefManager<HTMLElement>();
const fullPageRefsManager = createRefManager<HTMLElement>();
const contentRefsManager = createRefManager<HTMLElement>();

const setListInfo = async (pageIndex: number, index: number, page: any, item: any) => {
  await nextTick();
  await new Promise(r => requestAnimationFrame(r));
  setTimeout(async () => {
    const rect: any = await getPosition(page, item, "none");
    if (groups.value[pageIndex] && groups.value[pageIndex][index]) {
      groups.value[pageIndex][index].info = [
        {
          ...rect.percentage,
          pageOf: pageIndex + 1,
        },
      ];
    }
  }, 100);
};

const rebuildHeaders = () => {
  if (props.repeatHeaderInterval <= 0) return;

  const header = data.value.find(it => it.isHeader === true);
  if (!header) return;

  const interval = props.repeatHeaderInterval;

  data.value = data.value.filter(it => !it._isCloneHeader);

  // 按 pageOf 排序一次（避免分布不规律）
  data.value.sort((a, b) => a.pageOf - b.pageOf);

  //  重新分组
  const pageCount = groups.value.length;

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const shouldHaveHeader = pageIndex % interval === 0; // ✅ 不再 +1

    if (!shouldHaveHeader) continue;

    const pageItems = groups.value[pageIndex];
    const alreadyHasHeader = pageItems.some(it => it.isHeader || it._isCloneHeader);

    if (alreadyHasHeader) continue;

    const cloned = JSON.parse(JSON.stringify(header));
    cloned._isCloneHeader = true;
    cloned.id = SnowflakeIdGenerator.generateId();
    cloned.pageOf = pageIndex;

    cloned.props = {
      ...(cloned.props || {}),
      // breakPoint: { start: 0, end: 0 },
    };

    // 插入到 data 中（保证在该页最前）
    const insertIndex = data.value.findIndex(it => it.pageOf === pageIndex);

    if (insertIndex === -1) {
      data.value.push(cloned);
    } else {
      const newData = [...data.value];
      newData.splice(insertIndex, 0, cloned);
      data.value = newData;
    }
  }
};

watch(
  () => groups.value.length,
  () => {
    nextTick(() => rebuildHeaders());
  },
  { immediate: true },
);

let observers: any[] = [];
const updateItemInfo = (item: any, index: number, pageIndex: number) => {
  if (item.needCalculate === false) return;
  nextTick(async () => {
    const component = itemRefsManager.getRef(pageIndex, index);
    const page = pageRefsManager.getRef(pageIndex);
    const content = contentRefsManager.getRef(pageIndex);

    if (component?.$el && page && content) {
      const stop = observeTouchBottomPlus(
        content,
        component.$el,
        info => {
          autoPagination(data, info, item, pageIndex);
          nextTick(() => rebuildHeaders());
        },
        {
          offset: 0,
          once: true,
        },
      );
      observers.push(stop);
      setListInfo(pageIndex, index, page, component.$el);
    }
  });
};

const reflowPages = () => {
  nextPage.value = 0;
  data.value.forEach(it => {
    if (!it.isHeader) {
      it.pageOf = 0;
      if (it.props?.breakPoint) {
        delete it.props.breakPoint;
      }
      it.isSuffix = false;
      it.needCalculate = true;
    }
  });

  nextTick(() => {
    clearObservers();

    pageRefsManager.refs.value.forEach((pageEl, pageIndex) => {
      const contentEl = contentRefsManager.refs.value[pageIndex];
      if (!contentEl) return;

      const items = itemRefsManager.refs.value[pageIndex] || [];
      items.forEach((itemComp, itemIndex) => {
        if (!itemComp || !itemComp.$el) return;

        const stop = observeTouchBottomPlus(
          contentEl,
          itemComp.$el,
          info => {
            const pageOf = Number(info.entry.getAttribute("pageof"));
            const itemOf = Number(info.entry.getAttribute("itemof"));
            const item = groups.value[pageOf]?.[itemOf];
            if (!item) return;
            autoPagination(data, info, item, pageOf);
            nextTick(() => rebuildHeaders());
          },
          {
            offset: 6,
            once: true,
          },
        );

        setListInfo(pageIndex, itemIndex, pageEl, itemComp.$el);
        observers.push(stop);
      });
    });

    rebuildHeaders();
  });
};

const clearObservers = () => {
  observers.forEach(stop => stop && stop());
  observers = [];
};

onBeforeUnmount(() => {
  clearObservers();
});

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

const deleteById = id => {
  const rootId = String(id).split("_sf_")[0];
  data.value = data.value.filter(it => {
    if (it.isHeader) return true;
    const currentId = String(it.id);
    const isTarget = currentId === rootId || currentId.startsWith(`${rootId}_sf_`);
    return !isTarget;
  });

  nextTick(() => {
    cleanupEmptyState();
    reflowPages();
  });
};

const handleDelete = (event: MouseEvent, id: string) => {
  showPopConfirm(event, {
    onConfirm: () => {
      deleteById(id);
    },
  });
};

useEventBus("reflowPages", () => {
  nextTick(() => {
    cleanupEmptyState();
    reflowPages();
  });
});

useEventBus("deleteById", data => {
  deleteById(data.id);
});

const getQrCodeList = () => {
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
provide("isExportMode", isExportMode);
const pagelToCanvas = async (page: any) => {
  isExportMode.value = true;
  await nextTick();
  const points = document.getElementsByClassName("point");
  Array.from(points).forEach(p => (p.style.visibility = "visible"));
  try {
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return canvas;
  } catch (err) {
    console.error("pagelToCanvas:", err);
    return null;
  } finally {
    Array.from(points).forEach(p => (p.style.visibility = "hidden"));
    isExportMode.value = false;
  }
};

const getImageList = async (isFile: boolean = true) => {
  const gourpsMap: any = {
    A4_1: 1,
    A3_2: 2,
    A3_3: 3,
  };

  const paperType = props.paperSize || "A4_1";
  const groupSize = gourpsMap[paperType] || 1;

  const base64List: string[] = [];
  for (const pageEl of fullPageRefsManager.refs.value) {
    const canvas = await pagelToCanvas(pageEl);
    if (!canvas) continue;
    base64List.push(canvas.toDataURL("image/png"));
  }

  const mergedBase64List = await groupAndMergeImages(base64List, groupSize, "horizontal");
  return mergedBase64List.map((b64, index) =>
    isFile ? base64ToFile(b64, `canvas-image-${index + 1}.png`) : b64,
  );
};

const getAllQuestionInfo = async () => {
  for (const arr of itemRefsManager.refs.value) {
    for (const it of arr) {
      if (it?.getInfo) {
        await it.getInfo();
      }
    }
  }
};

defineExpose({
  getQrCodeList,
  getAllData,
  getAllFilterData,
  getViewInfo,
  pagelToCanvas,
  getImageList,
  getAllQuestionInfo,
});
</script>
