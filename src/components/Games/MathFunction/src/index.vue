<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-800 pb-24 relative overflow-hidden">
    <header class="bg-blue-600 text-white shadow-md sticky top-0 z-20">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between w-96%">
        <div class="flex items-center gap-3">
          <div class="bg-blue-700 p-2 rounded-full border border-blue-400/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-blue-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 class="text-xl font-bold tracking-wide">函数过山车</h1>
        </div>
        <button
          @click="showRules = true"
          class="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          说明
        </button>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6 space-y-6">
      <Transition name="fade">
        <div
          v-if="showRules"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showRules = false">
          <div class="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full relative animate-scale-in">
            <button
              @click="showRules = false"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
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
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 class="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              游戏规则
            </h2>
            <p class="text-sm text-gray-600 mb-4 leading-relaxed">
              通过调整
              <span class="font-bold text-blue-600">x</span>
              的值，控制过山车在函数轨道上移动。你的目标是让过山车穿过所有
              <span class="font-bold text-green-500">绿色检查点</span>
              。
            </p>
            <div class="bg-blue-50 p-3 rounded-lg text-xs space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>当前函数: y = kx + b</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span>检查点: 必须经过的坐标</span>
              </div>
            </div>
            <button
              @click="showRules = false"
              class="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
              开始挑战
            </button>
          </div>
        </div>
      </Transition>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-blue-100 p-5 lg:col-span-1 h-fit">
          <div class="bg-blue-50 rounded-xl p-4 text-center mb-6 border border-blue-100">
            <p class="text-xs text-blue-400 uppercase font-bold tracking-wider mb-1">
              当前轨道函数
            </p>
            <p class="text-2xl font-mono font-bold text-blue-700">{{ currentFunctionStr }}</p>
          </div>

          <div class="space-y-6">
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-sm font-bold text-gray-600">位置 (x)</label>
                <span class="text-lg font-bold text-blue-600 font-mono">{{ xVal.toFixed(1) }}</span>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="adjustX(-0.5)"
                  class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
                <input
                  type="range"
                  v-model.number="xVal"
                  :min="-10"
                  :max="10"
                  :step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <button
                  @click="adjustX(0.5)"
                  class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              class="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-100">
              <div class="text-xs text-gray-500">
                当
                <span class="font-mono text-gray-700 font-bold">x = {{ xVal.toFixed(1) }}</span>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-400 mb-0.5">高度 (y)</div>
                <div class="text-xl font-bold text-pink-500 font-mono">{{ yVal.toFixed(1) }}</div>
              </div>
            </div>

            <div>
              <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                检查点
              </div>
              <div class="space-y-2">
                <div
                  v-for="(cp, index) in checkpoints"
                  :key="index"
                  class="flex items-center justify-between text-sm p-2 rounded-lg transition-colors"
                  :class="cp.passed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'">
                  <span class="font-mono">({{ cp.x }}, {{ cp.y }})</span>
                  <svg
                    v-if="cp.passed"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd" />
                  </svg>
                  <div v-else class="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-4">
          <div
            class="bg-white rounded-xl shadow-md border border-blue-100 p-1 relative h-[400px] overflow-hidden w-96%">
            <div
              class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20 pointer-events-none"></div>

            <canvas ref="canvasRef" class="w-full h-full block rounded-lg bg-white"></canvas>

            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                @click="toggleAutoRide"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center gap-2 transition active:scale-95 text-sm font-bold">
                <svg
                  v-if="!isAutoRiding"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
                {{ isAutoRiding ? "暂停" : "自动行驶" }}
              </button>
              <button
                @click="resetRide"
                class="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full shadow-lg flex items-center gap-2 transition active:scale-95 text-sm font-bold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重置位置
              </button>
            </div>

            <div
              v-if="coasterPos"
              class="absolute px-2 py-1 bg-blue-600/90 text-white text-[10px] font-mono rounded shadow-sm pointer-events-none transition-all duration-75"
              :style="{ left: `${coasterPos.x + 15}px`, top: `${coasterPos.y - 30}px` }">
              ({{ xVal.toFixed(1) }}, {{ yVal.toFixed(1) }})
            </div>
          </div>
        </div>
      </div>

      <Transition name="scale">
        <div
          v-if="levelComplete"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm">
          <div
            class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-bounce-in border-t-8 border-blue-500">
            <div
              class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-4xl">🎢</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">挑战成功！</h2>
            <p class="text-gray-500 mb-6 text-sm">你已成功驾驶过山车穿过所有检查点。</p>

            <div class="bg-blue-50 p-4 rounded-xl mb-6 text-left">
              <h4 class="text-xs font-bold text-blue-600 uppercase mb-2">知识点回顾</h4>
              <p class="text-sm text-gray-700 leading-relaxed">
                一次函数
                <span class="font-mono font-bold">y = kx + b</span>
                的图像是一条直线。
                <br />
                在此关卡中：
                <br />
                • 斜率
                <span class="font-mono font-bold">k={{ currentK }}</span>
                <br />
                • 截距
                <span class="font-mono font-bold">b={{ currentB }}</span>
              </p>
            </div>

            <button
              @click="nextLevel"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg transition active:scale-95 flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              下一关
            </button>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

// --- Types ---
interface Checkpoint {
  id: string;
  x: number;
  y: number;
  passed: boolean;
}

interface Point {
  x: number;
  y: number;
}

// --- State ---
const canvasRef = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const showRules = ref(true); // Show rules on start
const levelComplete = ref(false);

const currentK = ref(2);
const currentB = ref(1);
const xVal = ref(-5);
const isAutoRiding = ref(false);
let animationFrameId: number | null = null;

const checkpoints = ref<Checkpoint[]>([]);
const coasterPos = ref<Point | null>(null);

// --- Computed ---
const currentFunctionStr = computed(() => {
  const bStr = currentB.value >= 0 ? `+ ${currentB.value}` : `- ${Math.abs(currentB.value)}`;
  return `y = ${currentK.value}x ${bStr}`;
});

const yVal = computed(() => currentK.value * xVal.value + currentB.value);

// --- Game Logic ---

const initLevel = () => {
  levelComplete.value = false;
  xVal.value = -8;
  isAutoRiding.value = false;

  // Randomize function for new levels
  // k: -2 to 2 (step 0.5), b: -3 to 3
  if (!checkpoints.value.length || levelComplete.value) {
    currentK.value = [0.5, 1, 1.5, 2, -0.5, -1, -1.5, -2][Math.floor(Math.random() * 8)];
    currentB.value = Math.floor(Math.random() * 7) - 3;
  }

  generateCheckpoints();
  draw();
};

const generateCheckpoints = () => {
  const points: Checkpoint[] = [];
  // Generate 5 points along the line within visible range x: -8 to 8
  const step = 3;
  for (let i = 0; i < 5; i++) {
    const cx = -6 + i * step;
    const cy = currentK.value * cx + currentB.value;
    points.push({
      id: `cp-${i}`,
      x: cx,
      y: cy,
      passed: false,
    });
  }
  checkpoints.value = points;
};

const calculateCanvasCoords = (mathX: number, mathY: number, width: number, height: number) => {
  const scale = 20; // pixels per unit
  const centerX = width / 2;
  const centerY = height / 2;

  return {
    x: centerX + mathX * scale,
    y: centerY - mathY * scale, // Invert Y for canvas
  };
};

const draw = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const context = canvas.getContext("2d");
  if (!context) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear
  context.clearRect(0, 0, width, height);

  // Draw Grid & Axis
  drawGrid(context, width, height);

  // Draw Function Line
  drawFunction(context, width, height);

  // Draw Checkpoints
  drawCheckpoints(context, width, height);

  // Draw Coaster
  drawCoaster(context, width, height);
};

const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const scale = 20;
  const cx = w / 2;
  const cy = h / 2;

  ctx.strokeStyle = "#e5e7eb"; // Light gray
  ctx.lineWidth = 1;
  ctx.beginPath();

  // Vertical lines
  for (let x = cx % scale; x < w; x += scale) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  // Horizontal lines
  for (let y = cy % scale; y < h; y += scale) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Axes
  ctx.strokeStyle = "#9ca3af"; // Darker gray
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(w, cy); // X axis
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, h); // Y axis
  ctx.stroke();

  // Arrows
  ctx.fillStyle = "#6b7280";
  ctx.font = "12px sans-serif";
  ctx.fillText("x", w - 15, cy - 10);
  ctx.fillText("y", cx + 10, 15);
};

const drawFunction = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.strokeStyle = "#3b82f6"; // Blue-500
  ctx.lineWidth = 3;
  ctx.beginPath();

  // Draw line from x = -10 to x = 10
  const start = calculateCanvasCoords(-10, currentK.value * -10 + currentB.value, w, h);
  const end = calculateCanvasCoords(10, currentK.value * 10 + currentB.value, w, h);

  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
};

const drawCheckpoints = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  checkpoints.value.forEach(cp => {
    const pos = calculateCanvasCoords(cp.x, cp.y, w, h);

    // Check if coaster is close enough to pass
    if (!cp.passed && Math.abs(xVal.value - cp.x) < 0.5) {
      cp.passed = true;
      checkCompletion();
    }

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    if (cp.passed) {
      ctx.fillStyle = "#10b981"; // Green
      ctx.fill();
    } else {
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
};

const drawCoaster = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const pos = calculateCanvasCoords(xVal.value, yVal.value, w, h);
  coasterPos.value = pos; // Update state for overlay bubble

  // Coaster Body (Simple Cart)
  ctx.fillStyle = "#ec4899"; // Pink-500
  ctx.beginPath();
  // Simple rounded rect shape
  ctx.roundRect(pos.x - 15, pos.y - 15, 30, 20, 5);
  ctx.fill();

  // Wheels
  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.arc(pos.x - 10, pos.y + 5, 4, 0, Math.PI * 2);
  ctx.arc(pos.x + 10, pos.y + 5, 4, 0, Math.PI * 2);
  ctx.fill();
};

const adjustX = (delta: number) => {
  let newValue = xVal.value + delta;
  if (newValue < -10) newValue = -10;
  if (newValue > 10) newValue = 10;
  xVal.value = parseFloat(newValue.toFixed(1));
};

const toggleAutoRide = () => {
  if (isAutoRiding.value) {
    isAutoRiding.value = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  } else {
    isAutoRiding.value = true;
    animateRide();
  }
};

const animateRide = () => {
  if (!isAutoRiding.value) return;

  if (xVal.value < 10) {
    xVal.value += 0.05;
    animationFrameId = requestAnimationFrame(animateRide);
  } else {
    isAutoRiding.value = false;
  }
};

const resetRide = () => {
  isAutoRiding.value = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  xVal.value = -8;
  checkpoints.value.forEach(cp => (cp.passed = false));
};

const checkCompletion = () => {
  if (checkpoints.value.every(cp => cp.passed)) {
    isAutoRiding.value = false;
    setTimeout(() => {
      levelComplete.value = true;
    }, 500);
  }
};

const nextLevel = () => {
  initLevel();
};

// --- Watchers & Lifecycle ---
watch([xVal, currentK, currentB], () => {
  draw();
});

onMounted(() => {
  if (canvasRef.value) {
    // Set canvas resolution for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.value.getBoundingClientRect();
    canvasRef.value.width = rect.width * dpr;
    canvasRef.value.height = rect.height * dpr;

    // Initial draw
    initLevel();
  }

  // Handle resize
  window.addEventListener("resize", () => {
    if (canvasRef.value) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvasRef.value.parentElement?.getBoundingClientRect();
      if (rect) {
        canvasRef.value.width = rect.width * dpr;
        canvasRef.value.height = rect.height * dpr;
        draw();
      }
    }
  });
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  animation: bounce-in 0.5s;
}
.scale-leave-active {
  animation: bounce-in 0.5s reverse;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

@keyframes scale-in {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
.animate-bounce-in {
  animation: bounce-in 0.5s;
}
</style>
