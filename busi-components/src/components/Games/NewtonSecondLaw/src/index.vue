<template>
  <div class="container">
    <div class="control-panel">
      <h1>牛顿第二定律演示</h1>
      <div class="law-display">F = m·a</div>
      <div class="control-group">
        <h2>参数设置</h2>
        <div>
          <label for="mass-m">砝码质量 m (kg)</label>
          <input type="range" id="mass-m" min="0.1" max="2.0" step="0.1" v-model.number="m" />
          <div class="value-display" id="mass-m-value">{{ m.toFixed(1) }} kg</div>
        </div>
        <div>
          <label for="mass-M">小车质量 M (kg)</label>
          <input type="range" id="mass-M" min="0.1" max="2.0" step="0.1" v-model.number="M" />
          <div class="value-display" id="mass-M-value">{{ M.toFixed(1) }} kg</div>
        </div>
        <div>
          <label for="mu">摩擦系数 μ</label>
          <input type="range" id="mu" min="0" max="0.5" step="0.01" v-model.number="muCoeff" />
          <div class="value-display">{{ muCoeff.toFixed(2) }}</div>
        </div>
      </div>
      <div class="control-group">
        <h2>物理量</h2>
        <div class="value-display">
          合力 F =
          <span id="force-value">{{ F.toFixed(2) }}</span>
          N
        </div>
        <div class="value-display">
          加速度 a =
          <span id="acceleration-value">{{ a.toFixed(2) }}</span>
          m/s²
        </div>
      </div>
      <div class="buttons">
        <button id="start-btn" @click="start">开始</button>
        <button id="pause-btn" class="pause-btn" @click="togglePause">
          {{ isPaused ? "继续" : "暂停" }}
        </button>
        <button id="reset-btn" class="reset-btn" @click="resetAnimation">重置</button>
      </div>
    </div>
    <div class="simulation-area">
      <canvas ref="canvasRef" id="physics-canvas"></canvas>
      <div class="physics-display">
        <div>
          时间:
          <span id="time-value" class="physics-value">{{ time.toFixed(1) }}</span>
          s
        </div>
        <div>
          速度:
          <span id="velocity-value" class="physics-value">{{ velocity.toFixed(2) }}</span>
          m/s
        </div>
        <div>
          位移:
          <span id="position-value" class="physics-value">{{ position.toFixed(2) }}</span>
          m
        </div>
      </div>
      <div class="info-box">
        <strong>牛顿第二定律:</strong>
        F = ma
        <br />
        砝码重力: F = m·g (g ≈ 9.8 m/s²)
        <br />
        系统加速度: a = F / (M + m)
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const m = ref(0.5);
const M = ref(1.0);
const g = 9.8;
const F = computed(() => m.value * g);
const muCoeff = ref(0.15);
const muS = computed(() => muCoeff.value);
const muK = computed(() => muCoeff.value);
const a = computed(() => {
  if (m.value <= M.value) return 0;
  const threshold = muS.value * M.value * g;
  if (F.value <= threshold) return 0;
  const friction = muK.value * M.value * g;
  return (F.value - friction) / (M.value + m.value);
});
const time = ref(0);
const velocity = ref(0);
const position = ref(0);
let animationId: number | null = null;
let lastTs: number | null = null;
const isRunning = ref(false);
const isPaused = ref(false);
const isFinished = ref(false);
const insufficient = ref(false);
const chartTimes: number[] = [];
const chartVelocities: number[] = [];
let INITIAL_CAR_X = 0;
let PULLEY_X = 0;
let MAX_CAR_X = 0;
let ctx: CanvasRenderingContext2D | null = null;

const resizeCanvas = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : canvas.width;
  canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : canvas.height;
  INITIAL_CAR_X = canvas.width * 0.2;
  PULLEY_X = canvas.width * 0.8;
  MAX_CAR_X = PULLEY_X - 150;
};

const updatePhysicsDisplay = () => {};

const drawVelocityChart = () => {
  if (!ctx || !canvasRef.value) return;
  const canvas = canvasRef.value;
  const chartWidth = canvas.width * 0.3;
  const chartHeight = canvas.height * 0.3;
  const chartX = 20;
  const chartY = canvas.height - chartHeight - 20;
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
  ctx.strokeStyle = "#0066cc";
  ctx.lineWidth = 2;
  ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
  ctx.fillStyle = "#003366";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("速度-时间图 (v-t)", chartX + chartWidth / 2, chartY - 10);
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chartX + 30, chartY + chartHeight - 30);
  ctx.lineTo(chartX + chartWidth - 10, chartY + chartHeight - 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(chartX + 30, chartY + chartHeight - 30);
  ctx.lineTo(chartX + 30, chartY + 10);
  ctx.stroke();
  ctx.fillStyle = "#333333";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("时间 (s)", chartX + chartWidth / 2, chartY + chartHeight - 5);
  ctx.save();
  ctx.translate(chartX + 10, chartY + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("速度 (m/s)", 0, 0);
  ctx.restore();
  if (chartTimes.length > 0) {
    const maxTime = Math.max(10, ...chartTimes);
    const maxVelocity = Math.max(5, ...chartVelocities);
    ctx.strokeStyle = "rgba(0, 102, 204, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const x = chartX + 30 + (i / 5) * (chartWidth - 40);
      ctx.beginPath();
      ctx.moveTo(x, chartY + 10);
      ctx.lineTo(x, chartY + chartHeight - 30);
      ctx.stroke();
      ctx.fillStyle = "#333333";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(((maxTime * i) / 5).toFixed(1), x, chartY + chartHeight - 10);
    }
    for (let i = 1; i <= 5; i++) {
      const y = chartY + chartHeight - 30 - (i / 5) * (chartHeight - 40);
      ctx.beginPath();
      ctx.moveTo(chartX + 30, y);
      ctx.lineTo(chartX + chartWidth - 10, y);
      ctx.stroke();
      ctx.fillStyle = "#333333";
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.fillText(((maxVelocity * i) / 5).toFixed(1), chartX + 25, y + 4);
    }
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < chartTimes.length; i++) {
      const x = chartX + 30 + (chartTimes[i] / maxTime) * (chartWidth - 40);
      const y = chartY + chartHeight - 30 - (chartVelocities[i] / maxVelocity) * (chartHeight - 40);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "#cc0000";
    for (let i = 0; i < chartTimes.length; i += Math.ceil(chartTimes.length / 20)) {
      const x = chartX + 30 + (chartTimes[i] / maxTime) * (chartWidth - 40);
      const y = chartY + chartHeight - 30 - (chartVelocities[i] / maxVelocity) * (chartHeight - 40);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

const drawScene = () => {
  if (!ctx || !canvasRef.value) return;
  const canvas = canvasRef.value;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f0f8ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const tableHeight = canvas.height * 0.6;
  ctx.fillStyle = "#d9d9d9";
  ctx.fillRect(0, tableHeight, canvas.width, canvas.height - tableHeight);
  ctx.fillStyle = "#999999";
  ctx.fillRect(PULLEY_X - 10, tableHeight - 150, 20, 150);
  const pulleyY = tableHeight - 50;
  const pulleyRadius = 25;
  ctx.fillStyle = "#666666";
  ctx.beginPath();
  ctx.arc(PULLEY_X, pulleyY, pulleyRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#999999";
  ctx.beginPath();
  ctx.arc(PULLEY_X, pulleyY, pulleyRadius - 5, 0, Math.PI * 2);
  ctx.fill();
  const carWidth = 120;
  const carHeight = 70;
  const carX = Math.min(INITIAL_CAR_X + position.value * 100, MAX_CAR_X);
  const carY = tableHeight - carHeight;
  ctx.fillStyle = "#0066cc";
  ctx.fillRect(carX, carY, carWidth, carHeight);
  ctx.fillStyle = "#003366";
  ctx.fillRect(carX + 10, carY + 10, 30, 20);
  ctx.fillRect(carX + carWidth - 40, carY + 10, 30, 20);
  ctx.fillStyle = "#333333";
  ctx.beginPath();
  ctx.arc(carX + 25, carY + carHeight, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(carX + carWidth - 25, carY + carHeight, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 3;
  const carRopeX = carX + carWidth;
  const carRopeY = carY + carHeight / 2;
  const carContactAngle = Math.PI;
  const carContactX = PULLEY_X + pulleyRadius * Math.cos(carContactAngle);
  const carContactY = pulleyY + pulleyRadius * Math.sin(carContactAngle);
  const weightContactAngle = 0;
  const weightContactX = PULLEY_X + pulleyRadius * Math.cos(weightContactAngle);
  const weightContactY = pulleyY + pulleyRadius * Math.sin(weightContactAngle);
  ctx.beginPath();
  ctx.moveTo(carRopeX, carRopeY);
  ctx.lineTo(carContactX, carContactY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(PULLEY_X, pulleyY, pulleyRadius, carContactAngle, weightContactAngle, false);
  ctx.stroke();
  const weightSize = 40 + m.value * 10;
  const weightX = PULLEY_X;
  const weightY = pulleyY + weightSize / 2 + position.value * 100;
  ctx.beginPath();
  ctx.moveTo(weightContactX, weightContactY);
  ctx.lineTo(weightX, weightY);
  ctx.stroke();
  ctx.fillStyle = "#cc0000";
  ctx.fillRect(weightX - weightSize / 2, weightY, weightSize, weightSize);
  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${m.value} kg`, weightX, weightY + weightSize / 2 + 5);
  ctx.fillStyle = "#003366";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${M.value} kg`, carX + carWidth / 2, carY - 10);
  drawVelocityChart();
  if (carX >= MAX_CAR_X && isRunning.value) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100);
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("演示结束", canvas.width / 2, canvas.height / 2);
    ctx.font = "18px Arial";
    ctx.fillText("小车已到达滑轮处", canvas.width / 2, canvas.height / 2 + 30);
  }
};

const animate = () => {
  if (!isRunning.value || isPaused.value) return;
  const now = performance.now();
  const dt = lastTs === null ? 0 : (now - lastTs) / 1000;
  lastTs = now;
  time.value += dt;
  velocity.value = a.value * time.value;
  position.value = 0.5 * a.value * time.value * time.value;
  chartTimes.push(time.value);
  chartVelocities.push(velocity.value);
  drawScene();
  const carX = INITIAL_CAR_X + position.value * 100;
  if (carX >= MAX_CAR_X) {
    isRunning.value = false;
    isFinished.value = true;
    return;
  }
  animationId = requestAnimationFrame(animate);
};

const start = () => {
  if (!isRunning.value && !isFinished.value) {
    if (a.value <= 0) {
      insufficient.value = true;
      return;
    }
    isRunning.value = true;
    isPaused.value = false;
    lastTs = null;
    animationId = requestAnimationFrame(animate);
  } else if (isFinished.value) {
    resetAnimation();
    if (a.value <= 0) {
      insufficient.value = true;
      return;
    }
    isRunning.value = true;
    isPaused.value = false;
    lastTs = null;
    animationId = requestAnimationFrame(animate);
  }
};

const togglePause = () => {
  if (isRunning.value) {
    isPaused.value = !isPaused.value;
    if (!isPaused.value) {
      lastTs = null;
      animationId = requestAnimationFrame(animate);
    }
  }
};

const resetAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  isRunning.value = false;
  isPaused.value = false;
  isFinished.value = false;
  insufficient.value = false;
  time.value = 0;
  velocity.value = 0;
  position.value = 0;
  chartTimes.splice(0, chartTimes.length);
  chartVelocities.splice(0, chartVelocities.length);
  drawScene();
};

onMounted(async () => {
  await nextTick();
  if (!canvasRef.value) return;
  ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  resizeCanvas();
  window.addEventListener("resize", () => {
    resizeCanvas();
    drawScene();
  });
  updatePhysicsDisplay();
  drawScene();
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<style scoped>
.container {
  display: flex;
  width: 100vw;
  height: 100%;
  gap: 20px;
}
.control-panel {
  width: 30%;
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 25px;
  color: #003366;
}
.control-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
h1 {
  color: #0066cc;
  font-size: 32px;
  margin-bottom: 10px;
  text-align: center;
}
h2 {
  color: #0066cc;
  font-size: 24px;
  border-bottom: 2px solid #0066cc;
  padding-bottom: 8px;
}
label {
  font-size: 20px;
  font-weight: bold;
}
input[type="range"] {
  width: 100%;
  height: 40px;
  -webkit-appearance: none;
  background: #e6f2ff;
  border-radius: 10px;
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 30px;
  height: 30px;
  background: #0066cc;
  border-radius: 50%;
  cursor: pointer;
}
.value-display {
  font-size: 22px;
  font-weight: bold;
  color: #003366;
  text-align: center;
  padding: 10px;
  background: #e6f2ff;
  border-radius: 8px;
}
.buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
button {
  padding: 15px;
  font-size: 22px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #0066cc;
  color: white;
}
button:hover {
  background: #004d99;
  transform: translateY(-2px);
}
button:active {
  transform: translateY(0);
}
.pause-btn {
  background: #ff9900;
}
.pause-btn:hover {
  background: #e68a00;
}
.reset-btn {
  background: #cc0000;
}
.reset-btn:hover {
  background: #b30000;
}
.simulation-area {
  width: 100%;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}
.physics-display {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  font-size: 24px;
  min-width: 250px;
  color: #003366;
}
.physics-value {
  color: #0066cc;
  font-weight: bold;
}
canvas {
  display: block;
  width: 100%;
}
.info-box {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  max-width: 500px;
  color: #003366;
}
.law-display {
  text-align: center;
  font-size: 26px;
  font-weight: bold;
  margin-top: 10px;
  color: #003366;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 8px;
}
</style>
