<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- 标题区域 -->
    <header class="text-center mb-10">
      <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-gray-800 mb-3">
        <i class="fa fa-flask text-primary mr-2"></i>
        句子解剖台
      </h1>
      <p class="text-gray-600 max-w-3xl mx-auto">
        识别长难句中的句子成分，点击单词选择其语法功能，剖析句子结构，提升阅读理解能力
      </p>
    </header>

    <!-- 主要内容区域 -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div class="p-6">
        <!-- 进度指示器 -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-500 mr-2">当前题目:</span>
            <span class="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
              {{ currentSentenceIndex + 1 }}/{{ sentenceBank.length }}
            </span>
          </div>
          <div class="text-sm font-medium">
            得分:
            <span class="text-primary">{{ score }}</span>
          </div>
        </div>

        <!-- 句子显示区域 -->
        <div class="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-100">
          <h2 class="text-lg font-semibold mb-4 text-gray-700">请分析下列句子成分:</h2>
          <div v-if="isCompleted" class="text-center py-8">
            <h3 class="text-2xl font-bold text-primary mb-4">恭喜完成所有练习！</h3>
            <p class="text-gray-600 mb-6">
              你的总得分: {{ score }} / {{ sentenceBank.length * 100 }}
            </p>
            <button
              @click="restartGame"
              class="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-all">
              <i class="fa fa-refresh mr-2"></i>
              重新开始
            </button>
          </div>

          <div v-else class="text-xl leading-relaxed font-mono min-h-[80px]">
            <span
              v-for="(token, index) in currentSentence.tokens"
              :key="index"
              class="word-token"
              :class="{
                [`highlight-${userAnswers[index]}`]: userAnswers[index],
                'ring-2 ring-green-500':
                  isAnswered && token.role && userAnswers[index] === token.role,
                'ring-2 ring-red-500':
                  isAnswered &&
                  token.role &&
                  userAnswers[index] &&
                  userAnswers[index] !== token.role,
              }"
              @click="handleWordClick(index)">
              {{ token.word }}
            </span>
          </div>
        </div>

        <!-- 工具选择面板 -->
        <div v-if="!isCompleted" class="mb-8">
          <h3 class="text-md font-semibold mb-3 text-gray-700">选择成分类型:</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(tool, key) in tools"
              :key="key"
              :data-role="key"
              class="tool-btn px-4 py-2 rounded-md hover:bg-opacity-20 transition-all"
              :class="{
                [`bg-${key}/10`]: true,
                [`text-${key}`]: true,
                'ring-2 ring-offset-2': selectedRole === key,
              }"
              @click="selectRole(key)">
              <i :class="tool.icon + ' mr-1'"></i>
              {{ tool.label }}
            </button>
          </div>
        </div>

        <!-- 检查与提交 -->
        <div v-if="!isCompleted && !isAnswered" class="flex justify-between mb-6">
          <button
            @click="clearSelection"
            class="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all">
            <i class="fa fa-eraser mr-2"></i>
            清除选择
          </button>
          <button
            @click="checkAnswer"
            class="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-all">
            <i class="fa fa-check mr-2"></i>
            检查答案
          </button>
        </div>

        <!-- 解析结果区域 -->
        <div v-if="isAnswered && !isCompleted" class="mt-6">
          <div class="p-5 bg-gray-50 rounded-lg border border-gray-100 mb-6">
            <h3 class="text-md font-semibold mb-3 text-gray-700">
              <i class="fa fa-sitemap text-primary mr-2"></i>
              句子骨架
            </h3>
            <div class="skeleton-box bg-white">
              {{ currentSentence.skeleton }}
            </div>

            <h3 class="text-md font-semibold mb-3 text-gray-700 mt-6">
              <i class="fa fa-language text-primary mr-2"></i>
              参考翻译
            </h3>
            <div class="bg-white p-4 rounded-lg border border-gray-100">
              {{ currentSentence.translation }}
            </div>
          </div>

          <button
            @click="goToNextSentence"
            class="w-full py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-all text-center">
            <i class="fa fa-arrow-right mr-2"></i>
            下一个句子
          </button>
        </div>
      </div>
    </div>

    <!-- 提示说明 -->
    <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4 flex items-center">
        <i class="fa fa-lightbulb-o text-primary mr-2"></i>
        使用说明
      </h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium text-gray-700 mb-2">操作步骤</h3>
          <ol class="list-decimal pl-5 text-gray-600 space-y-2">
            <li>从工具面板选择要识别的句子成分类型</li>
            <li>点击句子中对应的单词或短语进行标记</li>
            <li>完成所有成分识别后，点击"检查答案"</li>
            <li>查看解析结果和句子骨架，点击"下一个句子"继续</li>
          </ol>
        </div>
        <div>
          <h3 class="font-medium text-gray-700 mb-2">语法提示</h3>
          <ul class="list-disc pl-5 text-gray-600 space-y-2">
            <li>
              <span
                class="inline-block w-4 h-4 bg-subject/20 border border-subject rounded-sm mr-1"></span>
              主语：句子描述的主体
            </li>
            <li>
              <span
                class="inline-block w-4 h-4 bg-predicate/20 border border-predicate rounded-sm mr-1"></span>
              谓语：表示主语的动作或状态
            </li>
            <li>
              <span
                class="inline-block w-4 h-4 bg-attribute/20 border border-attribute rounded-sm mr-1"></span>
              定语：修饰名词或代词的成分
            </li>
            <li>
              <span
                class="inline-block w-4 h-4 bg-adverbial/20 border border-adverbial rounded-sm mr-1"></span>
              状语：修饰动词、形容词或整个句子
            </li>
            <li>
              <span
                class="inline-block w-4 h-4 bg-nonfinite/20 border border-nonfinite rounded-sm mr-1"></span>
              非谓语：分词、动名词、不定式等
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="text-center text-gray-500 text-sm py-4">
      <p>高中英语教学 · 长难句分析交互工具</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// 定义句子成分类型
type RoleType =
  | "subject"
  | "predicate"
  | "object"
  | "attribute"
  | "adverbial"
  | "appositive"
  | "nonfinite"
  | null;

// 定义单词标记接口
interface Token {
  word: string;
  role: RoleType;
  isNonfinite?: boolean;
}

// 定义句子接口
interface Sentence {
  id: number;
  sentence: string;
  tokens: Token[];
  skeleton: string;
  translation: string;
}

// 定义工具按钮接口
interface Tool {
  icon: string;
  label: string;
}

// 句子库
const sentenceBank: Sentence[] = [
  {
    id: 1,
    sentence: "The girl who is wearing a red dress is my sister who studies in Beijing.",
    tokens: [
      { word: "The", role: null },
      { word: "girl", role: "subject" },
      { word: "who", role: "attribute" },
      { word: "is", role: "attribute" },
      { word: "wearing", role: "attribute" },
      { word: "a", role: null },
      { word: "red", role: "attribute" },
      { word: "dress", role: "attribute" },
      { word: "is", role: "predicate" },
      { word: "my", role: null },
      { word: "sister", role: "object" },
      { word: "who", role: "attribute" },
      { word: "studies", role: "attribute" },
      { word: "in", role: "attribute" },
      { word: "Beijing.", role: "attribute" },
    ],
    skeleton: "The girl ... is my sister ...",
    translation: "那个穿红裙子的女孩是我在北京读书的姐姐。",
  },
  {
    id: 2,
    sentence: "We think that learning English well will help us achieve our dreams.",
    tokens: [
      { word: "We", role: "subject" },
      { word: "think", role: "predicate" },
      { word: "that", role: null },
      { word: "learning", role: "object", isNonfinite: true },
      { word: "English", role: "object" },
      { word: "well", role: "adverbial" },
      { word: "will", role: null },
      { word: "help", role: "object" },
      { word: "us", role: "object" },
      { word: "achieve", role: "nonfinite" },
      { word: "our", role: null },
      { word: "dreams.", role: "nonfinite" },
    ],
    skeleton: "We think that ... will help us ...",
    translation: "我们认为学好英语会帮助我们实现梦想。",
  },
  {
    id: 3,
    sentence: "When he came into the classroom, he found all the students reading quietly.",
    tokens: [
      { word: "When", role: "adverbial" },
      { word: "he", role: "adverbial" },
      { word: "came", role: "adverbial" },
      { word: "into", role: "adverbial" },
      { word: "the", role: null },
      { word: "classroom,", role: "adverbial" },
      { word: "he", role: "subject" },
      { word: "found", role: "predicate" },
      { word: "all", role: null },
      { word: "the", role: null },
      { word: "students", role: "object" },
      { word: "reading", role: "nonfinite" },
      { word: "quietly.", role: "adverbial" },
    ],
    skeleton: "When ..., he found students ...",
    translation: "当他走进教室时，发现所有学生都在安静地阅读。",
  },
  {
    id: 4,
    sentence: "The fact that he has already left for Shanghai surprises everyone in the office.",
    tokens: [
      { word: "The", role: null },
      { word: "fact", role: "subject" },
      { word: "that", role: null },
      { word: "he", role: "appositive" },
      { word: "has", role: "appositive" },
      { word: "already", role: "appositive" },
      { word: "left", role: "appositive" },
      { word: "for", role: "appositive" },
      { word: "Shanghai", role: "appositive" },
      { word: "surprises", role: "predicate" },
      { word: "everyone", role: "object" },
      { word: "in", role: "attribute" },
      { word: "the", role: null },
      { word: "office.", role: "attribute" },
    ],
    skeleton: "The fact that ... surprises everyone ...",
    translation: "他已经动身去上海这一事实让办公室里的每个人都很惊讶。",
  },
  {
    id: 5,
    sentence:
      "To improve our writing skills, we should read more good books which are written by famous authors.",
    tokens: [
      { word: "To", role: "nonfinite" },
      { word: "improve", role: "nonfinite" },
      { word: "our", role: null },
      { word: "writing", role: "nonfinite" },
      { word: "skills,", role: "nonfinite" },
      { word: "we", role: "subject" },
      { word: "should", role: null },
      { word: "read", role: "predicate" },
      { word: "more", role: null },
      { word: "good", role: "attribute" },
      { word: "books", role: "object" },
      { word: "which", role: "attribute" },
      { word: "are", role: "attribute" },
      { word: "written", role: "attribute" },
      { word: "by", role: "attribute" },
      { word: "famous", role: "attribute" },
      { word: "authors.", role: "attribute" },
    ],
    skeleton: "To ..., we should read books which ...",
    translation: "为了提高我们的写作技巧，我们应该多读著名作家写的好书。",
  },
];

// 工具按钮配置
const tools: Record<Exclude<RoleType, null>, Tool> = {
  subject: { icon: "fa fa-circle-o", label: "主语" },
  predicate: { icon: "fa fa-play", label: "谓语" },
  object: { icon: "fa fa-square-o", label: "宾语" },
  attribute: { icon: "fa fa-tag", label: "定语(从句)" },
  adverbial: { icon: "fa fa-arrows-h", label: "状语(从句)" },
  appositive: { icon: "fa fa-equals", label: "同位语" },
  nonfinite: { icon: "fa fa-minus", label: "非谓语" },
};

// 游戏状态
const currentSentenceIndex = ref(0);
const selectedRole = ref<RoleType>(null);
const userAnswers = ref<RoleType[]>([]);
const score = ref(0);
const isAnswered = ref(false);

// 计算属性
const currentSentence = computed(() => sentenceBank[currentSentenceIndex.value]);
const isCompleted = computed(() => currentSentenceIndex.value >= sentenceBank.length);

// 初始化当前句子
const initCurrentSentence = () => {
  userAnswers.value = Array(currentSentence.value.tokens.length).fill(null);
  selectedRole.value = null;
  isAnswered.value = false;
};

// 选择句子成分类型
const selectRole = (role: RoleType) => {
  if (isAnswered.value) return;
  selectedRole.value = role;
};

// 处理单词点击
const handleWordClick = (index: number) => {
  if (isAnswered.value || !selectedRole.value) return;
  userAnswers.value[index] =
    userAnswers.value[index] === selectedRole.value ? null : selectedRole.value;
};

// 清除选择
const clearSelection = () => {
  if (isAnswered.value) return;
  userAnswers.value = Array(currentSentence.value.tokens.length).fill(null);
  selectedRole.value = null;
};

// 检查答案
const checkAnswer = () => {
  if (isAnswered.value) return;

  let correctCount = 0;
  let totalItems = 0;

  currentSentence.value.tokens.forEach((token, index) => {
    if (token.role) {
      totalItems++;
      if (userAnswers.value[index] === token.role) {
        correctCount++;
      }
    }
  });

  // 计算得分
  const questionScore = Math.round((correctCount / totalItems) * 100);
  score.value += questionScore;
  isAnswered.value = true;
};

// 下一个句子
const goToNextSentence = () => {
  currentSentenceIndex.value++;
  if (!isCompleted.value) {
    initCurrentSentence();
  }
};

// 重新开始游戏
const restartGame = () => {
  currentSentenceIndex.value = 0;
  score.value = 0;
  initCurrentSentence();
};

// 初始化
initCurrentSentence();
</script>

<style scoped>
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
  .word-token {
    @apply px-1.5 py-0.5 rounded cursor-pointer transition-all;
  }
  .word-token:hover {
    @apply bg-gray-100;
  }
  .highlight-subject {
    @apply bg-subject/20 text-subject border-b-2 border-subject;
  }
  .highlight-predicate {
    @apply bg-predicate/20 text-predicate border-b-2 border-predicate;
  }
  .highlight-object {
    @apply bg-object/20 text-object border-b-2 border-object;
  }
  .highlight-attribute {
    @apply bg-attribute/20 text-attribute border-b-2 border-attribute;
  }
  .highlight-adverbial {
    @apply bg-adverbial/20 text-adverbial border-b-2 border-adverbial;
  }
  .highlight-appositive {
    @apply bg-appositive/20 text-appositive border-b-2 border-appositive;
  }
  .highlight-nonfinite {
    @apply bg-nonfinite/20 text-nonfinite border-b-2 border-nonfinite;
  }
  .skeleton-box {
    @apply border-2 border-dashed p-4 rounded-lg mb-4 transition-all;
  }
}

/* 引入外部资源 */
/* @import url("https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css"); */

/* 全局样式 */
:root {
  --primary: #3b82f6;
  --subject: #10b981;
  --predicate: #f59e0b;
  --object: #ef4444;
  --attribute: #8b5cf6;
  --adverbial: #ec4899;
  --appositive: #06b6d4;
  --nonfinite: #f97316;
  --background: #f8fafc;
}

body {
  background-color: var(--background);
  min-height: 100vh;
  font-family: "Inter", system-ui, sans-serif;
  color: #1f2937;
}

.font-mono {
  font-family: "Consolas", "Monaco", monospace;
}
</style>
