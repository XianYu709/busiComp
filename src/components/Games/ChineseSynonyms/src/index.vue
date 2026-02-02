<template>
  <div class="panel" ref="panelRef">
    <div class="title">近义词连连看</div>
    <div class="subtitle">把意思相近的词语连起来吧！</div>

    <!-- 游戏区域 -->
    <div class="game-area" ref="gameAreaRef">
      <!-- 提示信息 -->
      <div class="message" :class="messageType">
        <p v-if="!messageText">请先点击左边的词语，再点击右边意思相近的词语进行连线</p>
        <p v-else>{{ messageText }}</p>
      </div>

      <!-- 词语区域 -->
      <div class="words-container">
        <!-- 左侧词语 -->
        <div class="words-column left-column">
          <p class="column-label">左边词语</p>
          <div class="words-list">
            <div
              v-for="(word, index) in leftWords"
              :key="`left-${index}`"
              :id="`left-${index}`"
              class="word-card left-word"
              :class="{
                selected: selectedLeftWord === `left-${index}`,
                connected: isLeftWordConnected(`left-${index}`),
              }"
              :data-word="word"
              :ref="el => setLeftEl(`left-${index}`, el)"
              @click="handleLeftWordClick(`left-${index}`)">
              {{ word }}
            </div>
          </div>
        </div>

        <!-- 中间连接区域 -->
        <div class="middle-area"></div>

        <!-- 右侧词语 -->
        <div class="words-column right-column">
          <p class="column-label">右边词语</p>
          <div class="words-list">
            <div
              v-for="(word, index) in rightWords"
              :key="`right-${index}`"
              :id="`right-${index}`"
              class="word-card right-word"
              :class="{
                connected: isRightWordConnected(`right-${index}`),
              }"
              :data-word="word"
              :ref="el => setRightEl(`right-${index}`, el)"
              @click="handleRightWordClick(`right-${index}`)">
              {{ word }}
            </div>
          </div>
        </div>
      </div>

      <!-- 连接线容器 -->
      <div class="lines" :data-k="refresh">
        <div
          v-for="ln in lineStyles"
          :key="ln.id"
          class="connection-line"
          :class="ln.className"
          :style="ln.style" />
      </div>

      <!-- 按钮区域 -->
      <div class="actions">
        <button v-if="!showNext" class="btn btn-primary" @click="checkAnswer">
          <i class="icon-check"></i>
          检查答案
        </button>
        <button v-else class="btn btn-accent" @click="nextQuestion">
          <i class="icon-arrow"></i>
          下一题
        </button>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-desc">
      游戏说明：先点击左边的词语，再点击右边意思相近的词语进行连线，全部连完后点击"检查答案"按钮
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

// 近义词词库 - 每组包含4对近义词
const synonymGroups = [
  {
    pairs: [
      { left: "美丽", right: "漂亮" },
      { left: "高兴", right: "开心" },
      { left: "快速", right: "迅速" },
      { left: "喜欢", right: "喜爱" },
    ],
  },
  {
    pairs: [
      { left: "忽然", right: "突然" },
      { left: "朋友", right: "伙伴" },
      { left: "好像", right: "仿佛" },
      { left: "帮助", right: "帮忙" },
    ],
  },
  {
    pairs: [
      { left: "快乐", right: "快活" },
      { left: "渐渐", right: "慢慢" },
      { left: "有名", right: "著名" },
      { left: "常常", right: "经常" },
    ],
  },
  {
    pairs: [
      { left: "认真", right: "仔细" },
      { left: "希望", right: "期望" },
      { left: "中心", right: "中央" },
      { left: "本领", right: "本事" },
    ],
  },
  {
    pairs: [
      { left: "马上", right: "立刻" },
      { left: "明白", right: "知道" },
      { left: "平常", right: "平时" },
      { left: "容易", right: "简单" },
    ],
  },
  {
    pairs: [
      { left: "安静", right: "宁静" },
      { left: "温暖", right: "暖和" },
      { left: "明亮", right: "光亮" },
      { left: "干净", right: "清洁" },
    ],
  },
  {
    pairs: [
      { left: "巨大", right: "庞大" },
      { left: "微小", right: "细小" },
      { left: "宽阔", right: "宽广" },
      { left: "狭窄", right: "狭小" },
    ],
  },
  {
    pairs: [
      { left: "勇敢", right: "英勇" },
      { left: "害怕", right: "恐惧" },
      { left: "聪明", right: "智慧" },
      { left: "愚蠢", right: "笨拙" },
    ],
  },
  {
    pairs: [
      { left: "开始", right: "开端" },
      { left: "结束", right: "终止" },
      { left: "继续", right: "持续" },
      { left: "停止", right: "暂停" },
    ],
  },
  {
    pairs: [
      { left: "寻找", right: "找寻" },
      { left: "发现", right: "发觉" },
      { left: "观察", right: "观看" },
      { left: "思考", right: "思索" },
    ],
  },
  {
    pairs: [
      { left: "美丽", right: "漂亮" },
      { left: "丑陋", right: "难看" },
      { left: "新鲜", right: "新颖" },
      { left: "陈旧", right: "古老" },
    ],
  },
  {
    pairs: [
      { left: "快乐", right: "愉快" },
      { left: "悲伤", right: "难过" },
      { left: "兴奋", right: "激动" },
      { left: "平静", right: "安静" },
    ],
  },
  {
    pairs: [
      { left: "认真", right: "仔细" },
      { left: "马虎", right: "粗心" },
      { left: "努力", right: "勤奋" },
      { left: "懒惰", right: "懈怠" },
    ],
  },
  {
    pairs: [
      { left: "成功", right: "胜利" },
      { left: "失败", right: "挫折" },
      { left: "进步", right: "前进" },
      { left: "后退", right: "倒退" },
    ],
  },
  {
    pairs: [
      { left: "喜欢", right: "喜爱" },
      { left: "讨厌", right: "厌恶" },
      { left: "关心", right: "关爱" },
      { left: "忽视", right: "忽略" },
    ],
  },
  {
    pairs: [
      { left: "帮助", right: "协助" },
      { left: "阻碍", right: "妨碍" },
      { left: "支持", right: "支援" },
      { left: "反对", right: "抵制" },
    ],
  },
  {
    pairs: [
      { left: "保护", right: "守护" },
      { left: "破坏", right: "损坏" },
      { left: "建设", right: "建造" },
      { left: "拆除", right: "拆毁" },
    ],
  },
  {
    pairs: [
      { left: "增加", right: "增多" },
      { left: "减少", right: "削减" },
      { left: "提高", right: "提升" },
      { left: "降低", right: "下降" },
    ],
  },
  {
    pairs: [
      { left: "重要", right: "重大" },
      { left: "普通", right: "平常" },
      { left: "特殊", right: "特别" },
      { left: "一般", right: "通常" },
    ],
  },
  {
    pairs: [
      { left: "快速", right: "迅速" },
      { left: "缓慢", right: "迟缓" },
      { left: "急忙", right: "匆忙" },
      { left: "悠闲", right: "清闲" },
    ],
  },
  {
    pairs: [
      { left: "大声", right: "响亮" },
      { left: "小声", right: "轻声" },
      { left: "吵闹", right: "喧闹" },
      { left: "寂静", right: "安静" },
    ],
  },
  {
    pairs: [
      { left: "明亮", right: "光亮" },
      { left: "黑暗", right: "昏暗" },
      { left: "清晰", right: "清楚" },
      { left: "模糊", right: "朦胧" },
    ],
  },
  {
    pairs: [
      { left: "坚硬", right: "坚固" },
      { left: "柔软", right: "松软" },
      { left: "光滑", right: "平滑" },
      { left: "粗糙", right: "毛糙" },
    ],
  },
  {
    pairs: [
      { left: "高大", right: "魁梧" },
      { left: "矮小", right: "低矮" },
      { left: "肥胖", right: "臃肿" },
      { left: "瘦弱", right: "纤细" },
    ],
  },
  {
    pairs: [
      { left: "年轻", right: "年青" },
      { left: "年老", right: "年迈" },
      { left: "健康", right: "健壮" },
      { left: "虚弱", right: "衰弱" },
    ],
  },
  {
    pairs: [
      { left: "富裕", right: "富有" },
      { left: "贫穷", right: "贫困" },
      { left: "丰富", right: "充足" },
      { left: "缺乏", right: "缺少" },
    ],
  },
  {
    pairs: [
      { left: "热闹", right: "喧闹" },
      { left: "冷清", right: "清静" },
      { left: "繁华", right: "繁荣" },
      { left: "萧条", right: "冷落" },
    ],
  },
  {
    pairs: [
      { left: "整齐", right: "整洁" },
      { left: "杂乱", right: "混乱" },
      { left: "干净", right: "清洁" },
      { left: "肮脏", right: "污浊" },
    ],
  },
  {
    pairs: [
      { left: "完整", right: "完好" },
      { left: "破碎", right: "破裂" },
      { left: "坚固", right: "牢固" },
      { left: "脆弱", right: "易碎" },
    ],
  },
  {
    pairs: [
      { left: "新鲜", right: "新颖" },
      { left: "陈旧", right: "古老" },
      { left: "现代", right: "当代" },
      { left: "传统", right: "古典" },
    ],
  },
  {
    pairs: [
      { left: "简单", right: "容易" },
      { left: "复杂", right: "困难" },
      { left: "轻松", right: "容易" },
      { left: "艰难", right: "困难" },
    ],
  },
  {
    pairs: [
      { left: "安全", right: "平安" },
      { left: "危险", right: "风险" },
      { left: "稳定", right: "稳固" },
      { left: "动荡", right: "不安" },
    ],
  },
  {
    pairs: [
      { left: "正确", right: "准确" },
      { left: "错误", right: "失误" },
      { left: "真实", right: "确实" },
      { left: "虚假", right: "虚伪" },
    ],
  },
  {
    pairs: [
      { left: "善良", right: "仁慈" },
      { left: "邪恶", right: "凶恶" },
      { left: "友好", right: "友善" },
      { left: "敌对", right: "敌视" },
    ],
  },
  {
    pairs: [
      { left: "诚实", right: "真诚" },
      { left: "虚伪", right: "虚假" },
      { left: "正直", right: "公正" },
      { left: "狡猾", right: "奸诈" },
    ],
  },
  {
    pairs: [
      { left: "谦虚", right: "谦逊" },
      { left: "骄傲", right: "自大" },
      { left: "自信", right: "相信" },
      { left: "自卑", right: "自轻" },
    ],
  },
  {
    pairs: [
      { left: "耐心", right: "耐性" },
      { left: "急躁", right: "着急" },
      { left: "冷静", right: "镇定" },
      { left: "慌张", right: "慌乱" },
    ],
  },
  {
    pairs: [
      { left: "仔细", right: "认真" },
      { left: "粗心", right: "马虎" },
      { left: "细心", right: "细致" },
      { left: "大意", right: "疏忽" },
    ],
  },
  {
    pairs: [
      { left: "勤奋", right: "努力" },
      { left: "懒惰", right: "懈怠" },
      { left: "刻苦", right: "用功" },
      { left: "松懈", right: "放松" },
    ],
  },
  {
    pairs: [
      { left: "坚强", right: "刚强" },
      { left: "软弱", right: "脆弱" },
      { left: "勇敢", right: "英勇" },
      { left: "胆小", right: "怯懦" },
    ],
  },
  {
    pairs: [
      { left: "灵活", right: "敏捷" },
      { left: "呆板", right: "死板" },
      { left: "机灵", right: "聪明" },
      { left: "迟钝", right: "缓慢" },
    ],
  },
  {
    pairs: [
      { left: "活泼", right: "活跃" },
      { left: "沉闷", right: "死寂" },
      { left: "开朗", right: "乐观" },
      { left: "忧郁", right: "忧愁" },
    ],
  },
  {
    pairs: [
      { left: "温柔", right: "温和" },
      { left: "粗暴", right: "粗鲁" },
      { left: "和蔼", right: "亲切" },
      { left: "严厉", right: "严格" },
    ],
  },
  {
    pairs: [
      { left: "热情", right: "热心" },
      { left: "冷淡", right: "冷漠" },
      { left: "友好", right: "友善" },
      { left: "敌意", right: "恶意" },
    ],
  },
  {
    pairs: [
      { left: "高兴", right: "开心" },
      { left: "难过", right: "悲伤" },
      { left: "兴奋", right: "激动" },
      { left: "沮丧", right: "失望" },
    ],
  },
  {
    pairs: [
      { left: "满意", right: "满足" },
      { left: "失望", right: "沮丧" },
      { left: "惊喜", right: "意外" },
      { left: "平静", right: "安静" },
    ],
  },
  {
    pairs: [
      { left: "惊讶", right: "惊奇" },
      { left: "镇定", right: "冷静" },
      { left: "紧张", right: "焦虑" },
      { left: "放松", right: "轻松" },
    ],
  },
  {
    pairs: [
      { left: "想念", right: "思念" },
      { left: "忘记", right: "遗忘" },
      { left: "记得", right: "记住" },
      { left: "忽略", right: "忽视" },
    ],
  },
  {
    pairs: [
      { left: "理解", right: "明白" },
      { left: "困惑", right: "疑惑" },
      { left: "清楚", right: "清晰" },
      { left: "模糊", right: "朦胧" },
    ],
  },
  {
    pairs: [
      { left: "相信", right: "信任" },
      { left: "怀疑", right: "猜疑" },
      { left: "肯定", right: "确定" },
      { left: "否定", right: "否认" },
    ],
  },
  {
    pairs: [
      { left: "同意", right: "赞成" },
      { left: "反对", right: "抵制" },
      { left: "支持", right: "支援" },
      { left: "拒绝", right: "回绝" },
    ],
  },
  {
    pairs: [
      { left: "接受", right: "接收" },
      { left: "拒绝", right: "回绝" },
      { left: "允许", right: "准许" },
      { left: "禁止", right: "阻止" },
    ],
  },
  {
    pairs: [
      { left: "表扬", right: "称赞" },
      { left: "批评", right: "指责" },
      { left: "鼓励", right: "激励" },
      { left: "打击", right: "挫败" },
    ],
  },
  {
    pairs: [
      { left: "尊重", right: "尊敬" },
      { left: "轻视", right: "小看" },
      { left: "重视", right: "看重" },
      { left: "忽视", right: "忽略" },
    ],
  },
  {
    pairs: [
      { left: "爱护", right: "保护" },
      { left: "伤害", right: "损害" },
      { left: "关心", right: "关爱" },
      { left: "冷漠", right: "冷淡" },
    ],
  },
  {
    pairs: [
      { left: "帮助", right: "协助" },
      { left: "阻碍", right: "妨碍" },
      { left: "支持", right: "支援" },
      { left: "反对", right: "抵制" },
    ],
  },
  {
    pairs: [
      { left: "合作", right: "协作" },
      { left: "竞争", right: "比赛" },
      { left: "团结", right: "联合" },
      { left: "分裂", right: "分离" },
    ],
  },
  {
    pairs: [
      { left: "分享", right: "共享" },
      { left: "独占", right: "独享" },
      { left: "给予", right: "提供" },
      { left: "索取", right: "要求" },
    ],
  },
  {
    pairs: [
      { left: "节约", right: "节省" },
      { left: "浪费", right: "挥霍" },
      { left: "珍惜", right: "爱惜" },
      { left: "糟蹋", right: "破坏" },
    ],
  },
  {
    pairs: [
      { left: "保护", right: "守护" },
      { left: "破坏", right: "损坏" },
      { left: "建设", right: "建造" },
      { left: "拆除", right: "拆毁" },
    ],
  },
  {
    pairs: [
      { left: "创造", right: "发明" },
      { left: "模仿", right: "仿照" },
      { left: "创新", right: "革新" },
      { left: "守旧", right: "保守" },
    ],
  },
  {
    pairs: [
      { left: "学习", right: "学习" },
      { left: "复习", right: "温习" },
      { left: "练习", right: "训练" },
      { left: "休息", right: "歇息" },
    ],
  },
  {
    pairs: [
      { left: "进步", right: "前进" },
      { left: "退步", right: "倒退" },
      { left: "提高", right: "提升" },
      { left: "降低", right: "下降" },
    ],
  },
  {
    pairs: [
      { left: "成功", right: "胜利" },
      { left: "失败", right: "挫折" },
      { left: "完成", right: "结束" },
      { left: "开始", right: "开端" },
    ],
  },
  {
    pairs: [
      { left: "准备", right: "预备" },
      { left: "开始", right: "开端" },
      { left: "进行", right: "开展" },
      { left: "结束", right: "终止" },
    ],
  },
  {
    pairs: [
      { left: "等待", right: "等候" },
      { left: "行动", right: "行动" },
      { left: "停止", right: "暂停" },
      { left: "继续", right: "持续" },
    ],
  },
  {
    pairs: [
      { left: "到达", right: "抵达" },
      { left: "离开", right: "离去" },
      { left: "回来", right: "返回" },
      { left: "出发", right: "启程" },
    ],
  },
  {
    pairs: [
      { left: "进入", right: "走进" },
      { left: "退出", right: "离开" },
      { left: "前进", right: "向前" },
      { left: "后退", right: "倒退" },
    ],
  },
  {
    pairs: [
      { left: "上升", right: "升高" },
      { left: "下降", right: "降低" },
      { left: "上升", right: "提升" },
      { left: "下降", right: "跌落" },
    ],
  },
];

const panelRef = ref<HTMLElement | null>(null);
const gameAreaRef = ref<HTMLElement | null>(null);

const currentGroup = ref<(typeof synonymGroups)[0] | null>(null);
const leftWords = ref<string[]>([]);
const rightWords = ref<string[]>([]);
const connections = ref<Record<string, string>>({}); // 存储连接关系：leftId -> rightId
const selectedLeftWord = ref<string | null>(null); // 当前选中的左侧词语
const messageText = ref("");
const messageType = ref("");
const showNext = ref(false);
const refresh = ref(0);
const leftEls = ref<Record<string, HTMLElement | undefined>>({});
const rightEls = ref<Record<string, HTMLElement | undefined>>({});
const lineCorrectness = ref<Record<string, boolean>>({}); // 存储每条线的正确性

// 设置左侧元素引用
const setLeftEl = (wordId: string, el: HTMLElement | null) => {
  if (el) leftEls.value[wordId] = el as HTMLElement;
};

// 设置右侧元素引用
const setRightEl = (wordId: string, el: HTMLElement | null) => {
  if (el) rightEls.value[wordId] = el as HTMLElement;
};

// 初始化游戏
const initGame = () => {
  // 随机选择一组近义词
  const randomIndex = Math.floor(Math.random() * synonymGroups.length);
  currentGroup.value = synonymGroups[randomIndex] || null;

  if (!currentGroup.value) return;

  // 提取左右词语并打乱右侧顺序
  leftWords.value = currentGroup.value.pairs.map(pair => pair.left);
  rightWords.value = [...currentGroup.value.pairs.map(pair => pair.right)].sort(
    () => Math.random() - 0.5,
  );

  // 清空连接
  connections.value = {};
  lineCorrectness.value = {};

  // 重置状态
  messageText.value = "";
  messageType.value = "";
  showNext.value = false;
  selectedLeftWord.value = null;
  refresh.value++;
};

// 点击左侧词语
const handleLeftWordClick = (wordId: string) => {
  // 如果已经连接，取消连接并选中
  if (isLeftWordConnected(wordId)) {
    const rightId = connections.value[wordId];
    if (rightId) {
      // 删除连接和正确性标记
      delete connections.value[wordId];
      delete lineCorrectness.value[`${wordId}-${rightId}`];
      refresh.value++;
    }
    // 选中该词语，允许重新连线
    selectedLeftWord.value = wordId;
    return;
  }

  // 切换选中状态
  if (selectedLeftWord.value === wordId) {
    selectedLeftWord.value = null;
  } else {
    selectedLeftWord.value = wordId;
  }
};

// 点击右侧词语
const handleRightWordClick = (wordId: string) => {
  // 如果没有选中左侧词语，提示用户
  if (!selectedLeftWord.value) {
    showMessage("请先点击左边的词语", "warning");
    return;
  }

  // 如果右侧词语已经连接，先取消它的连接
  if (isRightWordConnected(wordId)) {
    // 找到连接该右侧词语的左侧词语
    Object.entries(connections.value).forEach(([lId, rId]) => {
      if (rId === wordId) {
        delete connections.value[lId];
        delete lineCorrectness.value[`${lId}-${rId}`];
      }
    });
  }

  // 移除左侧词语已有的连接（如果有）
  removeExistingConnections(selectedLeftWord.value, wordId);

  // 建立新连接
  connections.value[selectedLeftWord.value] = wordId;
  delete lineCorrectness.value[`${selectedLeftWord.value}-${wordId}`];

  // 触发重新计算连接线
  refresh.value++;

  // 清除选中状态
  selectedLeftWord.value = null;
};

// 计算连接线样式（参考反义词连连看）
const lineStyles = computed(() => {
  const container = gameAreaRef.value || panelRef.value;
  if (!container) return [] as any[];
  const rect = container.getBoundingClientRect();
  const arr: any[] = [];
  for (const [leftId, rightId] of Object.entries(connections.value)) {
    const le = leftEls.value[leftId];
    const re = rightEls.value[rightId];
    if (!le || !re) continue;
    const lr = le.getBoundingClientRect();
    const rr = re.getBoundingClientRect();
    const sx = lr.right - rect.left;
    const sy = lr.top + lr.height / 2 - rect.top;
    const ex = rr.left - rect.left;
    const ey = rr.top + rr.height / 2 - rect.top;
    const len = Math.hypot(ex - sx, ey - sy);
    const ang = (Math.atan2(ey - sy, ex - sx) * 180) / Math.PI;
    const lineId = `${leftId}-${rightId}`;
    const isCorrect = lineCorrectness.value[lineId];
    arr.push({
      id: lineId,
      className:
        isCorrect === true ? "correct-connection" : isCorrect === false ? "wrong-connection" : "",
      style: { width: `${len}px`, left: `${sx}px`, top: `${sy}px`, transform: `rotate(${ang}deg)` },
    });
  }
  return arr;
});

// 检查左侧词语是否已连接
const isLeftWordConnected = (wordId: string): boolean => {
  return wordId in connections.value;
};

// 检查右侧词语是否已连接
const isRightWordConnected = (wordId: string): boolean => {
  return Object.values(connections.value).includes(wordId);
};

// 移除已有的连接
const removeExistingConnections = (leftId: string, rightId: string) => {
  // 移除左侧词语已有的连接
  if (connections.value[leftId]) {
    const oldRightId = connections.value[leftId];
    delete lineCorrectness.value[`${leftId}-${oldRightId}`];
    delete connections.value[leftId];
  }

  // 移除右侧词语已有的连接
  Object.entries(connections.value).forEach(([lId, rId]) => {
    if (rId === rightId) {
      delete lineCorrectness.value[`${lId}-${rId}`];
      delete connections.value[lId];
    }
  });
};

// 检查答案
const checkAnswer = () => {
  // 检查是否所有词语都已连接
  if (Object.keys(connections.value).length !== leftWords.value.length) {
    showMessage("请把所有词语都连接起来", "warning");
    return;
  }

  if (!currentGroup.value) return;

  let allCorrect = true;
  const correctPairs = currentGroup.value.pairs;

  // 检查每个连接是否正确
  Object.entries(connections.value).forEach(([leftId, rightId]) => {
    // 提取词语
    const leftEl = leftEls.value[leftId];
    const rightEl = rightEls.value[rightId];
    if (!leftEl || !rightEl) return;

    const leftWord = leftEl.getAttribute("data-word");
    const rightWord = rightEl.getAttribute("data-word");

    // 检查是否为正确的近义词对
    const isCorrect = correctPairs.some(pair => pair.left === leftWord && pair.right === rightWord);

    // 标记连接线正确性
    const lineId = `${leftId}-${rightId}`;
    lineCorrectness.value[lineId] = isCorrect;

    if (!isCorrect) {
      allCorrect = false;
    }
  });

  // 触发重新计算连接线样式
  refresh.value++;

  // 显示结果
  if (allCorrect) {
    showMessage("太棒了！所有近义词都配对正确！", "success");
    showNext.value = true;
  } else {
    showMessage("有些配对不正确哦，再检查一下吧！", "error");
  }
};

// 显示提示信息
const showMessage = (text: string, type: "success" | "error" | "warning") => {
  messageText.value = text;
  messageType.value = type;
};

// 下一题
const nextQuestion = () => {
  initGame();
};

// 窗口大小变化时重新计算连接线
const handleResize = () => {
  refresh.value++;
};

onMounted(() => {
  initGame();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
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
  position: relative;
}

.title {
  text-align: center;
  font-weight: 700;
  font-size: clamp(1.6rem, 5vw, 2.2rem);
  color: #3b82f6;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #64748b;
  margin-bottom: 16px;
}

.game-area {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.connection-line {
  position: absolute;
  background-color: #3b82f6;
  transform-origin: 0 0;
  z-index: 10;
  height: 3px;
  pointer-events: none;
}

.connection-line.correct-connection {
  background-color: #10b981;
}

.connection-line.wrong-connection {
  background-color: #ef4444;
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

.words-container {
  display: flex;
  flex-direction: row;
  gap: 0;
  align-items: stretch;
}

.words-column {
  flex-shrink: 0;
}

.left-column {
  width: 22%;
}

.middle-area {
  flex: 1;
  min-width: 0;
}

.right-column {
  width: 22%;
}

.column-label {
  text-align: center;
  color: #64748b;
  margin-bottom: 16px;
  font-size: 14px;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.word-card {
  padding: 10px 14px;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.left-word {
  background: #3b82f6;
  color: #fff;
}

.left-word:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.left-word.selected {
  background: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
  transform: scale(1.05);
}

.left-word.connected {
  background: #10b981;
  opacity: 0.8;
}

.right-word {
  background: #f3f4f6;
  color: #1f2937;
}

.right-word:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.right-word.connected {
  background: #d1fae5;
  color: #065f46;
  opacity: 0.8;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
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

.btn-primary {
  background: #3b82f6;
}

.btn-primary:hover {
  background: rgba(59, 130, 246, 0.9);
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
  padding: 16px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

:deep(.fullscreen-content) .panel {
  height: 100%;
}
</style>

