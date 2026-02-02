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
      </div>
      <div>
        <span class="font-bold text-gray-800">上传答题卡</span>
      </div>
      <div class="flex gap-3">
        <el-button-group>
          <el-button size="default" @click="prevPaper" :disabled="isFirstPaper">上一份</el-button>
          <el-button size="default" @click="nextPaper" :disabled="isLastPaper">下一份</el-button>
        </el-button-group>
        <el-button type="primary" size="default" @click="openAssignDrawer">变更为实交</el-button>
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
              <span class="text-xs text-gray-500 mt-1">姓名：{{ studentInfo.name }}</span>
              <span class="text-xs text-gray-500 mt-1">考号：{{ studentInfo.examNo }}</span>
            </div>
          </div>

          <div class="flex-1 flex" style="border: 1px solid #ccc">
            <div
              class="h-94% w-48% flex-1 bg-gray-100 overflow-hidden flex items-center justify-center relative m-5"
              style="border: 1px solid #ccc; border-radius: 4px"
              :class="{ 'cursor-pointer': !paperList[currentPaperIndex].cardImages.front }"
              @click="
                !paperList[currentPaperIndex].cardImages.front && handleUploadCardImage('front')
              ">
              <!-- 有图片时的显示 -->
              <div
                v-if="paperList[currentPaperIndex].cardImages.front && !isImageLoading"
                class="transition-transform duration-200 ease-out shadow-lg relative group"
                ref="imageContainer">
                <img
                  :src="paperList[currentPaperIndex].cardImages.front"
                  class="max-h-[80vh] max-w-full block bg-white"
                  alt="Answer Card Front"
                  draggable="false" />

                <!-- 操作按钮 -->
                <div class="absolute top-2 right-2 flex gap-2">
                  <el-button
                    type="primary"
                    circle
                    size="small"
                    :icon="Edit"
                    @click.stop="handleUploadCardImage('front')"
                    title="替换图片" />
                  <el-button
                    type="danger"
                    circle
                    size="small"
                    :icon="Delete"
                    @click.stop="handleDeleteCardImage('front')"
                    title="删除图片" />
                </div>
              </div>

              <!-- 没有图片时的上传提示 -->
              <div
                v-else-if="!paperList[currentPaperIndex].cardImages.front && !isImageLoading"
                class="flex flex-col items-center justify-center text-gray-500 p-8">
                <el-icon size="48" class="mb-4 text-gray-400">
                  <UploadFilled />
                </el-icon>
                <span class="text-lg font-medium mb-2">点击上传答题卡正面图片</span>
                <span class="text-sm text-gray-400">支持 JPG、PNG 格式</span>
                <el-button
                  type="primary"
                  size="small"
                  class="mt-4"
                  @click.stop="handleUploadCardImage('front')">
                  上传正面图像
                </el-button>
              </div>

              <!-- 加载状态 -->
              <div v-else-if="isImageLoading" class="flex flex-col items-center justify-center p-8">
                <el-icon size="48" class="text-blue-500 animate-spin mb-4">
                  <Loading />
                </el-icon>
                <span class="text-gray-600">图片加载中...</span>
              </div>
            </div>
            <div
              class="h-94% w-48% flex-1 bg-gray-100 overflow-hidden flex items-center justify-center relative m-5"
              style="border: 1px solid #ccc; border-radius: 4px"
              :class="{ 'cursor-pointer': !paperList[currentPaperIndex].cardImages.back }"
              @click="
                !paperList[currentPaperIndex].cardImages.back && handleUploadCardImage('back')
              ">
              <!-- 有图片时的显示 -->
              <div
                v-if="paperList[currentPaperIndex].cardImages.back && !isImageLoading"
                class="transition-transform duration-200 ease-out shadow-lg relative group"
                ref="imageContainer">
                <img
                  :src="paperList[currentPaperIndex].cardImages.back"
                  class="max-h-[80vh] max-w-full block bg-white"
                  alt="Answer Card Back"
                  draggable="false" />

                <!-- 操作按钮 -->
                <div class="absolute top-2 right-2 flex gap-2">
                  <el-button
                    type="primary"
                    circle
                    size="small"
                    :icon="Edit"
                    @click.stop="handleUploadCardImage('back')"
                    title="替换图片" />
                  <el-button
                    type="danger"
                    circle
                    size="small"
                    :icon="Delete"
                    @click.stop="handleDeleteCardImage('back')"
                    title="删除图片" />
                </div>
              </div>

              <!-- 没有图片时的上传提示 -->
              <div
                v-else-if="!paperList[currentPaperIndex].cardImages.back && !isImageLoading"
                class="flex flex-col items-center justify-center text-gray-500 p-8">
                <el-icon size="48" class="mb-4 text-gray-400">
                  <UploadFilled />
                </el-icon>
                <span class="text-lg font-medium mb-2">点击上传答题卡背面图片</span>
                <span class="text-sm text-gray-400">支持 JPG、PNG 格式</span>
                <el-button
                  type="primary"
                  size="small"
                  class="mt-4"
                  @click.stop="handleUploadCardImage('back')">
                  上传背面图像
                </el-button>
              </div>

              <!-- 加载状态 -->
              <div
                v-else-if="isImageLoading1"
                class="flex flex-col items-center justify-center p-8">
                <el-icon size="48" class="text-blue-500 animate-spin mb-4">
                  <Loading />
                </el-icon>
                <span class="text-gray-600">图片加载中...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 题目选项区 -->
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElDrawer } from "element-plus";
import { ArrowLeft, Search, UploadFilled, Loading, Delete, Edit } from "@element-plus/icons-vue";

const router = useRouter();

// 1. 考生数据
const paperList = reactive([]);

// 分配考生弹出层数据
const students = reactive([]);
const assignDrawerVisible = ref(false);
const searchKey = ref("");
const selectedStudent = ref<any>(null);

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

// 是否是第一份/最后一份答题卡
const isFirstPaper = computed(() => currentPaperIndex.value === 0);
const isLastPaper = computed(() => currentPaperIndex.value === paperList.length - 1);

// 2. 图片控制
const isImageLoading = ref(false);
const isImageLoading1 = ref(false);

// 答题卡图片上传方法
const handleUploadCardImage = (side: "front" | "back") => {
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
          paperList[currentPaperIndex.value].cardImages[side] = imageUrl;
          isImageLoading.value = false;
          ElMessage.success(`答题卡${side === "front" ? "正面" : "背面"}上传成功`);
        };
        reader.readAsDataURL(file);
      }, 500);
    }
  };
  input.click();
};

// 删除答题卡图片
const handleDeleteCardImage = (side: "front" | "back") => {
  paperList[currentPaperIndex.value].cardImages[side] = "";
  ElMessage.success(`已删除答题卡${side === "front" ? "正面" : "背面"}图片`);
};

// 3. 题目数据
const activeTab = ref<"objective" | "subjective">("objective");
// 客观题数据
const objectiveQuestions = computed(() => paperList[currentPaperIndex.value].objectiveQuestions);
// 主观题数据
const subjectiveQuestions = computed(() => paperList[currentPaperIndex.value].subjectiveQuestions);

// 主观题操作方法
const handleUploadImage = (item: any) => {
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

const handleDeleteImage = (item: any) => {
  item.imageUrl = "";
  item.hasImage = false;
  ElMessage.success(`已删除${item.questionNo}的图片`);
};

const handleImageError = (item: any) => {
  ElMessage.error(`${item.questionNo}图片加载失败`);
  item.imageUrl = "";
  item.hasImage = false;
};

// 选择客观题选项
const selectOption = (item: any, option: string) => {
  item.selectedOption = item.selectedOption === option ? "" : option;
};

// 表格行样式
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
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
    ElMessage.success(`已切换到【${studentInfo.value.name}】的答题卡`);
  }
};

// 下一份答题卡
const nextPaper = () => {
  if (!isLastPaper.value) {
    currentPaperIndex.value++;
    ElMessage.success(`已切换到【${studentInfo.value.name}】的答题卡`);
  }
};

// 分配考生弹出层操作
const openAssignDrawer = () => {
  selectedStudent.value = null;
};

// 监听图片加载状态
onMounted(() => {
  isImageLoading.value = true;
  setTimeout(() => {
    isImageLoading.value = false;
  }, 300);
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

/* 自定义滚动条样式 */
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

/* 表格行交替背景色 */
:deep(.even-row) {
  background-color: #f9fafb;
}
:deep(.odd-row) {
  background-color: #ffffff;
}

/* 选项框选中样式 */
:deep(.option-box) {
  box-sizing: border-box !important;
}
:deep(.option-selected) {
  border: 1px solid #409eff !important;
  background-color: #e6f7ff !important;
  color: #1890ff !important;
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

/* 右侧弹出层样式 */
:deep(.assign-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
:deep(.assign-drawer .el-drawer__body) {
  padding: 16px;
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
