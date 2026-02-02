<template>
  <el-form label-width="70px">
    <!-- <el-form-item label="小题号">
      <el-input v-model="model.prefix" style="width: 200px" placeholder="请输入小题号" />
    </el-form-item> -->
    <el-form-item label="题目类型">
      <el-select
        style="width: 200px"
        placeholder="题目类型"
        v-model="model.questionTypeId"
        :options="typeOptions"
        @change="
          () => {
            model.answerType = 7;
          }
        " />
    </el-form-item>
    <el-form-item label="分数">
      <el-input v-model.number="model.score" style="width: 200px" type="number" :min="0"></el-input>
    </el-form-item>
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
import { ref, watch } from "vue";
import { getQuestionTypes } from "../api";

const model = defineModel({
  type: Object as () => {
    wordCount: number;
    wordMarkType: string;
    wordMarkInterval: number;
    minWordCount: number;
    gridSize: string;
    lineHeight: string;
    questionTypeId: string;
    answerType: string;
    prefix: string;
    score: number;
  },
  default: () => ({
    wordCount: 0,
    score: 0,
    wordMarkType: "every",
    wordMarkInterval: 100,
    minWordCount: 0,
    gridSize: "标准",
    lineHeight: "1mm",
    prefix: "",
    questionTypeId: null,
    answerType: null,
  }),
});

const typeOptions = ref<any[]>([]);

const getOptions = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const info = JSON.parse(urlParams.get("info") || "{}");
  typeOptions.value = await getQuestionTypes({
    answerTypes: 7,
    periodId: info?.period || info?.periodId,
    subjectId: info?.subject || info?.subjectId,
  });
};

getOptions();
</script>
