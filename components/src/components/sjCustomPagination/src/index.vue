<template>
  <div class="flex flex-justify-between flex-items-center p-6 bg-white rounded-b-10px">
    <div class="text-content text-text-content flex-shrink-0">共 {{ total }} 条</div>
    <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="pageSizes" :total="total"
      :pager-count="pagerCount" :layout="layout" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </div>
</template>

<script setup lang="ts">
  // 定义组件属性
  interface PaginationProps {
    total: number;
    currentPage: number;
    pageSize: number;
    pageSizes?: number[];
    pagerCount?: number;
    layout?: string;
  }

  // 定义事件
  interface PaginationEmits {
    (e: "sizeChange", value: number): void;
    (e: "currentChange", value: number): void;
  }

  // 接收属性
  const props = withDefaults(defineProps < PaginationProps > (), {
    pageSizes: () => [10, 20, 50, 100],
    pagerCount: 11,
    layout: "prev, pager, next, sizes",
  });

  // 定义事件-
  const emit = defineEmits < PaginationEmits > ();

  // 处理每页条数变化
  const handleSizeChange = (val: number) => {
    emit("sizeChange", val);
  };

  // 处理当前页变化
  const handleCurrentChange = (val: number) => {
    emit("currentChange", val);
  };
</script>

<style scoped lang="scss">
  .el-pagination {
    display: flex;
    align-items: center;
    margin-left: auto;
    --el-pagination-font-size: 14px;
    --el-pagination-bg-color: transparent;
    --el-pagination-text-color: #666;
    --el-pagination-border-radius: 4px;
    --el-text-color-regular: #666;

    :deep(.btn-prev) {
      border: 1px solid #e8e8e8;
      color: #666666 !important;

      &.is-active {
        border: 1px solid #0e5fc7;
        color: #0e5fc7 !important;
      }

      &:hover {
        border: 1px solid #0e5fc7;
        color: #0e5fc7 !important;
      }
    }

    :deep(.btn-next) {
      border: 1px solid #e8e8e8;
      color: #666666 !important;

      &.is-active {
        border: 1px solid #0e5fc7;
        color: #0e5fc7 !important;
      }

      &:hover {
        border: 1px solid #0e5fc7;
        color: #0e5fc7 !important;
      }
    }

    :deep(.el-pager li) {
      min-width: 32px;
      height: 32px;
      line-height: 32px;
      margin: 0 2px;
      border-radius: 4px;
      border: 1px solid #e8e8e8;
      color: #666666 !important;

      &.is-active {
        border: 1px solid #0e5fc7;
        color: #0e5fc7 !important;
      }

      &:hover {
        border: 1px solid #0e5fc7;
        color: #0e5fc7 !important;
      }
    }

    .btn-prev,
    .btn-next {
      min-width: 32px;
      height: 32px;
      line-height: 32px;
      margin: 0 2px;
      border-radius: 4px;
    }
  }
</style>