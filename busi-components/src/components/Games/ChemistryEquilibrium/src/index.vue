<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <header class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-bold text-slate-800 mb-3">化学平衡调节器</h1>
        <p class="text-slate-600 max-w-3xl mx-auto">
          通过调节反应条件，观察化学平衡的移动，理解勒夏特列原理
        </p>
      </header>

      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <div class="lg:w-1/3 space-y-8">
            <h2 class="text-xl font-semibold flex items-center">
              <span class="mr-2 text-blue-600">⚙️</span>
              反应条件控制
            </h2>

            <div class="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
              <div class="text-lg font-medium mb-2">可逆反应</div>
              <div class="text-xl font-bold my-3 flex justify-center items-center flex-wrap gap-2">
                <span class="text-indigo-600">N₂</span>
                +
                <span class="text-emerald-600">3H₂</span>
                <span class="mx-2">⇌</span>
                <span class="text-amber-500">2NH₃</span>
              </div>
              <div class="text-sm text-slate-500">ΔH = -92.4 kJ/mol (放热)</div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="font-medium text-slate-700">温度 (°C)</label>
                <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                  {{ temperature }}°C
                </span>
              </div>
              <input
                type="range"
                v-model.number="temperature"
                min="200"
                max="800"
                step="50"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                @input="adjustEquilibrium" />
              <div class="flex justify-between text-xs text-slate-400 mt-1">
                <span>低温 (200°C)</span>
                <span>高温 (800°C)</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="font-medium text-slate-700">压强 (atm)</label>
                <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                  {{ pressure }} atm
                </span>
              </div>
              <input
                type="range"
                v-model.number="pressure"
                min="1"
                max="500"
                step="50"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                @input="adjustEquilibrium" />
              <div class="flex justify-between text-xs text-slate-400 mt-1">
                <span>低压</span>
                <span>高压</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="font-medium text-slate-700">催化剂</label>
                <label class="inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="catalyst" class="sr-only peer" />
                  <div
                    class="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span class="ml-2 text-sm font-medium text-slate-600">
                    {{ catalyst ? "使用中" : "未使用" }}
                  </span>
                </label>
              </div>
              <div class="text-xs text-slate-400">铁触媒 (加速平衡达成)</div>
            </div>

            <div class="bg-blue-50 rounded-lg p-4 text-sm border border-blue-100">
              <h3 class="font-semibold mb-2 text-blue-800">平衡状态分析</h3>
              <div class="space-y-2 text-slate-700" v-html="analysisText"></div>
            </div>
          </div>

          <div class="lg:w-2/3 space-y-6">
            <h2 class="text-xl font-semibold flex items-center">
              <span class="mr-2 text-blue-600">⚗️</span>
              反应平衡可视化
            </h2>

            <div
              class="relative w-full h-[320px] bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shadow-inner">
              <div
                class="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-slate-500 z-10">
                微观反应容器
              </div>

              <div
                v-for="mol in molecules"
                :key="mol.id"
                class="absolute rounded-full shadow-sm animate-float"
                :style="getMoleculeStyle(mol)"
                :title="mol.type"></div>

              <div
                class="absolute bottom-2 right-2 bg-white/90 px-3 py-1.5 rounded-full text-sm font-bold flex items-center shadow-sm border border-slate-100">
                <span :class="isAdjusting ? 'text-amber-500' : 'text-emerald-600'">
                  {{ isAdjusting ? "平衡移动中..." : "达到平衡" }}
                </span>
                <span v-if="isAdjusting" class="ml-2 animate-spin">⚙️</span>
                <span v-else class="ml-2">⚖️</span>
              </div>
            </div>

            <div class="w-full h-[280px] bg-white p-2 rounded-lg border border-slate-100">
              <canvas ref="chartCanvas"></canvas>
            </div>

            <div class="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h3 class="font-semibold text-indigo-800 mb-2 flex items-center">
                <span class="mr-2">💡</span>
                原理应用
              </h3>
              <p class="text-sm text-indigo-900/80 leading-relaxed">{{ explanationText }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-4 text-slate-800">📚 核心知识点</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            class="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
            <h3 class="font-bold text-blue-700 mb-2">勒夏特列原理</h3>
            <p class="text-sm text-slate-600">
              如果改变影响平衡的一个条件（如浓度、压强或温度），平衡就向能够减弱这种改变的方向移动。
            </p>
          </div>
          <div
            class="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
            <h3 class="font-bold text-blue-700 mb-2">温度影响</h3>
            <p class="text-sm text-slate-600">
              对于放热反应（如合成氨），升高温度会导致平衡逆向移动；降低温度则正向移动。
            </p>
          </div>
          <div
            class="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
            <h3 class="font-bold text-blue-700 mb-2">压强影响</h3>
            <p class="text-sm text-slate-600">
              增大压强，平衡向气体分子数减少的方向移动。合成氨反应中，正反应方向体积减小，故加压有利。
            </p>
          </div>
          <div
            class="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
            <h3 class="font-bold text-blue-700 mb-2">催化剂作用</h3>
            <p class="text-sm text-slate-600">
              催化剂同等程度加快正逆反应速率，缩短达到平衡的时间，但不改变平衡点位置。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from "vue";
import {
  Chart,
  type ChartConfiguration,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";

// Register Chart.js components
Chart.register(BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip);

// --- Types ---
interface Molecule {
  id: number;
  type: "N2" | "H2" | "NH3";
  size: number;
  x: number;
  y: number;
  color: string;
  delay: number;
}

interface Concentrations {
  N2: number;
  H2: number;
  NH3: number;
}

// --- State ---
const temperature = ref(400);
const pressure = ref(200);
const catalyst = ref(true);
const isAdjusting = ref(false);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
let animationFrameId: number | null = null;

const concentrations = reactive<Concentrations>({
  N2: 1.0,
  H2: 3.0,
  NH3: 1.5,
});

const molecules = ref<Molecule[]>([]);

// --- Computed Text ---
const analysisText = computed(() => {
  let text = "";
  // Temperature Logic
  if (temperature.value < 400) {
    text += `<div class="flex items-center gap-2 mb-1"><span class="text-blue-500">❄️</span> 低温有利于放热反应，平衡正向移动 (生成 NH₃)</div>`;
  } else if (temperature.value > 400) {
    text += `<div class="flex items-center gap-2 mb-1"><span class="text-red-500">🔥</span> 高温抑制放热反应，平衡逆向移动 (消耗 NH₃)</div>`;
  } else {
    text += `<div class="flex items-center gap-2 mb-1"><span class="text-amber-500">🌡️</span> 标准温度状态</div>`;
  }

  // Pressure Logic
  if (pressure.value > 200) {
    text += `<div class="flex items-center gap-2 mb-1"><span class="text-purple-600">⬇️</span> 高压利于体积减小，平衡正向移动</div>`;
  } else if (pressure.value < 200) {
    text += `<div class="flex items-center gap-2 mb-1"><span class="text-purple-400">⬆️</span> 低压利于体积增大，平衡逆向移动</div>`;
  }

  // Current State
  text += `<div class="mt-3 pt-2 border-t border-blue-100 text-xs text-slate-500 font-mono">
      当前浓度: [N₂]=${concentrations.N2.toFixed(2)}, [H₂]=${concentrations.H2.toFixed(2)}, [NH₃]=${concentrations.NH3.toFixed(2)}
    </div>`;

  return text;
});

const explanationText = computed(() => {
  let text = "系统处于动态平衡中。";
  if (isAdjusting.value) {
    const isHeating = temperature.value > 400;
    const isPressurized = pressure.value > 200;

    if (isHeating) text = "升高温度，系统试图通过吸热方向（逆反应）来抵消温度升高。";
    else if (temperature.value < 400)
      text = "降低温度，系统向放热方向（正反应）移动以补偿热量损失。";

    if (isPressurized) text += " 同时，增大压强迫使平衡向气体分子数较少的方向（生成氨）移动。";
    else if (pressure.value < 200) text += " 同时，减小压强使平衡向气体分子数较多的方向移动。";
  }
  return text;
});

// --- Methods ---

// Initialize Chart
const initChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["N₂", "H₂", "NH3"],
      datasets: [
        {
          label: "浓度 (mol/L)",
          data: [concentrations.N2, concentrations.H2, concentrations.NH3],
          backgroundColor: [
            "rgba(79, 70, 229, 0.7)", // N2 Indigo
            "rgba(16, 185, 129, 0.7)", // H2 Emerald
            "rgba(245, 158, 11, 0.7)", // NH3 Amber
          ],
          borderColor: ["rgb(79, 70, 229)", "rgb(16, 185, 129)", "rgb(245, 158, 11)"],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 8,
          grid: { color: "#f1f5f9" },
        },
        x: {
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          padding: 10,
          cornerRadius: 8,
        },
      },
    },
  });
};

// Generate Molecules for Visualizer
const generateMolecules = () => {
  const total = 40; // Total particle count for visual density
  const totalConc = concentrations.N2 + concentrations.H2 + concentrations.NH3;

  const n2Count = Math.round((concentrations.N2 / totalConc) * total);
  const h2Count = Math.round((concentrations.H2 / totalConc) * total);
  const nh3Count = total - n2Count - h2Count;

  const newMolecules: Molecule[] = [];

  const createMol = (type: Molecule["type"], color: string, baseSize: number, count: number) => {
    for (let i = 0; i < count; i++) {
      newMolecules.push({
        id: Math.random(),
        type,
        size: baseSize + Math.random() * 4,
        x: Math.random() * 90 + 5, // 5% - 95%
        y: Math.random() * 90 + 5,
        color,
        delay: Math.random() * 5,
      });
    }
  };

  createMol("N2", "rgba(79, 70, 229, 0.85)", 16, n2Count);
  createMol("H2", "rgba(16, 185, 129, 0.85)", 10, h2Count);
  createMol("NH3", "rgba(245, 158, 11, 0.85)", 20, nh3Count);

  molecules.value = newMolecules;
};

// Core Physics Logic
const adjustEquilibrium = () => {
  isAdjusting.value = true;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  // Le Chatelier Logic factors
  const tempFactor = 1 - (temperature.value - 200) / 1200; // Lower temp -> higher NH3
  const pressureFactor = 1 + (pressure.value - 1) / 1000; // Higher pressure -> higher NH3

  // Target concentrations
  const targetNH3 = Math.max(0.1, 0.5 + tempFactor * pressureFactor * 2.5);
  // Stoichiometry rough approximation for demo: N2 + 3H2 <-> 2NH3
  const targetN2 = Math.max(0.1, 2.0 - (targetNH3 - 0.5) / 2);
  const targetH2 = Math.max(0.1, 6.0 - (targetNH3 - 0.5) * 1.5);

  const duration = catalyst.value ? 1000 : 2500;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

    // Update state
    concentrations.N2 += (targetN2 - concentrations.N2) * 0.1; // Smooth interpolation
    concentrations.H2 += (targetH2 - concentrations.H2) * 0.1;
    concentrations.NH3 += (targetNH3 - concentrations.NH3) * 0.1;

    // Update Visuals
    if (chartInstance) {
      chartInstance.data.datasets[0].data = [
        concentrations.N2,
        concentrations.H2,
        concentrations.NH3,
      ];
      chartInstance.update("none"); // Efficient update
    }

    // Occasionally regenerate molecules to reflect new ratios during animation
    if (Math.random() > 0.9) generateMolecules();

    if (progress < 1 && Math.abs(concentrations.NH3 - targetNH3) > 0.05) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      isAdjusting.value = false;
      // Final precise update
      concentrations.N2 = targetN2;
      concentrations.H2 = targetH2;
      concentrations.NH3 = targetNH3;
      generateMolecules();
      if (chartInstance) chartInstance.update();
    }
  };

  animationFrameId = requestAnimationFrame(animate);
};

// CSS Style Helper
const getMoleculeStyle = (mol: Molecule) => ({
  width: `${mol.size}px`,
  height: `${mol.size}px`,
  left: `${mol.x}%`,
  top: `${mol.y}%`,
  backgroundColor: mol.color,
  animationDelay: `${mol.delay}s`,
  animationDuration: `${3 + Math.random() * 2}s`,
});

// Lifecycle
onMounted(() => {
  initChart();
  generateMolecules();
});

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});

// Watchers
watch(catalyst, () => {
  // Catalyst triggers re-evaluation mainly for speed visualization
  adjustEquilibrium();
});
</script>

<style scoped>
/* Molecular Float Animation */
@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(10px, -15px);
  }
  50% {
    transform: translate(-5px, 20px);
  }
  75% {
    transform: translate(-15px, -5px);
  }
}

.animate-float {
  animation: float linear infinite;
}

/* Custom Range Slider Styling */
input[type="range"] {
  -webkit-appearance: none;
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  margin-top: -8px;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
  transition: transform 0.1s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #e2e8f0;
  border-radius: 3px;
}
</style>
