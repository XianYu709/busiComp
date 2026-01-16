<template>
  <div class="pb-10px" id="fillBlankQuestion" :class="props.breakPoint.start != 0 ? 'mt-10px' : ''">
    {{ breakPoint }}
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
          class="border flex relative fillBlank px-8px pt-5px"
          :id="it?.id"
          style="border-bottom: 1px solid #000"
          :style="{
            borderTop: index == 0 ? '1px solid #000' : 'none',
            borderBottom: it.hideBottomLine ? 'none' : '',
          }">
          <RightBox
            :showTopLine="it.showRitghtTop"
            v-if="$route.query?.reviewMethod == '2'"
            :key="index"
            v-model="it.step"
            :totalScore="it.score || 0"
            @complete="
              v => {
                getAllOptions[it.__globalIndex].scoreBoxList = v;
              }
            " />

          <Block
            :key="it.__globalIndex + rightSetting.lineType"
            :border="false"
            v-model="data[it.__globalIndex]"
            class="mb-5px"
            :class="it.lineCount && it.lineCount > 0 ? '' : 'h-170px'"
            @mount-done="() => getInfo(getAllOptions[it.__globalIndex])" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, ref, useAttrs, watch, type Ref } from "vue";
import Block from "../base/Block.vue";
import { makeResizableHeight } from "../../../../../../utils/src/makeResizableHeight";
import RightBox from "./RightBox.vue";
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
onMounted(() => {
  nextTick(() => {
    emits("end");
  });
  const divs = document.getElementsByClassName("fillBlank");
  for (let div of divs) {
    makeResizableHeight(div);
  }
});

const title = defineModel<any>("title");
const data = defineModel<any[]>("data", {
  default: () => [],
});

const childs = defineModel("childs", {
  default: [],
});

const rightSetting = inject<any>("AnswerCardSetting");
const isExportMode = inject<any>("isExportMode");
const sortType = computed(() => rightSetting.value.sortType);
const BoxWidth = inject<any>("BoxWidth");

// 判断是否需要分页
const shouldPaginate = computed(() => {
  return props.breakPoint && (props.breakPoint.start > 0 || props.breakPoint.end < 1);
});

// 获取所有选项（不分页）
const getAllOptions = computed(() => {
  if (!childs.value || childs.value.length === 0) return [];

  if (sortType.value === "smallFollow") {
    childs.value.forEach((item: any) => {
      if (item.block) {
        item.block.forEach((b: any, i) => {
          if (b.copyIndex) b.prefix = b.copyIndex;
          else b.copyIndex = b.prefix;
          if (i != item.block.length - 1) {
            b.hideBottomLine = true;
          }
          if (item.block.length > 1 && i != 0) {
            b.showRitghtTop = true;
          }
        });
      }
    });
  }
  if (sortType.value === "bigSingle") {
    childs.value.forEach((item: any, index: number) => {
      const big = index + 1;
      if (item.block) {
        item.block.forEach((b: any, i) => {
          const prefix = String(b.prefix).trim();
          const match = prefix.match(/^(.*?)\s*[\(\（](.*)[\)\）]$/);
          if (match) {
            b.prefix = `${big}(${match[2]})`;
          } else {
            b.prefix = `${big}`;
          }
          if (i != item.block.length - 1) {
            b.hideBottomLine = true;
          }
          if (item.block.length > 1 && i != 0) {
            b.showRitghtTop = true;
          }
        });
      }
    });
  }

  // 扁平化所有 block
  const allBlocks = [];
  childs.value.forEach(item => {
    if (item.block && item.block.length > 0) {
      allBlocks.push(...item.block);
    }
  });
  return allBlocks;
});

// 获取当前页面的选项（分页后）
const getCurrentPageOptions = computed(() => {
  const allOptions = getAllOptions.value;
  if (!allOptions || allOptions.length === 0) return [];

  // 无分页 → 返回全局带 index 的版本
  if (!shouldPaginate.value) {
    return allOptions.map((opt, i) => ({
      ...opt,
      __globalIndex: i,
    }));
  }

  const total = allOptions.length;
  const start = Number(props.breakPoint.start) || 0;
  const end = Number(props.breakPoint.end) || 0;

  const startIndex = Math.floor(start * total);
  let endIndex = Math.floor(end * total);

  if (end >= 0.99) endIndex = total;

  return allOptions.slice(startIndex, endIndex).map((opt, i) => {
    opt.__globalIndex = startIndex + i;
    return opt;
  });
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

const attrs = useAttrs();
const generator = async (el, it, index) => {
  await nextTick();
  const html = it.prefix + "<br/>" + getItem().repeat(it.lineCount);
  data.value.splice(index, 1, html);
};

const getInfo = async it => {
  const el = await waitForElementById(it.id);
  if (!el) return;

  await nextTick();
  await new Promise(r => requestAnimationFrame(r));
  setTimeout(async () => {
    const rect = await getPosition(attrs.pageBox, el, "none");
    it.infoList = [
      Object.freeze({
        ...rect.percentage,
        pageOf: Number(attrs.pageOf) + 1,
      }),
    ];
  }, 100);
};

// 重新生成所有当前页面的内容
const regenerateAll = () => {
  const currentOptions = getCurrentPageOptions.value;
  currentOptions.forEach((it, index) => {
    generator(null, it, index);
  });
};

watch(
  [
    () => rightSetting.value.lineType,
    () => getCurrentPageOptions.value,
    () => props.breakPoint,
    () => childs.value,
  ],
  () => {
    regenerateAll();
  },
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
