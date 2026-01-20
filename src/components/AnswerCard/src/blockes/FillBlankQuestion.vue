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
            class="text-16px font-500 text-left text-black h-30px leading-30px">
            {{ title || " " }}
          </div>
          <el-input v-else v-model="title" class="no-border-input input-title"></el-input>
        </template>
        <div
          class="border flex pl-5px relative"
          :class="[
            route.query?.reviewMethod == '2' && rightSetting.fillBlankMergeReview == true
              ? 'pt-20px'
              : 'pt-10px',
            props.breakPoint.start == 0 ? '' : 'mt-10px',
          ]">
          <RightBox
            v-if="
              props.breakPoint.start == 0 &&
              route.query?.reviewMethod == '2' &&
              rightSetting.fillBlankMergeReview == true
            "
            :totalScore="
              childs.reduce((sum, child: any) => {
                if (!child.block || !child.block.length) return sum;
                const blockScore = child.block.reduce((s, b) => s + Number(b.score || 0), 0);
                return sum + blockScore;
              }, 0)
            "
            @complete="
              v => {
                scoreBoxList = v;
              }
            " />
          <Block
            :key="rightSetting.fillBlankMergeReview"
            :border="false"
            :modelValue="data"
            class="mb-5px w-full"
            @vue:mounted="blockMounted" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, useAttrs, watch } from "vue";
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

const rightSetting = inject<any>("AnswerCardSetting");
const sortType = computed(() => rightSetting.value.sortType);
const isExportMode = inject<any>("isExportMode");

const route = useRoute();
let allBLocks: any[] = [];

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
        height:32px;
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

const blockMounted = async () => {
  await nextTick();
  await new Promise(r => requestAnimationFrame(r));

  if (allBLocks.length === 0) return;
  for (const it of allBLocks) {
    const el = await waitForElementById(it.id);
    if (attrs?.pageBox && el) {
      const rect: any = await getPosition(attrs.pageBox as HTMLElement, el, "none");
      it.infoList = [
        Object.freeze({
          ...rect.percentage,
          pageOf: Number(attrs.pageOf) + 1,
        }),
      ];
    }
  }
  nextTick(() => emits("end"));
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
  if (!shouldPaginate.value || childs.value.length === 0) return childs.value;

  const total = childs.value.length;
  const startIndex = Math.floor(props.breakPoint.start * total);
  let endIndex = Math.floor(props.breakPoint.end * total);

  if (props.breakPoint.end >= 0.99) endIndex = total;

  return childs.value.slice(startIndex, endIndex);
};

const renderSegment = (item: any) => {
  const prefixHtml = `${item.prefix}. `;
  const prefixWidthHtml = `<span style="display:inline-block;width:${prefixHtml.length + 2}px;"></span>`;

  if (item.block?.length > 1) {
    let html = "";

    item.block.forEach((b, i) => {
      const rate = Number(b.width.replace("%", "")) / 100;
      html += `
        <span
          contenteditable="true"
          data-fill-blank="true"
          style="
            display:inline-flex;
            align-items:flex-end;
            margin-right:10px;
            vertical-align:bottom;
            width: calc(${rate * 100}% - ${rate * 100 - 5}px);
          "
        >
          ${i === 0 ? prefixHtml : prefixWidthHtml}
          ${getItem(rate, b.score, b)}
        </span>
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
        justify-content:flex-end;
        width: 17px;
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
    data.value = `<div style="line-height:2;color:#999;"></div>`;
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
      const startIndex = shouldPaginate.value ? Math.floor(bp.start * childs.value.length) : 0;
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

  data.value = `<div>${html}</div>`;
};

const tempChilds = computed(() => childs.value);
watch(
  [
    () => rightSetting.value.lineType,
    () => rightSetting.value.fillBlankMergeReview,
    () => tempChilds.value,
    () => sortType.value,
    () => props.breakPoint,
  ],
  generator,
  {
    immediate: true,
    deep: true,
  },
);
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
.no-border-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid transparent !important;
  /* 保留边框占位避免跳动 */
  background: transparent !important;
  margin: 0;
  padding: 0;
}

/* 聚焦时也不出现边框高亮 */
.no-border-input :deep(.el-input__wrapper.is-focus) {
  border: 1px solid blue !important;
  /* Element Plus 默认主题蓝 */
  box-shadow: none !important;
  background: transparent !important;
}

/* 标题样式 */
.input-title :deep(.el-input__inner) {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  /* 黑色字体 */
  text-align: left;
}

/* 占位文字也变成黑色半透明 */
.no-border-input :deep(.el-input__inner::placeholder) {
  color: rgba(0, 0, 0, 0.4);
}
</style>
<style>
[data-fill-blank]:empty::after {
  content: " ";
  white-space: pre;
}
</style>
