<template>
  <div class="refraction-demo">
    <header>
      <h1>光的折射演示动画</h1>
      <p>观察光线从空气进入水中时的折射现象</p>
    </header>

    <div class="container">
      <div class="canvas-container">
        <canvas ref="canvasRef" id="refractionCanvas"></canvas>
      </div>

      <div class="controls">
        <div class="control-group">
          <div class="control-title">入射角调节</div>
          <div class="slider-container">
            <input type="range" v-model.number="incidentAngle" min="0" max="80" step="1" />
            <div class="value-display">{{ incidentAngle }}°</div>
          </div>
        </div>

        <div class="control-group">
          <div class="control-title">播放速度</div>
          <div class="slider-container">
            <input type="range" v-model.number="speed" min="0.1" max="2" step="0.1" />
            <div class="value-display">{{ speed.toFixed(1) }}x</div>
          </div>
        </div>

        <div class="control-group">
          <div class="control-title">动画控制</div>
          <div class="buttons">
            <button @click="togglePlayPause">{{ isPlaying ? "暂停" : "播放" }}</button>
            <button @click="reset">重置</button>
          </div>
        </div>
      </div>

      <div class="info-panel">
        <div class="info-title">折射数据</div>
        <div class="info-content">
          <div class="info-item">
            <div class="info-label">入射角</div>
            <div class="info-value">{{ incidentAngle }}°</div>
          </div>
          <div class="info-item">
            <div class="info-label">折射角</div>
            <div class="info-value">{{ refractedAngleDisplay }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">折射率 (水)</div>
            <div class="info-value">1.33</div>
          </div>
          <div class="info-item">
            <div class="info-label">折射率 (空气)</div>
            <div class="info-value">1.00</div>
          </div>
        </div>
      </div>

      <div class="explanation">
        <h3>光的折射原理</h3>
        <p>
          当光从一种介质进入另一种介质时，由于光在不同介质中的传播速度不同，会发生方向改变，这种现象称为折射。
        </p>
        <p class="law">斯涅尔定律: n₁·sin(θ₁) = n₂·sin(θ₂)</p>
        <p>其中 n₁ 和 n₂ 分别是两种介质的折射率，θ₁ 是入射角，θ₂ 是折射角。</p>
        <p>
          在本演示中，光线从空气(n=1.00)进入水(n=1.33)，由于水的折射率大于空气，折射角小于入射角。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let lastTimestamp: number | null = null;
type Bubble = { x: number; y: number; r: number; vy: number };
let bubbles: Bubble[] = [];

// 动画状态
const isPlaying = ref(true);
const speed = ref(1.0);
const incidentAngle = ref(30); // 入射角（度）
const refractedAngle = ref<number | null>(0); // 折射角（度）

// 折射率常量
const N1 = 1.0; // 空气折射率
const N2 = 1.33; // 水折射率

// 计算折射角
const calculateRefractedAngle = (incidentAngleDeg: number): number | null => {
  const incidentAngleRad = (incidentAngleDeg * Math.PI) / 180;

  // 使用斯涅尔定律计算折射角
  const sinRefracted = (N1 / N2) * Math.sin(incidentAngleRad);

  // 检查是否发生全反射
  if (sinRefracted > 1) {
    return null; // 全反射
  }

  const refractedAngleRad = Math.asin(sinRefracted);
  return (refractedAngleRad * 180) / Math.PI;
};

// 折射角显示
const refractedAngleDisplay = computed(() => {
  if (refractedAngle.value === null) {
    return "全反射";
  }
  return `${refractedAngle.value.toFixed(0)}°`;
});

// 设置Canvas尺寸
const resizeCanvas = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  initBubbles();
};

// 绘制背景
const drawBackground = () => {
  if (!ctx || !canvasRef.value) return;
  const canvas = canvasRef.value;
  const waterLevel = canvas.height * 0.6;

  // 绘制天空
  const skyGradient = ctx.createLinearGradient(0, 0, 0, waterLevel);
  skyGradient.addColorStop(0, "#87CEEB");
  skyGradient.addColorStop(1, "#E0F7FA");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, waterLevel);

  // 绘制水面
  const waterGradient = ctx.createLinearGradient(0, waterLevel, 0, canvas.height);
  waterGradient.addColorStop(0, "#1E90FF");
  waterGradient.addColorStop(1, "#000080");
  ctx.fillStyle = waterGradient;
  ctx.fillRect(0, waterLevel, canvas.width, canvas.height - waterLevel);

  // 绘制太阳
  ctx.beginPath();
  ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 30, 0, Math.PI * 2);
  const sunGradient = ctx.createRadialGradient(
    canvas.width * 0.8,
    canvas.height * 0.2,
    0,
    canvas.width * 0.8,
    canvas.height * 0.2,
    30,
  );
  sunGradient.addColorStop(0, "#FFFF00");
  sunGradient.addColorStop(1, "#FFA500");
  ctx.fillStyle = sunGradient;
  ctx.fill();

  // 绘制云朵
  drawCloud(canvas.width * 0.2, canvas.height * 0.15, 0.7);
  drawCloud(canvas.width * 0.5, canvas.height * 0.1, 0.5);
};

// 绘制云朵
const drawCloud = (x: number, y: number, scale: number) => {
  if (!ctx) return;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
  ctx.arc(x + 15 * scale, y - 10 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.arc(x + 30 * scale, y, 20 * scale, 0, Math.PI * 2);
  ctx.arc(x + 15 * scale, y + 10 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.fill();
};

// 绘制介质分界线
const drawInterface = (waterLevel: number) => {
  if (!ctx || !canvasRef.value) return;
  const canvas = canvasRef.value;

  ctx.strokeStyle = "#4fc3f7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, waterLevel);
  ctx.lineTo(canvas.width, waterLevel);
  ctx.stroke();

  // 添加标签
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText("空气 (n=1.00)", 20, waterLevel - 20);
  ctx.fillText("水 (n=1.33)", 20, waterLevel + 30);
};

// 绘制箭头
const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string) => {
  if (!ctx) return;
  const headLength = 15;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();
};

// 绘制光线
const drawLightRays = (waterLevel: number) => {
  if (!ctx || !canvasRef.value) return;
  const canvas = canvasRef.value;

  const centerX = canvas.width / 2;
  const centerY = waterLevel;

  // 入射光线
  const incidentAngleRad = (incidentAngle.value * Math.PI) / 180;
  const rayLength = canvas.width * 0.4;

  // 入射点
  const incidentX = centerX;
  const incidentY = centerY;

  // 入射光线起点
  const startX = incidentX - rayLength * Math.sin(incidentAngleRad);
  const startY = incidentY - rayLength * Math.cos(incidentAngleRad);

  // 绘制入射光线
  ctx.strokeStyle = "#ffcc00";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(incidentX, incidentY);
  ctx.stroke();

  // 绘制入射光线箭头
  drawArrow(startX, startY, incidentX, incidentY, "#ffcc00");

  // 法线
  ctx.strokeStyle = "#ffffff";
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // 折射光线（如果未发生全反射）
  if (refractedAngle.value !== null) {
    const refractedAngleRad = (refractedAngle.value * Math.PI) / 180;
    const refractedEndX = incidentX + rayLength * Math.sin(refractedAngleRad);
    const refractedEndY = incidentY + rayLength * Math.cos(refractedAngleRad);

    // 绘制折射光线
    ctx.strokeStyle = "#4fc3f7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(incidentX, incidentY);
    ctx.lineTo(refractedEndX, refractedEndY);
    ctx.stroke();

    // 绘制折射光线箭头
    drawArrow(incidentX, incidentY, refractedEndX, refractedEndY, "#4fc3f7");
  }

  // 反射光线
  const reflectedEndX = incidentX + rayLength * Math.sin(incidentAngleRad);
  const reflectedEndY = incidentY - rayLength * Math.cos(incidentAngleRad);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(incidentX, incidentY);
  ctx.lineTo(reflectedEndX, reflectedEndY);
  ctx.stroke();

  // 绘制反射光线箭头
  drawArrow(incidentX, incidentY, reflectedEndX, reflectedEndY, "rgba(255, 255, 255, 0.7)");
};

// 绘制角度标注
const drawAngleMarkers = (waterLevel: number) => {
  if (!ctx || !canvasRef.value) return;
  const canvas = canvasRef.value;

  const centerX = canvas.width / 2;
  const centerY = waterLevel;
  const radius = 50;

  // 入射角标注
  const incidentAngleRad = (incidentAngle.value * Math.PI) / 180;
  ctx.strokeStyle = "#ffcc00";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + incidentAngleRad, false);
  ctx.stroke();

  // 入射角文本
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    `θ₁ = ${incidentAngle.value.toFixed(0)}°`,
    centerX + radius * 0.7 * Math.sin(incidentAngleRad / 2),
    centerY - radius * 0.7 * Math.cos(incidentAngleRad / 2),
  );

  // 折射角标注（如果未发生全反射）
  if (refractedAngle.value !== null) {
    const refractedAngleRad = (refractedAngle.value * Math.PI) / 180;
    ctx.strokeStyle = "#4fc3f7";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 - refractedAngleRad, true);
    ctx.stroke();

    // 折射角文本
    ctx.fillStyle = "#4fc3f7";
    ctx.fillText(
      `θ₂ = ${refractedAngle.value.toFixed(0)}°`,
      centerX + radius * 0.7 * Math.sin(refractedAngleRad / 2),
      centerY + radius * 0.7 * Math.cos(refractedAngleRad / 2),
    );
  }
};

// 绘制场景
const drawScene = () => {
  if (!ctx || !canvasRef.value) return;
  const canvas = canvasRef.value;

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制背景
  drawBackground();

  // 计算折射角
  refractedAngle.value = calculateRefractedAngle(incidentAngle.value);

  // 绘制介质分界线
  const waterLevel = canvas.height * 0.6;
  drawInterface(waterLevel);

  // 绘制光线
  drawLightRays(waterLevel);

  // 绘制角度标注
  drawAngleMarkers(waterLevel);
  drawBubbles(waterLevel);
};

// 动画循环
const animate = () => {
  const step = (t: number) => {
    const dt = lastTimestamp === null ? 0 : (t - lastTimestamp) / 1000;
    lastTimestamp = t;
    updateBubbles(dt);
    drawScene();
    if (isPlaying.value) {
      animationId = requestAnimationFrame(step);
    }
  };
  animationId = requestAnimationFrame(step);
};

// 事件处理
const togglePlayPause = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    lastTimestamp = null;
    animate();
  } else if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
};

const reset = () => {
  incidentAngle.value = 30;
  speed.value = 1.0;
};

// 生命周期
onMounted(async () => {
  await nextTick();
  if (!canvasRef.value) return;

  ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});

function initBubbles() {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const waterLevel = canvas.height * 0.6;
  const count = 20;
  bubbles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: waterLevel + Math.random() * (canvas.height - waterLevel),
    r: 2 + Math.random() * 5,
    vy: 30 + Math.random() * 50,
  }));
}

function updateBubbles(dt: number) {
  if (!canvasRef.value || dt <= 0) return;
  const canvas = canvasRef.value;
  const waterLevel = canvas.height * 0.6;
  const s = Math.max(0.1, Math.min(2, speed.value));
  for (const b of bubbles) {
    b.y -= b.vy * s * dt;
    if (b.y < waterLevel + 5) {
      b.x = Math.random() * canvas.width;
      b.y = waterLevel + (canvas.height - waterLevel) - 5;
      b.r = 2 + Math.random() * 5;
      b.vy = 30 + Math.random() * 50;
    }
  }
}

function drawBubbles(waterLevel: number) {
  if (!ctx) return;
  for (const b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fill();
  }
}
</script>

<style scoped>
.refraction-demo {
  width: 100%;
}

.refraction-demo * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", "Arial Rounded MT Bold", sans-serif;
}

.refraction-demo {
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
  color: white;
  /* min-height: 100vh; */
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #ffcc00;
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.7);
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  max-width: 900px;
  background: rgba(0, 20, 40, 0.7);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 2px solid #4fc3f7;
}

.canvas-container {
  position: relative;
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(to bottom, #87ceeb, #1e90ff);
  border: 3px solid #4fc3f7;
  box-shadow: 0 0 15px rgba(79, 195, 247, 0.5);
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  width: 100%;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 30, 60, 0.8);
  padding: 15px;
  border-radius: 15px;
  min-width: 200px;
  border: 2px solid #4fc3f7;
}

.control-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #ffcc00;
}

.slider-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
}

input[type="range"] {
  flex-grow: 1;
  height: 10px;
  -webkit-appearance: none;
  background: linear-gradient(to right, #4fc3f7, #ffcc00);
  border-radius: 5px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffcc00;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
}

.value-display {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffcc00;
  min-width: 50px;
  text-align: center;
}

.buttons {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  background: linear-gradient(to bottom, #4fc3f7, #0288d1);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  font-weight: bold;
}

button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  background: linear-gradient(to bottom, #29b6f6, #0277bd);
}

button:active {
  transform: translateY(1px);
}

.info-panel {
  background: rgba(0, 30, 60, 0.8);
  padding: 15px;
  border-radius: 15px;
  width: 100%;
  margin-top: 10px;
  border: 2px solid #4fc3f7;
}

.info-title {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #ffcc00;
  text-align: center;
}

.info-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 40, 80, 0.6);
  padding: 10px;
  border-radius: 10px;
  min-width: 120px;
}

.info-label {
  font-size: 0.9rem;
  color: #4fc3f7;
}

.info-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffcc00;
}

.explanation {
  margin-top: 20px;
  background: rgba(0, 30, 60, 0.8);
  padding: 15px;
  border-radius: 15px;
  width: 100%;
  border: 2px solid #4fc3f7;
}

.explanation h3 {
  color: #ffcc00;
  margin-bottom: 10px;
  text-align: center;
}

.explanation p {
  line-height: 1.5;
  margin-bottom: 10px;
}

.law {
  font-style: italic;
  color: #4fc3f7;
  text-align: center;
  margin: 10px 0;
  font-weight: bold;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: center;
  }

  .control-group {
    width: 100%;
  }
}
</style>
