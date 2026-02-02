<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- 标题区域 -->
    <header class="text-center mb-10">
      <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-gray-800 mb-3">进化树拼图</h1>
      <p class="text-gray-600 max-w-3xl mx-auto">
        拖动生物类群到进化树的正确分支，依据进化证据推断生物间的亲缘关系
      </p>
    </header>

    <!-- 主要内容区域 -->
    <div class="bg-white rounded-xl shadow-soft p-6 mb-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 左侧进化树区域 -->
        <div class="lg:w-2/3">
          <h2 class="text-xl font-semibold mb-6 flex items-center">
            <i class="fa fa-sitemap mr-2 text-tree"></i>
            生物进化树
          </h2>

          <!-- 进化树容器 -->
          <div class="relative w-full min-h-[700px] bg-gray-50 rounded-xl p-6 mb-6 overflow-hidden">
            <!-- 进化树主干 -->
            <div
              class="absolute left-1/2 top-0 bottom-0 w-1 bg-tree transform -translate-x-1/2"></div>

            <!-- 根部 - 生命起源 -->
            <div
              class="absolute left-1/2 top-4 transform -translate-x-1/2 bg-tree text-white px-4 py-1 rounded-full text-sm font-medium">
              生命起源
            </div>

            <!-- 分支区域 -->
            <template v-for="branch in branches" :key="branch.target">
              <!-- 分支线 -->
              <div
                class="absolute bg-tree h-1"
                :style="{
                  left: branch.lineLeft,
                  top: branch.lineTop,
                  width: branch.lineWidth,
                  transform: branch.lineTransform,
                }"></div>

              <!-- 放置区域 -->
              <div
                class="drop-zone"
                :class="{
                  'drop-zone-active': branch.isActive,
                  'drop-zone-correct': branch.isCorrect,
                  'drop-zone-incorrect': branch.isIncorrect,
                }"
                :style="{
                  left: branch.zoneLeft,
                  top: branch.zoneTop,
                  width: branch.zoneWidth,
                  height: branch.zoneHeight,
                }"
                :data-target="branch.target"
                @dragover.prevent
                @dragenter.prevent="handleDragEnter(branch)"
                @dragleave="handleDragLeave(branch)"
                @drop="handleDrop(branch)">
                <!-- 已放置的生物类群 -->
                <div v-if="branch.organism" class="w-full">
                  <img
                    :src="branch.organism.image"
                    :alt="branch.organism.name"
                    class="w-12 h-12 object-cover rounded mr-3" />
                  <div>
                    <h3 class="font-medium">{{ branch.organism.name }}</h3>
                    <p class="text-xs text-gray-500">{{ branch.organism.description }}</p>
                  </div>
                </div>
              </div>

              <!-- 共同祖先标签 (如果有) -->
              <div
                v-if="branch.ancestor"
                class="absolute bg-tree/80 text-white px-3 py-1 rounded-full text-xs font-medium transform -translate-x-1/2"
                :style="{ left: '50%', top: branch.ancestorTop }">
                {{ branch.ancestor }}
              </div>

              <!-- 祖先连接线 (如果有) -->
              <div
                v-if="branch.ancestor"
                class="absolute left-1/2 w-1 bg-tree transform -translate-x-1/2"
                :style="{ top: branch.ancestorLineTop, height: branch.ancestorLineHeight }"></div>
            </template>
          </div>

          <!-- 反馈信息区域 -->
          <div
            id="feedback-area"
            class="hidden p-4 rounded-lg mb-4 border"
            :class="{
              'bg-success/10 border-success': feedback.isCorrect,
              'bg-error/10 border-error': !feedback.isCorrect,
            }"
            v-if="feedback.show">
            <h3
              id="feedback-title"
              class="font-medium mb-2"
              :class="{ 'text-success': feedback.isCorrect, 'text-error': !feedback.isCorrect }">
              {{ feedback.title }}
            </h3>
            <div id="feedback-evidence" class="flex flex-wrap gap-3 mt-3">
              <span
                v-for="(evidence, index) in feedback.evidence"
                :key="index"
                class="px-2 py-1 rounded-full text-xs"
                :class="getEvidenceColorClass(evidence)">
                {{ evidence }}
              </span>
            </div>
            <p id="feedback-message" class="text-sm text-gray-600 mt-2">
              {{ feedback.message }}
            </p>
          </div>
        </div>

        <!-- 右侧生物类群和证据区域 -->
        <div class="lg:w-1/3">
          <!-- 生物类群 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold mb-6 flex items-center">
              <i class="fa fa-paw mr-2 text-primary"></i>
              生物类群
            </h2>

            <div class="space-y-4" id="organisms-container">
              <div
                v-for="organism in organisms"
                :key="organism.type"
                :class="[
                  'draggable rounded-lg p-4 flex items-center',
                  organism.bgClass,
                  { hidden: organism.placed },
                ]"
                draggable="true"
                @dragstart="handleDragStart(organism)"
                @dragend="handleDragEnd">
                <img
                  :src="organism.image"
                  :alt="organism.name"
                  class="w-12 h-12 object-cover rounded mr-3" />
                <div>
                  <h3 class="font-medium">{{ organism.name }}</h3>
                  <p class="text-xs text-gray-500">{{ organism.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 进化证据类型 -->
          <div>
            <h2 class="text-xl font-semibold mb-6 flex items-center">
              <i class="fa fa-flask mr-2 text-evidence"></i>
              进化证据类型
            </h2>

            <div class="bg-gray-50 rounded-lg p-4 text-sm space-y-4">
              <div class="flex items-start">
                <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2"></span>
                <div>
                  <h3 class="font-medium">化石证据</h3>
                  <p class="text-gray-600">过渡化石展示了生物类群之间的演化关系</p>
                </div>
              </div>

              <div class="flex items-start">
                <span class="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-2"></span>
                <div>
                  <h3 class="font-medium">同源器官</h3>
                  <p class="text-gray-600">不同生物具有相同基本结构但功能不同的器官</p>
                </div>
              </div>

              <div class="flex items-start">
                <span class="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2"></span>
                <div>
                  <h3 class="font-medium">DNA证据</h3>
                  <p class="text-gray-600">亲缘关系越近的生物DNA序列相似度越高</p>
                </div>
              </div>

              <div class="flex items-start">
                <span class="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2"></span>
                <div>
                  <h3 class="font-medium">胚胎发育</h3>
                  <p class="text-gray-600">不同生物早期胚胎发育过程相似性表明亲缘关系</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点说明 -->
    <div class="bg-white rounded-xl shadow-soft p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">进化树知识点</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium text-primary mb-2">进化树的科学意义</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            进化树（系统发育树）是生物进化关系的可视化表示，通过分支模式展示不同生物类群的亲缘关系。分支节点代表共同祖先，分支长度有时表示进化时间或遗传差异程度。进化树帮助科学家理解生物多样性的起源和演化历程。
          </p>
        </div>

        <div>
          <h3 class="font-medium text-primary mb-2">生物进化的主要阶段</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            生命进化历程可分为几个主要阶段：从简单的原核生物到复杂的真核生物；从单细胞生物到多细胞生物；从水生生物到陆生生物；从变温动物到恒温动物。每个阶段都有重要的适应性特征出现，如细胞核、光合作用、脊椎骨、羊膜卵等。
          </p>
        </div>

        <div>
          <h3 class="font-medium text-primary mb-2">进化证据的综合运用</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            科学家通过多种证据线推断进化关系：化石记录展示了生物形态随时间的变化；同源器官表明共同祖先；DNA序列比较提供了分子水平的证据；胚胎发育模式揭示了生物早期发育的相似性。这些证据相互印证，构建了可靠的进化关系图。
          </p>
        </div>

        <div>
          <h3 class="font-medium text-primary mb-2">关键进化事件</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            生物进化史上有多个关键事件：约35亿年前原核生物出现；约15亿年前真核生物出现；约5.4亿年前寒武纪大爆发；约4.5亿年前植物登陆；约3.7亿年前动物登陆；约2.2亿年前哺乳动物出现；约1.5亿年前鸟类出现。这些事件极大地改变了生物多样性格局。
          </p>
        </div>
      </div>
    </div>

    <!-- 完成提示 -->
    <div
      id="completion-message"
      class="hidden bg-success/10 border border-success rounded-xl p-6 text-center mb-8"
      v-if="showCompletion">
      <h2 class="text-xl font-semibold text-success mb-3">恭喜完成进化树拼图！</h2>
      <p class="text-gray-600 max-w-2xl mx-auto mb-4">
        你成功地将所有生物类群放置在进化树的正确位置，展示了你对生物进化关系和证据的理解。
      </p>
      <button
        id="reset-btn"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all-300"
        @click="resetGame">
        重新开始
      </button>
    </div>

    <!-- 页脚 -->
    <footer class="mt-8 text-center text-gray-500 text-sm">
      <p>高中生物教学 · 进化树拼图交互工具</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

// 定义类型
interface Organism {
  type: string;
  name: string;
  description: string;
  image: string;
  bgClass: string;
  placed: boolean;
}

interface Branch {
  target: string;
  lineLeft: string;
  lineTop: string;
  lineWidth: string;
  lineTransform: string;
  zoneLeft: string;
  zoneTop: string;
  zoneWidth: string;
  zoneHeight: string;
  ancestor?: string;
  ancestorTop?: string;
  ancestorLineTop?: string;
  ancestorLineHeight?: string;
  isActive: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  organism: Organism | null;
}

interface Feedback {
  show: boolean;
  isCorrect: boolean;
  title: string;
  message: string;
  evidence: string[];
}

interface EvidenceHint {
  correct: string;
  evidence: string[];
  incorrect: Record<string, string>;
}

// 进化证据提示信息
const evidenceHints: Record<string, EvidenceHint> = {
  prokaryote: {
    correct:
      "原核生物是地球上最早出现的生命形式，约35亿年前就已存在。它们没有细胞核和复杂细胞器，是所有生物的共同祖先。",
    evidence: ["化石证据", "DNA证据"],
    incorrect: {
      plant: "植物属于真核生物，出现时间远晚于原核生物，原核生物是植物的远古祖先。",
      invertebrate: "无脊椎动物属于真核生物，而原核生物是更原始的生命形式，出现时间更早。",
      fish: "鱼类是复杂的脊椎动物，属于真核生物，进化地位远高于原核生物。",
      amphibian: "两栖类是高等脊椎动物，出现时间远晚于原核生物。",
      reptile: "爬行类是较晚出现的脊椎动物，原核生物是其远古祖先。",
      bird: "鸟类是高等脊椎动物，出现时间远晚于原核生物。",
      mammal: "哺乳类是最高等的脊椎动物，原核生物是其最原始的祖先。",
    },
  },
  plant: {
    correct:
      "植物界与动物界在真核生物阶段分道扬镳，通过光合作用自养生存。最原始的陆生植物化石可追溯到约4.5亿年前。",
    evidence: ["化石证据", "胚胎发育"],
    incorrect: {
      prokaryote: "原核生物是更原始的生命形式，植物属于真核生物，进化地位更高。",
      invertebrate: "无脊椎动物属于动物界，与植物界是平行进化的不同分支。",
      fish: "鱼类属于动物界，与植物界在真核生物阶段就已分化。",
      amphibian: "两栖类属于动物界，与植物界没有直接的进化关系。",
      reptile: "爬行类属于动物界，与植物界是完全不同的进化分支。",
      bird: "鸟类属于动物界，与植物界在真核生物阶段就已分化。",
      mammal: "哺乳类属于动物界，与植物界是平行进化的不同分支。",
    },
  },
  // 其他证据提示省略，与原代码保持一致
  invertebrate: {
    correct:
      "无脊椎动物是最早出现的动物类群，约6亿年前的埃迪卡拉纪就有化石记录，是所有脊椎动物的祖先类群。",
    evidence: ["化石证据", "DNA证据"],
    incorrect: {
      prokaryote: "无脊椎动物属于真核生物，进化地位高于原核生物。",
      plant: "无脊椎动物属于动物界，与植物界是不同的进化分支。",
      fish: "鱼类属于脊椎动物，是从无脊椎动物进化而来的，出现时间更晚。",
      amphibian: "两栖类是脊椎动物，与无脊椎动物的亲缘关系较远。",
      reptile: "爬行类是高等脊椎动物，进化地位高于无脊椎动物。",
      bird: "鸟类是高等脊椎动物，与无脊椎动物的亲缘关系较远。",
      mammal: "哺乳类是最高等的脊椎动物，无脊椎动物是其远古祖先。",
    },
  },
  fish: {
    correct:
      "鱼类是最早出现的脊椎动物，约5亿年前的寒武纪就有化石记录（如昆明鱼）。它们演化出脊椎骨，是所有陆生脊椎动物的祖先。",
    evidence: ["化石证据", "同源器官"],
    incorrect: {
      prokaryote: "鱼类是复杂的脊椎动物，进化地位远高于原核生物。",
      plant: "鱼类属于动物界，与植物界没有直接进化关系。",
      invertebrate: "鱼类是从无脊椎动物进化而来的，属于脊椎动物，进化地位更高。",
      amphibian: "两栖类是从鱼类进化而来的，出现时间晚于鱼类。",
      reptile: "爬行类比鱼类出现晚得多，是通过两栖类间接从鱼类进化而来的。",
      bird: "鸟类与鱼类的亲缘关系较远，出现时间晚得多。",
      mammal: "哺乳类与鱼类的亲缘关系较远，是脊椎动物进化的后期分支。",
    },
  },
  amphibian: {
    correct:
      "两栖类是最早登陆的脊椎动物，约3.7亿年前由肉鳍鱼类进化而来。化石如鱼石螈展示了从水生到陆生的过渡特征，具有水生幼体和陆生成体的双重生活史。",
    evidence: ["化石证据", "胚胎发育"],
    incorrect: {
      prokaryote: "两栖类是高等脊椎动物，进化地位远高于原核生物。",
      plant: "两栖类属于动物界，与植物界没有直接进化关系。",
      invertebrate: "两栖类是脊椎动物，进化地位高于无脊椎动物。",
      fish: "两栖类是从鱼类进化而来的，出现时间晚于鱼类。",
      reptile: "爬行类是从两栖类进化而来的，出现时间晚于两栖类。",
      bird: "鸟类与两栖类的亲缘关系较远，是从爬行类进化而来的。",
      mammal: "哺乳类与两栖类的亲缘关系较远，是通过爬行类间接进化而来的。",
    },
  },
  reptile: {
    correct:
      "爬行类约3亿年前从两栖类进化而来，羊膜卵的出现使它们完全摆脱了对水的依赖，成为真正的陆生动物。化石如始祖单弓兽展示了这一进化过程。",
    evidence: ["化石证据", "同源器官"],
    incorrect: {
      prokaryote: "爬行类是高等脊椎动物，进化地位远高于原核生物。",
      plant: "爬行类属于动物界，与植物界没有直接进化关系。",
      invertebrate: "爬行类是脊椎动物，进化地位高于无脊椎动物。",
      fish: "爬行类与鱼类的亲缘关系较远，是通过两栖类间接从鱼类进化而来的。",
      amphibian: "爬行类是从两栖类进化而来的，出现时间晚于两栖类。",
      bird: "鸟类是从爬行类中的恐龙分支进化而来的，与爬行类亲缘关系密切。",
      mammal: "哺乳类是从爬行类中的似哺乳爬行动物进化而来的，出现时间晚于爬行类。",
    },
  },
  bird: {
    correct:
      "鸟类约1.5亿年前从恐龙（一类特殊的爬行类）进化而来，始祖鸟化石清晰展示了爬行动物向鸟类的过渡特征，具有羽毛和翅膀等飞行适应特征。",
    evidence: ["化石证据", "DNA证据"],
    incorrect: {
      prokaryote: "鸟类是高等脊椎动物，进化地位远高于原核生物。",
      plant: "鸟类属于动物界，与植物界没有直接进化关系。",
      invertebrate: "鸟类是脊椎动物，进化地位高于无脊椎动物。",
      fish: "鸟类与鱼类的亲缘关系较远，是脊椎动物进化的后期分支。",
      amphibian: "鸟类与两栖类的亲缘关系较远，是从爬行类进化而来的。",
      reptile: "鸟类是从爬行类中的恐龙分支进化而来的，属于爬行类的姐妹群。",
      mammal: "鸟类与哺乳类是平行进化的类群，均起源于爬行类，但分支不同。",
    },
  },
  mammal: {
    correct:
      "哺乳类约2.2亿年前从似哺乳爬行动物进化而来，具有毛发、乳腺和恒温等特征。化石记录显示，它们在恐龙灭绝后迅速多样化，成为陆地生态系统的优势类群。",
    evidence: ["化石证据", "同源器官", "DNA证据"],
    incorrect: {
      prokaryote: "哺乳类是最高等的脊椎动物，进化地位远高于原核生物。",
      plant: "哺乳类属于动物界，与植物界没有直接进化关系。",
      invertebrate: "哺乳类是脊椎动物，进化地位高于无脊椎动物。",
      fish: "哺乳类与鱼类的亲缘关系较远，是脊椎动物进化的后期分支。",
      amphibian: "哺乳类与两栖类的亲缘关系较远，是通过爬行类间接进化而来的。",
      reptile: "哺乳类是从爬行类中的似哺乳爬行动物进化而来的，出现时间晚于爬行类。",
      bird: "哺乳类与鸟类是平行进化的类群，均起源于爬行类，但分支不同。",
    },
  },
};

// 生物类群数据
const organisms = ref<Organism[]>([
  {
    type: "prokaryote",
    name: "原核生物",
    description: "无细胞核，结构简单",
    image: "https://picsum.photos/id/1025/60/60",
    bgClass: "bg-gray-50 border border-gray-200",
    placed: false,
  },
  {
    type: "plant",
    name: "植物界",
    description: "光合自养，细胞壁",
    image: "https://picsum.photos/id/106/60/60",
    bgClass: "bg-green-50 border border-green-200",
    placed: false,
  },
  {
    type: "invertebrate",
    name: "无脊椎动物",
    description: "无脊椎骨，结构多样",
    image: "https://picsum.photos/id/1000/60/60",
    bgClass: "bg-yellow-50 border border-yellow-200",
    placed: false,
  },
  {
    type: "fish",
    name: "鱼类",
    description: "水生，鳃呼吸，有鳍",
    image: "https://picsum.photos/id/1024/60/60",
    bgClass: "bg-blue-50 border border-blue-200",
    placed: false,
  },
  {
    type: "amphibian",
    name: "两栖类",
    description: "水陆两栖，变态发育",
    image: "https://picsum.photos/id/231/60/60",
    bgClass: "bg-teal-50 border border-teal-200",
    placed: false,
  },
  {
    type: "reptile",
    name: "爬行类",
    description: "陆生，鳞片，卵生",
    image: "https://picsum.photos/id/1074/60/60",
    bgClass: "bg-orange-50 border border-orange-200",
    placed: false,
  },
  {
    type: "bird",
    name: "鸟类",
    description: "有羽毛，恒温，卵生",
    image: "https://picsum.photos/id/1062/60/60",
    bgClass: "bg-indigo-50 border border-indigo-200",
    placed: false,
  },
  {
    type: "mammal",
    name: "哺乳类",
    description: "有毛发，哺乳，恒温",
    image: "https://picsum.photos/id/200/60/60",
    bgClass: "bg-purple-50 border border-purple-200",
    placed: false,
  },
]);

// 进化树分支数据
const branches = reactive<Branch[]>([
  {
    target: "prokaryote",
    lineLeft: "50%",
    lineTop: "100px",
    lineWidth: "160px",
    lineTransform: "-translate-x-1/2",
    zoneLeft: "calc(50% - 160px)",
    zoneTop: "90px",
    zoneWidth: "140px",
    zoneHeight: "70px",
    isActive: false,
    isCorrect: false,
    isIncorrect: false,
    organism: null,
  },
  {
    target: "plant",
    lineLeft: "50%",
    lineTop: "250px",
    lineWidth: "160px",
    lineTransform: "-translate-x-1/2",
    zoneLeft: "calc(50% - 160px)",
    zoneTop: "240px",
    zoneWidth: "140px",
    zoneHeight: "70px",
    ancestor: "真核生物共同祖先",
    ancestorTop: "180px",
    ancestorLineTop: "180px",
    ancestorLineHeight: "60px",
    isActive: false,
    isCorrect: false,
    isIncorrect: false,
    organism: null,
  },
  {
    target: "invertebrate",
    lineLeft: "50%",
    lineTop: "400px",
    lineWidth: "180px",
    lineTransform: "-translate-x-1/2",
    zoneLeft: "calc(50% - 180px)",
    zoneTop: "390px",
    zoneWidth: "160px",
    zoneHeight: "70px",
    ancestor: "动物界共同祖先",
    ancestorTop: "330px",
    ancestorLineTop: "330px",
    ancestorLineHeight: "60px",
    isActive: false,
    isCorrect: false,
    isIncorrect: false,
    organism: null,
  },
  {
    target: "fish",
    lineLeft: "50%",
    lineTop: "550px",
    lineWidth: "180px",
    lineTransform: "-translate-x-1/2",
    zoneLeft: "calc(50% - 180px)",
    zoneTop: "540px",
    zoneWidth: "160px",
    zoneHeight: "70px",
    ancestor: "脊椎动物共同祖先",
    ancestorTop: "480px",
    ancestorLineTop: "480px",
    ancestorLineHeight: "60px",
    isActive: false,
    isCorrect: false,
    isIncorrect: false,
    organism: null,
  },
  {
    target: "amphibian",
    lineLeft: "50%",
    lineTop: "700px",
    lineWidth: "180px",
    lineTransform: "-translate-x-1/2",
    zoneLeft: "calc(50% - 180px)",
    zoneTop: "690px",
    zoneWidth: "160px",
    zoneHeight: "70px",
    ancestor: "四足动物共同祖先",
    ancestorTop: "630px",
    ancestorLineTop: "630px",
    ancestorLineHeight: "60px",
    isActive: false,
    isCorrect: false,
    isIncorrect: false,
    organism: null,
  },
  {
    target: "reptile",
    lineLeft: "50%",
    lineTop: "850px",
    lineWidth: "180px",
    lineTransform: "-translate-x-1/2",
    zoneLeft: "calc(50% - 180px)",
    zoneTop: "840px",
    zoneWidth: "160px",
    zoneHeight: "70px",
    ancestor: "羊膜动物共同祖先",
    ancestorTop: "780px",
    ancestorLineTop: "780px",
    ancestorLineHeight: "60px",
    isActive: false,
    isCorrect: false,
    isIncorrect: false,
    organism: null,
  },
  {
    target: "bird",
    lineLeft: "50%",
    lineTop: "850px",
    lineWidth: "180px",
    lineTransform: "translate-x-[10px]",
    zoneLeft: "50%",
    zoneTop: "840px",
    zoneWidth: "160px",
    zoneHeight: "70px",
    isActive: false,
    isCorrect: false,
    isIncorrect: false,
    organism: null,
  },
  {
    target: "mammal",
    lineLeft: "50%",
    lineTop: "1000px",
    lineWidth: "180px",
    lineTransform: "-translate-x-1/2",
    zoneLeft: "calc(50% - 180px)",
    zoneTop: "990px",
    zoneWidth: "160px",
    zoneHeight: "70px",
    ancestor: "哺乳类共同祖先",
    ancestorTop: "930px",
    ancestorLineTop: "930px",
    ancestorLineHeight: "60px",
    isActive: false,
    isCorrect: false,
    isIncorrect: false,
    organism: null,
  },
]);

// 状态变量
const draggedOrganism = ref<Organism | null>(null);
const feedback = reactive<Feedback>({
  show: false,
  isCorrect: false,
  title: "",
  message: "",
  evidence: [],
});
const showCompletion = ref(false);
const feedbackTimeout = ref<NodeJS.Timeout | null>(null);

// 获取证据标签的颜色类
const getEvidenceColorClass = (evidence: string): string => {
  switch (evidence) {
    case "化石证据":
      return "bg-blue-100 text-blue-800";
    case "同源器官":
      return "bg-green-100 text-green-800";
    case "DNA证据":
      return "bg-purple-100 text-purple-800";
    case "胚胎发育":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 拖拽开始
const handleDragStart = (organism: Organism) => {
  draggedOrganism.value = organism;
};

// 拖拽结束
const handleDragEnd = () => {
  // 重置所有分支的活跃状态
  branches.forEach(branch => {
    branch.isActive = false;
    branch.isIncorrect = false;
  });
  draggedOrganism.value = null;
};

// 拖拽进入
const handleDragEnter = (branch: Branch) => {
  if (!branch.isCorrect) {
    branch.isActive = true;
  }
};

// 拖拽离开
const handleDragLeave = (branch: Branch) => {
  if (!branch.isCorrect) {
    branch.isActive = false;
    branch.isIncorrect = false;
  }
};

// 放置
const handleDrop = (branch: Branch) => {
  if (!draggedOrganism.value || branch.isCorrect) return;

  // 重置所有分支的活跃状态
  branches.forEach(b => {
    b.isActive = false;
  });

  const draggedType = draggedOrganism.value.type;
  const targetType = branch.target;

  // 检查是否放置正确
  if (draggedType === targetType) {
    // 正确放置
    branch.isCorrect = true;
    branch.organism = { ...draggedOrganism.value };

    // 标记生物已放置
    const organismIndex = organisms.value.findIndex(o => o.type === draggedType);
    if (organismIndex !== -1) {
      organisms.value[organismIndex].placed = true;
    }

    // 显示正确反馈
    showFeedback(true, draggedType);

    // 检查是否完成所有放置
    checkCompletion();
  } else {
    // 错误放置
    branch.isIncorrect = true;
    // 显示错误反馈
    showFeedback(false, draggedType, targetType);

    // 3秒后移除错误状态
    setTimeout(() => {
      branch.isIncorrect = false;
    }, 3000);
  }
};

// 显示反馈信息
const showFeedback = (isCorrect: boolean, organismType: string, targetType?: string) => {
  // 清除之前的超时
  if (feedbackTimeout.value) {
    clearTimeout(feedbackTimeout.value);
  }

  feedback.show = true;
  feedback.isCorrect = isCorrect;

  if (isCorrect) {
    feedback.title = "放置正确！";
    feedback.message = evidenceHints[organismType].correct;
    feedback.evidence = evidenceHints[organismType].evidence;
  } else if (targetType) {
    feedback.title = "放置错误";
    feedback.message = evidenceHints[organismType].incorrect[targetType] || "该生物不属于这个分支";
    feedback.evidence = [];
  }

  // 8秒后隐藏反馈
  feedbackTimeout.value = setTimeout(() => {
    feedback.show = false;
  }, 8000);
};

// 检查是否完成所有放置
const checkCompletion = () => {
  const correctCount = branches.filter(branch => branch.isCorrect).length;
  if (correctCount === organisms.value.length) {
    setTimeout(() => {
      showCompletion.value = true;
    }, 1000);
  }
};

// 重置游戏
const resetGame = () => {
  // 重置分支状态
  branches.forEach(branch => {
    branch.isActive = false;
    branch.isCorrect = false;
    branch.isIncorrect = false;
    branch.organism = null;
  });

  // 重置生物状态
  organisms.value.forEach(organism => {
    organism.placed = false;
  });

  // 隐藏反馈和完成信息
  feedback.show = false;
  showCompletion.value = false;

  // 清除超时
  if (feedbackTimeout.value) {
    clearTimeout(feedbackTimeout.value);
  }
};

// 初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑
});
</script>

<style scoped>
/* 导入外部资源 */
/* @import url("https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css"); */

/* Tailwind工具类的补充 */
.content-auto {
  content-visibility: auto;
}

.shadow-soft {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.transition-all-300 {
  transition: all 300ms ease-in-out;
}

.draggable {
  cursor: grab;
  transition: all 300ms ease-in-out;
}

.draggable:active {
  cursor: grabbing;
}

.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms ease-in-out;
}

.drop-zone-active {
  border-color: #1e40af;
  background-color: rgba(30, 64, 175, 0.1);
}

.drop-zone-correct {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.drop-zone-incorrect {
  border-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

/* 颜色变量 */
:root {
  --color-primary: #1e40af;
  --color-tree: #15803d;
  --color-evidence: #b45309;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-background: #f8fafc;
}

.text-tree {
  color: var(--color-tree);
}

.text-primary {
  color: var(--color-primary);
}

.text-evidence {
  color: var(--color-evidence);
}

.text-success {
  color: var(--color-success);
}

.text-error {
  color: var(--color-error);
}

.bg-background {
  background-color: var(--color-background);
}

.bg-success\/10 {
  background-color: rgba(16, 185, 129, 0.1);
}

.bg-error\/10 {
  background-color: rgba(239, 68, 68, 0.1);
}

.border-success {
  border-color: var(--color-success);
}

.border-error {
  border-color: var(--color-error);
}
</style>
