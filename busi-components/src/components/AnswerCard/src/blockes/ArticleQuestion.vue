<template>
  <div>
    <div class="group relative w-full">
      <div
        class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex flex-col align-start z-10">
        <!-- <div>
          <el-button @click="visible = true" text>设置作文</el-button>
        </div> -->
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
          id="articleContent"
          ref="articleContentRef"
          class="py-5px w-full"
          :class="{
            'mt-10px': props.breakPoint.start != 0,
            border: articleSetting.questionBorder,
          }">
          <div
            v-if="
              props.breakPoint.start == 0 &&
              articleSetting.showQuestionDesc &&
              articleSetting.questionDesc
            "
            class="article-question-desc leading-28px"
            :class="{
              'px-10px': articleSetting.questionBorder,
            }"
            v-html="articleSetting?.questionDesc || ''"></div>
          <!-- <Block
            v-if="!isExportMode && props.breakPoint.start == 0"
            class="mt-5px mx-10px"
            :border="false"
            v-model="articleSetting.questionDesc" /> -->
          <div class="flex justify-center w-full">
            <div class="composition-grid my-10px" :style="{ lineHeight: lineHeightPx }">
              <div
                v-for="rowIndex in visibleRows"
                :key="rowIndex"
                class="grid-row"
                :style="{ marginTop: rowIndex === visibleRows[0] ? '0' : lineHeightPx }">
                <div
                  v-for="colIndex in cols"
                  :key="colIndex"
                  class="grid-cell"
                  :style="{
                    width: widthHeight[0] + 'px',
                    height: widthHeight[1] + 'px',
                    borderRight: colIndex === cols ? '1px solid black' : 'none',
                  }"></div>
              </div>

              <div class="word-marks">
                <span
                  v-for="mark in wordMarks"
                  :key="mark"
                  class="word-mark"
                  :style="getWordMarkStyle(mark)">
                  <span>{{ mark }}</span>
                  <i
                    style="
                      position: absolute;
                      top: 0px;
                      right: -12px;
                      display: inline-block;
                      width: 0;
                      height: 0;
                      border-width: 7px 4px 0 4px;
                      border-style: solid;
                      border-color: #000 transparent transparent transparent;
                    "></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="visible" width="600" title="编辑" destroy-on-close>
      <ArticleSettingView v-model="form" />
      <div class="flex justify-center">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="visible = false">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="tsx" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElButton, ElInput } from "element-plus";
import ArticleSettingView from "./ArticleSettingView.vue";
import Block from "../base/Block.vue";

const props = defineProps({
  breakPoint: {
    type: Object,
    default: () => ({
      start: 0,
      end: 0,
    }),
  },
});

const emits = defineEmits(["delete", "end", "repaginate"]);

onMounted(async () => {
  await nextTick();
  await new Promise(r => requestAnimationFrame(r));
  emits("end");
});

const hasBreakPoint = computed(() => {
  const { start, end } = props.breakPoint || {};
  return !(Number(start) === 0 && Number(end) === 0);
});

const visible = ref(false);
const title = defineModel<any>("title");
const articleTitle = defineModel<any>("articleTitle");
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

const form = defineModel<any>("articleSetting", {
  type: Object,
  default: {
    wordCount: 600,
    wordMarkInterval: 100,
    wordMarkType: "every",
    minWordCount: 10,
    gridSize: "较大",
    lineHeight: "1mm",
  },
});

watch(
  () => form.value,
  () => emits("repaginate"),
  { deep: true },
);

// 格子大小映射
const gridSizeMap = {
  紧凑: [30, 35],
  适中: [35, 35],
  标准: [35.5, 38],
  较大: [39, 38],
};

const lineHeightMap = {
  "0.5mm": "5px",
  "1mm": "6.25px",
  "1.5mm": "7.5px",
};

const widthHeight = computed(() => gridSizeMap[form.value.gridSize]);
const lineHeightPx = computed(() => lineHeightMap[form.value.lineHeight]);

const containerWidth = ref(0);
const articleContentRef = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  const container = articleContentRef.value;
  if (!container) return;

  resizeObserver = new ResizeObserver(entries => {
    containerWidth.value = entries[0].contentRect.width;
    emits("repaginate");
  });

  resizeObserver.observe(container);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

// —— 列数 ——
const cols = computed(() => {
  const cellWidth = widthHeight.value?.[0] ?? 35;
  return containerWidth.value > 0 ? Math.floor(containerWidth.value / cellWidth) : 0;
});

// —— 总行数 ——
const rows = computed(() => (cols.value ? Math.ceil(form.value.wordCount / cols.value) : 0));

const visibleRows = computed(() => {
  const total = rows.value;
  if (!total) return [];

  const startPct = Number(props.breakPoint.start || 0);
  const endPct = Number(props.breakPoint.end || 0);

  if (startPct === 0 && endPct === 0) {
    return Array.from({ length: total }, (_, i) => i);
  }

  if (startPct === 0 && endPct > 0) {
    const endIndex = Math.floor(total * endPct);
    return Array.from({ length: endIndex }, (_, i) => i);
  }

  if (startPct > 0 && endPct === 0) {
    const startIndex = Math.floor(total * startPct);
    return Array.from({ length: total - startIndex }, (_, i) => startIndex + i);
  }

  if (startPct > 0 && endPct > 0) {
    const startIndex = Math.floor(total * startPct);
    const endIndex = Math.floor(total * endPct);
    return Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
  }

  return [];
});

const wordMarks = computed(() => {
  if (form.value.wordMarkType === "every") {
    const arr = [];
    for (
      let i = form.value.wordMarkInterval;
      i <= form.value.wordCount;
      i += form.value.wordMarkInterval
    ) {
      arr.push(i);
    }
    return arr;
  }
  if (form.value.wordMarkType === "min") {
    return [form.value.minWordCount];
  }
  return [];
});

function getWordMarkStyle(mark: number) {
  if (!cols.value) return {};

  const totalRows = rows.value;
  const offsetRow = visibleRows.value[0] || 0;

  const row = Math.floor((mark - 1) / cols.value);
  const col = (mark - 1) % cols.value;

  if (row < offsetRow || row >= offsetRow + visibleRows.value.length) {
    return { display: "none" };
  }

  const rowInPage = row - offsetRow;

  const top = rowInPage * (widthHeight.value[1] + parseFloat(lineHeightPx.value)) - 1.5;

  return {
    position: "absolute",
    top: `${top}px`,
    left: `${col * widthHeight.value[0]}px`,
    fontSize: "8px",
    color: "red",
  };
}
</script>

<style lang="scss" scoped>
.border {
  border: 1px solid black;
  box-sizing: border-box;
}

.no-border-input :deep(.el-textarea__inner) {
  box-shadow: none !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  margin: 0;
  padding: 0;
  resize: none;
}

.input-title :deep(.el-textarea__inner) {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  text-align: left;
}

.input-articleTitle :deep(.el-input__inner) {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  text-align: center;
  padding-right: 70px;
  border-bottom: 1px solid black;
}

.composition-grid {
  position: relative;
  display: inline-block;
}

.grid-row {
  display: flex;
}

.grid-cell {
  border: 1px solid black;
  box-sizing: border-box;
}

.word-marks {
  position: absolute;
  top: -5px;
  left: 0;
}

.article-question-desc {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
