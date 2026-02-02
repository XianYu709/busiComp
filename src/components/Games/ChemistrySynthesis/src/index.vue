<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- 标题区域 -->
    <header class="text-center mb-10">
      <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-gray-800 mb-3">有机合成路线图</h1>
      <p class="text-gray-600 max-w-3xl mx-auto">
        从乙烯开始，通过选择正确的反应步骤，合成目标产物乙酸乙酯
      </p>
    </header>

    <!-- 主要内容区域 -->
    <div class="bg-white rounded-xl shadow-soft p-6 mb-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 左侧合成流程区域 -->
        <div class="lg:w-2/3">
          <h2 class="text-xl font-semibold mb-6 flex items-center">
            <i class="fa fa-flask mr-2 text-primary"></i>
            合成流程
          </h2>

          <!-- 合成目标 -->
          <div class="bg-gray-50 rounded-lg p-4 mb-8 text-center">
            <div class="text-lg font-medium mb-2">合成目标</div>
            <div class="flex flex-col md:flex-row items-center justify-center gap-4 my-3">
              <div class="px-4 py-2 bg-reactant/10 text-reactant rounded-lg font-medium">
                原料：乙烯 (C₂H₄)
              </div>
              <i class="fa fa-long-arrow-right text-gray-400"></i>
              <div class="px-4 py-2 bg-product/10 text-product rounded-lg font-medium">
                目标产物：乙酸乙酯 (CH₃COOCH₂CH₃)
              </div>
            </div>
          </div>

          <!-- 合成路径显示 -->
          <div class="mb-8">
            <div id="synthesis-path" class="flex flex-col gap-8">
              <!-- 合成路径步骤 -->
              <template v-for="(step, index) in synthesisPath" :key="index">
                <div class="flex flex-col md:flex-row items-center">
                  <!-- 箭头（除了第一步） -->
                  <template v-if="index > 0">
                    <div class="my-4 md:my-0 md:mx-6 w-full md:w-24 flex flex-col items-center">
                      <div class="reaction-arrow w-full"></div>
                      <div class="text-xs text-reaction mt-1">
                        {{ completedReactions[index - 1].reaction.type }}
                      </div>
                    </div>
                  </template>

                  <!-- 分子卡片 -->
                  <div
                    class="molecule-card bg-white rounded-xl p-4 w-full md:w-auto text-center"
                    :class="[
                      index === 0
                        ? 'bg-reactant/10 border border-reactant'
                        : 'bg-product/10 border border-product',
                      index === synthesisPath.length - 1 ? 'active' : '',
                    ]">
                    <h3 class="font-medium text-lg mb-1">{{ synthesisData[step].name }}</h3>
                    <div class="text-sm text-gray-600 mb-2">{{ synthesisData[step].formula }}</div>
                    <div v-if="index === 0" class="text-xs bg-white/80 rounded px-2 py-1">
                      起始原料
                    </div>
                    <div
                      v-if="synthesisData[step].isTarget"
                      class="text-xs bg-success/20 text-success rounded px-2 py-1">
                      目标产物
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- 反应选择区域 -->
          <div id="reaction-selection" class="bg-gray-50 rounded-xl p-5" v-if="!isCompleted">
            <h3 class="font-semibold mb-4 text-center">选择下一步反应</h3>
            <div id="reaction-options" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <template v-if="currentReactions.length === 0">
                <p class="text-center text-gray-500">没有可进行的反应</p>
              </template>

              <div
                v-for="reaction in currentReactions"
                :key="reaction.id"
                class="reaction-option bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary"
                @click="selectReaction(reaction)">
                <h4 class="font-medium text-reaction mb-1">{{ reaction.name }}</h4>
                <p class="text-xs text-gray-500 mb-2">类型：{{ reaction.type }}</p>
                <p class="text-sm">{{ reaction.equation }}</p>
              </div>
            </div>
          </div>

          <!-- 反馈信息 -->
          <div
            id="feedback"
            class="mt-6 p-4 rounded-lg text-center"
            :class="[
              feedbackType === 'success'
                ? 'bg-success/10 text-success border border-success'
                : 'bg-error/10 text-error border border-error',
              feedbackMessage ? '' : 'hidden',
            ]">
            {{ feedbackMessage }}
          </div>
        </div>

        <!-- 右侧信息区域 -->
        <div class="lg:w-1/3">
          <!-- 当前步骤详情 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold mb-6 flex items-center">
              <i class="fa fa-info-circle mr-2 text-primary"></i>
              反应详情
            </h2>
            <div id="reaction-details" class="bg-gray-50 rounded-xl p-5">
              <template v-if="selectedReaction">
                <h3 class="font-medium text-lg mb-3">{{ selectedReaction.name }}</h3>
                <div class="text-sm text-gray-600 mb-3">
                  反应类型：
                  <span class="text-reaction font-medium">{{ selectedReaction.type }}</span>
                </div>
                <div class="bg-white rounded p-3 mb-4 text-center text-sm">
                  {{ selectedReaction.equation }}
                </div>
                <div class="mb-3">
                  <h4 class="text-xs font-medium text-gray-500 mb-1">反应条件</h4>
                  <p class="text-sm">{{ selectedReaction.conditions }}</p>
                </div>
                <div>
                  <h4 class="text-xs font-medium text-gray-500 mb-1">反应说明</h4>
                  <p class="text-sm text-gray-600">{{ selectedReaction.description }}</p>
                </div>
              </template>
              <template v-else>
                <div class="text-center py-6">
                  <p class="text-gray-500">请选择第一步反应开始合成</p>
                  <p class="text-sm text-gray-400 mt-2">从乙烯出发，逐步合成乙酸乙酯</p>
                </div>
              </template>
            </div>
          </div>

          <!-- 合成树 -->
          <div>
            <h2 class="text-xl font-semibold mb-6 flex items-center">
              <i class="fa fa-sitemap mr-2 text-primary"></i>
              合成路线图
            </h2>
            <div id="synthesis-tree" class="bg-gray-50 rounded-xl p-5 min-h-[200px]">
              <div class="flex flex-col items-center gap-4">
                <template v-for="(nodeId, index) in synthesisPath" :key="index">
                  <div
                    class="w-16 h-16 rounded-full flex items-center justify-center"
                    :class="[
                      index === synthesisPath.length - 1
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-700',
                      synthesisData[nodeId].isTarget ? 'ring-2 ring-success' : '',
                    ]">
                    <span class="text-sm font-medium text-center">
                      {{ synthesisData[nodeId].name }}
                    </span>
                  </div>
                  <!-- 连接线（最后一个节点不需要） -->
                  <div v-if="index < synthesisPath.length - 1" class="w-1 h-4 bg-gray-300"></div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成提示 -->
    <div
      id="completion-message"
      class="bg-success/10 border border-success rounded-xl p-6 text-center mb-8"
      v-if="isCompleted">
      <h2 class="text-xl font-semibold text-success mb-3">恭喜完成乙酸乙酯的合成！</h2>
      <p class="text-gray-600 max-w-2xl mx-auto mb-4">
        你成功地从乙烯出发，通过多步反应合成了乙酸乙酯，掌握了烯烃、醇、羧酸和酯类之间的转化关系。
      </p>
      <div class="flex flex-wrap justify-center gap-4 mb-6">
        <div class="px-3 py-1 bg-gray-100 rounded-full text-sm">乙烯 → 乙醇</div>
        <div class="px-3 py-1 bg-gray-100 rounded-full text-sm">乙醇 → 乙醛</div>
        <div class="px-3 py-1 bg-gray-100 rounded-full text-sm">乙醛 → 乙酸</div>
        <div class="px-3 py-1 bg-gray-100 rounded-full text-sm">乙酸 + 乙醇 → 乙酸乙酯</div>
      </div>
      <button
        id="reset-btn"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all-300"
        @click="resetSynthesis">
        重新开始
      </button>
    </div>

    <!-- 知识点说明 -->
    <div class="bg-white rounded-xl shadow-soft p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">有机合成知识点</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium text-primary mb-2">加成反应</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            加成反应是不饱和化合物的一种特征反应，反应物分子中以双键或三键结合的碳原子，与其他原子或原子团直接结合生成新的化合物。如乙烯与水在催化剂和加热加压条件下发生加成反应生成乙醇。
          </p>
        </div>

        <div>
          <h3 class="font-medium text-primary mb-2">氧化反应</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            有机化学中的氧化反应通常指有机物分子中加入氧原子或失去氢原子的反应。如乙醇在铜催化下氧化生成乙醛，乙醛进一步氧化生成乙酸，这些都是典型的氧化反应。
          </p>
        </div>

        <div>
          <h3 class="font-medium text-primary mb-2">酯化反应</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            酯化反应是醇与羧酸或含氧无机酸发生反应生成酯和水的反应。如乙酸与乙醇在浓硫酸催化和加热条件下反应生成乙酸乙酯和水，该反应是可逆反应，通常采用加热回流和分水等方法提高产率。
          </p>
        </div>

        <div>
          <h3 class="font-medium text-primary mb-2">有机合成路线设计</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            有机合成路线设计通常采用"逆合成分析法"，从目标产物出发，逐步推导出起始原料。设计时需考虑反应的可行性、产率、步骤多少以及原料的易得性等因素，选择最优合成路线。
          </p>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="mt-8 text-center text-gray-500 text-sm">
      <p>高中化学教学 · 有机合成路线图交互工具</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// 定义类型
interface Reaction {
  id: string;
  name: string;
  type: string;
  product: string;
  equation: string;
  conditions: string;
  description: string;
}

interface NodeData {
  name: string;
  formula: string;
  reactions: Reaction[];
  isTarget?: boolean;
  isDeadEnd?: boolean;
}

interface CompletedReaction {
  from: string;
  reaction: Reaction;
  to: string;
}

// 合成路线数据
const synthesisData: Record<string, NodeData> = {
  ethylene: {
    name: "乙烯",
    formula: "C₂H₄",
    reactions: [
      {
        id: "hydration",
        name: "水合反应",
        type: "加成反应",
        product: "ethanol",
        equation: "C₂H₄ + H₂O → C₂H₅OH",
        conditions: "H₃PO₄催化剂，加热(300°C)，加压(7MPa)",
        description:
          "乙烯与水在催化剂作用下发生加成反应，生成乙醇。这是工业上生产乙醇的重要方法之一，称为乙烯直接水合法。",
      },
      {
        id: "oxidation",
        name: "氧化反应",
        type: "氧化反应",
        product: "acetaldehyde",
        equation: "2C₂H₄ + O₂ → 2CH₃CHO",
        conditions: "PdCl₂-CuCl₂催化剂，加热加压",
        description:
          "乙烯在特定催化剂作用下可直接氧化生成乙醛，这一反应称为瓦克法(Wacker process)，是工业上制备乙醛的重要方法。",
      },
      {
        id: "polymerization",
        name: "聚合反应",
        type: "加聚反应",
        product: "polyethylene",
        equation: "nC₂H₄ → [-CH₂-CH₂-]ₙ",
        conditions: "催化剂，加热加压",
        description:
          "乙烯在一定条件下可发生加聚反应生成聚乙烯，这是一种常用的塑料。但这不是合成乙酸乙酯的有效路径。",
      },
    ],
  },
  ethanol: {
    name: "乙醇",
    formula: "C₂H₅OH",
    reactions: [
      {
        id: "dehydrogenation",
        name: "脱氢反应",
        type: "氧化反应",
        product: "acetaldehyde",
        equation: "2C₂H₅OH + O₂ → 2CH₃CHO + 2H₂O",
        conditions: "Cu催化剂，加热(550°C)",
        description:
          "乙醇在铜催化和加热条件下发生氧化反应，脱氢生成乙醛。这是醇类氧化生成醛类的典型反应。",
      },
      {
        id: "dehydration",
        name: "脱水反应",
        type: "消去反应",
        product: "ethylene",
        equation: "C₂H₅OH → C₂H₄ + H₂O",
        conditions: "浓H₂SO₄，加热(170°C)",
        description:
          "乙醇在浓硫酸催化和较高温度下发生消去反应，脱水生成乙烯。这是实验室制备乙烯的常用方法，但会使合成路线倒退。",
      },
    ],
  },
  acetaldehyde: {
    name: "乙醛",
    formula: "CH₃CHO",
    reactions: [
      {
        id: "oxidation",
        name: "氧化反应",
        type: "氧化反应",
        product: "acetic_acid",
        equation: "2CH₃CHO + O₂ → 2CH₃COOH",
        conditions: "MnO₂催化剂，加热；或银氨溶液/新制Cu(OH)₂",
        description:
          "乙醛容易被氧化生成乙酸，可在催化剂作用下被氧气氧化，也可被银氨溶液、新制氢氧化铜等弱氧化剂氧化，是醛类的典型性质。",
      },
      {
        id: "reduction",
        name: "还原反应",
        type: "还原反应",
        product: "ethanol",
        equation: "CH₃CHO + H₂ → C₂H₅OH",
        conditions: "Ni催化剂，加热",
        description:
          "乙醛在催化剂作用下可被氢气还原生成乙醇，这是醛类还原生成醇类的典型反应，但会使合成路线倒退。",
      },
    ],
  },
  acetic_acid: {
    name: "乙酸",
    formula: "CH₃COOH",
    reactions: [
      {
        id: "esterification",
        name: "酯化反应",
        type: "酯化反应",
        product: "ethyl_acetate",
        equation: "CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O",
        conditions: "浓H₂SO₄催化剂，加热回流",
        description:
          "乙酸与乙醇在浓硫酸催化和加热条件下发生酯化反应，生成乙酸乙酯和水。浓硫酸在这里既作催化剂，又作吸水剂，有利于平衡向生成酯的方向移动。",
      },
    ],
  },
  ethyl_acetate: {
    name: "乙酸乙酯",
    formula: "CH₃COOCH₂CH₃",
    isTarget: true,
    reactions: [],
  },
  polyethylene: {
    name: "聚乙烯",
    formula: "(-CH₂-CH₂-)ₙ",
    reactions: [],
    isDeadEnd: true,
  },
};

// 状态管理
const currentNode = ref<string>("ethylene");
const synthesisPath = ref<string[]>(["ethylene"]);
const completedReactions = ref<CompletedReaction[]>([]);
const selectedReaction = ref<Reaction | null>(null);
const feedbackMessage = ref<string>("");
const feedbackType = ref<"success" | "error">("success");

// 计算属性
const currentReactions = computed<Reaction[]>(() => {
  return synthesisData[currentNode.value]?.reactions || [];
});

const isCompleted = computed<boolean>(() => {
  return synthesisData[currentNode.value]?.isTarget || false;
});

// 方法
const selectReaction = (reaction: Reaction) => {
  const productNode = reaction.product;
  const productData = synthesisData[productNode];

  // 检查是否是死胡同
  if (productData.isDeadEnd) {
    showFeedback(
      `选择的${reaction.name}生成了${productData.name}，这不是合成乙酸乙酯的有效路径，请尝试其他反应。`,
      "error",
    );
    return;
  }

  // 记录反应
  completedReactions.value.push({
    from: currentNode.value,
    reaction,
    to: productNode,
  });

  // 更新合成路径
  currentNode.value = productNode;
  synthesisPath.value.push(productNode);
  selectedReaction.value = reaction;

  // 显示成功反馈
  showFeedback(`成功进行${reaction.name}，生成了${productData.name}！`, "success");

  // 检查是否完成目标
  if (productData.isTarget) {
    setTimeout(() => {
      // 自动滚动到完成信息
      const completionEl = document.getElementById("completion-message");
      completionEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 1500);
  } else {
    // 滚动到最新步骤
    setTimeout(() => {
      const pathEl = document.getElementById("synthesis-path");
      pathEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 500);
  }
};

const showFeedback = (message: string, type: "success" | "error") => {
  feedbackMessage.value = message;
  feedbackType.value = type;

  // 3秒后隐藏
  setTimeout(() => {
    feedbackMessage.value = "";
  }, 3000);
};

const resetSynthesis = () => {
  // 重置状态
  currentNode.value = "ethylene";
  synthesisPath.value = ["ethylene"];
  completedReactions.value = [];
  selectedReaction.value = null;
  feedbackMessage.value = "";
};

// 初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑
});
</script>

<style scoped>
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
  .shadow-soft {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  .transition-all-300 {
    transition: all 300ms ease-in-out;
  }
  .reaction-arrow {
    position: relative;
    height: 2px;
    background-color: #f59e0b;
  }
  .reaction-arrow::after {
    content: "";
    position: absolute;
    right: 0;
    top: -4px;
    width: 0;
    height: 0;
    border-left: 8px solid #f59e0b;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
  }
  .molecule-card {
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .molecule-card.active {
    transform: scale(1.03);
    box-shadow:
      0 10px 25px -5px rgba(99, 102, 241, 0.1),
      0 8px 10px -6px rgba(99, 102, 241, 0.1);
  }
  .reaction-option {
    transition: all 0.3s ease;
  }
  .reaction-option:hover:not(.disabled) {
    transform: translateY(-2px);
  }
}

/* 颜色变量 */
:root {
  --primary: #6366f1;
  --reactant: #3b82f6;
  --product: #10b981;
  --reaction: #f59e0b;
  --success: #10b981;
  --error: #ef4444;
  --background: #f8fafc;
}

.bg-primary {
  background-color: var(--primary);
}

.text-primary {
  color: var(--primary);
}

.bg-reactant\/10 {
  background-color: rgba(59, 130, 246, 0.1);
}

.text-reactant {
  color: var(--reactant);
}

.border-reactant {
  border-color: var(--reactant);
}

.bg-product\/10 {
  background-color: rgba(16, 185, 129, 0.1);
}

.text-product {
  color: var(--product);
}

.border-product {
  border-color: var(--product);
}

.text-reaction {
  color: var(--reaction);
}

.bg-success\/10 {
  background-color: rgba(16, 185, 129, 0.1);
}

.text-success {
  color: var(--success);
}

.border-success {
  border-color: var(--success);
}

.bg-error\/10 {
  background-color: rgba(239, 68, 68, 0.1);
}

.text-error {
  color: var(--error);
}

.border-error {
  border-color: var(--error);
}

.bg-background {
  background-color: var(--background);
}

.ring-success {
  ring-color: var(--success);
}
</style>
