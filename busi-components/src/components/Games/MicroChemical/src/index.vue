<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10 w-100%">
    <header class="bg-blue-700 text-white shadow-md sticky top-0 z-20">
      <div class="container mx-auto  py-4 flex items-center justify-center relative">
        <h1 class="text-xl md:text-2xl font-bold flex items-center gap-2">
          <span class="bg-white/20 p-1.5 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </span>
          微观反应动画演示
        </h1>
        <p class="absolute bottom-1 text-xs text-blue-200 hidden md:block">氢气燃烧生成水</p>
      </div>
    </header>

    <main class="container mx-auto space-y-6 w-96%">
      <div class="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
        <h2 class="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd" />
          </svg>
          化学反应原理
        </h2>
        <p class="text-sm text-slate-600 mb-4 leading-relaxed">
          氢气(H₂)和氧气(O₂)在点燃的条件下发生化学反应，生成水(H₂O)。这个反应会释放大量的热量，属于放热反应。
        </p>
        <div class="flex flex-wrap gap-3 text-xs bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></span>
            <span class="font-medium text-slate-700">氢原子</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 bg-red-400 rounded-full shadow-sm"></span>
            <span class="font-medium text-slate-700">氧原子</span>
          </div>
          <div class="flex items-center gap-1.5 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
            <span>点击"点燃"开始</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div
          class="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-5 h-fit">
          <h3 class="font-bold text-slate-700 border-b pb-2">反应物准备</h3>

          <div class="border rounded-xl p-3 flex items-center gap-4 bg-slate-50">
            <div class="relative w-12 h-8 flex-shrink-0">
              <div
                class="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-[10px] text-white font-bold shadow-sm z-10">
                H
              </div>
              <div
                class="absolute left-5 top-1 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-[10px] text-white font-bold shadow-sm z-10">
                H
              </div>
              <div class="absolute left-3 top-3.5 w-6 h-1 bg-white/80"></div>
            </div>
            <div>
              <div class="font-bold text-blue-500">氢气 (H₂)</div>
              <div class="text-xs text-slate-500">双原子分子</div>
            </div>
            <div class="ml-auto">
              <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div class="border rounded-xl p-3 flex items-center gap-4 bg-slate-50">
            <div class="relative w-12 h-8 flex-shrink-0">
              <div
                class="absolute left-0 top-1 w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-[10px] text-white font-bold shadow-sm z-10">
                O
              </div>
              <div
                class="absolute left-5 top-1 w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-[10px] text-white font-bold shadow-sm z-10">
                O
              </div>
              <div class="absolute left-3 top-2.5 w-6 h-0.5 bg-white/80"></div>
              <div class="absolute left-3 top-4.5 w-6 h-0.5 bg-white/80"></div>
            </div>
            <div>
              <div class="font-bold text-red-500">氧气 (O₂)</div>
              <div class="text-xs text-slate-500">双原子分子</div>
            </div>
            <div class="ml-auto">
              <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div class="pt-2">
            <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
              <div class="text-sm text-amber-800 mb-3 font-medium">反应条件：点燃</div>
              <button
                @click="startReaction"
                :disabled="reactionStage > 1"
                class="w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.45-.412-1.725a1 1 0 00-1.846-.474c-.21.439-.427 1.096-.6 1.838a12.013 12.013 0 00-.23 2.115c0 2.222 1.07 4.165 2.66 5.433a6.002 6.002 0 007.822-.21 6.002 6.002 0 001.324-6.388c-.237-.872-.57-1.638-.975-2.28a10.05 10.05 0 00-1.92-2.167zm-3.23 6.13a1 1 0 011.668 0 8.026 8.026 0 01.998 2.37A1 1 0 0110.875 12a1 1 0 01-.956-1.317 6.026 6.026 0 00-.754-1.998z"
                    clip-rule="evenodd" />
                </svg>
                {{ reactionStage > 1 ? "反应进行中..." : "点燃" }}
              </button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 class="font-bold text-slate-700 mb-4 text-center">微观反应过程演示</h3>

          <div
            class="relative w-full h-[360px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-inner border border-slate-200"
            ref="containerRef">
            <div
              class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-800 shadow-sm z-20">
              {{ currentStageName }}
            </div>

            <div
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-12 bg-gradient-radial from-yellow-300 via-orange-500 to-transparent rounded-[50%_50%_40%_40%] origin-bottom animate-flame z-10 transition-opacity duration-500"
              :class="showFlame ? 'opacity-100' : 'opacity-0'"></div>

            <div
              v-for="mol in molecules"
              :key="mol.id"
              class="absolute transition-transform duration-100 ease-linear"
              :style="{
                left: `${mol.x}px`,
                top: `${mol.y}px`,
                transform: `rotate(${mol.rotation}deg)`,
                opacity: mol.visible ? 1 : 0,
                width: mol.width + 'px',
                height: mol.height + 'px',
              }">
              <template v-if="mol.type === 'H2'">
                <div
                  class="absolute w-6 h-6 rounded-full bg-blue-400 text-[8px] text-white flex items-center justify-center font-bold shadow-sm"
                  style="left: 0; top: 4px">
                  H
                </div>
                <div
                  class="absolute w-6 h-6 rounded-full bg-blue-400 text-[8px] text-white flex items-center justify-center font-bold shadow-sm"
                  style="left: 18px; top: 4px">
                  H
                </div>
                <div
                  class="absolute h-1 bg-white/70 transition-all duration-300"
                  style="left: 10px; top: 11px; width: 14px"
                  :class="mol.bondBroken ? 'opacity-0 w-0' : 'opacity-100'"></div>
              </template>

              <template v-if="mol.type === 'O2'">
                <div
                  class="absolute w-6 h-6 rounded-full bg-red-400 text-[8px] text-white flex items-center justify-center font-bold shadow-sm"
                  style="left: 0; top: 4px">
                  O
                </div>
                <div
                  class="absolute w-6 h-6 rounded-full bg-red-400 text-[8px] text-white flex items-center justify-center font-bold shadow-sm"
                  style="left: 18px; top: 4px">
                  O
                </div>
                <div
                  class="absolute h-0.5 bg-white/70 transition-all duration-300"
                  style="left: 10px; top: 10px; width: 14px"
                  :class="mol.bondBroken ? 'opacity-0 w-0' : 'opacity-100'"></div>
                <div
                  class="absolute h-0.5 bg-white/70 transition-all duration-300"
                  style="left: 10px; top: 14px; width: 14px"
                  :class="mol.bondBroken ? 'opacity-0 w-0' : 'opacity-100'"></div>
              </template>

              <template v-if="mol.type === 'H2O'">
                <div
                  class="absolute w-6 h-6 rounded-full bg-red-400 text-[8px] text-white flex items-center justify-center font-bold shadow-sm z-10"
                  style="left: 9px; top: 0">
                  O
                </div>
                <div
                  class="absolute w-6 h-6 rounded-full bg-blue-400 text-[8px] text-white flex items-center justify-center font-bold shadow-sm"
                  style="left: 0; top: 18px">
                  H
                </div>
                <div
                  class="absolute w-6 h-6 rounded-full bg-blue-400 text-[8px] text-white flex items-center justify-center font-bold shadow-sm"
                  style="left: 18px; top: 18px">
                  H
                </div>
                <div
                  class="absolute w-0.5 h-3 bg-white/70 origin-top"
                  style="left: 13px; top: 12px; transform: rotate(35deg)"></div>
                <div
                  class="absolute w-0.5 h-3 bg-white/70 origin-top"
                  style="left: 19px; top: 12px; transform: rotate(-35deg)"></div>
              </template>
            </div>

            <div
              v-for="atom in freeAtoms"
              :key="atom.id"
              class="absolute w-6 h-6 rounded-full text-[8px] text-white flex items-center justify-center font-bold shadow-sm transition-transform duration-100 ease-linear z-20"
              :class="atom.type === 'H' ? 'bg-blue-400' : 'bg-red-400'"
              :style="{
                left: `${atom.x}px`,
                top: `${atom.y}px`,
                opacity: atom.visible ? 1 : 0,
              }">
              {{ atom.type }}
            </div>

            <div
              v-for="p in particles"
              :key="p.id"
              class="absolute rounded-full bg-white/60 pointer-events-none"
              :style="{
                left: `${p.x}px`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
              }"></div>
          </div>

          <div class="mt-6 px-4">
            <div class="relative flex justify-between text-xs text-slate-500 mb-2 font-medium">
              <span :class="reactionStage >= 1 ? 'text-blue-600 font-bold' : ''">反应物</span>
              <span :class="reactionStage >= 2 ? 'text-blue-600 font-bold' : ''">分子拆分</span>
              <span :class="reactionStage >= 3 ? 'text-blue-600 font-bold' : ''">原子重组</span>
              <span :class="reactionStage >= 4 ? 'text-blue-600 font-bold' : ''">生成物</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 transition-all duration-700 ease-out rounded-full"
                :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="reactionStage === 4"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 class="font-bold text-slate-700 mb-4 text-center">配平化学方程式</h3>
          <div
            class="bg-slate-50 p-6 rounded-xl flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
            <input
              v-model="eqInputs.h2"
              type="text"
              maxlength="1"
              :disabled="eqVerified"
              class="w-10 h-10 text-center border-2 rounded-lg focus:outline-none focus:border-blue-500 font-bold text-lg"
              :class="
                eqStatus === 'correct'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-300'
              " />
            <span class="font-bold text-slate-600">H₂</span>
            <span class="font-bold text-slate-400 mx-1">+</span>
            <input
              v-model="eqInputs.o2"
              type="text"
              maxlength="1"
              :disabled="eqVerified"
              class="w-10 h-10 text-center border-2 rounded-lg focus:outline-none focus:border-blue-500 font-bold text-lg"
              :class="
                eqStatus === 'correct'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-300'
              " />
            <span class="font-bold text-slate-600">O₂</span>
            <span class="font-bold text-slate-400 mx-1">=</span>
            <input
              v-model="eqInputs.h2o"
              type="text"
              maxlength="1"
              :disabled="eqVerified"
              class="w-10 h-10 text-center border-2 rounded-lg focus:outline-none focus:border-blue-500 font-bold text-lg"
              :class="
                eqStatus === 'correct'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-300'
              " />
            <span class="font-bold text-slate-600">H₂O</span>
          </div>

          <div class="mt-4 text-center">
            <p v-if="eqStatus === 'error'" class="text-red-500 text-sm mb-3">
              配平不正确，请根据原子守恒原则再试一次
            </p>
            <p
              v-if="eqStatus === 'correct'"
              class="text-green-600 text-sm mb-3 font-bold flex items-center justify-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              恭喜！方程式配平正确！
            </p>
            <button
              v-if="!eqVerified"
              @click="checkEquation"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
              验证答案
            </button>
          </div>
        </div>

        <div
          v-if="eqVerified"
          class="bg-blue-50 rounded-xl border border-blue-100 p-5 animate-fade-in">
          <h3 class="font-bold text-blue-800 mb-3">反应总结</h3>
          <ul class="space-y-2 text-sm text-slate-700">
            <li class="flex gap-2">
              <span class="font-bold min-w-[4em]">微观：</span>
              <span>在点燃条件下，分子破裂成原子，原子重新组合成新分子。</span>
            </li>
            <li class="flex gap-2">
              <span class="font-bold min-w-[4em]">宏观：</span>
              <span>氢气燃烧产生淡蓝色火焰，放出热量，生成水。</span>
            </li>
            <li class="flex gap-2">
              <span class="font-bold min-w-[4em]">守恒：</span>
              <span>反应前后原子的种类和数目保持不变。</span>
            </li>
          </ul>
          <button
            @click="resetExperiment"
            class="mt-4 w-full py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-bold">
            重新演示
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";

// --- 类型定义 ---
interface Molecule {
  id: number;
  type: "H2" | "O2" | "H2O";
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  visible: boolean;
  bondBroken: boolean;
}

interface Atom {
  id: number;
  type: "H" | "O";
  x: number;
  y: number;
  vx: number;
  vy: number;
  visible: boolean;
  targetX?: number;
  targetY?: number;
  isCombining?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

// --- 状态管理 ---
const containerRef = ref<HTMLElement | null>(null);
const reactionStage = ref(1); // 1:反应物, 2:拆分, 3:重组, 4:生成物
const showFlame = ref(false);
const animationFrameId = ref<number | null>(null);

// 动画实体
const molecules = ref<Molecule[]>([]);
const freeAtoms = ref<Atom[]>([]);
const particles = ref<Particle[]>([]);

// 方程式输入
const eqInputs = reactive({ h2: "", o2: "", h2o: "" });
const eqStatus = ref<"normal" | "correct" | "error">("normal");
const eqVerified = ref(false);

// --- 计算属性 ---
const currentStageName = computed(() => {
  const names = ["", "准备阶段", "化学键断裂", "原子重组", "生成新物质"];
  return names[reactionStage.value];
});

const progressPercent = computed(() => {
  const map = [0, 10, 40, 70, 100];
  return map[reactionStage.value];
});

// --- 动画核心逻辑 ---

// 初始化分子
const initMolecules = () => {
  molecules.value = [];
  freeAtoms.value = [];

  // 2个H2
  molecules.value.push(createMol("H2", 100, 100));
  molecules.value.push(createMol("H2", 100, 200));
  // 1个O2
  molecules.value.push(createMol("O2", 250, 150));
};

const createMol = (type: Molecule["type"], x: number, y: number): Molecule => {
  return {
    id: Math.random(),
    type,
    x,
    y,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    width: 44, // 估算尺寸用于碰撞
    height: 32,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.5,
    visible: true,
    bondBroken: false,
  };
};

// 动画循环
const animate = () => {
  const w = containerRef.value?.clientWidth || 300;
  const h = containerRef.value?.clientHeight || 360;

  // 更新分子位置
  molecules.value.forEach(mol => {
    if (!mol.visible) return;

    mol.x += mol.vx;
    mol.y += mol.vy;
    mol.rotation += mol.rotationSpeed;

    // 边界碰撞
    if (mol.x <= 0 || mol.x >= w - mol.width) mol.vx *= -1;
    if (mol.y <= 0 || mol.y >= h - mol.height) mol.vy *= -1;
  });

  // 更新自由原子位置
  freeAtoms.value.forEach(atom => {
    if (!atom.visible) return;

    if (atom.isCombining && atom.targetX !== undefined && atom.targetY !== undefined) {
      // 趋向目标位置（重组中）
      const dx = atom.targetX - atom.x;
      const dy = atom.targetY - atom.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        atom.x += dx * 0.08;
        atom.y += dy * 0.08;
      }
    } else {
      // 自由运动
      atom.x += atom.vx;
      atom.y += atom.vy;
      // 边界
      if (atom.x <= 0 || atom.x >= w - 24) atom.vx *= -1;
      if (atom.y <= 0 || atom.y >= h - 24) atom.vy *= -1;
    }
  });

  // 粒子动画 (简单的消失效果)
  particles.value = particles.value
    .filter(p => p.opacity > 0.01)
    .map(p => ({
      ...p,
      y: p.y - 0.5, // 向上飘
      opacity: p.opacity * 0.95,
    }));

  animationFrameId.value = requestAnimationFrame(animate);
};

// --- 交互流程 ---

// 1. 开始反应
const startReaction = () => {
  if (reactionStage.value > 1) return;

  showFlame.value = true;

  // 加速运动模拟受热
  molecules.value.forEach(m => {
    m.vx *= 4;
    m.vy *= 4;
    m.rotationSpeed *= 3;
  });

  // 1.5秒后进入拆分阶段
  setTimeout(breakBonds, 1500);
};

// 2. 化学键断裂
const breakBonds = () => {
  reactionStage.value = 2;
  showFlame.value = false;

  molecules.value.forEach(mol => {
    mol.bondBroken = true; // 视觉上隐藏键

    // 延迟一点生成原子，模拟拆分过程
    setTimeout(() => {
      mol.visible = false; // 隐藏原分子

      // 生成自由原子
      if (mol.type === "H2") {
        createAtom("H", mol.x, mol.y);
        createAtom("H", mol.x + 20, mol.y);
      } else if (mol.type === "O2") {
        createAtom("O", mol.x, mol.y);
        createAtom("O", mol.x + 20, mol.y);
      }
    }, 600);
  });

  // 拆分完成后进入重组
  setTimeout(recombineAtoms, 2500);
};

const createAtom = (type: Atom["type"], x: number, y: number) => {
  freeAtoms.value.push({
    id: Math.random(),
    type,
    x,
    y,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    visible: true,
    isCombining: false,
  });
};

// 3. 原子重组
const recombineAtoms = () => {
  reactionStage.value = 3;

  // 目标：形成2个H2O
  // 我们有 4个H, 2个O
  const hAtoms = freeAtoms.value.filter(a => a.type === "H");
  const oAtoms = freeAtoms.value.filter(a => a.type === "O");

  // 设定两个水分子的目标生成位置
  const w = containerRef.value?.clientWidth || 300;
  const h = containerRef.value?.clientHeight || 360;
  const target1 = { x: w * 0.3, y: h * 0.5 };
  const target2 = { x: w * 0.7, y: h * 0.5 };

  // 分配原子去向
  if (oAtoms.length >= 2 && hAtoms.length >= 4) {
    // 组1
    assignTarget(oAtoms[0], target1.x, target1.y);
    assignTarget(hAtoms[0], target1.x - 10, target1.y + 15);
    assignTarget(hAtoms[1], target1.x + 10, target1.y + 15);

    // 组2
    assignTarget(oAtoms[1], target2.x, target2.y);
    assignTarget(hAtoms[2], target2.x - 10, target2.y + 15);
    assignTarget(hAtoms[3], target2.x + 10, target2.y + 15);
  }

  // 等待原子就位后生成新分子
  setTimeout(formProducts, 2000);
};

const assignTarget = (atom: Atom, tx: number, ty: number) => {
  atom.isCombining = true;
  atom.targetX = tx;
  atom.targetY = ty;
  atom.vx = 0; // 停止随机运动，由动画循环中的趋向逻辑接管
  atom.vy = 0;
};

// 4. 生成新物质
const formProducts = () => {
  // 隐藏所有原子
  freeAtoms.value.forEach(a => (a.visible = false));

  // 清空旧分子，生成新分子
  molecules.value = [];

  const w = containerRef.value?.clientWidth || 300;
  const h = containerRef.value?.clientHeight || 360;

  // 生成2个水分子
  molecules.value.push(createMol("H2O", w * 0.3 - 10, h * 0.5 - 10));
  molecules.value.push(createMol("H2O", w * 0.7 - 10, h * 0.5 - 10));

  // 稍微给点速度
  molecules.value.forEach(m => {
    m.vx = (Math.random() - 0.5) * 0.2;
    m.vy = (Math.random() - 0.5) * 0.2;
  });

  // 撒花/粒子效果
  spawnParticles(w * 0.3, h * 0.5);
  spawnParticles(w * 0.7, h * 0.5);

  reactionStage.value = 4;
};

const spawnParticles = (x: number, y: number) => {
  for (let i = 0; i < 10; i++) {
    particles.value.push({
      id: Math.random(),
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      size: Math.random() * 4 + 2,
      opacity: 1,
    });
  }
};

// --- 方程式验证 ---
const checkEquation = () => {
  const { h2, o2, h2o } = eqInputs;
  // 简单容错：允许空着表示1，或者显式写1（虽然化学上通常省略）
  const vH2 = h2.trim();
  const vO2 = o2.trim();
  const vH2O = h2o.trim();

  if (vH2 === "2" && (vO2 === "1" || vO2 === "") && vH2O === "2") {
    eqStatus.value = "correct";
    eqVerified.value = true;
  } else {
    eqStatus.value = "error";
  }
};

const resetExperiment = () => {
  reactionStage.value = 1;
  showFlame.value = false;
  eqStatus.value = "normal";
  eqVerified.value = false;
  eqInputs.h2 = "";
  eqInputs.o2 = "";
  eqInputs.h2o = "";
  initMolecules();
};

// --- 生命周期 ---
onMounted(() => {
  initMolecules();
  animationFrameId.value = requestAnimationFrame(animate);
});

onUnmounted(() => {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value);
});
</script>

<style scoped>
@keyframes flame-flicker {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(-2deg);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1) rotate(2deg);
  }
}
.animate-flame {
  animation: flame-flicker 0.2s infinite alternate;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in-up 0.4s ease-out forwards;
}
</style>
