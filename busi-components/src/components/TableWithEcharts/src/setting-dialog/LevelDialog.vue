<!-- 设置 等级 对话框 -->
<template>
    <sjDialog 
        v-model="showLeveDialog" 
        title="学业等级设置" 
        width="500px" 
        :close-on-click-modal="false" 
        confirm-text="确认"
        cancel-text="取消" 
        @confirm="handleManyRateConfirm" 
        @cancel="handleManyRateCancel"
    >
        <div>
            <!-- 设置类型选择 -->
            <el-radio-group
                v-model="type"
                @change="handleTypeChange"
                class="setting-type-group"
            >
                <el-radio label="SCORE_RATE">按得分率</el-radio>
                <el-radio label="GRADE_RATIO">按年级人数比例</el-radio>
                <el-radio label="CLASS_RATIO">按班级人数比例</el-radio>
            </el-radio-group>

            <!-- 临界规则（仅比例类型显示） -->
            <template v-if="isRatioType">
            <el-radio-group
                v-model="criticalScoreRule"
                class="critical-rule-group"
            >
                <el-radio label="HIGH_LEVEL">按高等级设置</el-radio>
                <el-radio label="MORE_COUNT">按所在人数多的等级设置</el-radio>
            </el-radio-group>
            </template>

            <!-- 等级设置列表 -->
            <div class="grade-list">
            <div
                v-for="(grade, index) in levels"
                :key="grade.id"
                class="grade-item"
            >
                <!-- 等级标签输入 -->
                <el-input
                    v-model="grade.levelName"
                    placeholder="等级标签"
                    class="grade-label"
                    :disabled="levels.length <= 1 && index === 0"
                />

                <!-- 得分率类型内容 -->
                <template v-if="type === 'SCORE_RATE'">
                <el-input-number
                    v-model.number="grade.minScoreRate"
                    :min="0"
                    :max="100"
                    :precision="0"
                    suffix="%"
                    class="grade-input"
                />
                <span class="operator">≤ 得分率</span>
                <span class="operator" v-if="index === levels.length - 1">≤</span>
                <span class="operator" v-else><</span>
                <el-input-number
                    v-model.number="grade.maxScoreRate"
                    :min="grade.minScoreRate"
                    :max="100"
                    :precision="0"
                    suffix="%"
                    class="grade-input"
                />
                </template>

                <!-- 比例类型内容 -->
                <template v-if="isRatioType">
                <span class="ratio-label">所占比例</span>
                <el-input-number
                    v-model.number="grade.ratio"
                    :min="0"
                    :max="100"
                    :precision="0"
                    suffix="%"
                    class="grade-input"
                />
                </template>

                <!-- 删除按钮（至少保留1个等级） -->
                <el-button
                    :icon="Delete"
                    type="text"
                    class="delete-btn"
                    @click="deleteGrade(index)"
                    v-if="levels.length > 3 && index >3"
                />
            </div>
            </div>

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

<script lang="ts" setup>
import { sjDialog } from "@sjjb/components";
import { ElMessage } from "element-plus";
import { ref, reactive, onMounted, toRefs, computed, watch } from 'vue';
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

// 设置多率 确认按钮
const handleManyRateConfirm = async () => {
    // 保存数据
    saveToStorage();
    showLeveDialog.value = false
    // 可以添加保存成功的提示
    ElMessage.success('设置已保存');
    emit("handleBtn");
}

// 设置多率 取消按钮
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

// 定义等级数据类型
interface GradeItem {
  id: string;
  levelName: string;
  minScoreRate?: number; // 得分率最小值
  maxScoreRate?: number; // 得分率最大值
  ratio?: number; // 比例值
}

// 本地存储键名
const STORAGE_KEY = 'academicGradeSettings';

// 状态管理
const state = reactive({
  dialogVisible: true, // 对话框显示状态
  type: 'SCORE_RATE' as 'SCORE_RATE' | 'GRADE_RATIO' | 'CLASS_RATIO',
  criticalScoreRule: 'HIGH_LEVEL' as 'HIGH_LEVEL' | 'MORE_COUNT',
  levels: [] as GradeItem[],
});

const { type, criticalScoreRule, levels } = toRefs(state);

// 判断是否为比例类型设置
const isRatioType = computed(() => 
  type.value === 'GRADE_RATIO' || type.value === 'CLASS_RATIO'
);

// 生成唯一ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// 生成默认等级标签（A、B、C...）
const generateLabel = (length: number) => String.fromCharCode(65 + length);

// 获取默认配置
const getDefaultConfig = (_type: string): {
  type: string;
  criticalScoreRule: string;
  levels: GradeItem[];
} => {
  // 基础等级数量
  const baseCount = 4;
  
  if (_type === 'SCORE_RATE') {
    // 按得分率默认配置
    return {
      type: 'SCORE_RATE',
      criticalScoreRule: 'HIGH_LEVEL',
      levels: Array.from({ length: baseCount }, (_, i) => {
        const labels = ['A', 'B', 'C', 'D', 'E'];
        const maxValues = [100, 90, 80, 70, 60];
        const minValues = [90, 80, 70, 60, 0];
        return {
          id: generateId(),
          levelName: labels[i],
          minScoreRate: minValues[i],
          maxScoreRate: maxValues[i]
        };
      })
    };
  } else {
    // 按比例默认配置
    return {
      type: _type,
      criticalScoreRule: 'HIGH_LEVEL',
      levels: Array.from({ length: baseCount }, (_, i) => {
        const labels = ['A', 'B', 'C', 'D', 'E'];
        const ratios = [15, 35, 35, 15, 0]; // 比例总和100%
        return {
          id: generateId(),
          levelName: labels[i],
          ratio: ratios[i]
        };
      })
    };
  }
};

// 从本地存储加载数据
const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsedData = JSON.parse(saved);
      // 兼容旧字段：settingType -> type
      if (parsedData?.settingType && !parsedData?.type) {
        parsedData.type = parsedData.settingType;
      }
      return parsedData;
    } catch (e) {
      console.error('加载本地数据失败', e);
    }
  }
  // 无本地数据时返回默认配置
  return getDefaultConfig(type.value);
};

// 保存到本地存储
const saveToStorage = () => {
  const data = {
    type: type.value,
    criticalScoreRule: criticalScoreRule.value,
    levels: levels.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 切换设置类型
const handleTypeChange = (newType: string) => {
  type.value = newType as any;
  // 加载对应类型的默认配置
  const defaultConfig = getDefaultConfig(newType);
  levels.value = defaultConfig.levels;
  criticalScoreRule.value = defaultConfig.criticalScoreRule;
};

// 添加等级
const addGrade = () => {
  const newLabel = generateLabel(levels.value.length);
  if (type.value === 'SCORE_RATE') {
    // 得分率类型默认值（基于最后一个等级的最小值）
    const lastItem = levels.value[levels.value.length - 1];
    levels.value.push({
      id: generateId(),
      levelName: newLabel,
      minScoreRate: 0,
      maxScoreRate: lastItem?.minScoreRate || 0
    });
  } else {
    // 比例类型默认值（平均分配剩余比例）
    const totalRatio = levels.value.reduce((sum, item) => sum + (item.ratio || 0), 0);
    const remainingRatio = 100 - totalRatio;
    levels.value.push({
      id: generateId(),
      levelName: newLabel,
      ratio: Math.max(0, Math.round(remainingRatio / 1)) // 简单分配剩余比例
    });
  }
};

// 删除等级
const deleteGrade = (index: number) => {
  if (levels.value.length <= 1) return;
  
  // 比例类型删除时重新分配比例
  if (isRatioType.value) {
    const deletedRatio = levels.value[index].ratio || 0;
    levels.value.splice(index, 1);
    // 平均分配删除的比例到剩余等级
    const avgAdd = deletedRatio / levels.value.length;
    levels.value.forEach(item => {
      item.ratio = Math.min(100, Math.round((item.ratio || 0) + avgAdd));
    });
  } else {
    // 得分率类型直接删除
    levels.value.splice(index, 1);
    // 调整最后一个等级的符号（改为≤）
    const lastItem = levels.value[levels.value.length - 1];
    if (lastItem) {
      // 确保最后一个等级的max为100
      if (lastItem.maxScoreRate !== 100) {
        lastItem.maxScoreRate = 100;
      }
    }
  }
};


// 页面挂载时加载数据
onMounted(() => {
    const savedData = loadFromStorage();
    type.value = savedData?.type ?? 'SCORE_RATE';
    criticalScoreRule.value = savedData.criticalScoreRule;
    levels.value = savedData.levels;
});
</script>
<style scoped>
.setting-type-group {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.critical-rule-group {
  margin: 10px 0 20px;
  display: flex;
  gap: 20px;
  padding-left: 20px;
}

.grade-list {
  margin-bottom: 15px;
}

.grade-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.grade-label {
  width: 80px;
}

.grade-input {
  width: 120px;
}

.operator {
  white-space: nowrap;
  color: #666;
}

.ratio-label {
  margin-left: 10px;
  color: #666;
}

.delete-btn {
  color: #ff4d4f;
  margin-left: 10px;
}

.add-btn {
  margin: 10px 0;
  color: #165dff;
}
</style>
