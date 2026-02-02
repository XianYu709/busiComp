<template>
  <div class="top">
    <div class="flex justify-between">
      <div class="flex">
        <img class="w-24px h-24px" src="../images/title.png" alt="" />
        <!-- 重复扫描 -->
        <span class="ml-10px fw-500 color-#333 text-16px mt-4px">{{ repeatedLabel }}</span>
      </div>
      <div class="flex cursor-pointer">
        <img class="w-20px h-20px" src="../images/dc.png" alt="" />
        <span class="color-#666 ml-5px text-14px mt-3px fw-400">导出</span>
        <!-- <el-button type="primary" plain>导出</el-button>  -->
      </div>
    </div>
    <div class="mt-20px">
      <el-input
        placeholder="请输入姓名/学号"
        class="w-260px h-36px mb-20px bg-#f5f6f7 border-none"
        style="width: 260px"
        :suffix-icon="Search"></el-input>
    </div>
  </div>

  <el-table
    border
    ref="multipleTableRef"
    :data="tableDatas()"
    style="width: 96%"
    class="ml-25px mr-25px"
    :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: '500' }">
    <el-table-column prop="studentName" label="姓名" width="200" align="center" />

    <el-table-column
      prop="studentCode"
      :label="computedLabel()"
      width="200"
      align="center"
      sortable />
    <el-table-column property="schoolName" label="学校" min-width="100" align="center" />
    <el-table-column
      prop="className"
      label="班级"
      min-width="100"
      align="center"
      :filters="classFilters"
      :filter-method="filterTag"
      filter-placement="bottom-end">
      <template #default="scope">
        <el-tag>{{ scope.row.className || "其他班" }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column
      prop="createTime"
      label="解析时间"
      width="auto"
      align="center"
      show-overflow-tooltip />
  </el-table>

  <div class="pagination" style="padding: 25px">
    <el-pagination
      :page-sizes="[10, 20, 30, 40]"
      :background="true"
      layout="total, ->, prev, pager, next, sizes"
      :total="state.total"
      v-model:current-page="state.page"
      v-model:page-size="state.limit" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { ElTable } from "element-plus";
import { Search } from "@element-plus/icons-vue";

// 定义 Props
const props = defineProps({
  message: {
    type: String,
    default: "homework",
  },
  recordId: {
    type: String,
    default: "",
  },
  subjectId: {
    type: Number,
    default: 1,
  },
  // --- 修改点 1: 新增接收数据的 prop ---
  listData: {
    type: Array,
    default: () => [],
  },
  repeatedLabel: {
    type: String,
    default: "",
  },
});

const str = ref("");
const computedLabel = () => {
  if (props.message == "exam") {
    str.value = "考号";
  } else if (props.message == "homework") {
    str.value = "学号";
  }
  return `${str.value}`;
};

interface User {
  studentName: string;
  studentCode: string;
  className: string;
  createTime: string;
}

const filterTag = (value: string, row: User) => {
  return row.className === value;
};

const multipleTableRef = ref<InstanceType<typeof ElTable>>();

// --- 修改点 2: 数据源改为 computed ---
const tableData = computed<User[]>(() => props.listData as User[]);

const state = reactive({
  page: 1,
  limit: 10,
  // --- 修改点 3: total 改为动态计算 ---
  total: computed(() => props.listData.length),
});

// 前端分页逻辑
const tableDatas = () => {
  const start = (state.page - 1) * state.limit;
  const end = state.page * state.limit;
  return tableData.value.slice(start, end);
};
// 计算班级筛选器
const classFilters = computed(() => {
  // 获取所有不重复的班级，并按数字排序
  const uniqueClasses = Array.from(
    new Set(tableData.value.map(item => item.className || "其他班")),
  ).sort((a, b) => {
    if (a === "其他班") return 1;
    if (b === "其他班") return -1;
    // 尝试提取数字进行排序
    const numA = parseInt(a.match(/\d+/)?.[0] || "0");
    const numB = parseInt(b.match(/\d+/)?.[0] || "0");
    return numA - numB;
  });

  // 转换为 Element Plus 筛选器格式
  return uniqueClasses.map(cls => ({
    text: cls,
    value: cls,
  }));
});
</script>

<style scoped lang="scss">
.top {
  padding: 25px 25px 0px 25px;
}

.border-none {
  :deep(.el-input__wrapper) {
    background: #f5f6f7;
    box-shadow: none !important;
    border: none !important;
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-input__wrapper:hover) {
    box-shadow: none !important;
    border: none !important;
  }
}
</style>
