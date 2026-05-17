<template>
  <ElInput :prefix-icon="Search"  :="$attrs" />
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { ElInput } from "element-plus";

defineOptions({ name: "StyleInput" });
</script>
<style scoped>
:deep(.el-input__wrapper) {
  background: #f5f6f7;
  box-shadow: none;
}
</style>
