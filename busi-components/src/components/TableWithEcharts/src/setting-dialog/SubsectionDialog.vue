<template>
    <sjDialog 
        v-model="showLeveDialog" 
        title="分段设置" 
        width="500px" 
        :close-on-click-modal="false" 
        confirm-text="确认"
        cancel-text="取消" 
        @confirm="handleManyRateConfirm" 
        @cancel="handleManyRateCancel"
    >
        <div class="my-20px">
            <el-form-item label="区间范围：">
                <el-input-number
                    v-model="grade.minRate"
                    :min="0"
                    :max="100"
                    :step="1"
                    suffix="%"
                    class="input-min"
                />
                <span class="mx-2"> 分 ~ </span>
                <el-input-number
                    v-model="grade.maxRate"
                    :min="grade.minRate"
                    :max="100"
                    :step="1"
                    suffix="%"
                    class="input-max"
                /> 
                <span class="ml-10px"> 分 </span>
            </el-form-item>

            <el-form-item label="成绩间隔：">
                <el-input-number
                    v-model="grade.threshold"
                    :min="10"
                    :max="100"
                    :step="1"
                    suffix="%"
                    class="input-min"
                />
            </el-form-item>
        </div>
    </sjDialog>
</template>

<script setup lang="ts">
import { sjDialog } from "@sjjb/components";
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref, toRefs, watch } from "vue";

const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
})

// Emits
const emit = defineEmits(["update:modelValue", "confirm", "cancel", "handleBtn"]);

const showLeveDialog = ref(false)

// 设置分段 确认按钮
const handleManyRateConfirm = async () => {
    // 保存数据
    saveToStorage();
    showLeveDialog.value = false
    // 可以添加保存成功的提示
    ElMessage.success('设置已保存');
    emit("handleBtn");
}

// 设置分段 取消按钮
const handleManyRateCancel = async () => {
    emit("handleBtn");
    showLeveDialog.value = false
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newVal => {
    showLeveDialog.value = newVal;
  },
  { immediate: true }
);

// 监听 visible 变化
watch(showLeveDialog, newVal => {
  emit("update:modelValue", newVal);
});

// 定义评分档次类型
interface Grade {
  levelName: string;       // 分段名称
  minRate?: number;        // 最小值（独立分段用）
  maxRate?: number;        // 最大值（独立分段用）
  includeMin?: boolean; // 是否包含最小值
  includeMax?: boolean;     // 是否包含最大值
  threshold?: number;  // 阈值
}

// 存储键名
const STORAGE_KEY = 'subsectionSettingConfig';

// const grade = ref<Grade>({
//   levelName: "",
//   minRate: 0,
//   maxRate: 90,
//   threshold: 50,
//   includeMin: false,
//   includeMax: false
// })

// 状态管理
const state = reactive({
  grade: {
    levelName: "",
    minRate: 0,
    maxRate: 90,
    threshold: 50,
    includeMin: false,
    includeMax: false
  } as Grade,
});

const { grade } = toRefs(state);

// 获取默认配置
const getDefaultConfig = () => {
    return {
        levelName: "",
        minRate: 0,
        maxRate: 90,
        threshold: 50,
        includeMin: false,
        includeMax: false
    }
};

// 从本地存储加载数据
const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('加载本地数据失败', e);
    }
  }
  // 无本地数据时返回默认配置
  return getDefaultConfig();
};

// 保存到本地存储
const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(grade.value));
};

// 页面挂载时加载数据
onMounted(() => {
  const loadedData = loadFromStorage();
  if (loadedData && typeof loadedData === 'object') {
    Object.assign(grade.value, loadedData);
  }
});

</script>

<style scoped>

</style>