<template>
    <sjDialog 
        v-model="showLeveDialog" 
        title="名次分段设置" 
        width="500px" 
        :close-on-click-modal="false" 
        confirm-text="确认"
        cancel-text="取消" 
        @confirm="handleManyRateConfirm" 
        @cancel="handleManyRateCancel"
    >
        <div class="my-20px">
            <el-form-item 
                v-for="(grade, index) in levels" 
                :key="index" 
                :label="'第'+ `${index + 1}` + '段：前'"
            >
                <el-input-number
                    v-model="grade.scoreThreshold"
                    :min="0"
                    :max="100"
                    class="grade-input"
                />
                <span class="ml-10px"> 名 </span>

                <!-- 删除按钮（至少保留1个等级） -->
                <el-button
                    :icon="Delete"
                    type="text"
                    class="delete-btn ml-20px"
                    @click="deleteGrade(index)"
                    v-if="levels.length > 1 && index > 0"
                />
            </el-form-item>

            <!-- 增加等级按钮 -->
            <el-button
                type="text"
                class="add-btn"
                @click="addGrade"
            >
            +增加等级
            </el-button>
        </div>
    </sjDialog>
</template>

<script setup lang="ts">
import { sjDialog } from "@sjjb/components";
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref, toRefs, watch } from "vue";
import { Delete } from '@element-plus/icons-vue'

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
    const thresholds = levels.value.map(item => Number(item.scoreThreshold));
    const hasDuplicateThreshold = new Set(thresholds).size !== thresholds.length;
    if (hasDuplicateThreshold) {
      ElMessage.warning('存在相同的分段名次，请调整后再确认');
      return;
    }

    // 保存数据
    saveToStorage();
    showLeveDialog.value = false
    // 可以添加保存成功的提示
    ElMessage.success('设置已保存');
    emit("handleBtn");
}

// 设置分段 取消按钮
const handleManyRateCancel = async () => {
    const savedData = loadFromStorage();
    levels.value = savedData.levels;
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
  if (newVal) {
    const savedData = loadFromStorage();
    levels.value = savedData.levels;
  }
  emit("update:modelValue", newVal);
});

// 定义评分档次类型
interface GradeItem {
  id: string;
  segmentName: string;       // 分段名称
  minRanking?: number;        // 最小值（独立分段用）
  maxRanking?: number;        // 最大值（独立分段用）
  includeMin?: boolean; // 是否包含最小值
  includeMax?: boolean;     // 是否包含最大值
  scoreThreshold?: number;  // 阈值
}

// 存储键名
const STORAGE_KEY = 'rankSettingConfig';

// 状态管理
const state = reactive({
  levels: [] as GradeItem[],
});

const { levels } = toRefs(state);

// 生成唯一ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const normalizeRankLevel = (item: GradeItem): GradeItem => {
  const scoreThreshold = Math.max(1, Number(item.scoreThreshold ?? item.segmentName ?? 1));
  const minRanking = 1;
  const maxRanking = scoreThreshold;
  const includeMin = item.includeMin === undefined ? true : Boolean(item.includeMin);
  const includeMax = true;

  return {
    ...item,
    segmentName: `${scoreThreshold}`,
    scoreThreshold,
    minRanking,
    maxRanking,
    includeMin,
    includeMax,
  };
};

// 获取默认配置
const getDefaultConfig = (): {
  levels: GradeItem[];
} => {
  // 基础等级数量
  const baseCount = 2;
  return {
    levels: Array.from({ length: baseCount }, (_, i) => {
      const thresholds = [3, 7];
      return {
        id: generateId(),
        segmentName: `${thresholds[i]}`,
        minRanking: 1,
        maxRanking: thresholds[i],
        includeMin: true,
        includeMax: true,
        scoreThreshold: thresholds[i]
      };
    })
  };
};

// 从本地存储加载数据
const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsedData = JSON.parse(saved);
      return {
        ...parsedData,
        levels: Array.isArray(parsedData?.levels)
          ? parsedData.levels.map((item: GradeItem) => normalizeRankLevel(item))
          : []
      };
    } catch (e) {
      console.error('加载本地数据失败', e);
    }
  }
  // 无本地数据时返回默认配置
  return getDefaultConfig();
};

// 保存到本地存储
const saveToStorage = () => {
  const data = {
    levels: levels.value.map((item) => normalizeRankLevel(item))
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 添加等级
const addGrade = () => {
    levels.value.push({
        id: generateId(),
        segmentName: '1',
        minRanking: 1,
        maxRanking: 1,
        includeMin: true,
        includeMax: true,
        scoreThreshold: 1,
    });
};

// 删除等级
const deleteGrade = (index: number) => {
    if (levels.value.length <= 1) return;
    
    // 得分率类型直接删除
    levels.value.splice(index, 1);
};

// 页面挂载时加载数据
onMounted(() => {
    const savedData = loadFromStorage();
    levels.value = savedData.levels;
});

</script>

<style scoped>

</style>
