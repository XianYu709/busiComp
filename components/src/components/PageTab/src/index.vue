<template>
  <div class="rounded-lg h-full" :class="props?.outClass">
    <div class="flex overflow-auto no-scrollbar my-pagetab-class">
      <div
        v-for="item in tabs"
        :key="item.value"
        class="my-pageTab-lable"
        :class="[
          tabActive == item.value
            ? 'color-#1A69E5   border-b-2px border-solid border-#1A69E5'
            : 'color-#000  ',
          tabWidth == 'auto' ? 'px-20px' : '0',
          props.tabs.length > 3 ? 'my-tab-item' : '',
        ]"
        :style="{ width: tabWidth }"
        @click="tabActive = item.value"
        v-hasPermi="item?.permission ?? []"
      >
        <!-- @click="handleTabClick(item.value)" -->
        {{ item.label }}
      </div>
    </div>
    <!-- 详细页面 -->
    <div
      class="rounded-lg rounded-t-0 shadow-md p-20px bg-white"
      :style="{
        height: isFull ? 'calc(100% - 98px)' : '',
        ...bodyStyle,
      }"
      v-loading="contentLoading">
      <slot :empty="Empty"></slot>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { computed, defineComponent, type CSSProperties } from "vue";

defineOptions({ name: "PageTab" });

const props = withDefaults(
  defineProps<{
    tabs: {
      permission?: any;
      label: string;
      value: string | number;
      activeIcon?: any;
      icon?: any;
    }[];
    tabWidth?: string;
    modelValue?: string | number;
    bodyStyle?: CSSProperties;
    outClass?: string;
    isFull?: boolean;
    contentLoading?: boolean;
  }>(),
  { tabs: () => [], tabWidth: "166px", isFull: false, contentLoading: false },
);

const emit = defineEmits(["Change", "update:modelValue"]);

const tabActive = computed({
  get() {
    return props.modelValue;
  },
  // 移除 set 方法，改为使用 handleTabClick 处理
  set(val: string | number) {
    // console.log("props.modelValue",props.modelValue)
    // console.log("valuelllllllll",val)
    // 只有当值真正改变时才触发事件
    if (props.modelValue !== val) {
      emit("update:modelValue", val);
      emit("Change", val);
    }
  },
});

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

<style lang="scss" scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  position: relative;
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
}
.prev,
.next {
  position: absolute;
  height: 100%;
  background: #000;
  top: 0;
  width: 20px;
}
.next {
  right: 0;
}
.my-tab-item {
  flex: 1;
}

.my-pageTab-lable {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Source Han Sans";
  font-size: 17px;
  font-weight: 600;
  flex-shrink: 0;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  height: 56px;
  margin-right: 8px;
  background-color: #fff;
  box-shadow: 0px -2px 4px 0px rgba(0,0,0,0.05);
  cursor: pointer;
}
</style>
