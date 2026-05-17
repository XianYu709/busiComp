<template>
  <div class="container">
    <header class="header">
      <h1>小学数学追击问题演示</h1>
      <p>通过动画直观理解同向追击、环形跑道和异向相遇问题</p>
    </header>

    <div class="grid">
      <div class="panel">
        <div class="panel-title">参数设置</div>
        <div class="form">
          <div class="form-item">
            <label>问题类型</label>
            <select v-model="problemType" class="select" style="width: 100%">
              <option value="straight">同向直线追击</option>
              <option value="circle">环形跑道追击</option>
              <option value="opposite">异向相遇</option>
            </select>
          </div>
          <div class="form-item">
            <label>情景选择</label>
            <select v-model="scenario" class="select" style="width: 100%">
              <option value="sameStart">同起点，一方后出发</option>
              <option value="differentStart">不同起点，同时出发</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-item" style="width: 50%">
              <label>
                <span class="dot dot-a"></span>
                甲的速度 (单位/秒)
              </label>
              <input
                v-model.number="speedA"
                type="number"
                min="0"
                step="0.1"
                class="input"
                style="width: 90%" />
            </div>
            <div class="form-item" style="width: 50%; margin-left: 10px">
              <label>
                <span class="dot dot-b"></span>
                乙的速度 (单位/秒)
              </label>
              <input
                v-model.number="speedB"
                type="number"
                min="0"
                step="0.1"
                class="input"
                style="width: 90%" />
            </div>
          </div>
          <div class="form-item">
            <label>出发时间差 (秒)</label>
            <div class="row">
              <select v-model="timeDiffDirection" class="select">
                <option value="aFirst">甲先出发</option>
                <option value="bFirst">乙先出发</option>
              </select>
              <input v-model.number="timeDiff" type="number" min="0" step="1" class="input" />
            </div>
          </div>
          <div class="form-item" v-show="showDistance">
            <label>初始距离 (单位)</label>
            <input v-model.number="initialDistance" type="number" min="0" step="1" class="input" />
          </div>
          <div class="buttons">
            <button class="btn btn-primary" @click="handleStart">
              {{ isRunning ? "暂停演示" : "开始演示" }}
            </button>
            <button class="btn btn-secondary" @click="resetAnimation">重置</button>
          </div>
        </div>
      </div>

      <div class="stage">
        <div class="stage-top">
          <div class="stage-title">动画演示</div>
          <div class="timer">
            时间:
            <span>{{ timer.toFixed(1) }}</span>
            秒
          </div>
        </div>

        <div ref="straightTrack" class="straight" v-show="problemType !== 'circle'">
          <div class="track-line"></div>
          <div ref="runnerA" class="runner runner-a"></div>
          <div ref="runnerB" class="runner runner-b"></div>
          <div class="start-label">起点</div>
        </div>

        <div ref="circleTrack" class="circle" v-show="problemType === 'circle'">
          <div ref="trackRing" class="track-ring"></div>
          <div ref="runnerACircle" class="runner runner-a circle-pos"></div>
          <div ref="runnerBCircle" class="runner runner-b circle-pos"></div>
          <div class="circle-start">起点</div>
        </div>

        <div class="result" v-show="catchTime !== null">
          <div class="result-title">计算结果</div>
          <p class="result-text" v-html="resultHtml"></p>
        </div>
      </div>
    </div>

    <div class="explain">
      <div class="explain-title">追击问题说明</div>
      <div class="explain-grid">
        <div>
          <div class="explain-sub">
            <span class="icon">→</span>
            同向直线追击
          </div>
          <p>速度快的物体从后面追上速度慢的物体。追击时间 = 距离差 ÷ 速度差</p>
        </div>
        <div>
          <div class="explain-sub">
            <span class="icon">↻</span>
            环形跑道追击
          </div>
          <p>在环形跑道上，快的追上慢的时，比慢的多跑一圈。相遇时间 = 跑道长度 ÷ 速度差</p>
        </div>
        <div>
          <div class="explain-sub">
            <span class="icon">⇄</span>
            异向相遇
          </div>
          <p>两个物体从两地出发，相向而行。相遇时间 = 距离 ÷ 速度和</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";

const problemType = ref<"straight" | "circle" | "opposite">("straight");
const scenario = ref<"sameStart" | "differentStart">("sameStart");
const speedA = ref(3);
const speedB = ref(2);
const timeDiffDirection = ref<"aFirst" | "bFirst">("aFirst");
const timeDiff = ref(2);
const initialDistance = ref(10);

const straightTrack = ref<HTMLElement | null>(null);
const circleTrack = ref<HTMLElement | null>(null);
const runnerA = ref<HTMLElement | null>(null);
const runnerB = ref<HTMLElement | null>(null);
const runnerACircle = ref<HTMLElement | null>(null);
const runnerBCircle = ref<HTMLElement | null>(null);
const trackRing = ref<HTMLElement | null>(null);

const isRunning = ref(false);
const startTime = ref<number | null>(null);
const pauseTime = ref(0);
const timer = ref(0);
const catchTime = ref<number | null>(null);
const resultHtml = ref("");
let animationId: number | null = null;
let trackLength = 0;

const showDistance = computed(
  () => scenario.value === "differentStart" && problemType.value !== "circle",
);

const handleStart = () => {
  if (isRunning.value) {
    if (animationId) cancelAnimationFrame(animationId);
    pauseTime.value = Date.now() - (startTime.value || Date.now());
    isRunning.value = false;
  } else {
    startTime.value = Date.now() - pauseTime.value;
    isRunning.value = true;
    animate();
  }
};

const resetAnimation = () => {
  if (animationId) cancelAnimationFrame(animationId);
  isRunning.value = false;
  startTime.value = null;
  pauseTime.value = 0;
  catchTime.value = null;
  timer.value = 0;
  resultHtml.value = "";
  if (problemType.value === "straight" || problemType.value === "opposite") {
    if (runnerA.value) runnerA.value.style.left = "0px";
    if (runnerB.value) {
      if (scenario.value === "differentStart" && problemType.value === "straight") {
        runnerB.value.style.left = `${initialDistance.value * 5}px`;
      } else if (scenario.value === "differentStart" && problemType.value === "opposite") {
        const trackWidth = (straightTrack.value?.clientWidth || 0) - 32;
        runnerB.value.style.left = `${Math.min(trackWidth, initialDistance.value * 5)}px`;
      } else {
        runnerB.value.style.left = "0px";
      }
    }
  } else {
    if (runnerACircle.value)
      runnerACircle.value.style.transform = "rotate(0deg) translate(0, -50%)";
    if (runnerBCircle.value)
      runnerBCircle.value.style.transform = "rotate(0deg) translate(0, -50%)";
  }
};

const animate = () => {
  const currentTime = Date.now();
  const elapsed = (currentTime - (startTime.value || currentTime)) / 1000;
  timer.value = Math.max(0, elapsed);

  const problem = problemType.value;
  const scen = scenario.value;
  const tDiff = timeDiff.value;
  const dir = timeDiffDirection.value;
  let timeA = timer.value;
  let timeB = timer.value;
  if (dir === "aFirst") timeB = Math.max(0, timer.value - tDiff);
  else timeA = Math.max(0, timer.value - tDiff);

  if (problem === "straight") updateStraightPosition(timeA, timeB);
  else if (problem === "circle") updateCirclePosition(timeA, timeB);
  else updateOppositePosition(timeA, timeB);

  if (isRunning.value && catchTime.value === null) animationId = requestAnimationFrame(animate);
};

const updateStraightPosition = (timeAVal: number, timeBVal: number) => {
  const trackWidth = (straightTrack.value?.clientWidth || 0) - 32;
  let posA = timeAVal * speedA.value * 5;
  let posB = timeBVal * speedB.value * 5;
  if (scenario.value === "differentStart") posB += initialDistance.value * 5;
  posA = Math.min(posA, trackWidth);
  posB = Math.min(posB, trackWidth);
  if (runnerA.value) runnerA.value.style.left = `${posA}px`;
  if (runnerB.value) runnerB.value.style.left = `${posB}px`;
  const bothStarted = timeAVal > 0 && timeBVal > 0;
  const canDetect = scenario.value === "differentStart" ? true : bothStarted;
  const proximity = Math.abs(posA - posB) <= 16;
  const behindIsA = scenario.value === "sameStart" ? timeDiffDirection.value === "bFirst" : true;
  const speedBehind = behindIsA ? speedA.value : speedB.value;
  const speedAhead = behindIsA ? speedB.value : speedA.value;
  const behindAheadMeet = behindIsA ? posA >= posB - 8 : posB >= posA - 8;
  if (
    canDetect &&
    speedBehind > speedAhead &&
    proximity &&
    behindAheadMeet &&
    catchTime.value === null
  ) {
    catchTime.value = timer.value;
    showResult();
    isRunning.value = false;
    if (animationId) cancelAnimationFrame(animationId);
  }
};

const updateCirclePosition = (timeAVal: number, timeBVal: number) => {
  const parentRect = circleTrack.value?.getBoundingClientRect();
  const ringRect = trackRing.value?.getBoundingClientRect();
  if (!parentRect || !ringRect) return;
  const W = ringRect.width;
  const H = ringRect.height;
  const R = H / 2;
  const cx = ringRect.left - parentRect.left + W / 2;
  const cy = ringRect.top - parentRect.top + H / 2;
  const left = cx - W / 2;
  const right = cx + W / 2;
  const top = cy - H / 2;
  const bottom = cy + H / 2;
  const L1 = W - 2 * R;
  const L2 = Math.PI * R;
  const L3 = W - 2 * R;
  const P = 2 * (W - 2 * R) + 2 * Math.PI * R;

  const mapPos = (s: number) => {
    let x = cx,
      y = cy;
    const sm = ((s % P) + P) % P;
    if (sm <= L1) {
      x = left + R + sm;
      y = top;
    } else if (sm <= L1 + L2) {
      const s2 = sm - L1;
      const angle = -Math.PI / 2 + s2 / R;
      const cX = right - R;
      x = cX + R * Math.cos(angle);
      y = cy + R * Math.sin(angle);
    } else if (sm <= L1 + L2 + L3) {
      const s3 = sm - (L1 + L2);
      x = right - R - s3;
      y = bottom;
    } else {
      const s4 = sm - (L1 + L2 + L3);
      const angle = Math.PI / 2 - s4 / R;
      const cX = left + R;
      x = cX - R * Math.cos(angle);
      y = cy + R * Math.sin(angle);
    }
    return { x, y };
  };

  const distScale = 2;
  const posA = mapPos(timeAVal * speedA.value * distScale);
  const posB = mapPos(timeBVal * speedB.value * distScale);
  if (runnerACircle.value) {
    runnerACircle.value.style.left = `${posA.x - 16}px`;
    runnerACircle.value.style.top = `${posA.y - 16}px`;
    runnerACircle.value.style.transform = "";
  }
  if (runnerBCircle.value) {
    runnerBCircle.value.style.left = `${posB.x - 16}px`;
    runnerBCircle.value.style.top = `${posB.y - 16}px`;
    runnerBCircle.value.style.transform = "";
  }

  const bothStarted = timeAVal > 0 && timeBVal > 0;
  if (bothStarted && speedA.value > speedB.value) {
    const sA = timeAVal * speedA.value * distScale;
    const sB = timeBVal * speedB.value * distScale;
    let diff = sA - sB;
    if (diff < 0) diff += P;
    const diffAbs = Math.min(diff, P - diff);
    const threshold = 16;
    if (diffAbs <= threshold && catchTime.value === null) {
      catchTime.value = timer.value;
      showResult();
      isRunning.value = false;
      if (animationId) cancelAnimationFrame(animationId);
    }
  }
};

const updateOppositePosition = (timeAVal: number, timeBVal: number) => {
  const trackWidth = (straightTrack.value?.clientWidth || 0) - 32;
  let posA = timeAVal * speedA.value * 5;
  let initB = trackWidth;
  if (scenario.value === "differentStart") initB = Math.min(trackWidth, initialDistance.value * 5);
  let posB = initB - timeBVal * speedB.value * 5;
  posA = Math.min(posA, trackWidth);
  posB = Math.max(posB, 0);
  if (runnerA.value) runnerA.value.style.left = `${posA}px`;
  if (runnerB.value) runnerB.value.style.left = `${posB}px`;
  const bothStarted = timeAVal > 0 && timeBVal > 0;
  if (bothStarted && Math.abs(posA - posB) <= 10 && catchTime.value === null) {
    catchTime.value = timer.value;
    showResult();
    isRunning.value = false;
    if (animationId) cancelAnimationFrame(animationId);
  }
};

const showResult = () => {
  const p = problemType.value;
  const sA = speedA.value;
  const sB = speedB.value;
  const tDiff = timeDiff.value;
  const dir = timeDiffDirection.value;
  let html = "";
  if (p === "straight") {
    const scen = scenario.value;
    let distanceDiff = 0;
    const behindIsA = scen === "sameStart" ? dir === "bFirst" : true;
    if (scen === "differentStart") distanceDiff = initialDistance.value;
    else distanceDiff = (behindIsA ? sA : sB) * tDiff;
    const speedBehind = behindIsA ? sA : sB;
    const speedAhead = behindIsA ? sB : sA;
    const speedDiff = speedBehind - speedAhead;
    const calc = speedDiff > 0 ? (distanceDiff / speedDiff).toFixed(1) : "无法追上";
    const who = behindIsA ? "甲" : "乙";
    html = `甲的速度：${sA} 单位/秒<br/>乙的速度：${sB} 单位/秒<br/>速度差(追击者-被追者)：${speedDiff.toFixed(
      1,
    )} 单位/秒<br/>初始距离差：${distanceDiff} 单位<br/><span class=\"primary\">${
      speedDiff > 0
        ? `${who}在 ${catchTime.value} 秒时追上对方`
        : "追击者速度不大于被追者，无法追上"
    }</span><br/><span class=\"sub\">计算：追击时间 = 距离差 ÷ 速度差 = ${distanceDiff} ÷ ${speedDiff.toFixed(
      1,
    )} = ${calc} 秒</span>`;
  } else if (p === "circle") {
    const speedDiff = sA - sB;
    html = `甲的速度：${sA} 单位/秒<br/>乙的速度：${sB} 单位/秒<br/>速度差：${speedDiff.toFixed(
      1,
    )} 单位/秒<br/><span class="primary">甲在 ${
      catchTime.value
    } 秒时追上乙</span><br/><span class="sub">计算：相遇时间 = 跑道长度 ÷ 速度差</span>`;
  } else {
    const scen = scenario.value;
    let distance =
      scen === "differentStart" ? initialDistance.value : speedB.value * timeDiff.value;
    const speedSum = sA + sB;
    const calc = (distance / speedSum).toFixed(1);
    html = `甲的速度：${sA} 单位/秒<br/>乙的速度：${sB} 单位/秒<br/>速度和：${speedSum.toFixed(
      1,
    )} 单位/秒<br/>距离：${distance} 单位<br/><span class="primary">两者在 ${
      catchTime.value
    } 秒时相遇</span><br/><span class="sub">计算：相遇时间 = 距离 ÷ 速度和 = ${distance} ÷ ${speedSum.toFixed(
      1,
    )} = ${calc} 秒</span>`;
  }
  resultHtml.value = html;
};

onMounted(async () => {
  await nextTick();
  problemType.value = "straight";
  scenario.value = "sameStart";
  resetAnimation();
});
</script>

<style scoped>
.container {
  width: 100%;
}
.header {
  text-align: center;
  margin-bottom: 16px;
  width: 100%;
}
.header h1 {
  font-weight: 700;
  color: #1e293b;
  font-size: 28px;
}
.header p {
  color: #64748b;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  width: 100%;
}
.panel {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
}
.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-item {
  width: 100%;
}
.form-item label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}
.form-row {
  display: flex;
}
.input-sd {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
}
.row {
  display: flex;
  gap: 8px;
}
.row > .select,
.row > .input {
  flex: 1;
}
.select,
.input {
  /* width: 100%; */
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
}
.select:focus,
.input:focus {
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
  border-color: #4f46e5;
}
.buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-top: 6px;
}
.btn {
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background: #4f46e5;
  color: #fff;
}
.btn-primary:hover {
  background: #4338ca;
}
.btn-secondary {
  background: #e5e7eb;
  color: #111827;
}
.btn-secondary:hover {
  background: #d1d5db;
}
.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  margin-right: 6px;
  vertical-align: middle;
}
.dot-a {
  background: #4f46e5;
}
.dot-b {
  background: #ec4899;
}

.stage {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-height: 280px;
}
.stage-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.stage-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
.timer {
  color: #64748b;
}
.straight {
  position: relative;
  height: 160px;
  margin-bottom: 12px;
}
.track-line {
  position: absolute;
  top: 50%;
  width: 100%;
  border-top: 2px dashed #64748b;
}
.runner {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  position: absolute;
  left: 0;
  top: calc(50% - 16px);
  transition: all 0.1s linear;
  z-index: 10;
}
.runner-a {
  background: #4f46e5;
}
.runner-b {
  background: #ec4899;
}
.start-label {
  position: absolute;
  bottom: 0;
  left: 0;
  font-size: 12px;
  color: #64748b;
}
.circle {
  position: relative;
  height: 160px;
  margin-bottom: 12px;
}
.track-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 75%;
  height: 75%;
  border: 2px dashed #64748b;
  border-radius: 999px;
  transform: translate(-50%, -50%);
}
.circle-pos {
  top: 50%;
  left: 50%;
}
.circle-start {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: #64748b;
}
.result {
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}
.result-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}
.result-text {
  color: #64748b;
}
.primary {
  color: #4f46e5;
  font-weight: 600;
}
.sub {
  color: #64748b;
  font-size: 12px;
}

.explain {
  margin-top: 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
}
.explain-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}
.explain-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  color: #64748b;
}
.explain-sub {
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 6px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
