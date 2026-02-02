<template>
  <div class="top">
    <div class="flex justify-between">
      <div class="flex">
        <img class="w-24px h-24px" src="../images/title.png" alt="" />
        <!-- 缺少作业 -->
        <span class="ml-10px fw-500 color-#333 text-16px mt-4px">{{ lackLabel }}</span>
      </div>
      <div class="flex">
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
    style="width: 96%"
    class="ml-25px mr-25px"
    :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: '500' }">
    <!-- <el-table-column type="selection" align="center" min-width="55" /> -->

    <el-table-column property="studentName" label="姓名" min-width="100" align="center" />

    <el-table-column
      property="studentCode"
      :label="computedLabel()"
      min-width="100"
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

    <el-table-column fixed="right" label="操作" width="auto" align="center">
      <template #default="scope">
        <text class="text-12px color-#0052D9 cursor-pointer" @click="uploadImage(scope.row)">
          上传图像
        </text>
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

// --- 修改点 1: 接收 listData ---
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
  lackLabel: {
    type: String,
    default: "",
  },
});

const message = ref(props.message);

const str = ref("");
const computedLabel = () => {
  if (message.value == "exam") {
    str.value = "考号";
  } else if (message.value == "homework") {
    str.value = "学号";
  }
  return `${str.value}`;
};

interface User {
  studentName: string;
  studentCode: string;
  className: string;
  status: string;
  id: string;
}

const multipleTableRef = ref<InstanceType<typeof ElTable>>();

const mockData = [
  // {
  //   studentName: "张三",
  //   studentCode: "20230001",
  //   class: "1班",
  //   createTime: "2024-01-15 09:30:25",
  //   id: "1",
  // },
];

// --- 修改点 2: 数据源改为 computed 监听 props ---
const tableData = computed<User[]>(() => {
  if (props.listData && props.listData.length > 0) {
    return props.listData as User[];
  } else {
    // 开发环境下使用模拟数据
    return [] as User[];
  }
});
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

const state = reactive({
  page: 1,
  limit: 10,
  // 总条数直接取数组长度
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

// 上传图像
const uploadImage = () => {
  router.push("/uploadImage");
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
