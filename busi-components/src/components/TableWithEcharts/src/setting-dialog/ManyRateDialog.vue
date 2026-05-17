<!-- 设置 多率 对话框 -->
<template>
  <sjDialog
    v-model="showManyRateDialog"
    title="多率设置 (设置仅对本账号，本次生效)"
    width="500px"
    :close-on-click-modal="false"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleManyRateConfirm"
    @cancel="handleManyRateCancel"
  >
    <div class="grade-setting-container" style="padding-top: 20px;">
      <!-- 设置方式选择 -->
      <el-row :gutter="20" class="setting-row">
        <el-col :span="13">
          <el-form-item label="设置方式:">
            <el-select v-model="settingMode" @change="handleModeChange" placeholder="请选择设置方式">
              <el-option label="独立分段设置" value="independent" />
              <el-option label="累计分段设置" value="cumulative" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" class="text-right">
          <el-button type="text" :icon="Refresh" @click="restoreDefaults">
            恢复默认值
          </el-button>
        </el-col>
      </el-row>

      <!-- 档线选择 -->
      <el-form-item label="选择档线:">
        <el-radio-group v-model="gradeCount" @change="handleGradeCountChange" class="grade-count-radio">
          <el-radio :label="3">3档</el-radio>
          <el-radio :label="4">4档</el-radio>
          <el-radio :label="5">5档</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 独立分段设置内容 -->
      <template v-if="settingMode === 'independent'">
        <el-form-item v-for="(grade, index) in grades" :key="index" :label="grade.levelName + ':'">
          <div class="range-inputs">
            <el-input-number
              v-model="grade.minRate"
              :min="0"
              :max="100"
              :step="1"
              suffix="%"
              class="input-min"
            />
            <span class="range-operator">≤ 得分率</span>
            <template v-if="grade.isMax">
              <span class="range-operator">≤</span>
              <el-input-number
                v-model="grade.maxRate"
                :min="grade.minRate"
                :max="100"
                :step="1"
                suffix="%"
                class="input-max"
              />
            </template>
            <template v-else>
              <span class="range-operator">
                <
              </span>
              <el-input-number
                v-model="grade.maxRate"
                :min="grade.minRate"
                :max="100"
                :step="1"
                suffix="%"
                class="input-max"
              />
            </template>

            <!-- 低分档的包含选项 -->
            <el-checkbox v-if="grade.isLowest" v-model="grade.includeMin" class="include-checkbox">
              包含{{ grade.maxRate }}%
            </el-checkbox>
          </div>
        </el-form-item>
      </template>

      <!-- 累计分段设置内容 -->
      <template v-if="settingMode === 'cumulative'">
        <el-form-item v-for="(grade, index) in grades" :key="index" :label="grade.levelName + ':'">
          <div class="cumulative-inputs">
            <span class="range-operator">得分率</span>
            <template v-if="!grade.isLowest">
              <span class="range-operator">≥</span>
              <el-input-number 
                v-model="grade.minRate" 
                :min="0" 
                :max="100" 
                :step="1" 
                suffix="%"
                class="input-threshold" 
              />
            </template>
            <template v-else>
              <span class="range-operator">
                <
              </span>
              <el-input-number
                v-model="grade.minRate"
                :min="0"
                :max="100"
                :step="1"
                suffix="%"
                class="input-threshold"
              />
              <el-checkbox
                v-model="grade.includeMin"
                class="include-checkbox"
                style="margin-left: 20px;"
              >
                包含{{ grade.minRate }}%
              </el-checkbox>
            </template>
          </div>
        </el-form-item>
      </template>
    </div>
  </sjDialog>

</template>

<script lang="ts" setup>
import { sjDialog } from "@sjjb/components";
import { ElMessage } from "element-plus";
import { ref, onMounted, reactive, toRefs, watch } from 'vue';
import { Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(["update:modelValue", "confirm", "cancel", "handleBtn"]);

const showManyRateDialog = ref(false)

// 设置多率 确认按钮
const handleManyRateConfirm = async () => {
  saveToStorage();
  showManyRateDialog.value = false
  // 可以添加保存成功的提示
  ElMessage.success('设置已保存');
  emit("handleBtn");
}

// 设置多率 取消按钮
const handleManyRateCancel = async () => {
  emit("handleBtn");
  showManyRateDialog.value = false
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newVal => {
    showManyRateDialog.value = newVal;
    if (newVal) {
    }
  },
  { immediate: true }
);

// 监听 visible 变化
watch(showManyRateDialog, newVal => {
  emit("update:modelValue", newVal);
});


// 定义评分档次类型
interface Grade {
  levelName: string;       // 档次名称
  minRate?: number;        // 最小值（独立分段用）
  maxRate?: number;        // 最大值（独立分段用）
  threshold?: number;  // 阈值（累计分段用）
  isMax?: boolean;     // 是否为最高档
  isLowest?: boolean;  // 是否为最低档
  includeMin?: boolean; // 是否包含最大值（独立分段最低档用）
  includeThreshold?: boolean; // 是否包含阈值（累计分段最低档用）
}

// 存储键名
const STORAGE_KEY = 'gradeSettingConfig';

// 状态定义
const state = reactive({
  settingMode: 'independent' as 'independent' | 'cumulative',
  gradeCount: 4 as 3 | 4 | 5,
  grades: [] as Grade[],
  // 用于取消操作时恢复原始值
  originalData: {
    settingMode: 'independent' as 'independent' | 'cumulative',
    gradeCount: 4 as 3 | 4 | 5,
    grades: [] as Grade[]
  }
});

const { settingMode, gradeCount, grades, originalData } = toRefs(state);

// 获取默认配置
const getDefaultConfig = (mode: 'independent' | 'cumulative', count: 3 | 4 | 5): Grade[] => {
  // 基础档次配置（根据数量过滤）
  const baseGrades = [
    { levelName: '优秀', isMax: true, isLowest: false },
    { levelName: '良好', isMax: false, isLowest: false },
    { levelName: '合格', isMax: false, isLowest: false },
    { levelName: '低分', isMax: false, isLowest: true }
  ]
  let activeGrades = baseGrades
  if (count === 5) {
    // 先修改原最高等级
    baseGrades[0].isMax = false;
    // 再添加新的最高等级
    activeGrades = [{ levelName: '高分', isMax: true, isLowest: false }, ...baseGrades];
  } else if (count === 3) {
    activeGrades = [baseGrades[0], baseGrades[2], baseGrades[3]];
  }

  // 根据模式设置不同的默认值
  if (mode === 'independent') {
    return activeGrades.map((grade, index, array) => {
      const total = array.length;
      let minRate = 0;
      let maxRate = 100;

      // 设置默认区间
      if (count === 5) {
        if (grade.levelName === '高分') {
          minRate = '';
          maxRate = '';
        } else if (grade.levelName === '优秀') {
          minRate = 90;
          maxRate = 100;
        } else if (grade.levelName === '良好') {
          minRate = 80;
          maxRate = 90;
        } else if (grade.levelName === '合格') {
          minRate = 60;
          maxRate = 80;
        } else if (grade.levelName === '低分') {
          minRate = 0;
          maxRate = 30;
        }
      } else if (count === 3) {
        if (grade.levelName === '优秀') {
          minRate = 90;
          maxRate = 100;
        } else if (grade.levelName === '合格') {
          minRate = 60;
          maxRate = 90;
        } else if (grade.levelName === '低分') {
          minRate = 0;
          maxRate = 60;
        }
      } else {
        if (grade.levelName === '优秀') {
          minRate = 90;
          maxRate = 100;
        } else if (grade.levelName === '良好') {
          minRate = 80;
          maxRate = 90;
        } else if (grade.levelName === '合格') {
          minRate = 60;
          maxRate = 80;
        } else if (grade.levelName === '低分') {
          minRate = 0;
          maxRate = 30;
        }
      }


      return {
        ...grade,
        minRate,
        maxRate,
        includeMin: false
      };
    });
  } else {
    // 累计分段模式
    return activeGrades.map((grade) => {
      let minRate = 0;

      if (count === 5) {
        if (grade.levelName === '高分') {
          minRate = '';
        } else if (grade.levelName === '优秀') {
          minRate = 90;
        } else if (grade.levelName === '良好') {
          minRate = 80;
        } else if (grade.levelName === '合格') {
          minRate = 60;
        } else if (grade.levelName === '低分') {
          minRate = 30;
        }
      } else if (count === 3) {
        if (grade.levelName === '优秀') {
          minRate = 90;
        } else if (grade.levelName === '合格') {
          minRate = 60;
        } else if (grade.levelName === '低分') {
          minRate = 60;
        }
      } else {
        if (grade.levelName === '优秀') {
          minRate = 90;
        } else if (grade.levelName === '良好') {
          minRate = 80;
        } else if (grade.levelName === '合格') {
          minRate = 60;
        } else if (grade.levelName === '低分') {
          minRate = 30;
        }
      }

      return {
        ...grade,
        minRate,
        includeMin: false
      };
    });
  }
};

// 从本地存储加载配置
const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        settingMode: parsed.settingMode || 'independent',
        gradeCount: parsed.gradeCount || 4,
        grades: parsed.grades || getDefaultConfig(
          parsed.settingMode || 'independent',
          parsed.gradeCount || 4
        )
      };
    } catch (e) {
      console.error('Failed to parse saved config', e);
    }
  }
  // 返回默认配置
  return {
    settingMode: 'independent',
    gradeCount: 4,
    grades: getDefaultConfig('independent', 4)
  };
};

// 保存到本地存储
const saveToStorage = () => {
  const config = {
    settingMode: settingMode.value,
    gradeCount: gradeCount.value,
    grades: grades.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// 初始化 grades 数据
const initGrades = () => {
  grades.value = getDefaultConfig(settingMode.value, gradeCount.value);
};

// 处理设置方式变更
const handleModeChange = (newMode: 'independent' | 'cumulative') => {
  settingMode.value = newMode;
  initGrades();
};

// 处理档线数量变更
const handleGradeCountChange = (count: 3 | 4 | 5) => {
  gradeCount.value = count;
  initGrades();
};

// 恢复默认值
const restoreDefaults = () => {
  initGrades();
};

// 监听档次变化，确保区间逻辑正确
watch(grades, (newVal) => {
  // 对于独立分段模式，确保区间不重叠
  if (settingMode.value === 'independent') {
    for (let i = 0; i < newVal.length - 1; i++) {
      const current = newVal[i];
      const next = newVal[i + 1];
      if (current && next && current.minRate !== undefined && next.maxRate !== undefined) {
        // 确保当前最小值小于下一个最大值
        if (current.minRate >= next.maxRate) {
          next.maxRate = current.minRate;
        }
      }
    }
  }
}, { deep: true });

// 页面挂载时加载数据
onMounted(() => {
  const { settingMode: mode, gradeCount: count, grades: loadedGrades } = loadFromStorage();
  settingMode.value = mode;
  gradeCount.value = count;
  grades.value = loadedGrades;
});

</script>
<style scoped></style>
