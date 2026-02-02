<template>
  <div class="pb-10px" id="fillBlankQuestion" :class="props.breakPoint.start != 0 ? 'mt-10px' : ''">
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
          v-for="(it, index) in getCurrentPageOptions"
          :key="it.__globalIndex"
          class="border flex relative fillBlank px-8px pt-5px"
          :id="`${it?.id || 'brief'}_${it.__globalIndex}`"
          style="border-bottom: 1px solid #000"
          :style="{
            borderTop: index == 0 ? '1px solid #000' : 'none',
            borderBottom: it.hideBottomLine ? 'none' : '',
          }">
          <RightBox
            :showTopLine="it.showRitghtTop"
            v-if="$route.query?.reviewMethod == '2'"
            :key="`rb_${it.__globalIndex}`"
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
            :key="`${it.__globalIndex}_${rightSetting.lineType}`"
            :border="false"
            v-model="data[it.__globalIndex]"
            class="mb-5px"
            :class="it.lineCount && it.lineCount > 0 ? '' : 'h-170px'"
            @mount-done="() => getInfo(it)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, useAttrs, watch } from "vue";
import Block from "../base/Block.vue";
import { makeResizableHeight } from "../../../../../../utils/src/makeResizableHeight";
import RightBox from "./RightBox.vue";
import { getPosition } from "../utils/getPosition";
import { waitForElementById } from "../utils/waitForElement";

type BreakPoint = { start: number; end: number };

type OptionBlock = {
  id?: string;
  prefix?: string | number;
  copyIndex?: string | number;
  lineCount?: number;
  hideBottomLine?: boolean;
  showRitghtTop?: boolean;
  step?: any;
  score?: number;
  scoreBoxList?: any;
  __globalIndex: number;
  displayPrefix?: string | number;
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

onMounted(() => {
  nextTick(() => emits("end"));
  const divs = document.getElementsByClassName("fillBlank");
  for (let div of Array.from(divs)) {
    makeResizableHeight(div as HTMLElement);
  }
});

const title = defineModel<any>("title");
const data = defineModel<any[]>("data", { default: () => [] });
const childs = defineModel<any[]>("childs", { default: () => [] });

const rightSetting = inject<any>("AnswerCardSetting");
const isExportMode = inject<any>("isExportMode");
const sortType = computed(() => rightSetting.value.sortType);
const BoxWidth = inject<any>("BoxWidth");

const attrs = useAttrs();

const shouldPaginate = computed(() => {
  return props.breakPoint && (props.breakPoint.start > 0 || props.breakPoint.end < 1);
});

const getAllRawBlocks = (): any[] => {
  const all: any[] = [];
  (childs.value || []).forEach((item: any) => {
    if (Array.isArray(item.block) && item.block.length > 0) {
      all.push(...item.block);
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
      const blocks = Array.isArray(item.block) ? item.block : [];

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
    if (Array.isArray(item.block) && item.block.length > 0) {
      item.block.forEach((b: any) => flat.push({ ...b }));
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

const getCurrentPageOptions = computed<OptionBlock[]>(() => {
  const allOptions = getAllOptions.value;
  if (!allOptions || allOptions.length === 0) return [];

  if (!shouldPaginate.value) return allOptions;

  const total = allOptions.length;
  const start = Number((props.breakPoint as any).start) || 0;
  const end = Number((props.breakPoint as any).end) || 0;

  const startIndex = Math.floor(start * total);
  let endIndex = Math.floor(end * total);
  if (end >= 0.999) endIndex = total;

  return allOptions.slice(startIndex, endIndex);
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

const generator = async (_el: any, it: OptionBlock, index: number) => {
  await nextTick();
  const prefix = it.displayPrefix ?? it.prefix ?? "";
  const lineCount = Number(it.lineCount || 0);
  const html = String(prefix) + "<br/>" + getItem().repeat(lineCount);
  data.value.splice(index, 1, html);
};

const getRawByGlobalIndex = (globalIndex: number) => {
  const allRaw = getAllRawBlocks();
  return allRaw[globalIndex] || null;
};

const getInfo = async (it: OptionBlock) => {
  const domId = `${it?.id || "brief"}_${it.__globalIndex}`;
  const el = await waitForElementById(domId);
  if (!el) return;

  await nextTick();
  await new Promise(r => requestAnimationFrame(r));

  setTimeout(async () => {
    const rect = await getPosition(attrs.pageBox as any, el as any, "none");
    const infoList = [
      Object.freeze({
        ...rect.percentage,
        pageOf: Number((attrs as any).pageOf) + 1,
      }),
    ];

    const raw = getRawByGlobalIndex(it.__globalIndex);
    if (raw) {
      raw.infoList = infoList;
    }

    (it as any).infoList = infoList;
  }, 100);
};

const regenerateAll = () => {
  const currentOptions = getCurrentPageOptions.value;
  currentOptions.forEach((it, index) => {
    generator(null, it, it.__globalIndex);
  });
};

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
.no-border-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  margin: 0;
  padding: 0;
}

/* 聚焦时也不出现边框高亮 */
.no-border-input :deep(.el-input__wrapper.is-focus) {
  border: 1px solid blue !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* 标题样式 */
.input-title :deep(.el-input__inner) {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  text-align: left;
}

/* 占位文字也变成黑色半透明 */
.no-border-input :deep(.el-input__inner::placeholder) {
  color: rgba(0, 0, 0, 0.4);
}
</style>
