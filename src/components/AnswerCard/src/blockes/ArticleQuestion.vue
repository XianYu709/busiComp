<template>
  <div>
    <div class="group relative w-full">
      <div
        class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex flex-col align-start z-10">
        <div>
          <el-button @click="visible = true" text>设置作文</el-button>
        </div>
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
          id="articleContent"
          class="border py-5px"
          :class="props.breakPoint.start != 0 ? 'mt-10px' : ''">
          <div v-if="props.breakPoint.start == 0" class="flex w-full items-center px-10px">
            <div class="w-60px">题目：</div>
            <el-input
              class="no-border-input input-articleTitle"
              v-model="articleTitle"
              style="width: 90%"></el-input>
          </div>

          <div class="flex justify-center">
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
                  {{ mark }}
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
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  const container = document.getElementById("articleContent");
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

  return {
    position: "absolute",
    top: `calc(${rowInPage} * (${widthHeight.value[1]}px + ${lineHeightPx.value}))`,
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

.no-border-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  margin: 0;
  padding: 0;
}

.input-title :deep(.el-input__inner) {
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
</style>
