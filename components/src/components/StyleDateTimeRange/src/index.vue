<template>
  <ElDatePicker placeholder="请选择查找时间" v-model="styleTime" :="$attrs" style="width: 100%" />
  <!-- :prefix-icon="Search" -->
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { ElDatePicker } from "element-plus";
import { ref } from "vue";

const styleTime = ref("")

defineOptions({ name: "StylePicker", styleTime: "" });
</script>
<style scoped>
.el-input__wrapper {
  background-color: transparent !important;
  background: #f5f6f7 !important;
  box-shadow: none !important;
}
</style>
