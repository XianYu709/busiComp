<template>
  <div class="panel">
    <div class="title">偏旁组字小游戏</div>
    <div class="subtitle">根据提示，从偏旁中找出能组成一个字的两个，拖到卡槽</div>

    <div class="message" :class="msgType">{{ messageText }}</div>

    <div class="prompt">
      <span class="hint-label">提示：</span>
      <span class="hint-text">{{ hintText }}</span>
    </div>

    <div class="slots-row">
      <div class="slot" :class="{hover: slotHover==='slot1'}" @dragover.prevent="onSlotOver('slot1')" @dragleave="onSlotLeave" @drop="onSlotDrop('slot1')">
        <span v-if="!placed.slot1" class="slot-placeholder">第一个偏旁</span>
        <div v-else class="radical placed">{{ placed.slot1 }}</div>
      </div>
      <div class="op">+</div>
      <div class="slot" :class="{hover: slotHover==='slot2'}" @dragover.prevent="onSlotOver('slot2')" @dragleave="onSlotLeave" @drop="onSlotDrop('slot2')">
        <span v-if="!placed.slot2" class="slot-placeholder">第二个偏旁</span>
        <div v-else class="radical placed">{{ placed.slot2 }}</div>
      </div>
      <div class="op">=</div>
      <div class="result" :class="resultClass">{{ resultChar || '?' }}</div>
    </div>

    <div class="pool">
      <p class="pool-caption">偏旁选择区</p>
      <div class="radicals-container">
        <div
          v-for="(r,idx) in poolRadicals"
          :key="r+'-'+idx"
          class="radical"
          draggable="true"
          @dragstart="onDragStart(r,$event)"
          @dragend="onDragEnd"
        >{{ r }}</div>
      </div>
    </div>

    <div class="actions">
      <button v-if="!showNext" class="btn primary" @click="checkAnswer">检查</button>
      <button v-else class="btn accent" @click="nextQuestion">下一题</button>
    </div>

    <div class="game-desc">游戏说明：根据上方提示，从5个偏旁中找出能组成一个字的两个，分别拖到两个卡槽中，然后点击“检查”按钮</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type RadicalPair = { correct: [string,string]; result: string; hint: string; distractors: string[] }
const radicalPairs: RadicalPair[] = [
  { correct: ['氵','可'], result: '河', hint: '滔滔不绝向海行，一去不返是此名', distractors: ['亻','扌','木'] },
  { correct: ['木','对'], result: '树', hint: '站在路旁戴绿帽，风雨无阻守边疆', distractors: ['氵','宀','火'] },
  { correct: ['亻','尔'], result: '你', hint: '对面相逢常称呼，第二人称记清楚', distractors: ['讠','艹','刂'] },
  { correct: ['扌','丁'], result: '打', hint: '举手挥拳做动作，击敲拍击皆是它', distractors: ['日','月','石'] },
  { correct: ['艹','化'], result: '花', hint: '含苞待放香满径，春来遍地皆如锦', distractors: ['宀','辶','心'] },
  { correct: ['木','果'], result: '棵', hint: '树木量词常使用，一株一株数分明', distractors: ['讠','氵','疒'] }
]

const current = ref<RadicalPair | null>(null)
const poolRadicals = ref<string[]>([])
const placed = ref<{slot1:string|null;slot2:string|null}>({ slot1: null, slot2: null })
const dragging = ref<string|null>(null)
const slotHover = ref<'slot1'|'slot2'|null>(null)
const messageText = ref('请将合适的偏旁拖到卡槽中')
const msgType = ref('')
const showNext = ref(false)
const resultChar = ref('')
const resultClass = ref('')
const hintText = ref('')

const start = () => {
  const idx = Math.floor(Math.random() * radicalPairs.length)
  current.value = radicalPairs[idx]
  poolRadicals.value = [...(current.value?.correct || []), ... (current.value?.distractors || [])].sort(()=>Math.random()-0.5)
  placed.value.slot1 = null
  placed.value.slot2 = null
  dragging.value = null
  slotHover.value = null
  messageText.value = '请将合适的偏旁拖到卡槽中'
  msgType.value = ''
  resultChar.value = ''
  resultClass.value = ''
  hintText.value = current.value?.hint || ''
  showNext.value = false
}

const onDragStart = (r:string, e:DragEvent) => { dragging.value = r }
const onDragEnd = () => { dragging.value = null }
const onSlotOver = (slot:'slot1'|'slot2') => { slotHover.value = slot }
const onSlotLeave = () => { slotHover.value = null }
const onSlotDrop = (slot:'slot1'|'slot2') => {
  slotHover.value = null
  if (!dragging.value) return
  const other = slot==='slot1' ? 'slot2' : 'slot1'
  // 如果另一个槽已放置相同偏旁，清空它
  if (placed.value[other] === dragging.value) placed.value[other] = null
  // 放入当前槽
  placed.value[slot] = dragging.value
  // 从池移除该偏旁（若两个槽都未放置该偏旁则存在于池）
  const used = new Set([placed.value.slot1, placed.value.slot2].filter(Boolean) as string[])
  poolRadicals.value = poolRadicals.value.filter(r => !used.has(r))
  // 将被替换出的旧值放回池
  const prev = dragging.value
  dragging.value = null
  if (prev && (placed.value[other] !== prev) && !used.has(prev)) poolRadicals.value.push(prev)
}

const checkAnswer = () => {
  if (!placed.value.slot1 || !placed.value.slot2) {
    messageText.value = '请在两个卡槽都放入偏旁'
    msgType.value = 'warning'
    return
  }
  const a = placed.value.slot1
  const b = placed.value.slot2
  const corr = current.value!.correct
  const ok = (a===corr[0] && b===corr[1]) || (a===corr[1] && b===corr[0])
  resultChar.value = current.value!.result
  if (ok) {
    messageText.value = `正确！${a}和${b}组成"${current.value!.result}"字`
    msgType.value = 'success'
    resultClass.value = 'ok'
    showNext.value = true
  } else {
    messageText.value = '不太对哦，再试试！'
    msgType.value = 'error'
    resultClass.value = 'bad'
  }
}

const nextQuestion = () => { start() }

start()
</script>

<style scoped>
.panel{width:min(980px,100%);margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 15px rgba(0,0,0,0.08);padding:20px}
.title{text-align:center;font-weight:700;font-size:20px;color:#8B5CF6}
.subtitle{text-align:center;color:#64748b;margin-top:6px}
.message{text-align:center;height:24px;color:#64748b;margin:8px 0}
.message.success{color:#10B981}
.message.error{color:#EF4444}
.message.warning{color:#F59E0B}
.prompt{display:flex;justify-content:center;gap:8px;margin:12px 0}
.hint-label{color:#8B5CF6;font-weight:600}
.hint-text{color:#334155}
.slots-row{display:flex;justify-content:center;align-items:center;gap:12px;margin:16px 0}
.slot{width:80px;height:80px;border:2px solid #d1d5db;border-radius:12px;display:flex;align-items:center;justify-content:center;transition:all .2s}
.slot.hover{border-color:#8B5CF6}
.slot-placeholder{color:#9ca3af;font-size:12px}
.op{color:#6b7280;font-size:20px}
.result{width:80px;height:80px;border:2px dashed #d1d5db;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#6b7280}
.result.ok{border-color:#10B981;background:#ecfdf5;color:#10B981}
.result.bad{border-color:#EF4444;background:#fee2e2;color:#EF4444}
.pool{background:#F3F4F6;border-radius:12px;padding:12px}
.pool-caption{text-align:center;color:#64748b;margin:4px 0}
.radicals-container{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;min-height:80px}
.radical{width:56px;height:56px;background:#8B5CF6;color:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:move;transition:all .2s;box-shadow:0 6px 12px rgba(139,92,246,0.2)}
.radical.placed{background:#8B5CF6}
.actions{display:flex;justify-content:center;gap:12px;margin-top:16px}
.btn{padding:10px 18px;border:none;border-radius:999px;color:#fff;cursor:pointer;font-weight:600}
.btn.primary{background:#8B5CF6}
.btn.accent{background:#F59E0B}
.game-desc{text-align:center;color:#64748b;font-size:12px;margin-top:8px}
:deep(.fullscreen-content) .panel{height:100%;}
</style>