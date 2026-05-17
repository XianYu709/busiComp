<template>
  <ElDatePicker
    type="daterange"
    placeholder="请选择时间"
    clearable
    :="$attrs"
    style="width: 100%" />
</template>

<script setup lang="ts">
import { ElDatePicker } from "element-plus";
defineOptions({ name: "StyleDateTimeRange", styleTime: "" });
</script>
<style scoped lang="scss">
:deep(.el-input__wrapper) {
  background-color: transparent !important;
  background: #f5f6f7 !important;
  box-shadow: none !important;
}
</style>
