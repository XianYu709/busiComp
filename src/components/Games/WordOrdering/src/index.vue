<template>
  <div class="word-ordering">
    <div class="title">词语排列小游戏</div>
    <div class="subtitle">把词语拖到正确的位置，组成完整的句子吧！</div>
    <div class="panel">
      <div class="message" v-html="messageHtml"></div>
      <div class="slots" role="list">
        <div
          v-for="(slot, i) in slots"
          :key="i"
          class="slot"
          :class="{ correct: resultMarks[i] === 'correct', wrong: resultMarks[i] === 'wrong' }"
          @dragover.prevent
          @drop="handleDropOnSlot(i)"
          @click="returnSlotWord(i)">
          <span v-if="slot">{{ slot }}</span>
        </div>
      </div>
      <div class="pool" role="list" @dragover.prevent @drop="handleDropOnPool">
        <div
          v-for="(word, idx) in poolWords"
          :key="word + '-' + idx"
          class="word"
          draggable="true"
          @dragstart="draggedWord = word"
          @dragend="draggedWord = null">
          {{ word }}
        </div>
      </div>
      <div class="actions">
        <button class="btn primary" v-if="!showNext" @click="checkAnswer">检查答案</button>
        <button class="btn accent" v-if="showNext" @click="initGame">下一题</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

type Sentence = { full: string; words: string[] };

const sentences: Sentence[] = [
  { full: "小猫在河边钓鱼", words: ["小猫", "在", "河边", "钓鱼"] },
  { full: "我们一起去公园玩", words: ["我们", "一起", "去", "公园", "玩"] },
  { full: "太阳从东方慢慢升起", words: ["太阳", "从", "东方", "慢慢", "升起"] },
  { full: "小鸟在树上快乐唱歌", words: ["小鸟", "在", "树上", "快乐", "唱歌"] },
  { full: "妈妈精心为我做早餐", words: ["妈妈", "精心", "为我", "做", "早餐"] },
  { full: "春天里花儿都开放了", words: ["春天里", "花儿", "都", "开放了"] },
  { full: "弟弟认真地读故事书", words: ["弟弟", "认真地", "读", "故事书"] },
  { full: "天上的白云飘来飘去", words: ["天上的", "白云", "飘来", "飘去"] },
  { full: "老师耐心教我们写字", words: ["老师", "耐心", "教我们", "写字"] },
  { full: "小鱼在水里自由游动", words: ["小鱼", "在", "水里", "自由", "游动"] },
  { full: "我和同学开心做游戏", words: ["我和同学", "开心", "做", "游戏"] },
  { full: "秋天的树叶变黄了", words: ["秋天的", "树叶", "变", "黄了"] },
  { full: "爷爷在院子里种花草", words: ["爷爷", "在", "院子里", "种", "花草"] },
  { full: "这只小狗非常可爱", words: ["这只", "小狗", "非常", "可爱"] },
  { full: "妹妹喜欢画画和唱歌", words: ["妹妹", "喜欢", "画画", "和", "唱歌"] },
];

const current = ref<Sentence | null>(null);
const originalWords = ref<string[]>([]);
const poolWords = ref<string[]>([]);
const slots = ref<(string | null)[]>([]);
const draggedWord = ref<string | null>(null);
const messageHtml = ref("请把下面的词语拖到对应的位置");
const showNext = ref(false);
const resultMarks = ref<("correct" | "wrong" | null)[]>([]);

const initGame = () => {
  const idx = Math.floor(Math.random() * sentences.length);
  current.value = sentences[idx];
  originalWords.value = current.value.words.slice();
  poolWords.value = originalWords.value.slice().sort(() => Math.random() - 0.5);
  slots.value = Array.from({ length: originalWords.value.length }, () => null);
  resultMarks.value = Array.from({ length: originalWords.value.length }, () => null);
  draggedWord.value = null;
  messageHtml.value = "请把下面的词语拖到对应的位置";
  showNext.value = false;
};

const handleDropOnSlot = (i: number) => {
  if (!draggedWord.value) return;
  const existing = slots.value[i];
  if (existing) poolWords.value.push(existing);
  slots.value[i] = draggedWord.value;
  const idx = poolWords.value.indexOf(draggedWord.value);
  if (idx >= 0) poolWords.value.splice(idx, 1);
  draggedWord.value = null;
};

const handleDropOnPool = () => {
  if (!draggedWord.value) return;
  draggedWord.value = null;
};

const returnSlotWord = (i: number) => {
  const w = slots.value[i];
  if (!w) return;
  poolWords.value.push(w);
  slots.value[i] = null;
};

const checkAnswer = () => {
  const allFilled = slots.value.every(x => !!x);
  if (!allFilled) {
    messageHtml.value = '<span class="warn">请把所有卡槽都填满哦</span>';
    return;
  }
  let ok = true;
  for (let i = 0; i < originalWords.value.length; i++) {
    const correct = originalWords.value[i];
    const given = slots.value[i];
    const isRight = given === correct;
    resultMarks.value[i] = isRight ? "correct" : "wrong";
    if (!isRight) ok = false;
  }
  if (ok) {
    messageHtml.value = '<span class="success">太棒了！全部正确！</span>';
    showNext.value = true;
  } else {
    messageHtml.value = '<span class="error">有些位置不对哦，再试试！</span>';
    setTimeout(() => {
      resultMarks.value = Array.from({ length: originalWords.value.length }, () => null);
    }, 2000);
  }
};

onMounted(() => {
  initGame();
});
</script>

<style scoped>
.word-ordering {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #eef2ff;
}
.title {
  font-weight: 700;
  font-size: 20px;
  color: #1e293b;
  text-align: center;
}
.subtitle {
  color: #64748b;
  text-align: center;
}
.panel {
  width: min(980px, 100%);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 20px 20px 24px;
}
.message {
  text-align: center;
  min-height: 24px;
  color: #64748b;
}
.message .success {
  color: #10b981;
}
.message .error {
  color: #ef4444;
}
.message .warn {
  color: #f59e0b;
}
.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  padding: 10px 0 16px;
}
.slot {
  min-width: 64px;
  height: 64px;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}
.slot.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.06);
}
.slot.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.pool {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 16px;
  background: #f3f4f6;
  border-radius: 12px;
}
.word {
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
  color: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: move;
  user-select: none;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
}
.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}
.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn.primary {
  background: #3b82f6;
}
.btn.accent {
  background: #f59e0b;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}
:deep(.fullscreen-content) .word-ordering {
  height: 100%;
}
</style>