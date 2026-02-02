<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
    <!-- 顶部导航栏 -->
    <div
      class="h-14 bg-white border-b flex items-center justify-between px-5 shadow-sm shrink-0 z-10">
      <div class="flex items-center gap-4">
        <div
          class="flex items-center text-gray-600 cursor-pointer hover:text-blue-500 transition"
          @click="handleBack">
          <el-icon class="mr-1"><ArrowLeft /></el-icon>
          <span class="text-sm">返回</span>
        </div>
        <div class="h-4 w-px bg-gray-300 mx-2"></div>
        <span class="font-bold text-gray-800">查看答题卡</span>
      </div>

      <div class="flex gap-3">
        <el-button-group>
          <el-button size="default" @click="prevPaper" :disabled="isFirstPaper">上一份</el-button>
          <el-button size="default" @click="nextPaper" :disabled="isLastPaper">下一份</el-button>
        </el-button-group>
        <el-button type="primary" size="default" @click="openAssignDrawer">分配考生</el-button>
      </div>
    </div>

    <!-- 主体内容区 + 右侧弹出层容器 -->
    <div class="flex-1 flex overflow-hidden bg-white relative">
      <!-- 原主体内容（答题卡+题目区） -->
      <div class="flex-1 flex overflow-hidden">
        <!-- 答题卡图片预览区 -->
        <div class="flex-1 flex flex-col border shadow-sm relative z-0 m-5 overflow-hidden">
          <!-- 图片操作工具栏 -->
          <div class="h-10 border-b flex items-center justify-between px-4 bg-gray-50 select-none">
            <div class="flex items-center gap-4 text-gray-600 mr-4">
              <span class="text-xs text-gray-500 mt-1">考号：{{ studentInfo.examNo }}</span>
              <span
                class="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                异常类型：实考被替换
              </span>
            </div>

            <div class="flex items-center text-sm gap-3">
              <el-tooltip content="左旋转" placement="bottom">
                <el-icon class="icon-btn" @click="rotateLeft"><RefreshLeft /></el-icon>
              </el-tooltip>
              <el-tooltip content="右旋转" placement="bottom">
                <el-icon class="icon-btn" @click="rotateRight"><RefreshRight /></el-icon>
              </el-tooltip>
              <div class="h-4 w-px bg-gray-300"></div>
              <el-tooltip content="放大" placement="bottom">
                <el-icon class="icon-btn" @click="zoomIn"><ZoomIn /></el-icon>
              </el-tooltip>
              <el-tooltip content="缩小" placement="bottom">
                <el-icon class="icon-btn" @click="zoomOut"><ZoomOut /></el-icon>
              </el-tooltip>
              <el-tooltip content="还原 1:1" placement="bottom">
                <el-icon class="icon-btn" @click="resetZoom"><FullScreen /></el-icon>
              </el-tooltip>

              <!-- 新增缩放比例显示 -->
              <span class="text-xs text-gray-500">{{ Math.round(zoomScale * 100) }}%</span>
              <div class="h-3 w-px bg-gray-300"></div>
              <span
                class="cursor-pointer hover:text-blue-500 transition"
                :class="currentCardSide === 'front' ? 'text-blue-600 font-bold' : 'text-gray-500'"
                @click="currentCardSide = 'front'">
                第一面
              </span>
              <div class="h-3 w-px bg-gray-300"></div>
              <span
                class="cursor-pointer hover:text-blue-500 transition"
                :class="currentCardSide === 'back' ? 'text-blue-600 font-bold' : 'text-gray-500'"
                @click="currentCardSide = 'back'">
                第二面
              </span>
            </div>
          </div>
          <div class="flex-1" style="border: 1px solid #ccc; border-radius: 4px">
            <div
              class="h-94% flex-1 bg-gray-100 overflow-hidden flex items-center justify-center relative m-5"
              style="border: 1px solid #ccc; border-radius: 4px"
              @wheel="handleWheelZoom"
              @mousedown="startDrag"
              @mousemove="handleDragMove"
              @mouseup="stopDrag"
              @mouseleave="stopDrag"
              :class="{ 'cursor-pointer': !cardImageUrl }"
              @click="!cardImageUrl && handleUploadCardImage()">
              <!-- 有图片时的显示 -->
              <div
                v-if="cardImageUrl && !isImageLoading"
                class="transition-transform duration-200 ease-out shadow-lg"
                :style="{
                  transform: `translate(${dragX}px, ${dragY}px) scale(${zoomScale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  cursor: isDragging ? 'grabbing' : 'grab',
                }"
                ref="imageContainer">
                <img
                  :src="cardImageUrl"
                  class="max-h-[80vh] max-w-full block bg-white"
                  alt="Answer Card"
                  draggable="false" />
              </div>

              <!-- 操作按钮 (悬浮在右上角，不受图片缩放影响) -->
              <div
                v-if="cardImageUrl && !isImageLoading"
                class="absolute top-2 right-2 flex gap-2 z-10">
                <el-button
                  type="primary"
                  circle
                  size="small"
                  :icon="Edit"
                  @click.stop="handleUploadCardImage()"
                  title="替换图片" />
                <el-button
                  type="danger"
                  circle
                  size="small"
                  :icon="Delete"
                  @click.stop="handleDeleteCardImage()"
                  title="删除图片" />
              </div>

              <!-- 没有图片时的上传提示 -->
              <div
                v-else-if="!cardImageUrl && !isImageLoading"
                class="flex flex-col items-center justify-center text-gray-500 p-8">
                <el-icon size="48" class="mb-4 text-gray-400">
                  <UploadFilled />
                </el-icon>
                <span class="text-lg font-medium mb-2">点击上传答题卡图片</span>
                <span class="text-sm text-gray-400">支持 JPG、PNG 格式</span>
                <el-button
                  type="primary"
                  size="small"
                  class="mt-4"
                  @click.stop="handleUploadCardImage()">
                  选择图片文件
                </el-button>
              </div>

              <!-- 加载状态 -->
              <div v-else-if="isImageLoading" class="flex flex-col items-center justify-center p-8">
                <el-icon size="48" class="text-blue-500 animate-spin mb-4">
                  <Loading />
                </el-icon>
                <span class="text-gray-600">图片加载中...</span>
              </div>

              <!-- 操作提示（有图片时显示） -->
              <div
                v-if="cardImageUrl && !isDragging && !isImageLoading"
                class="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                滚动鼠标滚轮可缩放图片
              </div>
            </div>
          </div>
          <!-- 图片显示区（支持拖拽） -->
        </div>

        <!-- 题目选项区（匹配图片样式） -->
        <div
          class="w-[320px] bg-white flex flex-col shrink-0 pb-5 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10 overflow-auto">
          <!-- 标签页切换 -->
          <div class="flex border-b bg-gray-50 mt-5">
            <div
              class="flex-1 text-center py-2.5 text-sm cursor-pointer relative"
              :class="activeTab === 'objective' ? 'text-blue-600 font-bold' : 'text-gray-600'"
              @click="activeTab = 'objective'">
              客观题
              <div
                v-if="activeTab === 'objective'"
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600"></div>
            </div>
            <div
              class="flex-1 text-center py-2.5 text-sm cursor-pointer relative"
              :class="activeTab === 'subjective' ? 'text-blue-600 font-bold' : 'text-gray-600'"
              @click="activeTab = 'subjective'">
              主观题
              <div
                v-if="activeTab === 'subjective'"
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600"></div>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="flex-1 overflow-y-auto custom-scrollbar" style="border: 1px solid #ccc">
            <!-- 客观题表格 -->
            <div
              v-if="activeTab === 'objective'"
              class="m-2 border-gray-300 rounded overflow-hidden">
              <!-- 使用 el-table 组件 -->
              <el-table
                :data="objectiveQuestions"
                :header-cell-style="{
                  background: '#F9FAFE',
                  color: '#333',
                  borderRight: '1px solid #ddd',
                  borderBottom: '1px solid #ddd',
                }"
                :cell-style="{ borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }"
                :row-class-name="tableRowClassName"
                style="width: 100%"
                :show-header="true"
                :default-sort="{ prop: 'questionNo', order: 'ascending' }">
                <!-- 题号列 -->
                <el-table-column
                  prop="questionNo"
                  label="题号"
                  width="80"
                  align="center"
                  header-align="center"
                  :resizable="false">
                  <template #default="{ row }">
                    <span class="text-sm font-mono text-gray-800">{{ row.questionNo }}</span>
                  </template>
                </el-table-column>

                <!-- 选项列 -->
                <el-table-column
                  prop="selectedOption"
                  label="选项"
                  header-align="left"
                  :resizable="false">
                  <template #default="{ row }">
                    <div class="flex items-center gap-1 pl-2">
                      <!-- 关键修改1：添加独立的类名 + !important 强制生效 -->
                      <div
                        v-for="opt in ['A', 'B', 'C', 'D']"
                        :key="opt"
                        class="option-box w-7 h-7 flex items-center justify-center text-sm cursor-pointer border border-gray-300 rounded-sm transition-all duration-200 hover:bg-gray-50"
                        :class="row.selectedOption === opt ? 'option-selected' : ''"
                        @click="selectOption(row, opt)">
                        {{ opt }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 空状态 -->
              <div
                v-if="objectiveQuestions.length === 0"
                class="h-40 flex flex-col items-center justify-center text-gray-400 border-t border-gray-300">
                <el-empty description="暂无客观题数据" :image-size="60" />
              </div>
            </div>

            <!-- 主观题区域 -->
            <div
              v-else
              class="m-2 border border-gray-300 rounded overflow-hidden"
              style="border: 1px solid #ccc">
              <div class="flex flex-col">
                <!-- 主观题列表 -->
                <div
                  v-for="item in subjectiveQuestions"
                  :key="item.questionNo"
                  class="border-b border-gray-200 p-3">
                  <!-- 标题行 -->
                  <div class="flex items-center justify-between mb-3">
                    <span class="font-medium text-gray-700">{{ item.questionNo }}</span>
                    <div class="flex items-center gap-3">
                      <span
                        class="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
                        @click="handleUploadImage(item)">
                        上传图片
                      </span>
                      <div class="h-3 w-px bg-gray-300"></div>
                      <span
                        class="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
                        @click="handleDeleteImage(item)">
                        删除
                      </span>
                    </div>
                  </div>

                  <!-- 图片显示区域 -->
                  <div
                    class="border border-gray-300 rounded mb-2 bg-gray-50"
                    style="border: 1px solid #ccc; border-radius: 3px"
                    :style="{ height: item.imageUrl ? 'auto' : '40px' }"
                    @click="!item.imageUrl && handleUploadImage(item)"
                    :class="{ 'cursor-pointer': !item.imageUrl }">
                    <!-- 如果有图片，显示图片 -->
                    <img
                      v-if="item.imageUrl"
                      :src="item.imageUrl"
                      class="w-full h-auto max-h-48 object-contain p-1"
                      alt="主观题图片"
                      @error="handleImageError(item)" />
                    <!-- 如果没有图片，显示空区域 -->
                    <div v-else class="w-full h-10 flex items-center justify-center">
                      <!-- 空的图片区域 -->
                    </div>
                  </div>
                </div>

                <!-- 空状态 -->
                <div
                  v-if="subjectiveQuestions.length === 0"
                  class="h-40 flex flex-col items-center justify-center text-gray-400">
                  <el-empty description="暂无主观题数据" :image-size="60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧弹出层（分配考生） -->
      <el-drawer
        v-model="assignDrawerVisible"
        direction="rtl"
        size="35%"
        title="为当前答题卡分配考生"
        :with-header="true"
        :close-on-click-modal="false">
        <!-- 搜索栏 -->
        <div class="mb-3 flex items-center gap-2">
          <span>考号/姓名：</span>
          <el-input v-model="searchKey" placeholder="请输入考号或姓名" style="width: 200px" />
        </div>

        <!-- 考生列表表格 -->
        <el-table
          :data="filteredStudents"
          border
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', fontSize: '14px' }"
          :cell-style="{ fontSize: '13px' }">
          <el-table-column prop="examNo" label="考号" align="center" width="120" />
          <el-table-column prop="name" label="姓名" align="center" width="80" />
          <el-table-column prop="class" label="班级" align="center" width="80" />
          <el-table-column prop="status" label="状态" align="center" width="80"></el-table-column>
          <el-table-column label="操作" align="center" width="180">
            <template #default="{ row }">
              <div class="flex items-center justify-center">
                <span
                  class="text-blue-500 text-xs cursor-pointer hover:text-blue-600 transition"
                  @click="handleAssign(row, '实考')">
                  提交为实考
                </span>
                <div class="h-4 w-px bg-gray-300 mx-2"></div>
                <span
                  class="text-blue-500 text-xs cursor-pointer hover:text-blue-600 transition"
                  @click="handleAssign(row, '缺考')">
                  提交为缺考
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="mt-3 flex justify-between items-center">
          <span class="text-sm text-gray-500">共{{ students.length }}条记录</span>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            layout="prev, pager, next, jumper"
            :total="students.length"
            :pager-count="5"
            small />
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElDrawer } from "element-plus";
import {
  ArrowLeft,
  RefreshLeft,
  RefreshRight,
  ZoomIn,
  ZoomOut,
  FullScreen,
  UploadFilled,
  Loading,
  Edit,
  Delete,
} from "@element-plus/icons-vue";

const router = useRouter();

// 1. 考生数据（匹配图片中的题目选项）
const paperList = reactive([
  {
    name: "张一三",
    examNo: "20252",
    abnormalType: "实考被替换",
    objectiveQuestions: [
      { questionNo: "一.1", selectedOption: "B" },
      { questionNo: "一.2", selectedOption: "C" },
      { questionNo: "一.3", selectedOption: "C" },
      { questionNo: "一.4", selectedOption: "C" },
      { questionNo: "一.5", selectedOption: "C" },
      { questionNo: "一.6", selectedOption: "C" },
      { questionNo: "一.7", selectedOption: "D" },
      { questionNo: "一.8", selectedOption: "D" },
      { questionNo: "一.9", selectedOption: "D" },
      { questionNo: "一.10", selectedOption: "D" },
      { questionNo: "一.11", selectedOption: "C" },
      { questionNo: "一.12", selectedOption: "B" },
      { questionNo: "一.13", selectedOption: "C" },
      { questionNo: "一.14", selectedOption: "B" },
      { questionNo: "一.15", selectedOption: "D" },
    ],
    subjectiveQuestions: [
      {
        questionNo: "二.21题",
        imageUrl: "", // 初始无图片
        hasImage: false,
      },
      {
        questionNo: "三.25题",
        imageUrl: "", // 初始无图片
        hasImage: false,
      },
      {
        questionNo: "三.26题",
        imageUrl: "", // 初始无图片
        hasImage: false,
      },
    ],
    cardImages: {
      front: "",
      back: "https://placehold.co/600x840/FFFFFF/999999?text=Exam+Paper+Front+20252",
    },
  },
]);

// 分配考生弹出层 - 模拟考生列表数据
const students = reactive([
  { examNo: "205072502", name: "李一二", class: "1班", status: "缺少答卷" },
  { examNo: "205072503", name: "李一三", class: "1班", status: "缺少答卷" },
  { examNo: "205072504", name: "李一四", class: "1班", status: "缺少答卷" },
  { examNo: "20991", name: "李一一", class: "1班", status: "实考" },
]);
const assignDrawerVisible = ref(false);
const searchKey = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

// 过滤后的考生列表
const filteredStudents = computed(() => {
  return students.filter(
    item => item.examNo.includes(searchKey.value) || item.name.includes(searchKey.value),
  );
});

// 当前选中的答题卡索引
const currentPaperIndex = ref(0);
// 当前考生信息
const studentInfo = computed(() => ({
  name: paperList[currentPaperIndex.value].name,
  examNo: paperList[currentPaperIndex.value].examNo,
  abnormalType: paperList[currentPaperIndex.value].abnormalType,
}));

// 是否是第一份/最后一份答题卡（控制按钮禁用状态）
const isFirstPaper = computed(() => currentPaperIndex.value === 0);
const isLastPaper = computed(() => currentPaperIndex.value === paperList.length - 1);

// 2. 图片控制（新增拖拽功能）
const currentCardSide = ref<"front" | "back">("front");
const cardImageUrl = computed(
  () => paperList[currentPaperIndex.value].cardImages[currentCardSide.value],
);

// 主观题操作方法
const handleUploadImage = item => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        item.imageUrl = e.target?.result as string;
        item.hasImage = true;
        ElMessage.success(`已为${item.questionNo}上传图片`);
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

const handleDeleteImage = item => {
  item.imageUrl = "";
  item.hasImage = false;
  ElMessage.success(`已删除${item.questionNo}的图片`);
};

const handleImageError = item => {
  ElMessage.error(`${item.questionNo}图片加载失败`);
  item.imageUrl = "";
  item.hasImage = false;
};

// 答题卡图片上传方法
const handleUploadCardImage = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      isImageLoading.value = true;

      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = e => {
          const imageUrl = e.target?.result as string;
          paperList[currentPaperIndex.value].cardImages[currentCardSide.value] = imageUrl;
          isImageLoading.value = false;
          ElMessage.success(`答题卡${currentCardSide.value === "front" ? "正面" : "背面"}上传成功`);
        };
        reader.readAsDataURL(file);
      }, 1000);
    }
  };
  input.click();
};

// 删除答题卡图片
const handleDeleteCardImage = () => {
  paperList[currentPaperIndex.value].cardImages[currentCardSide.value] = "";
  // 重置缩放和旋转状态
  resetZoom();
  ElMessage.success(`已删除答题卡${currentCardSide.value === "front" ? "正面" : "背面"}图片`);
};

const zoomScale = ref(1);
const rotation = ref(0);
const dragX = ref(0);
const dragY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const isImageLoading = ref(false);

// 图片缩放
const zoomIn = () => {
  if (zoomScale.value < 3) {
    zoomScale.value += 0.1;
  } else {
    ElMessage.warning("已达到最大缩放比例");
  }
};
const zoomOut = () => {
  if (zoomScale.value > 0.4) {
    zoomScale.value -= 0.1;
  } else {
    ElMessage.warning("已达到最小缩放比例");
  }
};
// 还原缩放和旋转
const resetZoom = () => {
  zoomScale.value = 1;
  rotation.value = 0;
  dragX.value = 0;
  dragY.value = 0;
};
// 旋转图片
const rotateLeft = () => (rotation.value -= 90);
const rotateRight = () => (rotation.value += 90);

// 鼠标滚轮缩放
const handleWheelZoom = (e: WheelEvent) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

// 拖拽图片
const startDrag = (e: MouseEvent) => {
  e.preventDefault();
  isDragging.value = true;
  startX.value = e.clientX - dragX.value;
  startY.value = e.clientY - dragY.value;
};
const handleDragMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  dragX.value = e.clientX - startX.value;
  dragY.value = e.clientY - startY.value;
};
const stopDrag = () => {
  isDragging.value = false;
};

// 3. 题目数据
const activeTab = ref<"objective" | "subjective">("objective");
// 客观题数据（关联当前答题卡）
const objectiveQuestions = computed(() => paperList[currentPaperIndex.value].objectiveQuestions);
// 主观题数据（关联当前答题卡）
const subjectiveQuestions = computed(() => paperList[currentPaperIndex.value].subjectiveQuestions);

// 选择客观题选项
const selectOption = (item, option) => {
  item.selectedOption = item.selectedOption === option ? "" : option;
};

const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 1 ? "even-row" : "odd-row";
};

// 4. 路由与操作
const handleBack = () => {
  router.back();
};

// 上一份答题卡
const prevPaper = () => {
  if (!isFirstPaper.value) {
    currentPaperIndex.value--;
    resetZoom(); // 切换答题卡时还原图片状态
    ElMessage.success(`已切换到【${studentInfo.value.name}】的答题卡`);
  }
};

// 下一份答题卡
const nextPaper = () => {
  if (!isLastPaper.value) {
    currentPaperIndex.value++;
    resetZoom(); // 切换答题卡时还原图片状态
    ElMessage.success(`已切换到【${studentInfo.value.name}】的答题卡`);
  }
};

// 分配考生弹出层操作
const openAssignDrawer = () => {
  assignDrawerVisible.value = true;
};
const handleAssign = (row, status) => {
  // 模拟分配逻辑
  row.status = status;
  ElMessage.success(`已将【${row.name}】状态修改为${row.status}`);
};
// 分页操作
const handleSizeChange = val => {
  pageSize.value = val;
};
const handleCurrentChange = val => {
  currentPage.value = val;
};

// 监听图片加载状态
onMounted(() => {
  // 模拟图片加载
  isImageLoading.value = true;
  setTimeout(() => {
    isImageLoading.value = false;
  }, 500);
});
</script>

<style scoped>
/* 定义图标按钮的通用样式 */
.icon-btn {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s;
}
.icon-btn:hover {
  color: #409eff;
}

/* 自定义滚动条样式，让列表更精致 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 拖拽状态样式 */
:deep(.el-icon) {
  user-select: none;
}

/* 关键修改2：使用 :deep 穿透 + !important 强制生效选中样式 */
:deep(.option-box) {
  box-sizing: border-box !important; /* 边框计入尺寸 */
}
:deep(.option-selected) {
  border: 1px solid #409eff !important; /* 蓝色边框强制生效 */
  background-color: #e6f7ff !important; /* 浅蓝色背景 */
  color: #1890ff !important; /* 蓝色文字 */
  font-weight: 500 !important;
}

/* 表格边框样式 */
:deep(.el-table) {
  border: 1px solid #ddd;
}
:deep(.el-table th) {
  border-right: 1px solid #ddd !important;
  border-bottom: 1px solid #ddd !important;
}
:deep(.el-table td) {
  border-right: 1px solid #ddd !important;
  border-bottom: 1px solid #ddd !important;
}
:deep(.el-table--border) {
  border: 1px solid #ddd;
}

/* 动画样式 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
