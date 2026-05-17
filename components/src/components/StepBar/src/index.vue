<template>
  <div class="flex">
    <div
      v-for="(item, index) in props.items"
      class="flex flex-col items-center item"
      :class="{ active: index == value }">
      <div class="dot"></div>
      <div v-if="index != props.items.length - 1" class="line"></div>
      <div v-if="value == index" class="item-title">{{ item.startTitle }}</div>
      <div v-else-if="Number(value) < index" class="item-title">{{ item.notStartedTitle }}</div>
      <div v-else class="item-title">{{ item.endTitle }}</div>
      <div class="item-desc">{{ item.desc }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "StepBar" });

type Item = {
  id: number | string;
  startTitle: string;
  notStartedTitle: string;
  endTitle: string;
  desc: string;
};
type PropsType = { items: Item[] };

const props = withDefaults(defineProps<PropsType>(), {});

const value = defineModel();
</script>

<style lang="scss" scoped>
.item {
  width: 230px;
  position: relative;

  .dot {
    border-radius: 50%;
    border: 2px solid #0e5fc7;
    height: 5px;
    width: 5px;
  }

  .line {
    position: absolute;
    right: -100px;
    top: 4px;
    width: 200px;
    height: 2px;
    background: #0e5fc7;
  }
  .item-title {
    font-family:
      Source Han Sans,
      Source Han Sans;
    font-weight: 400;
    font-size: 16px;
    color: #1f1f1f;
    line-height: 24px;
    text-align: center;
    font-style: normal;
    text-transform: none;
    margin: 5px 0;
  }
  .item-desc {
    font-family:
      Source Han Sans,
      Source Han Sans;
    font-weight: 400;
    font-size: 14px;
    color: #666666;
    line-height: 20px;
    text-align: center;
    font-style: normal;
    text-transform: none;
  }
  &.active {
    .dot {
      background: #0e5fc7; // 实心
    }
    .item-title {
      color: #0e5fc7; // 高亮文字颜色
    }
  }
}
</style>
