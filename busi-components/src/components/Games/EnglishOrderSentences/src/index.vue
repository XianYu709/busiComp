<template>
  <div class="panel">
    <div class="title">Sentence Builder</div>
    <div class="subtitle">Drag the words to form a correct sentence</div>

    <div class="game-area">
      <!-- 提示信息 -->
      <div class="message" :class="messageType">
        <p v-if="!messageText">Drag words from below to the slots</p>
        <p v-else>{{ messageText }}</p>
      </div>

      <!-- 卡槽区域 -->
      <div class="slots-container">
        <div
          v-for="(slot, i) in slots"
          :key="i"
          class="slot"
          :class="{
            'slot-hover': hoveredSlot === i,
            'correct-slot': slotStatus[i] === 'correct',
            'wrong-slot': slotStatus[i] === 'wrong',
          }"
          @dragover.prevent="handleSlotDragOver(i)"
          @dragleave="handleSlotDragLeave(i)"
          @drop="handleSlotDrop(i)">
          <div
            v-if="slot"
            class="slot-word"
            :class="{ dragging: draggedWord === slot && dragSource === 'slot' }"
            draggable="true"
            :data-word="slot"
            @dragstart="handleWordDragStart(slot, 'slot', i)"
            @dragend="handleWordDragEnd"
            @click="handleSlotWordClick(i)">
            {{ slot }}
          </div>
        </div>
      </div>

      <!-- 词语池 -->
      <div class="word-bank">
        <p class="word-bank-label">Word Bank</p>
        <div class="words-container">
          <div
            v-for="(word, idx) in pool"
            :key="`pool-${word}-${idx}`"
            class="word"
            :class="{ dragging: draggedWord === word && dragSource === 'pool' }"
            draggable="true"
            :data-word="word"
            @dragstart="handleWordDragStart(word, 'pool')"
            @dragend="handleWordDragEnd">
            {{ word }}
          </div>
        </div>
      </div>

      <!-- 按钮区域 -->
      <div class="actions">
        <button v-if="!showNext" class="btn btn-primary" @click="checkAnswer">
          <i class="icon-check"></i>
          Check Answer
        </button>
        <button v-else class="btn btn-accent" @click="nextSentence">
          <i class="icon-arrow"></i>
          Next Sentence
        </button>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-desc">
      Instructions: Drag words from the word bank to the slots above. Arrange them in the correct
      order to form a sentence.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// 英语句子库 - 适合小学生的英语句子
const sentences = [
  {
    full: "The cat is on the mat",
    words: ["The", "cat", "is", "on", "the", "mat"],
  },
  {
    full: "We are playing in the park",
    words: ["We", "are", "playing", "in", "the", "park"],
  },
  {
    full: "She eats an apple every day",
    words: ["She", "eats", "an", "apple", "every", "day"],
  },
  {
    full: "He can ride a blue bike",
    words: ["He", "can", "ride", "a", "blue", "bike"],
  },
  {
    full: "They will go to school tomorrow",
    words: ["They", "will", "go", "to", "school", "tomorrow"],
  },
  {
    full: "I have a little dog at home",
    words: ["I", "have", "a", "little", "dog", "at", "home"],
  },
  {
    full: "Birds sing loudly in the tree",
    words: ["Birds", "sing", "loudly", "in", "the", "tree"],
  },
  {
    full: "My mother cooks delicious food",
    words: ["My", "mother", "cooks", "delicious", "food"],
  },
  {
    full: "The sun shines brightly today",
    words: ["The", "sun", "shines", "brightly", "today"],
  },
  {
    full: "We learn English in the classroom",
    words: ["We", "learn", "English", "in", "the", "classroom"],
  },
  {
    full: "She reads books every evening",
    words: ["She", "reads", "books", "every", "evening"],
  },
  {
    full: "The dog runs after the ball",
    words: ["The", "dog", "runs", "after", "the", "ball"],
  },
  {
    full: "They play football on Sundays",
    words: ["They", "play", "football", "on", "Sundays"],
  },
  {
    full: "I drink milk for breakfast",
    words: ["I", "drink", "milk", "for", "breakfast"],
  },
  {
    full: "The flowers look very beautiful",
    words: ["The", "flowers", "look", "very", "beautiful"],
  },
  {
    full: "I like to eat apples",
    words: ["I", "like", "to", "eat", "apples"],
  },
  {
    full: "She is my best friend",
    words: ["She", "is", "my", "best", "friend"],
  },
  {
    full: "We go to the park together",
    words: ["We", "go", "to", "the", "park", "together"],
  },
  {
    full: "He likes playing basketball",
    words: ["He", "likes", "playing", "basketball"],
  },
  {
    full: "The teacher is very kind",
    words: ["The", "teacher", "is", "very", "kind"],
  },
  {
    full: "I can swim in the pool",
    words: ["I", "can", "swim", "in", "the", "pool"],
  },
  {
    full: "They are happy today",
    words: ["They", "are", "happy", "today"],
  },
  {
    full: "My father works in a hospital",
    words: ["My", "father", "works", "in", "a", "hospital"],
  },
  {
    full: "The book is on the desk",
    words: ["The", "book", "is", "on", "the", "desk"],
  },
  {
    full: "I want to buy a new toy",
    words: ["I", "want", "to", "buy", "a", "new", "toy"],
  },
  {
    full: "She helps her mother at home",
    words: ["She", "helps", "her", "mother", "at", "home"],
  },
  {
    full: "We study hard every day",
    words: ["We", "study", "hard", "every", "day"],
  },
  {
    full: "The cat sits on the chair",
    words: ["The", "cat", "sits", "on", "the", "chair"],
  },
  {
    full: "I love my family very much",
    words: ["I", "love", "my", "family", "very", "much"],
  },
  {
    full: "He runs fast in the race",
    words: ["He", "runs", "fast", "in", "the", "race"],
  },
  {
    full: "The sky is blue and clear",
    words: ["The", "sky", "is", "blue", "and", "clear"],
  },
  {
    full: "I have breakfast at seven",
    words: ["I", "have", "breakfast", "at", "seven"],
  },
  {
    full: "She draws pictures in class",
    words: ["She", "draws", "pictures", "in", "class"],
  },
  {
    full: "We visit the zoo on weekends",
    words: ["We", "visit", "the", "zoo", "on", "weekends"],
  },
  {
    full: "The bird flies high in the sky",
    words: ["The", "bird", "flies", "high", "in", "the", "sky"],
  },
  {
    full: "I wear a red coat today",
    words: ["I", "wear", "a", "red", "coat", "today"],
  },
  {
    full: "He plays piano every evening",
    words: ["He", "plays", "piano", "every", "evening"],
  },
  {
    full: "The fish swims in the water",
    words: ["The", "fish", "swims", "in", "the", "water"],
  },
  {
    full: "I write a letter to my friend",
    words: ["I", "write", "a", "letter", "to", "my", "friend"],
  },
  {
    full: "She dances beautifully on stage",
    words: ["She", "dances", "beautifully", "on", "stage"],
  },
  {
    full: "We plant trees in spring",
    words: ["We", "plant", "trees", "in", "spring"],
  },
  {
    full: "The moon shines at night",
    words: ["The", "moon", "shines", "at", "night"],
  },
  {
    full: "I clean my room on Saturday",
    words: ["I", "clean", "my", "room", "on", "Saturday"],
  },
  {
    full: "He jumps high in the game",
    words: ["He", "jumps", "high", "in", "the", "game"],
  },
  {
    full: "The rabbit hops in the garden",
    words: ["The", "rabbit", "hops", "in", "the", "garden"],
  },
  {
    full: "I watch TV after dinner",
    words: ["I", "watch", "TV", "after", "dinner"],
  },
  {
    full: "She sings a song for us",
    words: ["She", "sings", "a", "song", "for", "us"],
  },
  {
    full: "We build a sandcastle on the beach",
    words: ["We", "build", "a", "sandcastle", "on", "the", "beach"],
  },
  {
    full: "The wind blows gently today",
    words: ["The", "wind", "blows", "gently", "today"],
  },
  {
    full: "I ride my bike to school",
    words: ["I", "ride", "my", "bike", "to", "school"],
  },
  {
    full: "He catches the ball with his hands",
    words: ["He", "catches", "the", "ball", "with", "his", "hands"],
  },
  {
    full: "The stars twinkle in the dark",
    words: ["The", "stars", "twinkle", "in", "the", "dark"],
  },
  {
    full: "I brush my teeth before bed",
    words: ["I", "brush", "my", "teeth", "before", "bed"],
  },
  {
    full: "She makes a cake for her birthday",
    words: ["She", "makes", "a", "cake", "for", "her", "birthday"],
  },
  {
    full: "We fly kites on windy days",
    words: ["We", "fly", "kites", "on", "windy", "days"],
  },
  {
    full: "The butterfly lands on the flower",
    words: ["The", "butterfly", "lands", "on", "the", "flower"],
  },
  {
    full: "I feed the ducks in the pond",
    words: ["I", "feed", "the", "ducks", "in", "the", "pond"],
  },
  {
    full: "He climbs the tree carefully",
    words: ["He", "climbs", "the", "tree", "carefully"],
  },
  {
    full: "The rain falls from the clouds",
    words: ["The", "rain", "falls", "from", "the", "clouds"],
  },
  {
    full: "I pack my bag for school",
    words: ["I", "pack", "my", "bag", "for", "school"],
  },
  {
    full: "She waters the plants every morning",
    words: ["She", "waters", "the", "plants", "every", "morning"],
  },
  {
    full: "We share our toys with friends",
    words: ["We", "share", "our", "toys", "with", "friends"],
  },
];

const currentSentence = ref<(typeof sentences)[0] | null>(null);
const originalWords = ref<string[]>([]);
const pool = ref<string[]>([]);
const slots = ref<(string | null)[]>([]);
const draggedWord = ref<string | null>(null);
const dragSource = ref<"pool" | "slot">("pool");
const draggedSlotIndex = ref<number | null>(null);
const hoveredSlot = ref<number | null>(null);
const showNext = ref(false);
const messageText = ref("");
const messageType = ref("");
const slotStatus = ref<Record<number, "correct" | "wrong">>({});

// 初始化游戏
const initGame = () => {
  // 随机选择一个句子
  const randomIndex = Math.floor(Math.random() * sentences.length);
  currentSentence.value = sentences[randomIndex];

  if (!currentSentence.value) return;

  // 获取预设的正确分词
  originalWords.value = [...currentSentence.value.words];

  // 打乱单词顺序
  pool.value = [...originalWords.value].sort(() => Math.random() - 0.5);

  // 初始化卡槽
  slots.value = Array.from({ length: originalWords.value.length }, () => null);

  // 重置状态
  messageText.value = "";
  messageType.value = "";
  showNext.value = false;
  slotStatus.value = {};
  draggedWord.value = null;
  hoveredSlot.value = null;
};

// 处理卡槽拖拽悬停
const handleSlotDragOver = (index: number) => {
  hoveredSlot.value = index;
};

// 处理卡槽拖拽离开
const handleSlotDragLeave = (index: number) => {
  if (hoveredSlot.value === index) {
    hoveredSlot.value = null;
  }
};

// 处理卡槽放置
const handleSlotDrop = (index: number) => {
  hoveredSlot.value = null;

  if (!draggedWord.value) return;

  // 如果卡槽已有内容，将其放回单词池
  if (slots.value[index]) {
    pool.value.push(slots.value[index]!);
  }

  // 放入新单词
  slots.value[index] = draggedWord.value;

  // 从原位置移除
  if (dragSource.value === "pool") {
    const poolIndex = pool.value.indexOf(draggedWord.value);
    if (poolIndex >= 0) {
      pool.value.splice(poolIndex, 1);
    }
  } else if (dragSource.value === "slot" && draggedSlotIndex.value !== null) {
    slots.value[draggedSlotIndex.value] = null;
  }

  // 清除拖拽状态
  draggedWord.value = null;
  dragSource.value = "pool";
  draggedSlotIndex.value = null;

  // 清除该卡槽的状态标记
  delete slotStatus.value[index];
};

// 处理单词拖拽开始
const handleWordDragStart = (word: string, source: "pool" | "slot", slotIndex?: number) => {
  draggedWord.value = word;
  dragSource.value = source;
  if (source === "slot" && slotIndex !== undefined) {
    draggedSlotIndex.value = slotIndex;
  }
};

// 处理单词拖拽结束
const handleWordDragEnd = () => {
  draggedWord.value = null;
  dragSource.value = "pool";
  draggedSlotIndex.value = null;
};

// 处理卡槽中单词的点击（重新拖动）
const handleSlotWordClick = (index: number) => {
  if (!slots.value[index]) return;

  const word = slots.value[index]!;
  // 将单词放回单词池
  pool.value.push(word);
  slots.value[index] = null;
  // 清除状态标记
  delete slotStatus.value[index];
};

// 检查答案
const checkAnswer = () => {
  // 检查是否所有卡槽都已填满
  const isComplete = slots.value.every(slot => slot !== null);

  if (!isComplete) {
    showMessage("Please fill all the slots", "warning");
    return;
  }

  // 清除之前的状态
  slotStatus.value = {};

  let isAllCorrect = true;

  // 检查每个位置是否正确
  slots.value.forEach((slot, index) => {
    if (slot === originalWords.value[index]) {
      slotStatus.value[index] = "correct";
    } else {
      slotStatus.value[index] = "wrong";
      isAllCorrect = false;
    }
  });

  // 显示结果
  if (isAllCorrect) {
    showMessage("Excellent! Perfect sentence!", "success");
    showNext.value = true;
  } else {
    showMessage("Not quite right. Try again!", "error");

    // 3秒后移除错误标记，方便重新尝试
    setTimeout(() => {
      slotStatus.value = {};
    }, 3000);
  }
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
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  color: #1e40af;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #64748b;
  margin-bottom: 16px;
}

.game-area {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.message {
  text-align: center;
  margin-bottom: 20px;
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

.slots-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
  min-height: 80px;
}

.slot {
  min-width: 50px;
  height: 56px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  transition: all 0.3s ease;
  background: #fff;
}

.slot.slot-hover {
  border-color: #1e40af;
  background-color: rgba(30, 64, 175, 0.05);
}

.slot.correct-slot {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.slot.wrong-slot {
  border-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.slot-word {
  background: #1e40af;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: move;
  user-select: none;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.slot-word:hover {
  background: #1e3a8a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.3);
}

.slot-word.dragging {
  opacity: 0.7;
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(30, 64, 175, 0.2);
}

.word-bank {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.word-bank-label {
  text-align: center;
  color: #64748b;
  margin-bottom: 12px;
  font-size: 14px;
}

.words-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  min-height: 60px;
}

.word {
  background: #1e40af;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: move;
  user-select: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.word:hover {
  background: #1e3a8a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.25);
}

.word.dragging {
  opacity: 0.7;
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(30, 64, 175, 0.2);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
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

.btn-primary {
  background: #1e40af;
}

.btn-primary:hover {
  background: rgba(30, 64, 175, 0.9);
}

.btn-accent {
  background: #f59e0b;
}

.btn-accent:hover {
  background: rgba(245, 158, 11, 0.9);
}

.icon-check::before {
  content: "✓";
  font-weight: bold;
}

.icon-arrow::before {
  content: "→";
  font-weight: bold;
}

.game-desc {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

:deep(.fullscreen-content) .panel {
  height: 100%;
}
</style>
