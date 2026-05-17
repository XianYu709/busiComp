<template>
  <div class="panel">
    <div class="title">Grammar Detective</div>
    <div class="subtitle">Find the grammar mistake in the sentence!</div>

    <div class="game-area">
      <!-- 语法点提示 -->
      <div class="grammar-hint">
        <p class="hint-text">
          Grammar Focus:
          <span class="hint-value">{{ currentQuestion?.grammarPoint || "Loading..." }}</span>
        </p>
      </div>

      <!-- 提示信息 -->
      <div class="message" :class="messageType">
        <p v-if="!messageText">Click on the word that has a grammar mistake</p>
        <p v-else>{{ messageText }}</p>
      </div>

      <!-- 句子显示区域 -->
      <div class="sentence-container">
        <span
          v-for="(word, index) in words"
          :key="index"
          class="word"
          :class="{
            'word-hover': hoveredWordIndex === index,
            'correct-word': wordStatus[index] === 'correct',
            'wrong-word': wordStatus[index] === 'wrong',
          }"
          :data-index="index"
          @click="handleWordClick(index)"
          @mouseenter="hoveredWordIndex = index"
          @mouseleave="hoveredWordIndex = null">
          {{ word }}
        </span>
      </div>

      <!-- 按钮区域 -->
      <div class="actions">
        <button v-if="showNext" class="btn btn-accent" @click="nextSentence">
          <i class="icon-arrow"></i>
          Next Sentence
        </button>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-desc">
      Instructions: Each sentence contains one grammar mistake. Click on the word that has the
      mistake. Test your skills in tenses, subject-verb agreement, articles, and more!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// 语法题库 - 包含句子、错误单词位置、正确形式和语法点提示
const grammarQuestions = [
  {
    sentence: "She go to school every day.",
    mistakeIndex: 1,
    correctForm: "goes",
    grammarPoint: "Subject-verb agreement (third person singular)",
  },
  {
    sentence: "I have buy a new book yesterday.",
    mistakeIndex: 2,
    correctForm: "bought",
    grammarPoint: "Past tense of irregular verbs",
  },
  {
    sentence: "They are playing football when it started to rain.",
    mistakeIndex: 2,
    correctForm: "were",
    grammarPoint: "Past continuous tense",
  },
  {
    sentence: "There is three apples on the table.",
    mistakeIndex: 1,
    correctForm: "are",
    grammarPoint: "Subject-verb agreement (plural)",
  },
  {
    sentence: "He don't like to eat vegetables.",
    mistakeIndex: 1,
    correctForm: "doesn't",
    grammarPoint: "Negative present simple (third person)",
  },
  {
    sentence: "She has been living here since five years.",
    mistakeIndex: 5,
    correctForm: "for",
    grammarPoint: "Prepositions with time (for/since)",
  },
  {
    sentence: "This is the good movie I have ever seen.",
    mistakeIndex: 3,
    correctForm: "best",
    grammarPoint: "Superlative form of adjectives",
  },
  {
    sentence: "We will going to visit our grandparents next week.",
    mistakeIndex: 2,
    correctForm: "go",
    grammarPoint: "Future tense (will + base verb)",
  },
  {
    sentence: "The cat is laying on the sofa.",
    mistakeIndex: 3,
    correctForm: "lying",
    grammarPoint: "Irregular verbs (lie/lay)",
  },
  {
    sentence: "I didn't knew the answer to the question.",
    mistakeIndex: 2,
    correctForm: "know",
    grammarPoint: "Past simple negative (base verb)",
  },
  {
    sentence: "She is more tall than her brother.",
    mistakeIndex: 2,
    correctForm: "taller",
    grammarPoint: "Comparative form of adjectives",
  },
  {
    sentence: "There are much students in the classroom.",
    mistakeIndex: 2,
    correctForm: "many",
    grammarPoint: "Countable vs uncountable nouns (many/much)",
  },
  {
    sentence: "If it will rain tomorrow, we will stay at home.",
    mistakeIndex: 3,
    correctForm: "rains",
    grammarPoint: "First conditional (present simple in if-clause)",
  },
  {
    sentence: "I have been study English for three years.",
    mistakeIndex: 3,
    correctForm: "studying",
    grammarPoint: "Present perfect continuous tense",
  },
  {
    sentence: "The book who I read was very interesting.",
    mistakeIndex: 2,
    correctForm: "that/which",
    grammarPoint: "Relative pronouns (for things)",
  },
  {
    sentence: "I am go to the library tomorrow.",
    mistakeIndex: 1,
    correctForm: "going",
    grammarPoint: "Present continuous for future plans",
  },
  {
    sentence: "She can plays the piano very well.",
    mistakeIndex: 2,
    correctForm: "play",
    grammarPoint: "Modal verbs (base verb after can)",
  },
  {
    sentence: "The students was listening to the teacher.",
    mistakeIndex: 1,
    correctForm: "were",
    grammarPoint: "Subject-verb agreement (plural)",
  },
  {
    sentence: "He have finished his homework already.",
    mistakeIndex: 1,
    correctForm: "has",
    grammarPoint: "Present perfect (third person singular)",
  },
  {
    sentence: "I saw a interesting movie last night.",
    mistakeIndex: 1,
    correctForm: "an",
    grammarPoint: "Articles (a/an before vowel sounds)",
  },
  {
    sentence: "She is good in English than math.",
    mistakeIndex: 3,
    correctForm: "at",
    grammarPoint: "Prepositions (good at, not good in)",
  },
  {
    sentence: "They was playing basketball yesterday.",
    mistakeIndex: 1,
    correctForm: "were",
    grammarPoint: "Past continuous tense (plural subject)",
  },
  {
    sentence: "I want to going to the park.",
    mistakeIndex: 2,
    correctForm: "go",
    grammarPoint: "Infinitive after 'want to'",
  },
  {
    sentence: "The dog was bite by a cat.",
    mistakeIndex: 2,
    correctForm: "bitten",
    grammarPoint: "Passive voice (past participle)",
  },
  {
    sentence: "She don't have any brothers.",
    mistakeIndex: 1,
    correctForm: "doesn't",
    grammarPoint: "Negative present simple (third person)",
  },
  {
    sentence: "I have been wait here for two hours.",
    mistakeIndex: 3,
    correctForm: "waiting",
    grammarPoint: "Present perfect continuous (verb + ing)",
  },
  {
    sentence: "He is more smart than his friend.",
    mistakeIndex: 2,
    correctForm: "smarter",
    grammarPoint: "Comparative form (one-syllable adjectives)",
  },
  {
    sentence: "There is a lot of books on the shelf.",
    mistakeIndex: 1,
    correctForm: "are",
    grammarPoint: "Subject-verb agreement with 'a lot of'",
  },
  {
    sentence: "I will call you when I will arrive.",
    mistakeIndex: 4,
    correctForm: "arrive",
    grammarPoint: "Time clauses (present simple after 'when')",
  },
  {
    sentence: "She is the most beautifulest girl in class.",
    mistakeIndex: 3,
    correctForm: "most beautiful",
    grammarPoint: "Superlative form (no double superlative)",
  },
  {
    sentence: "The teacher asked me where do I live.",
    mistakeIndex: 4,
    correctForm: "I live",
    grammarPoint: "Indirect questions (no question word order)",
  },
  {
    sentence: "I have less friends than you.",
    mistakeIndex: 2,
    correctForm: "fewer",
    grammarPoint: "Countable vs uncountable (fewer/less)",
  },
  {
    sentence: "He said that he is tired.",
    mistakeIndex: 3,
    correctForm: "was",
    grammarPoint: "Reported speech (tense backshift)",
  },
  {
    sentence: "She is interested on science.",
    mistakeIndex: 3,
    correctForm: "in",
    grammarPoint: "Prepositions (interested in)",
  },
  {
    sentence: "I have been to Beijing last year.",
    mistakeIndex: 4,
    correctForm: "went",
    grammarPoint: "Past simple with specific time",
  },
  {
    sentence: "The boy which lives next door is my friend.",
    mistakeIndex: 1,
    correctForm: "who",
    grammarPoint: "Relative pronouns (for people)",
  },
  {
    sentence: "She is afraid from the dark.",
    mistakeIndex: 2,
    correctForm: "of",
    grammarPoint: "Prepositions (afraid of)",
  },
  {
    sentence: "I wish I was rich.",
    mistakeIndex: 3,
    correctForm: "were",
    grammarPoint: "Subjunctive mood (I wish I were)",
  },
  {
    sentence: "He is used to live in the countryside.",
    mistakeIndex: 3,
    correctForm: "living",
    grammarPoint: "Used to vs be used to (gerund)",
  },
  {
    sentence: "The movie was so bored that I fell asleep.",
    mistakeIndex: 3,
    correctForm: "boring",
    grammarPoint: "Adjectives ending in -ed vs -ing",
  },
  {
    sentence: "I have been working here since three years.",
    mistakeIndex: 4,
    correctForm: "for",
    grammarPoint: "Prepositions with time (for/since)",
  },
  {
    sentence: "She is the taller student in the class.",
    mistakeIndex: 2,
    correctForm: "tallest",
    grammarPoint: "Superlative form (the + superlative)",
  },
  {
    sentence: "I would rather to stay home today.",
    mistakeIndex: 2,
    correctForm: "stay",
    grammarPoint: "Would rather (base verb, no 'to')",
  },
  {
    sentence: "The car was drive by my father.",
    mistakeIndex: 2,
    correctForm: "driven",
    grammarPoint: "Passive voice (past participle)",
  },
  {
    sentence: "I look forward to see you soon.",
    mistakeIndex: 3,
    correctForm: "seeing",
    grammarPoint: "Phrasal verbs (look forward to + gerund)",
  },
  {
    sentence: "He is not enough old to drive.",
    mistakeIndex: 2,
    correctForm: "old enough",
    grammarPoint: "Word order (enough + noun/adjective)",
  },
  {
    sentence: "She speaks English very good.",
    mistakeIndex: 3,
    correctForm: "well",
    grammarPoint: "Adverbs vs adjectives (good/well)",
  },
  {
    sentence: "I have been knowing him for five years.",
    mistakeIndex: 2,
    correctForm: "known",
    grammarPoint: "Present perfect (not used with 'knowing')",
  },
  {
    sentence: "The information are very useful.",
    mistakeIndex: 1,
    correctForm: "is",
    grammarPoint: "Uncountable nouns (singular verb)",
  },
  {
    sentence: "I suggest you to study harder.",
    mistakeIndex: 2,
    correctForm: "study",
    grammarPoint: "Suggest (no 'to' before verb)",
  },
  {
    sentence: "She is married with a doctor.",
    mistakeIndex: 2,
    correctForm: "to",
    grammarPoint: "Prepositions (married to)",
  },
  {
    sentence: "I prefer coffee than tea.",
    mistakeIndex: 2,
    correctForm: "to",
    grammarPoint: "Prepositions (prefer...to)",
  },
  {
    sentence: "The children was playing in the garden.",
    mistakeIndex: 1,
    correctForm: "were",
    grammarPoint: "Subject-verb agreement (children is plural)",
  },
  {
    sentence: "I have been wait for the bus since 8 o'clock.",
    mistakeIndex: 2,
    correctForm: "waiting",
    grammarPoint: "Present perfect continuous (verb + ing)",
  },
  {
    sentence: "He is the most clever student in school.",
    mistakeIndex: 2,
    correctForm: "cleverest",
    grammarPoint: "Comparative forms (clever - cleverer/cleverest)",
  },
  {
    sentence: "I am looking forward for the weekend.",
    mistakeIndex: 3,
    correctForm: "to",
    grammarPoint: "Phrasal verbs (look forward to)",
  },
  {
    sentence: "She was born in 1990, isn't she?",
    mistakeIndex: 4,
    correctForm: "wasn't",
    grammarPoint: "Tag questions (match the main verb)",
  },
  {
    sentence: "The news are very interesting today.",
    mistakeIndex: 1,
    correctForm: "is",
    grammarPoint: "Uncountable nouns (news is singular)",
  },
  {
    sentence: "I have been to London two years ago.",
    mistakeIndex: 4,
    correctForm: "went",
    grammarPoint: "Past simple with 'ago'",
  },
  {
    sentence: "He is good in playing basketball.",
    mistakeIndex: 2,
    correctForm: "at",
    grammarPoint: "Prepositions (good at)",
  },
  {
    sentence: "I would like that you help me.",
    mistakeIndex: 2,
    correctForm: "you to help",
    grammarPoint: "Would like (would like + object + to + verb)",
  },
  {
    sentence: "The police is looking for the suspect.",
    mistakeIndex: 1,
    correctForm: "are",
    grammarPoint: "Collective nouns (police is plural)",
  },
  {
    sentence: "She is the most beautiful than her sister.",
    mistakeIndex: 2,
    correctForm: "more beautiful",
    grammarPoint: "Comparative vs superlative",
  },
];

const currentQuestion = ref<(typeof grammarQuestions)[0] | null>(null);
const words = ref<string[]>([]);
const isAnswered = ref(false);
const showNext = ref(false);
const messageText = ref("");
const messageType = ref("");
const wordStatus = ref<Record<number, "correct" | "wrong">>({});
const hoveredWordIndex = ref<number | null>(null);

// 初始化游戏
const initGame = () => {
  // 随机选择一个题目
  const randomIndex = Math.floor(Math.random() * grammarQuestions.length);
  currentQuestion.value = grammarQuestions[randomIndex] || null;

  if (!currentQuestion.value) return;

  // 分割句子为单词（保留标点符号）
  words.value = currentQuestion.value.sentence.split(/\s+/);

  // 重置状态
  messageText.value = "";
  messageType.value = "";
  showNext.value = false;
  isAnswered.value = false;
  wordStatus.value = {};
  hoveredWordIndex.value = null;
};

// 处理单词点击
const handleWordClick = (index: number) => {
  if (isAnswered.value || !currentQuestion.value) return;

  isAnswered.value = true;
  const isCorrect = index === currentQuestion.value.mistakeIndex;

  if (isCorrect) {
    wordStatus.value[index] = "correct";
    showMessage(`Correct! The word should be "${currentQuestion.value.correctForm}"`, "success");
  } else {
    wordStatus.value[index] = "wrong";
    // 同时高亮正确的错误单词
    wordStatus.value[currentQuestion.value.mistakeIndex] = "correct";
    const correctWord = words.value[currentQuestion.value.mistakeIndex];
    showMessage(
      `Not quite. The mistake is in "${correctWord}" – it should be "${currentQuestion.value.correctForm}"`,
      "error",
    );
  }

  // 显示下一题按钮
  showNext.value = true;
};

// 显示提示信息
const showMessage = (text: string, type: "success" | "error" | "warning") => {
  messageText.value = text;
  messageType.value = type;
};

// 下一题
const nextSentence = () => {
  initGame();
};

onMounted(() => {
  initGame();
});
</script>

<style scoped>
.panel {
  width: min(980px, 100%);
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.title {
  text-align: center;
  font-weight: 700;
  font-size: clamp(1.6rem, 5vw, 2.2rem);
  color: #1e40af;
  margin-bottom: 8px;
  font-family: "Comic Sans MS", cursive;
}

.subtitle {
  text-align: center;
  color: #64748b;
  margin-bottom: 16px;
}

.game-area {
  background: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  margin-bottom: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.grammar-hint {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 24px;
  text-align: center;
}

.hint-text {
  color: #374151;
  font-weight: 500;
  margin: 0;
}

.hint-value {
  color: #1e40af;
}

.message {
  text-align: center;
  margin-bottom: 24px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message p {
  margin: 0;
}

.message.success {
  color: #10b981;
}

.message.error {
  color: #ef4444;
}

.message.warning {
  color: #f59e0b;
}

.sentence-container {
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  min-height: 80px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 12px;
  margin-bottom: 24px;
}

.word {
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  user-select: none;
}

.word:hover {
  background-color: rgba(30, 64, 175, 0.1);
  transform: scale(1.05);
}

.word.word-hover {
  background-color: rgba(30, 64, 175, 0.1);
  transform: scale(1.05);
}

.word.correct-word {
  background-color: rgba(16, 185, 129, 0.2);
  border: 2px solid #10b981;
}

.word.wrong-word {
  background-color: rgba(239, 68, 68, 0.2);
  border: 2px solid #ef4444;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-accent {
  background: #f59e0b;
}

.btn-accent:hover {
  background: rgba(245, 158, 11, 0.9);
}

.icon-arrow::before {
  content: "→";
  font-weight: bold;
}

.game-desc {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

:deep(.fullscreen-content) .panel {
  height: 100%;
}
</style>
