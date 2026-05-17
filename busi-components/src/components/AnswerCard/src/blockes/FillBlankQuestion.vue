<template>
  <div id="fillBlankQuestion">
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
          ref="rootRef"
          class="border flex pl-5px relative"
          :class="[
            route.query?.reviewMethod == '2' && rightSetting.fillBlankMergeReview == true
              ? 'pt-20px'
              : 'pt-2px',
            props.breakPoint.start == 0 ? '' : 'mt-10px',
          ]">
          <RightBox
            v-if="
              props.breakPoint.start == 0 &&
              route.query?.reviewMethod == '2' &&
              rightSetting.fillBlankMergeReview == true
            "
            :totalScore="getTotalScoreForReview()"
            @complete="
              v => {
                scoreBoxList = v;
              }
            " />
          <Block
            :key="rightSetting.fillBlankMergeReview"
            :border="false"
            v-model="data"
            class="mb-5px w-full"
            @vue:mounted="blockMounted" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, ref, useAttrs, watch } from "vue";
import Block from "../base/Block.vue";
import RightBox from "./RightBox.vue";
import { useRoute } from "vue-router";
import { getPosition } from "../utils/getPosition";
import { waitForElementById } from "../utils/waitForElement";

const props = defineProps({
  breakPoint: {
    type: Object,
    default: () => ({
      start: 0,
      end: 1,
    }),
  },
});
const emits = defineEmits(["delete", "end"]);

const title = defineModel<any>("title");
const data = defineModel<string>("data", { default: () => "" });
const childs = defineModel("childs", { default: [] });
const scoreBoxList = defineModel("scoreBoxList", { default: [] });
const generatedTemplate = ref("");

const rightSetting = inject<any>("AnswerCardSetting");
const sortType = computed(() => rightSetting.value.sortType);
const isExportMode = inject<any>("isExportMode");

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

const route = useRoute();
let allBLocks: any[] = [];
const rootRef = ref<HTMLElement | null>(null);

const ensureItemBlock = (item: any) => {
  if (!item || typeof item !== "object") return [];
  if (!Array.isArray(item.block) || item.block.length === 0) {
    const width = item.width ?? "33.3%";
    const score = item.score ?? 0;
    const fallbackId = item.id ? `${item.id}_block_0` : `fill_block_${String(item.prefix ?? "0")}`;
    item.block = [{ width, score, id: fallbackId, isOneProb: 1 }];
  }
  return item.block as any[];
};

const expandChildsForRender = (source: any[] = []) => {
  const out: any[] = [];

  source.forEach((item: any) => {
    const hasSubQuestions =
      Number(item?.isOneProb) === 2 && Array.isArray(item?.childs) && item.childs.length > 0;

    if (hasSubQuestions) {
      item.childs.forEach((sub: any, idx: number) => {
        if (!sub.prefix) sub.prefix = `${item.prefix}（${idx + 1}）`;
        if (sub.width === undefined || sub.width === null || sub.width === "") {
          sub.width = item.width ?? "33.3%";
        }
        if (sub.score === undefined || sub.score === null || sub.score === "") {
          sub.score = item.score ?? 0;
        }
        ensureItemBlock(sub);
        out.push(sub);
      });
      return;
    }

    ensureItemBlock(item);
    out.push(item);
  });

  return out;
};

const getTotalScoreForReview = () => {
  return expandChildsForRender(childs.value || []).reduce((sum, item: any) => {
    const blockScore = (item.block || []).reduce(
      (s: number, b: any) => s + Number(b.score || 0),
      0,
    );
    return sum + blockScore;
  }, 0);
};

const getItem = (rate: number, fullScore?: number, b?: any) => {
  if (b?.block) {
    allBLocks.push(b.block[0]);
  } else {
    allBLocks.push(b);
  }

  return `
    <span
      id="${b.id}"
      contenteditable="true"
      data-mce-contenteditable="true"
      style="
        position:relative;
        display:inline-block;
        width:100%;
        height:40px;
        border-bottom:1px ${rightSetting.value.lineType === "dashed" ? "dashed" : "solid"} #000;
        vertical-align:bottom;
        margin-bottom:4px;
        user-select: none; 
      "
    >
      ${
        route.query?.reviewMethod == "2" && !rightSetting.value.fillBlankMergeReview
          ? `
            <span style="
              position:absolute;
              right:0;
              bottom:-1px;
              width:60px;
              height:16px;
              display:flex;
              font-size:12px;
              border:1px solid #000;
              line-height:16px;
            ">
              <span style="border-right:1px solid #000;width:50%; display:flex; align-item:center; justify-content: center;">0</span>
              <span style="width:50%; display:flex; align-item:center; justify-content: center;">${fullScore || 0}</span>
            </span>
          `
          : ""
      }
    </span>
  `;
};

/* 勿删 */
// const getItem = (rate: number, fullScore?: number, b?: any) => {
//   if (b?.block) {
//     allBLocks.push(b.block[0]);
//   } else {
//     allBLocks.push(b);
//   }

//   const spaceCount = rightSetting.value.fillBlankMergeReview
//     ? Math.max(Math.floor(rate * 130), 4)
//     : Math.max(Math.floor(rate * 110), 4);
//   const placeholder = "&nbsp;".repeat(spaceCount);

//   return `
//     <span
//       id="${b.id}"
//       class="fill-blank-item"
//       style="
//         position:relative;
//         border-bottom: 1px ${rightSetting.value.lineType === "dashed" ? "dashed" : "solid"} #000;
//         padding: 0 2px;
//         line-height: 2.5;
//         cursor: text;
//       "
//     >${placeholder}
//     </span>
//     ${
//       route.query?.reviewMethod == "2" && !rightSetting.value.fillBlankMergeReview
//         ? `<span contenteditable="false" style="display:inline-block; font-size:12px; border:1px solid #000; margin-left:4px; vertical-align:middle; line-height:1.25;">
//              <span style="padding:1px 8px; border-right:1px solid #000; ">0</span><span style="padding:2px 8px;">${fullScore || 0}</span>
//            </span>`
//         : ""
//     }
//   `;
// };

const attrs = useAttrs();

const buildPosition = (rect: any) => {
  return Object.freeze({
    ...rect.percentage,
    pageOf: Number(attrs.pageOf) + 1,
  });
};

const measureOuterInfo = async () => {
  const pageBox = attrs?.pageBox as HTMLElement | undefined;
  const rootEl = rootRef.value;
  if (!pageBox || !rootEl) return [];

  const rect: any = await getPosition(pageBox, rootEl, "none");
  if (!rect?.percentage) return [];

  return [buildPosition(rect)];
};

const measureInnerBlocks = async () => {
  await nextTick();
  await new Promise(r => requestAnimationFrame(r));

  if (allBLocks.length === 0) return;
  for (const it of allBLocks) {
    const el = await waitForElementById(it.id);
    if (attrs?.pageBox && el) {
      const rect: any = await getPosition(attrs.pageBox as HTMLElement, el, "none");
      if (!rect?.percentage) continue;
      it.infoList = [buildPosition(rect)];
    }
  }
};

const getInfo = async () => {
  await measureInnerBlocks();
  return await measureOuterInfo();
};

const blockMounted = async () => {
  const info = await getInfo();
  nextTick(() => emits("end", { info }));
};

const shouldPaginate = computed(() => {
  return (
    props.breakPoint &&
    typeof props.breakPoint.start === "number" &&
    typeof props.breakPoint.end === "number" &&
    (props.breakPoint.start > 0 || props.breakPoint.end < 1)
  );
});

const getCurrentPageChilds = () => {
  const renderList = expandChildsForRender(childs.value || []);
  if (!shouldPaginate.value || renderList.length === 0) return renderList;

  const total = renderList.length;
  const startIndex = Math.floor(props.breakPoint.start * total);
  let endIndex = Math.floor(props.breakPoint.end * total);

  if (props.breakPoint.end >= 0.99) endIndex = total;

  return renderList.slice(startIndex, endIndex);
};

const renderSegment = (item: any) => {
  const prefixText = String(item.prefix ?? "");
  const prefixHtml = `${prefixText}. `;
  const prefixWidth = Math.max(prefixText.length * 8 + 8, 18);
  const prefixWidthHtml = `<span style="display:inline-block;width:${prefixWidth}px;"></span>`;

  if (item.block?.length > 1) {
    let html = "";
    const total = item.block.length;

    item.block.forEach((b, i) => {
      const rate = Number(b.width.replace("%", "")) / 100;
      const isLast = i === total - 1;
      const shouldBreakLine = !isLast && (i + 1) % 2 === 0;
      html += `
        <span
          contenteditable="true"
          data-fill-blank="true"
          style="
            display:inline-flex;
            align-items:flex-end;
            margin-right:${isLast || shouldBreakLine ? 0 : 10}px;
            vertical-align:bottom;
            width: calc(${rate * 100}% - 10px);
          "
        ><span style="white-space:nowrap;">${i === 0 ? prefixHtml : prefixWidthHtml}</span>
          ${getItem(rate, b.score, b)}
        </span>
        ${shouldBreakLine ? "<br>" : ""}
      `;
    });

    return html;
  }

  // 单空
  const rate = Number(item.width.replace("%", "")) / 100;

  return `
    <span
      style="
        display:inline-flex;
        align-items:flex-end;
        width: calc(${rate * 100}% - ${30}px);
      "
    >
    <span
      style="
        display:inline-flex;
        justify-content:flex-start;
        width: 23px;
        margin-right: 1px;
        margin-right: 1px;
        white-space: nowrap;
        flex-shrink: 0;
        "
      >
      ${prefixHtml}
    </span>
      ${getItem(rate, item.score, item.block[0])}
    </span>
  `;
};

const generator = () => {
  allBLocks = [];
  const bp = props.breakPoint || { start: 0, end: 1 };
  const list = getCurrentPageChilds();

  if (!list || list.length === 0) {
    const emptyTemplate = `<div style="line-height:2;color:#999;"></div>`;
    if (!data.value || data.value === generatedTemplate.value) {
      data.value = emptyTemplate;
    }
    generatedTemplate.value = emptyTemplate;
    return;
  }

  if (sortType.value === "smallFollow") {
    list.forEach(it => {
      if (it?.copyIndex) it.prefix = it.copyIndex;
      else it.copyIndex = it.prefix;
    });
  }
  if (sortType.value === "bigSingle") {
    list.forEach((it, i) => {
      const startIndex = shouldPaginate.value
        ? Math.floor(bp.start * expandChildsForRender(childs.value || []).length)
        : 0;
      it.prefix = startIndex + i + 1;
    });
  }

  let html = "";
  let currentWidth = 0;

  const computeWidth = (it: any) =>
    it.block?.length
      ? it.block.reduce((s, b) => s + Number(b.width.replace("%", "")) / 100, 0)
      : Number(it.width.replace("%", "")) / 100;

  list.forEach((it, index) => {
    // 多空 → 整段渲染 + 换行
    if (it.block?.length > 1) {
      html += renderSegment(it) + "<br>";
      currentWidth = 0;
      return;
    }

    // 单空换行逻辑
    const w = computeWidth(it);
    const seg = renderSegment(it);

    if (currentWidth + w > 1) {
      html += "<br>";
      currentWidth = 0;
    }

    html += seg;
    currentWidth += w;

    if (index < list.length - 1 && currentWidth > 0) {
      html += `<span style="display:inline-block;width:14px;"></span>`;
    }
  });

  const nextTemplate = `<div style="margin-left: 6px;">${html}</div>`;
  if (!data.value || data.value === generatedTemplate.value) {
    data.value = nextTemplate;
  }
  generatedTemplate.value = nextTemplate;
};

const tempChilds = computed(() => childs.value);
watch(
  [
    () => rightSetting.value.lineType,
    () => rightSetting.value.fillBlankMergeReview,
    () => tempChilds.value,
    () => data.value,
    () => sortType.value,
    () => props.breakPoint,
  ],
  generator,
  {
    immediate: true,
    deep: true,
  },
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

  &:hover {
    border: 1px solid blue;
  }
}

.border-r {
  border-right: 1px solid black;
  box-sizing: border-box;

  &:hover {
    border-right: 1px solid blue;
  }
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
<style>
[data-fill-blank]:empty::after {
  content: " ";
  white-space: pre;
}
</style>
