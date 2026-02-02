<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps({
  paper: {
    type: String,
  },
  page: {
    type: Number,
    required: true,
  },
  position: {
    type: String,
  },
  pageSize: {
    type: Number,
  },
  hideMiddlePoint: {
    type: Boolean,
    default: true,
  },
});

// const front = ref(props.page % 2 !== 0);
const date = new Date();
const dateStr = ref("");
dateStr.value =
  "DEV 0.7" +
  "-" +
  Number(date.getMonth() + 1) +
  "-" +
  date.getDate() +
  " " +
  date.getHours() +
  ":" +
  date.getMinutes();

const isDev = computed(() => import.meta.env.VITE_APP_ENV == "development");

const pageNo = computed(() => props.page + 1); // 1-based

const hideLeft = computed(() => {
  if (!props.hideMiddlePoint) return false;

  if (props.paper === "A4_1") return false;

  if (props.paper === "A3_2") return pageNo.value % 2 === 0;

  if (props.paper === "A3_3") {
    const idx = (pageNo.value - 1) % 3; // 0,1,2
    return idx === 1 || idx === 2; // 第2页全隐藏；第3页隐藏左
  }

  return false;
});

const hideRight = computed(() => {
  if (!props.hideMiddlePoint) return false;

  if (props.paper === "A4_1") return false;

  if (props.paper === "A3_2") return pageNo.value % 2 === 1;

  if (props.paper === "A3_3") {
    const idx = (pageNo.value - 1) % 3;
    return idx === 0 || idx === 1;
  }

  return false;
});
</script>

<template>
  <!-- top -->
  <div v-if="props.position == 'top'" class="point" style="visibility: hidden">
    <div
      v-if="!hideLeft"
      style="background-color: #000000; width: 25px; height: 15px; float: left"
      id="topLeftPoint"></div>
    <div
      v-if="!hideRight"
      style="background-color: #000000; width: 25px; height: 15px; float: right"></div>
  </div>

  <!-- page number -->
  <div
    v-if="props.position == 'bottom'"
    class="absolute bottom-22px left-50% -transform-translate-x-50%"
    style="font-size: 11px; text-align: center; line-height: 15px; height: 15px">
    第{{ props.page + 1 }}页 共{{ props.pageSize }}页
  </div>

  <!-- bottom -->
  <div class="point" style="visibility: hidden">
    <div
      v-if="!hideLeft"
      style="
        background-color: #000000;
        width: 25px;
        height: 15px;
        display: inline-block;
        position: absolute;
        left: 0;
        bottom: 0;
      "
      id="bottomLeftPoint"></div>

    <!-- bottom center -->
    <div class="absolute bottom-0 left-50% -transform-translate-x-50% flex gap-3">
      <!-- <div v-for="item in props.page + 1" :key="item" class="w-15px h-15px bg-black"></div> -->
      <div class="w-15px h-15px bg-black"></div>
    </div>

    <div
      v-if="!hideRight"
      style="
        background-color: #000000;
        width: 25px;
        height: 15px;
        display: inline-block;
        position: absolute;
        right: 0;
        bottom: 0;
      "></div>
  </div>
  <!-- 调试标记 -->
  <div v-if="isDev" class="absolute right-0 bottom-27px text-12px">{{ dateStr }}</div>
</template>
