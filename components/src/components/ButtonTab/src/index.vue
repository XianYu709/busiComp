<template>
  <div v-if="props.type == 'group'" class="flex justify-center items-center tab-pan-box">
    <div
      v-for="item in props.items"
      :key="item.value"
      :class="value == item.value ? 'active' : 'default'"
      @click="value = item.value">
      {{ item.label }}
    </div>
  </div>
  <div v-if="props.type == 'single'" class="flex flex-wrap w-full tab-pan-box-single">
    <div
      v-for="item in props.items"
      :key="item.value"
      :type="value === item.value ? 'primary' : 'default'"
      plain
      class="text-center"
      :class="value == item.value ? 'active' : 'default'"
      @click="value = item.value">
      {{ item.label }}
    </div>

    <div v-if="props.items.length % 2 === 1" class="w-[calc(50%-4px)] m-1 invisible"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ name: "ButtonTab" });

type Item = { label: string; value: string | number };
type PropsType = { modelValue: string | number; items: Item[]; type?: "group" | "single" };

const props = withDefaults(defineProps<PropsType>(), { type: "group" });
const emit = defineEmits(["onChange", "update:modelValue"]);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: string | number) {
    emit("update:modelValue", val);
    emit("onChange", val);
  },
});
</script>

<style lang="scss" scoped>
.tab-pan-box {
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  font-family:
    Source Han Sans-Medium
    sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #666;
  text-align: center;
  height: 34px;

  > div {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.active {
      background: #E7EFF9;
      color: #0e5fc7;
      font-weight: 600;
    }

    &.default {
      background: #F5F6F7;
      color: #666;
    }
  }
}
.tab-pan-box-single {
  font-family:
    Source Han Sans,
    sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  margin-bottom: -12px;
  justify-content: space-between;
  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(50% - 8px);
    border-radius: 4px;
    height: 32px;
    cursor: pointer;
    margin-bottom: 10px;
    border: 1px solid #e8e8e8;

    &.active {
      background: #e7eff9;
      color: #0e5fc7;
    }

    &.default {
      color: #666;
    }
  }
}
</style>
