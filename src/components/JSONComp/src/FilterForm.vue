<template>
  <div class="flex my-8px" v-loading="filterLoading || false">
    <component
      v-for="item in [...filterList]"
      :key="item.field"
      v-model="filterModal[item.field]"
      v-bind="normalizeProps(item.props)"
      @change="handleChange(item.field, $event)"
      :is="h(item.component, {}, item.slots)" />
  </div>
</template>

<script setup lang="ts" name="FilterForm">
import { h, type Component } from "vue";

const emit = defineEmits<{
  change: [field: string, value: any]
}>()

type filterItem = {
  field: string;
  component: Component;
  props?: Record<string, any>;
  slots?: Record<string, any>;
};

export type corePropsType = {
  filterLoading?: boolean;
  filterList: filterItem[];
};
withDefaults(defineProps<corePropsType>(), {});

const filterModal = defineModel<any>();

function normalizeProps(props: any) {
  if (props?.options && typeof props.options === "object" && "value" in props.options) {
    return {
      ...props,
      options: props.options.value,
    };
  }
  return props;
}

const handleChange = (field: string, value: any) => {
  emit('change', field, value)
}
</script>

<style lang="scss" scoped></style>
