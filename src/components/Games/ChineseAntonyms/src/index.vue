<template>
  <div class="panel" ref="panelRef">
    <div class="title">小学语文·反义词连连看</div>
    <div class="subtitle">把意思相反的词语连起来吧</div>
    <div class="canvas" ref="canvasRef">
      <div class="grid">
        <div class="col">
          <button
            v-for="w in left"
            :key="w"
            class="chip"
            :class="selectedLeft === w ? 'active' : connectedLeft.has(w) ? 'done' : ''"
            :ref="el=>setLeftEl(w,el as HTMLElement)"
            @click="selectLeft(w)">
            {{ w }}
          </button>
        </div>
        <div class="col">
          <button
            v-for="w in right"
            :key="w"
            class="chip"
            :class="connectedRight.has(w) ? 'done' : selectedRight === w ? 'active' : ''"
            :ref="el=>setRightEl(w,el as HTMLElement)"
            @click="selectRight(w)">
            {{ w }}
          </button>
        </div>
      </div>
      <div class="lines" :data-k="refresh">
        <div v-for="ln in lineStyles" :key="ln.id" class="connection-line" :style="ln.style" />
      </div>
    </div>
    <div class="actions">
      <button class="btn primary" v-if="!done" @click="check">检查答案</button>
      <button class="btn accent" v-else @click="reset">下一题</button>
    </div>
    <div class="msg" :class="msgType">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";

const group = [
  ["远", "近"],
  ["难", "易"],
  ["早", "晚"],
  ["升", "降"],
];
const left = ref(group.map(p => p[0]));
const right = ref(group.map(p => p[1]).sort(() => Math.random() - 0.5));
const selectedLeft = ref("");
const selectedRight = ref("");
const connected = ref<Map<string, string>>(new Map());
const connectedLeft = ref<Set<string>>(new Set());
const panelRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
const leftEls = ref<Record<string, HTMLElement | undefined>>({});
const rightEls = ref<Record<string, HTMLElement | undefined>>({});
const refresh = ref(0);
const msg = ref("");
const msgType = ref("");
const done = computed(() => connected.value.size === left.value.length);
const connectedRight = computed(() => new Set(connected.value.values()));
const setLeftEl = (w: string, el: HTMLElement | null) => {
  if (el) leftEls.value[w] = el;
};
const setRightEl = (w: string, el: HTMLElement | null) => {
  if (el) rightEls.value[w] = el;
};
const selectLeft = (w: string) => {
  if (connectedLeft.value.has(w)) return;
  selectedLeft.value = w;
};
const selectRight = (w: string) => {
  selectedRight.value = w;
  const ok = group.some(p => p[0] === selectedLeft.value && p[1] === w);
  if (!selectedLeft.value) return;
  if (ok) {
    connected.value.set(selectedLeft.value, w);
    connectedLeft.value.add(selectedLeft.value);
    selectedLeft.value = "";
    selectedRight.value = "";
    refresh.value++;
  } else {
    msg.value = "配对不正确";
    msgType.value = "error";
    selectedRight.value = "";
  }
};
const lineStyles = computed(() => {
  const container = canvasRef.value || panelRef.value;
  if (!container) return [] as any[];
  const rect = container.getBoundingClientRect();
  const arr: any[] = [];
  for (const [l, r] of connected.value.entries()) {
    const le = leftEls.value[l];
    const re = rightEls.value[r];
    if (!le || !re) continue;
    const lr = le.getBoundingClientRect();
    const rr = re.getBoundingClientRect();
    const sx = lr.right - rect.left;
    const sy = lr.top + lr.height / 2 - rect.top;
    const ex = rr.left - rect.left;
    const ey = rr.top + rr.height / 2 - rect.top;
    const len = Math.hypot(ex - sx, ey - sy);
    const ang = (Math.atan2(ey - sy, ex - sx) * 180) / Math.PI;
    arr.push({
      id: `${l}|${r}`,
      style: { width: `${len}px`, left: `${sx}px`, top: `${sy}px`, transform: `rotate(${ang}deg)` },
    });
  }
  return arr;
});
const check = () => {
  const ok = group.every(p => connected.value.get(p[0]) === p[1]);
  if (ok) {
    msg.value = "全部正确";
    msgType.value = "success";
  } else {
    msg.value = "有配对错误";
    msgType.value = "error";
  }
};
const reset = async () => {
  connected.value.clear();
  connectedLeft.value.clear();
  right.value = group.map(p => p[1]).sort(() => Math.random() - 0.5);
  msg.value = "";
  msgType.value = "";
  await nextTick();
  refresh.value++;
};
const onResize = () => {
  refresh.value++;
};
onMounted(() => {
  window.addEventListener("resize", onResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", onResize);
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
  font-size: 20px;
  color: #ec4899;
}
.subtitle {
  text-align: center;
  color: #64748b;
  margin-top: 6px;
}
.canvas {
  position: relative;
}
.grid {
  display: flex;
  gap: 0;
  justify-content: space-between;
  margin-top: 16px;
  align-items: stretch;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  width: 22%;
}
.col:first-child {
  margin-right: auto;
}
.col:last-child {
  margin-left: auto;
}
.chip {
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: #ec4899;
  color: #fff;
  cursor: pointer;
}
.chip.active {
  background: #f59e0b;
}
.chip.done {
  background: #10b981;
}
.lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.connection-line {
  position: absolute;
  background-color: #ec4899;
  height: 3px;
  transform-origin: 0 0;
  z-index: 10;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}
.btn.primary {
  background: #ec4899;
}
.btn.accent {
  background: #f59e0b;
}
.msg {
  text-align: center;
  margin-top: 8px;
}
.success {
  color: #10b981;
}
.error {
  color: #ef4444;
}
:deep(.fullscreen-content) .panel {
  height: 100%;
}
</style>