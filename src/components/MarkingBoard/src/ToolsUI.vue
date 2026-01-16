<template>
  <div
    ref="toolbarRef"
    class="select-none fixed left-50% top-65% flex w-230px pb-5px pt-7px rounded-7px items-center justify-evenly bg-#F5F7FA cursor-move shadow-2xl">
    <div v-for="it in bars">
      <ElTooltip :content="it.title" trigger="click">
        <img
          :src="active == it.name ? it.activeIcon : it.icon"
          class="w-26px h-26px cursor-pointer"
          @click="clickEvent(it.name)" />
      </ElTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElTooltip } from "element-plus";
import type { CanvasMarkingInstance } from "./useCanvasMarking";
import { nextTick, ref, watch } from "vue";
import { useDraggable } from "@sjjb/utils";

const props = defineProps<{
  canvasIns: CanvasMarkingInstance | null | undefined;
}>();

let original = import.meta.glob("../img/*.png", {
  eager: true,
  as: "url",
});

const images = Object.entries(original).reduce(
  (acc, [key, value]) => {
    const fileName = key.match(/([^/]+)\.\w+$/)?.[1];
    if (fileName) {
      acc[fileName] = value;
    }
    return acc;
  },
  {} as Record<string, string>,
);

const bars = [
  {
    name: "text",
    icon: images.text,
    activeIcon: images.text_active,
    title: "标注文字",
  },
  {
    name: "draw",
    icon: images.pencil,
    activeIcon: images.pencil_active,
    title: "自由标绘",
  },
  {
    name: "mark-right",
    icon: images.right,
    activeIcon: images.right_active,
    title: "正确",
  },
  {
    name: "mark-wrong",
    icon: images.wrong,
    activeIcon: images.wrong_active,
    title: "错误",
  },
  {
    name: "mark-half-right",
    icon: images.half_right,
    activeIcon: images.half_right_active,
    title: "半对",
  },
  {
    name: "clear",
    icon: images.clear,
    activeIcon: images.clear,
    title: "清空所有标注",
  },
];
const currentInstance = ref<CanvasMarkingInstance | null>();

const active = ref<any>("");
watch(
  () => props.canvasIns,
  () => {
    nextTick(() => {
      active.value = props.canvasIns && props.canvasIns.getCurrentMode();
    });
    currentInstance.value = props.canvasIns;
  },
  { immediate: true },
);

const clickEvent = (item: any) => {
  active.value = item;
  if (item == "clear") {
    currentInstance.value?.resetExcludeImg();
    active.value = "none";
    return;
  }
  currentInstance.value?.setMode(item);
};

const toolbarRef = ref<HTMLElement | null>(null);

useDraggable(toolbarRef);
</script>
