<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- 标题区域 -->
    <header class="text-center mb-10">
      <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-#333 mb-3">天体运动模拟器</h1>
      <p class="text-gray-400 max-w-3xl mx-auto">
        调整行星参数，使其稳定绕太阳运行，理解万有引力与向心力的关系
      </p>
    </header>

    <!-- 主要内容区域 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-6 mb-8 text-#fff">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 左侧控制面板 -->
        <div class="lg:w-1/3">
          <h2 class="text-xl font-semibold mb-6 flex items-center">
            <i class="fa fa-sliders mr-2 text-primary"></i>
            参数控制
          </h2>

          <!-- 太阳信息 -->
          <div class="bg-gray-800 rounded-lg p-4 mb-6">
            <div class="flex items-center mb-3">
              <div class="w-6 h-6 bg-sun rounded-full mr-2"></div>
              <h3 class="font-medium">太阳参数</h3>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">质量：</span>
                <span class="font-medium">1.989 × 10³⁰ kg</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">半径：</span>
                <span class="font-medium">6.963 × 10⁸ m</span>
              </div>
            </div>
          </div>

          <!-- 行星质量控制 -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label for="planet-mass" class="font-medium flex items-center">
                <div class="w-4 h-4 bg-planet rounded-full mr-2"></div>
                行星质量 (×10²⁴ kg)
              </label>
              <span id="mass-value" class="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                {{ massValue }} ×10²⁴ kg
              </span>
            </div>
            <input
              type="range"
              id="planet-mass"
              min="0.3"
              max="318"
              v-model.number="massSlider"
              step="0.1"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>水星 (0.33)</span>
              <span>木星 (318)</span>
            </div>
          </div>

          <!-- 轨道半径控制 -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label for="orbit-radius" class="font-medium">轨道半径 (×10¹¹ m)</label>
              <span id="radius-value" class="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                {{ radiusValue }} ×10¹¹ m
              </span>
            </div>
            <input
              type="range"
              id="orbit-radius"
              min="0.58"
              max="59.1"
              v-model.number="radiusSlider"
              step="0.1"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>水星 (0.58)</span>
              <span>冥王星 (59.1)</span>
            </div>
          </div>

          <!-- 初始速度控制 -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label for="initial-velocity" class="font-medium">初始速度 (km/s)</label>
              <span
                id="velocity-value"
                class="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                {{ velocityValue }} km/s
              </span>
            </div>
            <input
              type="range"
              id="initial-velocity"
              min="10"
              max="60"
              v-model.number="velocitySlider"
              step="0.1"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>低于逃逸速度</span>
              <span>高于逃逸速度</span>
            </div>
          </div>

          <!-- 计算结果 -->
          <div class="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 class="font-medium mb-3">计算结果</h3>
            <div class="space-y-3">
              <div>
                <div class="text-xs text-gray-400 mb-1">所需向心力</div>
                <div id="required-force" class="text-lg font-medium">{{ requiredForce }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-1">万有引力</div>
                <div id="gravity-force" class="text-lg font-medium">{{ gravityForce }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-1">逃逸速度</div>
                <div id="escape-velocity" class="text-lg font-medium">{{ escapeVelocity }}</div>
              </div>
            </div>
          </div>

          <!-- 运行状态 -->
          <div :class="statusClass" class="rounded-lg p-4 mb-6">
            <div class="flex items-center">
              <i :class="statusIcon" class="mr-2"></i>
              <h3 class="font-medium">{{ statusTitle }}</h3>
            </div>
            <p class="text-sm text-gray-300 mt-2">
              {{ statusMessage }}
            </p>
          </div>

          <!-- 控制按钮 -->
          <div class="flex gap-3">
            <button
              @click="applyParameters"
              class="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition-all">
              应用参数
            </button>
            <button
              @click="resetSimulation"
              class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-all">
              重置
            </button>
          </div>
        </div>

        <!-- 右侧模拟区域 -->
        <div class="lg:w-2/3">
          <h2 class="text-xl font-semibold mb-6 flex items-center">
            <i class="fa fa-globe mr-2 text-primary"></i>
            天体运行模拟
          </h2>

          <!-- 模拟容器 -->
          <div
            ref="simulationContainer"
            class="relative w-full aspect-square bg-background rounded-lg overflow-hidden mb-6">
            <div id="stars-container" class="absolute inset-0">
              <div
                v-for="star in stars"
                :key="star.id"
                class="star"
                :style="{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  animationDelay: `${star.delay}s`,
                }"></div>
            </div>
            <div id="orbit" class="orbit" :style="orbitStyle"></div>
            <div id="trail" class="trail" :style="trailStyle"></div>
            <div id="velocity-vector" class="vector" :style="velocityVectorStyle"></div>
            <div id="gravity-vector" class="vector" :style="gravityVectorStyle"></div>
            <div id="planet" class="planet bg-planet" :style="planetStyle"></div>
            <div id="sun" class="sun bg-sun" :style="sunStyle"></div>

            <!-- 运行状态标签 -->
            <div
              class="absolute top-4 left-4 bg-gray-900/80 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              <span id="simulation-status">{{ simulationStatusText }}</span>
            </div>

            <!-- 暂停/继续按钮 -->
            <button
              @click="togglePlayPause"
              class="absolute top-4 right-4 bg-gray-900/80 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm">
              <i :class="playPauseIcon"></i>
            </button>
          </div>

          <!-- 物理公式 -->
          <div class="bg-gray-800 rounded-lg p-4">
            <h3 class="font-semibold mb-4">相关物理公式</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div class="bg-gray-900/50 p-3 rounded">
                <div class="text-lg font-medium mb-2">万有引力定律</div>
                <div class="text-xl my-2">F = G·(M·m)/r²</div>
                <div class="text-xs text-gray-400">
                  G = 6.67×10⁻¹¹ N·m²/kg²
                  <br />
                  M: 中心天体质量, m: 行星质量, r: 轨道半径
                </div>
              </div>
              <div class="bg-gray-900/50 p-3 rounded">
                <div class="text-lg font-medium mb-2">向心力公式</div>
                <div class="text-xl my-2">F = m·v²/r</div>
                <div class="text-xs text-gray-400">
                  v: 轨道速度, m: 行星质量, r: 轨道半径
                  <br />
                  稳定运行时: 万有引力 = 向心力
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点说明 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-6 mb-8 text-#fff">
      <h2 class="text-xl font-semibold mb-4">天体运动知识点</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium text-primary mb-2">稳定轨道条件</h3>
          <p class="text-gray-400 text-sm leading-relaxed">
            行星绕中心天体稳定运行的条件是万有引力恰好提供所需的向心力：G·(M·m)/r² =
            m·v²/r。由此可推导出所需轨道速度为v =
            √(GM/r)。当实际速度等于这个值时，轨道是圆形；当速度略小时，轨道是椭圆形；当速度大于逃逸速度时，行星将脱离轨道。
          </p>
        </div>

        <div>
          <h3 class="font-medium text-primary mb-2">逃逸速度</h3>
          <p class="text-gray-400 text-sm leading-relaxed">
            逃逸速度是指物体脱离中心天体引力束缚所需的最小速度，计算公式为vₑ =
            √(2GM/r)。对于地球轨道上的物体，逃逸速度约为42.1km/s。当行星速度大于等于逃逸速度时，将沿抛物线或双曲线轨迹脱离太阳系。
          </p>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="mt-8 text-center text-gray-500 text-sm">
      <p>高中物理教学 · 天体运动模拟器交互工具</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from "vue";

// 物理常量定义
const G = 6.6743e-11; // 万有引力常量 (N·m²/kg²)
const SUN_MASS = 1.989e30; // 太阳质量 (kg)
const SUN_RADIUS = 6.963e8; // 太阳半径 (m)
const EARTH_MASS = 5.97e24; // 地球质量 (kg)
const EARTH_ORBIT = 1.5e11; // 地球轨道半径 (m)
const EARTH_VELOCITY = 29.78e3; // 地球公转速度 (m/s)

// 类型定义
interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface SimulationParams {
  planetMass: number; // 行星质量 (kg)
  orbitRadius: number; // 轨道半径 (m)
  initialVelocity: number; // 初始速度 (m/s)
  isRunning: boolean; // 模拟是否运行
  position: Position; // 行星位置 (m)
  velocity: Velocity; // 行星速度矢量 (m/s)
  trailPoints: Position[]; // 轨迹点
  isEscaped: boolean; // 是否已脱离轨道
}

interface Star {
  id: number;
  size: number;
  left: number;
  top: number;
  delay: number;
}

interface Status {
  class: string;
  icon: string;
  title: string;
  message: string;
}

// 响应式状态
const simulationContainer = ref<HTMLDivElement | null>(null);
const scaleFactor = ref(1);
const stars = ref<Star[]>([]);

// 滑块值
const massSlider = ref(5.97);
const radiusSlider = ref(1.5);
const velocitySlider = ref(29.8);

// 模拟参数
const simulationParams = ref<SimulationParams>({
  planetMass: 5.97e24,
  orbitRadius: 1.5e11,
  initialVelocity: 29.78e3,
  isRunning: true,
  position: { x: 1.5e11, y: 0 },
  velocity: { x: 0, y: 29.78e3 },
  trailPoints: [],
  isEscaped: false,
});

// 计算属性 - 显示值格式化
const massValue = computed(() => massSlider.value.toFixed(2));
const radiusValue = computed(() => radiusSlider.value.toFixed(2));
const velocityValue = computed(() => velocitySlider.value.toFixed(1));

// 计算物理参数
const requiredForce = computed(() => {
  const force =
    (simulationParams.value.planetMass * Math.pow(simulationParams.value.initialVelocity, 2)) /
    simulationParams.value.orbitRadius;
  return formatNumber(force) + " N";
});

const gravityForce = computed(() => {
  const force =
    (G * SUN_MASS * simulationParams.value.planetMass) /
    (simulationParams.value.orbitRadius * simulationParams.value.orbitRadius);
  return formatNumber(force) + " N";
});

const escapeVelocity = computed(() => {
  const velocity = Math.sqrt((2 * G * SUN_MASS) / simulationParams.value.orbitRadius);
  return (velocity / 1000).toFixed(1) + " km/s";
});

// 状态指示器
const status = ref<Status>({
  class: "bg-success/20 border border-success",
  icon: "fa fa-check-circle text-success",
  title: "稳定运行中",
  message: "行星处于稳定轨道，万有引力恰好提供所需向心力",
});

const statusClass = computed(() => status.value.class);
const statusIcon = computed(() => status.value.icon);
const statusTitle = computed(() => status.value.title);
const statusMessage = computed(() => status.value.message);

// 模拟状态文本
const simulationStatusText = ref("运行中");

// 播放/暂停图标
const playPauseIcon = computed(() =>
  simulationParams.value.isRunning ? "fa fa-pause" : "fa fa-play",
);

// 样式计算属性
const orbitStyle = computed(() => {
  const orbitDisplayRadius = simulationParams.value.orbitRadius * scaleFactor.value;
  return {
    width: `${orbitDisplayRadius * 2}px`,
    height: `${orbitDisplayRadius * 2}px`,
    opacity: simulationParams.value.isEscaped ? "0.3" : "1",
  };
});

const trailStyle = computed(() => {
  const orbitDisplayRadius = simulationParams.value.orbitRadius * scaleFactor.value;
  return {
    width: `${orbitDisplayRadius * 2 * 0.95}px`,
    height: `${orbitDisplayRadius * 2 * 0.95}px`,
  };
});

const sunStyle = computed(() => {
  if (!simulationContainer.value) return {};

  const containerSize = Math.min(
    simulationContainer.value.clientWidth,
    simulationContainer.value.clientHeight,
  );
  const sunDisplayRadius = Math.min(30, containerSize * 0.05);

  return {
    width: `${sunDisplayRadius * 2}px`,
    height: `${sunDisplayRadius * 2}px`,
  };
});

const planetStyle = computed(() => {
  const screenX = simulationParams.value.position.x * scaleFactor.value;
  const screenY = simulationParams.value.position.y * scaleFactor.value;

  const planetMassRatio = simulationParams.value.planetMass / EARTH_MASS;
  const planetDisplayRadius = Math.max(5, Math.min(15, 8 * Math.cbrt(planetMassRatio)));

  return {
    width: `${planetDisplayRadius * 2}px`,
    height: `${planetDisplayRadius * 2}px`,
    left: `calc(50% + ${screenX}px)`,
    top: `calc(50% + ${screenY}px)`,
  };
});

const velocityVectorStyle = computed(() => {
  const r = Math.sqrt(
    simulationParams.value.position.x * simulationParams.value.position.x +
      simulationParams.value.position.y * simulationParams.value.position.y,
  );

  if (r < 1e9) return { display: "none" };

  const velocityMagnitude = Math.sqrt(
    simulationParams.value.velocity.x * simulationParams.value.velocity.x +
      simulationParams.value.velocity.y * simulationParams.value.velocity.y,
  );

  const velocityVectorLength = Math.min(50, velocityMagnitude * scaleFactor.value * 1e-3);
  const velocityAngle =
    (Math.atan2(simulationParams.value.velocity.y, simulationParams.value.velocity.x) * 180) /
    Math.PI;

  const screenX = simulationParams.value.position.x * scaleFactor.value;
  const screenY = simulationParams.value.position.y * scaleFactor.value;

  return {
    width: `${velocityVectorLength}px`,
    height: "2px",
    left: `calc(50% + ${screenX}px)`,
    top: `calc(50% + ${screenY}px)`,
    transform: `rotate(${velocityAngle}deg)`,
    display: "block",
  };
});

const gravityVectorStyle = computed(() => {
  const r = Math.sqrt(
    simulationParams.value.position.x * simulationParams.value.position.x +
      simulationParams.value.position.y * simulationParams.value.position.y,
  );

  if (r < 1e9) return { display: "none" };

  const gravityAngle =
    (Math.atan2(-simulationParams.value.position.y, -simulationParams.value.position.x) * 180) /
    Math.PI;
  const gravityMagnitude = (G * SUN_MASS * simulationParams.value.planetMass) / (r * r);

  const gravityVectorLength = Math.min(40, gravityMagnitude * scaleFactor.value * 1e-22);

  const screenX = simulationParams.value.position.x * scaleFactor.value;
  const screenY = simulationParams.value.position.y * scaleFactor.value;

  return {
    width: `${gravityVectorLength}px`,
    height: "2px",
    backgroundColor: "rgba(239, 68, 68, 0.6)",
    left: `calc(50% + ${screenX}px)`,
    top: `calc(50% + ${screenY}px)`,
    transform: `rotate(${gravityAngle}deg)`,
    display: "block",
  };
});

// 辅助函数 - 创建星空背景
function createStars() {
  const starCount = 200;
  const newStars: Star[] = [];

  for (let i = 0; i < starCount; i++) {
    newStars.push({
      id: i,
      size: Math.random() * 2 + 0.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
    });
  }

  stars.value = newStars;
}

// 辅助函数 - 格式化大数字
function formatNumber(num: number): string {
  if (num >= 1e24) {
    return (num / 1e24).toFixed(2) + " ×10²⁴";
  } else if (num >= 1e21) {
    return (num / 1e21).toFixed(2) + " ×10²¹";
  } else if (num >= 1e18) {
    return (num / 1e18).toFixed(2) + " ×10¹⁸";
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + " ×10⁹";
  }
  return num.toFixed(2);
}

// 检查轨道稳定性
function checkStability() {
  const requiredForce =
    (simulationParams.value.planetMass * Math.pow(simulationParams.value.initialVelocity, 2)) /
    simulationParams.value.orbitRadius;

  const gravityForce =
    (G * SUN_MASS * simulationParams.value.planetMass) /
    (simulationParams.value.orbitRadius * simulationParams.value.orbitRadius);

  const ratio = requiredForce / gravityForce;
  const escapeVelocity = Math.sqrt((2 * G * SUN_MASS) / simulationParams.value.orbitRadius);
  const isEscape = simulationParams.value.initialVelocity >= escapeVelocity;

  if (isEscape) {
    status.value = {
      class: "bg-danger/20 border border-danger",
      icon: "fa fa-exclamation-triangle text-danger",
      title: "将脱离轨道",
      message: "行星速度超过逃逸速度，将脱离太阳引力束缚",
    };
  } else if (Math.abs(1 - ratio) < 0.1) {
    // 10%误差范围内视为稳定
    status.value = {
      class: "bg-success/20 border border-success",
      icon: "fa fa-check-circle text-success",
      title: "稳定运行中",
      message: "行星处于稳定轨道，万有引力恰好提供所需向心力",
    };
  } else if (ratio > 1) {
    status.value = {
      class: "bg-warning/20 border border-warning",
      icon: "fa fa-arrow-circle-up text-warning",
      title: "轨道不稳定",
      message: "速度过大，万有引力不足以提供向心力，轨道将逐渐变大",
    };
  } else {
    status.value = {
      class: "bg-warning/20 border border-warning",
      icon: "fa fa-arrow-circle-down text-warning",
      title: "轨道不稳定",
      message: "速度过小，万有引力大于所需向心力，行星将逐渐靠近太阳",
    };
  }
}

// 更新缩放比例
function updateScaleFactor() {
  if (!simulationContainer.value) return;

  const containerSize = Math.min(
    simulationContainer.value.clientWidth,
    simulationContainer.value.clientHeight,
  );
  scaleFactor.value = containerSize / (2 * 60e11); // 基于最大轨道半径的缩放
}

// 应用参数
function applyParameters() {
  // 获取滑块值并转换为实际物理量
  const planetMass = parseFloat(massSlider.value.toString()) * 1e24; // kg
  const orbitRadius = parseFloat(radiusSlider.value.toString()) * 1e11; // m
  const initialVelocity = parseFloat(velocitySlider.value.toString()) * 1e3; // m/s

  // 更新参数
  simulationParams.value = {
    ...simulationParams.value,
    planetMass,
    orbitRadius,
    initialVelocity,
    position: { x: orbitRadius, y: 0 },
    velocity: { x: 0, y: initialVelocity },
    trailPoints: [],
    isEscaped: false,
  };

  // 检查运行状态
  checkStability();

  // 更新模拟尺寸
  updateScaleFactor();

  // 重置状态显示
  simulationStatusText.value = "运行中";
}

// 重置模拟
function resetSimulation() {
  // 重置滑块
  massSlider.value = 5.97;
  radiusSlider.value = 1.5;
  velocitySlider.value = 29.8;

  // 应用默认参数
  applyParameters();

  // 确保模拟运行
  if (!simulationParams.value.isRunning) {
    togglePlayPause();
  }
}

// 切换播放/暂停
function togglePlayPause() {
  simulationParams.value.isRunning = !simulationParams.value.isRunning;

  if (simulationParams.value.isRunning) {
    simulationStatusText.value = simulationParams.value.isEscaped ? "已脱离轨道" : "运行中";
  } else {
    simulationStatusText.value = "已暂停";
  }
}

// 更新轨迹
function updateTrail() {
  // 限制轨迹点数量
  if (simulationParams.value.trailPoints.length > 200) {
    simulationParams.value.trailPoints.shift();
  }

  // 仅当行星未脱离且在运行时添加轨迹点
  if (simulationParams.value.isRunning && !simulationParams.value.isEscaped) {
    simulationParams.value.trailPoints.push({
      x: simulationParams.value.position.x,
      y: simulationParams.value.position.y,
    });
  }
}

// 更新模拟（基于物理规律的精确计算）
function updateSimulation() {
  if (simulationParams.value.isRunning) {
    // 计算行星到太阳的距离
    const r = Math.sqrt(
      simulationParams.value.position.x * simulationParams.value.position.x +
        simulationParams.value.position.y * simulationParams.value.position.y,
    );

    // 计算万有引力大小 (F = G*M*m / r²)
    const gravityForce = (G * SUN_MASS * simulationParams.value.planetMass) / (r * r);

    // 计算加速度 (F = ma → a = F/m)
    const acceleration = gravityForce / simulationParams.value.planetMass;

    // 计算加速度分量（指向太阳）
    const ax = -acceleration * (simulationParams.value.position.x / r);
    const ay = -acceleration * (simulationParams.value.position.y / r);

    // 时间步长（模拟加速倍数）
    const timeStep = 86400 * 7; // 7天（以秒为单位）

    // 更新速度（v = v0 + a*t）
    simulationParams.value.velocity.x += ax * timeStep;
    simulationParams.value.velocity.y += ay * timeStep;

    // 更新位置（x = x0 + v*t）
    simulationParams.value.position.x += simulationParams.value.velocity.x * timeStep;
    simulationParams.value.position.y += simulationParams.value.velocity.y * timeStep;

    // 检查是否脱离轨道（距离超过初始轨道的10倍或速度超过逃逸速度）
    const escapeVelocity = Math.sqrt((2 * G * SUN_MASS) / simulationParams.value.orbitRadius);
    const currentVelocity = Math.sqrt(
      simulationParams.value.velocity.x * simulationParams.value.velocity.x +
        simulationParams.value.velocity.y * simulationParams.value.velocity.y,
    );

    if (r > simulationParams.value.orbitRadius * 10 || currentVelocity >= escapeVelocity * 1.1) {
      simulationParams.value.isEscaped = true;
      simulationStatusText.value = "已脱离轨道";
    } else if (r < SUN_RADIUS * 2) {
      // 检查是否坠入太阳
      simulationStatusText.value = "已坠入太阳";
      simulationParams.value.isRunning = false;
    }

    // 更新轨迹
    updateTrail();
  }

  // 继续动画循环
  requestAnimationFrame(updateSimulation);
}

// 初始化
onMounted(() => {
  // 创建星空背景
  createStars();

  // 设置初始尺寸
  updateScaleFactor();

  // 计算初始参数
  checkStability();

  // 开始动画
  requestAnimationFrame(updateSimulation);

  // 监听窗口大小变化
  window.addEventListener("resize", () => {
    updateScaleFactor();
  });
});

// 监听滑块变化，实时更新显示值
watch(massSlider, () => {
  // 仅更新显示，不立即应用参数
});

watch(radiusSlider, () => {
  // 仅更新显示，不立即应用参数
});

watch(velocitySlider, () => {
  // 仅更新显示，不立即应用参数
});
</script>

<style scoped>
/* 引入外部资源 */
/* @import url("https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css"); */

/* 自定义工具类 */
.star {
  position: absolute;
  background-color: white;
  border-radius: 50%;
  animation: twinkle 2s infinite alternate;
}

@keyframes twinkle {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
}

.orbit {
  position: absolute;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 1s ease-in-out;
}

.planet {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.sun {
  position: absolute;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 40px rgba(245, 158, 11, 0.8),
    0 0 80px rgba(245, 158, 11, 0.5);
  z-index: 20;
}

.trail {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(59, 130, 246, 0.1);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.vector {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.6);
  transform-origin: left center;
  z-index: 5;
}

/* 颜色变量 */
:root {
  --primary: #1e40af;
  --sun: #f59e0b;
  --planet: #3b82f6;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --background: #0f172a;
}

/* 全局样式 */
.bg-primary {
  background-color: var(--primary);
}

.bg-sun {
  background-color: var(--sun);
}

.bg-planet {
  background-color: var(--planet);
}

.bg-success {
  background-color: var(--success);
}

.bg-warning {
  background-color: var(--warning);
}

.bg-danger {
  background-color: var(--danger);
}

.bg-background {
  background-color: var(--background);
}

.text-primary {
  color: var(--primary);
}

.text-success {
  color: var(--success);
}

.text-warning {
  color: var(--warning);
}

.text-danger {
  color: var(--danger);
}
</style>
