<template>
  <!--实交-->
  <div class="top">
    <div class="flex justify-between">
      <div class="flex">
        <img class="w-24px h-24px" src="../images/title.png" alt="" />
        <span class="ml-10px fw-500 color-#333 text-16px mt-4px">{{ actualLabel }}</span>
      </div>
      <div class="flex">
        <div @click="reIdentifyAll" class="flex cursor-pointer">
          <img class="w-20px h-20px" src="../images/cxsb.png" alt="" />
          <span class="color-#666 ml-5px text-14px mt-3px fw-400">全部重新识别</span>
        </div>
        <div class="flex cursor-pointer ml-10px">
          <img class="w-20px h-20px" src="../images/sx.png" alt="" />
          <span class="color-#666 ml-5px text-14px mt-3px fw-400">刷新</span>
        </div>
        <div class="flex cursor-pointer ml-10px">
          <img class="w-20px h-20px" src="../images/dc.png" alt="" />
          <span class="color-#666 ml-5px text-14px mt-3px fw-400">导出</span>
        </div>
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
    :style="{ width: '96%' }"
    class="ml-25px mr-25px"
    :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: '500' }">
    <el-table-column type="selection" align="center" min-width="60" />

    <el-table-column prop="studentName" label="姓名" min-width="150" align="center" />

    <el-table-column
      prop="studentCode"
      :label="computedLabel()"
      min-width="150"
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
      label="提交时间"
      min-width="180"
      align="center"
      show-overflow-tooltip
      sortable />

    <el-table-column fixed="right" label="操作" min-width="150" align="center">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="viewCard(scope.row)">
          人工解析
        </el-button>
      </template>
    </el-table-column>
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
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  message: {
    type: String,
  },
  examInfoId: {
    type: String,
  },
  subjectId: {
    type: [String, Number], // 兼容类型
  },
  recordId: {
    type: String,
  },
  // 接收父组件传来的数据列表
  listData: {
    type: Array,
    default: () => [],
  },
  actualLabel: {
    type: String,
    default: "",
  },
});
// 模拟数据 - 只在开发时使用
const mockData = [];

const str = ref("");
const computedLabel = () => {
  if (props.message === "exam") {
    str.value = "考号";
  } else if (props.message === "homework") {
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

const multipleTableRef = ref<InstanceType<typeof ElTable>>();

// const tableData = computed<User[]>(() => props.listData as User[]);
// 使用props.listData，如果为空则使用模拟数据
const tableData = computed<User[]>(() => {
  if (props.listData && props.listData.length > 0) {
    return props.listData as User[];
  } else {
    // 开发环境下使用模拟数据
    return mockData as User[];
  }
});

const state = reactive({
  page: 1,
  limit: 10,
  total: computed(() => props.listData.length),
});

// 前端分页逻辑
const tableDatas = () => {
  const start = (state.page - 1) * state.limit;
  const end = state.page * state.limit;
  return tableData.value.slice(start, end);
};

const filterTag = (value: string, row: User) => {
  return row.className === value;
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

// 查看答卷
const viewCard = (row: User) => {
  console.log("viewPaper");
  console.log(row.studentName);
  router.push({
    // path: "/card",
    path: "/Manual",
    query: {
      name: row.studentName,
    },
  });
};

// 全部重新识别
const reIdentifyAll = () => {
  if (tableData.value.length === 0) {
    console.log("没有数据可重新识别");
    return;
  }

  tableData.value.forEach(item => {
    console.log(item.studentName, " 重新识别");
    // 重新识别每一个
  });
};
</script>

<style scoped lang="scss">
.top {
  padding: 25px 25px 0 25px;
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
