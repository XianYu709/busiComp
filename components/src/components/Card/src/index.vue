<template>
  <div
    class="rounded-lg shadow-md p-20px bg-white relative"
    :class="isFull ? 'h-full' : ''"
    :style="{
      paddingBottom: props.showBottomImg ? '200px' : '20px',
      boxSizing: 'border-box',
      ...bodyStyle,
    }">
    <div
      class="flex justify-between mb-20px"
      v-if="title || $slots.title"
      :class="props.showTitleBottomLine ? 'title-bottom-border' : ''"
      :style="titleStyle">
      <div class="flex items-center">
        <slot name="title">
          <!-- <img
            v-if="props.showIcon"
            class="w-24px h24px"
            src="@apps/academic-center/assets/icons/teaching-research/plan_detail-title.png"
            alt="" /> -->
          <div class="title">
            {{ props.title }}
          </div>
          <el-tooltip v-if="props.tip" placement="right" effect="light">
            <img
              class="w-16px h-16px cursor-pointer"
              src="@apps/academic-center/assets/icons/teaching-research/paln_question.png"
              alt="" />
            <template #content>
              <div class="text-12px leading-20px max-w-300px">
                <div
                  v-for="(line, index) in tipLines"
                  :key="index"
                  class="mb-4px last:mb-0 break-words">
                  {{ line }}
                </div>
              </div>
            </template>
          </el-tooltip>
        </slot>
      </div>
      <div>
        <slot name="action">
          <ActionBar v-if="props.actions" :actions="actions" />
        </slot>
        <div class="flex items-center">
          <div class="title" v-if="props.rightTitle">{{ props.rightTitle }}</div>
        </div>
      </div>
    </div>
    <slot :empty="Empty"></slot>
    <img
      v-if="props.showBottomImg"
      src="../src/img/card-bottom.png"
      class="w-200px h-200px absolute bottom-0 left-50% -transform-translate-x-50%" />
  </div>
</template>

<script setup lang="tsx">
import { ActionBar, type actionType } from "@sjjb/components";
import { computed, defineComponent, type CSSProperties } from "vue";

type boxProps = {
  title?: string;
  actions?: actionType[];
  tip?: string;
  bodyStyle?: CSSProperties;
  titleStyle?: CSSProperties;
  showIcon?: boolean;
  showTitleBottomLine?: boolean;
  showBottomImg?: boolean;
  isFull?: boolean;
  rightTitle?: string;
};

const props = withDefaults(defineProps<boxProps>(), {
  actions: [],
  title: "",
  rightTitle: "",
  showIcon: true,
  showBottomImg: false,
  showTitleBottomLine: false,
  isFull: false,
});

const tipLines = computed(() =>
  props.tip
    .split("\n")
    .map(t => t.trim())
    .filter(Boolean),
);

import emptyImg from "@apps/academic-center/assets/images/empty.png";
const Empty = defineComponent({
  name: "Empty",
  setup() {
    return () => (
      <div class='flex justify-center flex-col items-center  absolute top-50% left-50% transform-translate-x-[-50%] transform-translate-y-[-50%] '>
        <img src={emptyImg} class='w-300px' />
      </div>
    );
  },
});
</script>

<style scoped>
.title {
  font-family:
    Source Han Sans,
    Source Han Sans;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin: 0 10px;
}

.title-bottom-border {
  padding-bottom: 15px;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    left: -20px;
    right: -20px;
    bottom: 0px;
    border-bottom: 1px solid #ebeef5;
  }
}
</style>

<style>
.el-popper.is-customized {
  /* Set padding to ensure the height is 32px */
  padding: 6px 12px;
  background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
}

.el-popper.is-customized .el-popper__arrow::before {
  background: linear-gradient(45deg, #b2e68d, #bce689);
  right: 0;
}
</style>
