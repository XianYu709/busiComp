<template>
  <div>
    <div v-for="line in list" :key="line.field" class="flex items-center mb-2.5">
      <div
        class="mr-5 text-right text-14px flex-shrink-0 flex"
        :style="{
          width: props.labelWidth || '80px',
        }">
        <div class="pt-4px">
          {{ line.label }}
        </div>
      </div>
      <Options :="{ ...line }" v-model="filterModal" />
    </div>
  </div>
</template>

<script setup lang="ts" name="HorizontalSelect">
import { computed, type Component } from "vue";
import Options from "./HorizontalSelectOptions.vue";

type items = {
  body: Component & (() => Component);
};

type options = (model: any) => items[] & ((model: any) => Promise<items[]>);

type filterItem = {
  field: string;
  label: string;
  multiple: boolean;
  depends: string[];
  childKeys: string[];
  options: options;
};

export type corePropsType = {
  selectList: filterItem[];
  labelWidth: string;
};
const props = withDefaults(defineProps<corePropsType>(), {});

const filterModal = defineModel<any>();

const list = computed(() => props.selectList);
</script>

<style lang="scss" scoped></style>
