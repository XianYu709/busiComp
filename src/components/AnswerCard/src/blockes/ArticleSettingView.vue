<template>
  <el-form label-width="70px">
    <el-form-item label="作文字数">
      <el-input-number v-model="model.wordCount" :min="0" size="small" :step="50" />
      <span class="ml-2">字</span>
    </el-form-item>

    <el-form-item label="字数标记">
      <el-radio-group v-model="model.wordMarkType">
        <el-radio label="every">
          <div class="flex items-center">
            每
            <el-select
              style="width: 100px"
              class="ml-2"
              size="small"
              v-model="model.wordMarkInterval">
              <el-option label="100" :value="100" />
              <el-option label="200" :value="200" />
              <el-option label="300" :value="300" />
            </el-select>
          </div>
        </el-radio>

        <el-radio label="min">
          <div class="flex items-center">
            最少字数处
            <el-input-number class="ml-2" size="small" v-model="model.minWordCount" />
          </div>
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="格子大小">
      <el-radio-group v-model="model.gridSize">
        <el-radio label="紧凑">紧凑</el-radio>
        <el-radio label="适中">适中</el-radio>
        <el-radio label="标准">标准</el-radio>
        <el-radio label="较大">较大</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="行间距">
      <el-radio-group v-model="model.lineHeight">
        <el-radio label="0.5mm">0.5mm</el-radio>
        <el-radio label="1mm">1mm</el-radio>
        <el-radio label="1.5mm">1.5mm</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const model = defineModel({
  type: Object as () => {
    wordCount: number;
    wordMarkType: string;
    wordMarkInterval: number;
    minWordCount: number;
    gridSize: string;
    lineHeight: string;
  },
  default: () => ({
    wordCount: 0,
    wordMarkType: "every",
    wordMarkInterval: 100,
    minWordCount: 0,
    gridSize: "标准",
    lineHeight: "1mm",
  }),
});
</script>
