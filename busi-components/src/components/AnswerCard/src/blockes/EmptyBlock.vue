<template>
  <div class="bg-[#fff] px-10px py-10px page" :style="pageStyle">
    <div class="relative h-full">
      <AnchorPoint
        :paper="paperSize"
        :page="page"
        position="top"
        :page-size="pageSize"
        :show-page-number="false" />

      <div
        class="mt-25px px-10px bg-[#f5f5f5]"
        :style="{
          height: 'calc(100% - 70px)',
          border: contentBorder ? '1px solid #000' : '1px solid transparent',
        }">
        <div class="empty-block-shell">
          <div class="empty-block-message">请勿在此区域作答</div>
        </div>
      </div>

      <AnchorPoint
        :paper="paperSize"
        :page="page"
        position="bottom"
        :page-size="pageSize"
        :show-page-number="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import AnchorPoint from "./AnchorPoint.vue";

const props = withDefaults(
  defineProps<{
    paperSize?: "A4_1" | "A3_2" | "A3_3";
    page: number;
    pageSize?: number;
    contentBorder?: boolean;
  }>(),
  {
    paperSize: "A4_1",
    pageSize: 1,
    contentBorder: false,
  },
);

const contentWidthMap = {
  A4_1: 800,
  A3_2: 800,
  A3_3: 530,
} as const;

const pageStyle = computed<CSSProperties>(() => {
  const width = contentWidthMap[props.paperSize || "A4_1"];
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
  };
});
</script>

<style scoped>
.empty-block-shell {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.empty-block-message {
  color: #999;
  font-size: 64px;
  line-height: 1.2;
  font-weight: 400;
  text-align: center;
  letter-spacing: 2px;
  word-break: break-all;
}
</style>
