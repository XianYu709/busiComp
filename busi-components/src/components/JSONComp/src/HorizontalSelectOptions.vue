<template>
  <div class="flex items-start flex-wrap cursor-pointer gap-2.5" v-loading="loading">
    <div
      v-for="item in items"
      :key="item.key"
      class="text-#666666 text-14px px-6px inDiv"
      :class="getClass(item.key)">
      <component :is="item.vNode" @click="!item.disabled && handleClick(item.key)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch, type PropType } from "vue";

type DependsItem = string | number | boolean | object | null | undefined;

const props = defineProps({
  field: {
    type: String,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false, // 多选模式
  },
  singleValueKeepArray: {
    type: Boolean,
    default: false, // 多选模式
  },
  depends: {
    type: Array as PropType<DependsItem[]>,
    default: () => [],
  },
  childKeys: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  options: Function,
});

const model = defineModel<Record<string, any>>({});
const items = ref<any>([]);
const loading = ref(true);

const getKey = (item, key) => {
  const vNode = typeof item === "function" ? item() : item;
  return vNode.props?.[key];
};

const getData = async () => {
  if (!props.options) return;
  try {
    loading.value = true;
    const result = await props.options(model);
    items.value = (result || []).map(it => {
      const vNode = typeof it === "function" ? it() : it;
      const key = getKey(vNode, "data-val");
      return { vNode: it, key, disabled: !key };
    });
  } finally {
    loading.value = false;
  }
};

let timeoutId;
watch(
  () =>
    props.depends.map(dep => {
      // string: 视为 model 字段依赖；非 string: 视为外部值依赖
      if (typeof dep === "string") return model.value?.[dep];
      return dep;
    }),
  () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      getData();
    }, 400);
  },
  { deep: true, immediate: true },
);

const getClass = key => {
  const value = model.value[props.field];
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.includes(key) ? ["active"] : [];
  }
  return value === key ? ["active"] : [];
};

const handleClick = value => {
  const field = props.field;
  let current = model.value[field];

  if (props.multiple) {
    if (!Array.isArray(current)) current = [];
    if (current.includes(value)) {
      current = current.filter(v => v !== value);
    } else {
      current.push(value);
    }
    model.value[field] = [...current];
  } else {
    model.value[field] = props.singleValueKeepArray ? [value] : value;
  }

  props.childKeys.forEach(item => {
    const [key, keyChild] = item.split(".");
    if (!key!.includes(value)) {
      delete model.value![keyChild!];
    }
  });
};

onBeforeMount(() => {
  timeoutId = null;
});
</script>

<style lang="scss" scoped>
.active {
  color: #0e5fc7;
  background: #e7eff9;
  border-radius: 4px;
}
.inDiv {
  line-height: 26px;
}
</style>
