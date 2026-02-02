<template>
  <div class="top">
    <div class="flex justify-between">
      <div class="flex">
        <img class="w-24px h-24px" src="../images/title.png" alt="" />
        <!-- 学号重复 -->
        <span class="ml-10px fw-500 color-#333 text-16px mt-4px">{{ abnormalLabel }}</span>
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
    <div class="mt-20px flex">
      <el-input
        placeholder="请输入姓名/学号"
        class="w-260px h-36px mb-20px bg-#f5f6f7 border-none"
        style="width: 260px"
        :suffix-icon="Search"></el-input>
      <div class="ml-10px">
        <el-radio
          :model-value="showStudentImage"
          :label="true"
          size="large"
          @click="handleRadioClick">
          考生图像
        </el-radio>
      </div>
    </div>
  </div>

  <el-table
    border
    ref="multipleTableRef"
    :data="tableDatas()"
    style="width: 96%"
    class="ml-25px mr-25px"
    :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: '500' }">
    <el-table-column type="selection" align="center" min-width="55" />

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

    <el-table-column property="status" label="状态" min-width="100" align="center" />

    <el-table-column
      property="createTime"
      label="解析时间"
      min-width="180"
      align="center"
      show-overflow-tooltip
      sortable />

    <el-table-column fixed="right" label="操作" min-width="150" align="center">
      <template #default="scope">
        <el-space size="2" spacer="|">
          <el-button link type="primary" size="small" @click="viewCard(scope)">查看答卷</el-button>
          <el-button link type="primary" size="small">删除</el-button>
        </el-space>
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
      v-model:page-size="state.limit"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElTable } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

const router = useRouter();
const showStudentImage = ref(false); // 可以是 true/false 或具体的值

// 模拟数据
const mockData = [];

const handleRadioClick = (event: Event) => {
  event.preventDefault();
  showStudentImage.value = !showStudentImage.value;
};

// --- 修改点 1: 接收 listData ---
const props = defineProps({
  message: {
    type: String,
  },
  examInfoId: {
    type: String,
  },
  subjectId: {
    type: [String, Number],
  },
  recordId: {
    type: String,
  },
  // 接收父组件传来的列表
  listData: {
    type: Array,
    default: () => [],
  },
  abnormalLabel: {
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
  createTime: string;
}

// --- 修改点 2: 移除模拟数据和 API 调用 ---
// 直接使用 computed 映射 props.listData
// const tableData = computed(() => props.listData);
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

const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const state = reactive({
  page: 1,
  limit: 10,
  // 总数直接取数组长度
  total: computed(() => props.listData.length),
});

// 前端分页逻辑
const tableDatas = () => {
  const start = (state.page - 1) * state.limit;
  const end = state.page * state.limit;
  return tableData.value.slice(start, end);
};

const reIdentifyAll = () => {
  console.log("全部重新识别");
};

const handleCurrentChange = newPage => {
  console.log("当前页:", newPage);
  state.page = newPage;
};

const handleSizeChange = newSize => {
  console.log("每页大小:", newSize);
  state.limit = newSize;
};

const filterTag = (value: string, row: User) => {
  const rowClass = row.className || "其他班";
  return rowClass === value;
};

// 查看答卷
const viewCard = scope => {
  console.log("查看答卷:", scope);
  router.push({
    // path: "/exam-center/viewCard",
    path: "/ViewCard",
    query: {
      id: scope.row.studentId || scope.row.studentCode,
    },
  });
};

// 监听数据变化，确保当数据更新时班级筛选器也会更新
watch(
  () => props.listData,
  () => {
    console.log("数据更新，重新生成班级筛选器");
  },
  { deep: true },
);
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
