<template>
  <div id="auto-div-4e4780c4" v-if="visible" class="formula-editor-overlay" @click="handleOverlayClick">
    <div id="auto-div-0997137e" class="formula-editor-dialog" @click.stop>
      <!-- 标题栏 -->
      <div id="auto-div-5d402dab" class="formula-editor-header">
        <h3 id="auto-h3-567c5004">公式编辑器</h3>
        <button id="auto-button-e435744a" class="close-btn" @click="close">×</button>
      </div>

      <!-- 工具栏 -->
      <div id="auto-div-f8a11cd6" class="formula-toolbar">
        <!-- 紧凑分组工具条：悬浮展开子面板（避免页面重复符号） -->
        <div id="auto-div-c9214ffc" class="toolbar-groups">
          <div id="auto-div-b9b3d767" class="symbol-group">
            <button id="auto-button-fc3125f2" class="group-btn">运算</button>
            <div id="auto-div-77b0a3e4" class="group-panel">
              <button id="auto-button-93a7f6ed" @click="insertSymbol('+')">+</button>
              <button id="auto-button-81e640fa" @click="insertSymbol('-')">−</button>
              <button id="auto-button-def2391c" @click="insertSymbol('\\pm')">±</button>
              <button id="auto-button-8f34bebb" @click="insertSymbol('\\mp')">∓</button>
              <button id="auto-button-8896cdcb" @click="insertSymbol('\\times')">×</button>
              <button id="auto-button-b1424484" @click="insertSymbol('\\div')">÷</button>
              <button id="auto-button-48a88032" @click="insertSymbol('\\oplus')">⊕</button>
              <button id="auto-button-43a2109a" @click="insertSymbol('\\ominus')">⊖</button>
              <button id="auto-button-b485a6f7" @click="insertSymbol('\\otimes')">⊗</button>
              <button id="auto-button-a6cd328f" @click="insertSymbol('\\odot')">⊙</button>
              <button id="auto-button-1fec895a" @click="insertSymbol('\\cdot')">·</button>
              <button id="auto-button-5c59d5a2" @click="insertSymbol('\\circ')">∘</button>
              <button id="auto-button-c6dd8c88" @click="insertSymbol('\\ast')">∗</button>
              <button id="auto-button-07e0e6ec" @click="insertTemplate('\\sqrt{}')">√</button>
              <button id="auto-button-ce983fe9" @click="insertTemplate('\\sqrt[n]{}')">n√</button>
              <button id="auto-button-879c4553" @click="insertTemplate('\\frac{}{}')">a/b</button>
              <button id="auto-button-a58b455a" @click="insertTemplate('\\sum_{ }^{ }')">∑</button>
              <button id="auto-button-0b2fb1a3" @click="insertTemplate('\\prod_{ }^{ }')">∏</button>
              <button id="auto-button-b24372a8" @click="insertTemplate('\\int_{ }^{ }')">∫</button>
              <button id="auto-button-8fc0bca3" @click="insertSymbol('\\partial')" title="∂">∂</button>
          <button id="auto-button-5f6c2ce6" @click="insertSymbol('\\nabla')" title="∇">∇</button>
          <!-- <button id="auto-button-5c6ccb6e" @click="insertTemplate('\\iint_{ }^{ }')" title="二重积分">⨌</button> -->
          <!-- <button id="auto-button-8c89ee04" @click="insertTemplate('\\iiint_{ }^{ }')" title="三重积分">∰</button> -->
              <button id="auto-button-d3983beb" @click="insertSymbol('\\oint')">∮</button>
              <button id="auto-button-3eed7ea1" @click="insertTemplate('\\lim_{ }')">lim</button>
            </div>
          </div>

          <div id="auto-div-3d337716" class="symbol-group">
            <button id="auto-button-603a5f8f" class="group-btn">关系</button>
            <div id="auto-div-9103b3f6" class="group-panel">
              <button id="auto-button-93750cfd" @click="insertSymbol('=')">=</button>
              <button id="auto-button-d83b5391" @click="insertSymbol('\\neq')">≠</button>
              <button id="auto-button-7915c77b" @click="insertSymbol('\\equiv')">≡</button>
              <button id="auto-button-ab3b9f0c" @click="insertSymbol('\\sim')">∼</button>
              <button id="auto-button-d6eb282b" @click="insertSymbol('\\approx')">≈</button>
              <button id="auto-button-bea31172" @click="insertSymbol('\\simeq')">≃</button>
              <button id="auto-button-99db2663" @click="insertSymbol('\\cong')">≅</button>
              <button id="auto-button-28ce9bab" @click="insertSymbol('\\leq')">≤</button>
              <button id="auto-button-67db1be4" @click="insertSymbol('\\geq')">≥</button>
              <button id="auto-button-af91daa7" @click="insertSymbol('\\ll')">≪</button>
              <button id="auto-button-cced5194" @click="insertSymbol('\\gg')">≫</button>
              <button id="auto-button-bd1a8a4c" @click="insertSymbol('\\prec')">≺</button>
              <button id="auto-button-6e8e95d7" @click="insertSymbol('\\succ')">≻</button>
            </div>
          </div>

          <div id="auto-div-e2e82503" class="symbol-group">
            <button id="auto-button-cb988325" class="group-btn">箭头</button>
            <div id="auto-div-1b4cdbce" class="group-panel">
              <button id="auto-button-bcd306dd" @click="insertSymbol('\\leftarrow')">←</button>
              <button id="auto-button-1e6cf64d" @click="insertSymbol('\\rightarrow')">→</button>
              <button id="auto-button-f389d1f3" @click="insertSymbol('\\uparrow')">↑</button>
              <button id="auto-button-a2dce49d" @click="insertSymbol('\\downarrow')">↓</button>
              <button id="auto-button-1d5a25d3" @click="insertSymbol('\\leftrightarrow')">↔</button>
              <button id="auto-button-e28b7989" @click="insertSymbol('\\Leftarrow')">⇐</button>
              <button id="auto-button-1318c74b" @click="insertSymbol('\\Rightarrow')">⇒</button>
              <button id="auto-button-0719eecb" @click="insertSymbol('\\Leftrightarrow')">⇔</button>
              <button id="auto-button-9be4e251" @click="insertSymbol('\\nearrow')">↗</button>
              <button id="auto-button-b1e2d1c3" @click="insertSymbol('\\searrow')">↘</button>
              <button id="auto-button-bd1da8c0" @click="insertSymbol('\\swarrow')">↙</button>
              <button id="auto-button-6cba6e38" @click="insertSymbol('\\nwarrow')">↖</button>
            </div>
          </div>

          <div id="auto-div-a9042cc7" class="symbol-group">
            <button id="auto-button-85c175d5" class="group-btn">括号</button>
            <div id="auto-div-cb856189" class="group-panel">
          <button id="auto-button-e6614ca6" @click="insertTemplate('{ }^{\\mathsf{T}}')" title="转置">Tᵗ</button>
              <button id="auto-button-9a8de0a8" @click="insertTemplate('\\left(  \\right)')">()</button>
              <button id="auto-button-d1b20c9e" @click="insertTemplate('\\left[  \\right]')">[]</button>
              <button id="auto-button-2730833c" @click="insertTemplate('\\left\\{  \\right\\}')">{}</button>
              <button id="auto-button-5c51cf2a" @click="insertTemplate('\\left|  \\right|')">||</button>
          <button id="auto-button-3210c68c" @click="insertTemplate('\\left[  \\right]')" title="[ ]">[ ]</button>

              <!-- <button id="auto-button-85384f77" @click="insertTemplate('\\left\\langle  \\right\\rangle')">⟨⟩</button> -->
            </div>
          </div>

          <div id="auto-div-87fe5e79" class="symbol-group">
            <button id="auto-button-c09b11a4" class="group-btn">修饰</button>
            <div id="auto-div-0dbd2dd2" class="group-panel">
              <button id="auto-button-def858ad" @click="insertTemplate('x\\prime')">x'</button>
              <button id="auto-button-8f9502fd" @click="insertTemplate('x\\prime\\prime')">x''</button>
              <button id="auto-button-6ef8b889" @click="insertTemplate('x\\prime\\prime\\prime')">x'''</button>
              <!-- <button id="auto-button-84f8ab45" @click="insertTemplate('\\dot{x}')">ẋ</button> -->
              <!-- <button id="auto-button-511b38e8" @click="insertTemplate('\\ddot{x}')">ẍ</button> -->
              <button id="auto-button-71f6db3b" @click="insertTemplate('\\bar{x}')">x̄</button>
              <!-- <button id="auto-button-e718ccdc" @click="insertTemplate('\\tilde{x}')">x̃</button> -->
              <!-- <button id="auto-button-afaad6d4" @click="insertTemplate('\\hat{x}')">x̂</button> -->
              <button id="auto-button-a410bad2" @click="insertTemplate('\\vec{x}')">→x</button>
              <button id="auto-button-d7d93779" @click="insertTemplate('\\overline{x}')">x̅</button>
              <button id="auto-button-f3e0551e" @click="insertTemplate('\\underline{x}')">x̲</button>
            </div>
          </div>

          <div id="auto-div-167afa98" class="symbol-group">
            <button id="auto-button-a8572669" class="group-btn">省略/空格</button>
            <div id="auto-div-02e9e551" class="group-panel">
              <button id="auto-button-5b640a57" @click="insertSymbol('\\ldots')">…</button>
              <button id="auto-button-c31b450a" @click="insertSymbol('\\cdots')">⋯</button>
              <button id="auto-button-c4a58a35" @click="insertSymbol('\\vdots')">⋮</button>
              <button id="auto-button-dd0278c5" @click="insertSymbol('\\ddots')">⋱</button>
              <!-- <button id="auto-button-ca4eee3a" @click="insertSymbol('\\,')">a\,b</button> -->
            </div>
          </div>

          <div id="auto-div-86a954e4" class="symbol-group">
            <button id="auto-button-2e0fb135" class="group-btn">集合/逻辑</button>
            <div id="auto-div-cb1cfb43" class="group-panel">
              <button id="auto-button-42a42c86" @click="insertSymbol('\\subset')">⊂</button>
              <button id="auto-button-b2fdfa4d" @click="insertSymbol('\\subseteq')">⊆</button>
              <button id="auto-button-3bf4012d" @click="insertSymbol('\\supset')">⊃</button>
              <button id="auto-button-0fe4da05" @click="insertSymbol('\\supseteq')">⊇</button>
              <button id="auto-button-09355363" @click="insertSymbol('\\in')">∈</button>
              <button id="auto-button-852c0caa" @click="insertSymbol('\\notin')">∉</button>
              <button id="auto-button-641398e6" @click="insertSymbol('\\cap')">∩</button>
              <button id="auto-button-e6bb06ad" @click="insertSymbol('\\cup')">∪</button>
              <button id="auto-button-af101b2e" @click="insertSymbol('\\setminus')">∖</button>
              <button id="auto-button-7bcb78d7" @click="insertSymbol('\\emptyset')">∅</button>
              <button id="auto-button-db80650d" @click="insertSymbol('\\therefore')">∴</button>
              <button id="auto-button-383abfc3" @click="insertSymbol('\\because')">∵</button>
              <button id="auto-button-4149dbcb" @click="insertSymbol('\\forall')">∀</button>
              <button id="auto-button-d8d6195e" @click="insertSymbol('\\exists')">∃</button>
          <button id="auto-button-208b4f7e" @click="insertSymbol('\\ni')" title="∋">∋</button>

              <button id="auto-button-4bf155d9" @click="insertSymbol('\\lor')">∨</button>
              <button id="auto-button-afd51f9a" @click="insertSymbol('\\land')">∧</button>
              <button id="auto-button-8adbb72a" @click="insertSymbol('\\neg')">¬</button>
            </div>
          </div>

          <div id="auto-div-86a081f0" class="symbol-group">
            <button id="auto-button-ea2ef544" class="group-btn">希腊</button>
            <div id="auto-div-54c32643" class="group-panel panel-wide">
              <div id="auto-div-159fa143" class="panel-row">
                <button id="auto-button-a7050699" @click="insertSymbol('\\alpha')">α</button>
                <button id="auto-button-adb9c8ab" @click="insertSymbol('\\beta')">β</button>
                <button id="auto-button-70c0faa8" @click="insertSymbol('\\gamma')">γ</button>
                <button id="auto-button-4a102c87" @click="insertSymbol('\\delta')">δ</button>
                <button id="auto-button-fc005bdf" @click="insertSymbol('\\epsilon')">ε</button>
                <button id="auto-button-976ff58a" @click="insertSymbol('\\zeta')">ζ</button>
                <button id="auto-button-1c6d87d0" @click="insertSymbol('\\eta')">η</button>
                <button id="auto-button-5ec941db" @click="insertSymbol('\\theta')">θ</button>
                <button id="auto-button-81b51b9b" @click="insertSymbol('\\iota')">ι</button>
                <button id="auto-button-7e1849f3" @click="insertSymbol('\\kappa')">κ</button>
                <button id="auto-button-b41dff8e" @click="insertSymbol('\\lambda')">λ</button>
                <button id="auto-button-e7c5a30a" @click="insertSymbol('\\mu')">μ</button>
                <button id="auto-button-c5bb5caf" @click="insertSymbol('\\nu')">ν</button>
                <button id="auto-button-e97332d6" @click="insertSymbol('\\xi')">ξ</button>
                <button id="auto-button-04538419" @click="insertSymbol('\\pi')">π</button>
                <button id="auto-button-884305af" @click="insertSymbol('\\rho')">ρ</button>
                <button id="auto-button-87a1d186" @click="insertSymbol('\\sigma')">σ</button>
                <button id="auto-button-de54e699" @click="insertSymbol('\\tau')">τ</button>
                <button id="auto-button-f4bf077f" @click="insertSymbol('\\upsilon')">υ</button>
                <button id="auto-button-4c833eaf" @click="insertSymbol('\\phi')">φ</button>
                <button id="auto-button-f4ec9fbf" @click="insertSymbol('\\chi')">χ</button>
                <button id="auto-button-b5e8908e" @click="insertSymbol('\\psi')">ψ</button>
                <button id="auto-button-199c0c64" @click="insertSymbol('\\omega')">ω</button>
              </div>
              <div id="auto-div-bccce80a" class="panel-row">
                <button id="auto-button-f5bfe56c" @click="insertSymbol('\\Gamma')">Γ</button>
                <button id="auto-button-121c20b3" @click="insertSymbol('\\Delta')">Δ</button>
                <button id="auto-button-82ea3ce2" @click="insertSymbol('\\Theta')">Θ</button>
                <button id="auto-button-c3a4ee71" @click="insertSymbol('\\Lambda')">Λ</button>
                <button id="auto-button-ebe555e0" @click="insertSymbol('\\Xi')">Ξ</button>
                <button id="auto-button-85fb8f56" @click="insertSymbol('\\Pi')">Π</button>
                <button id="auto-button-6d0e5760" @click="insertSymbol('\\Sigma')">Σ</button>
                <button id="auto-button-cfdfebb6" @click="insertSymbol('\\Upsilon')">Υ</button>
                <button id="auto-button-d2edcf11" @click="insertSymbol('\\Phi')">Φ</button>
                <button id="auto-button-626db10a" @click="insertSymbol('\\Psi')">Ψ</button>
                <button id="auto-button-014ce00a" @click="insertSymbol('\\Omega')">Ω</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 格式选项 -->
        <div id="auto-div-47293eb7" class="format-options">
           <!-- 第三行：常用符号 -->
         <div id="auto-div-e0cf7dfa" class="toolbar-row">
            <button id="auto-button-a27940ee" @click="insertSymbol('π')" title="pi">π</button>
            <button id="auto-button-6ae9c6bc" @click="insertSymbol('\\Theta')">Θ</button>
            <button id="auto-button-34325bfa" @click="insertSymbol('\\in')">∈</button>
            <button id="auto-button-7ac8722c" @click="insertSymbol('\\rightarrow')">→</button>
            <button id="auto-button-6f73735d" @click="insertSymbol('\\leq')">≤</button>
            <button id="auto-button-851358e8" @click="insertSymbol('\\neq')">≠</button>
            <button id="auto-button-57ac2e51" @click="insertSymbol('\\pm')">±</button>
            <button id="auto-button-417922ae" @click="insertSymbol('\\infty')" title="无穷大">∞</button>
            <button id="auto-button-4b0360f9" @click="insertTemplate('\\left(  \\right)')">()</button>
            <button id="auto-button-83aebedd" @click="insertTemplate('\\left[  \\right]')">[]</button>
            <button id="auto-button-bcf6a089" @click="insertTemplate('\\left\\{  \\right\\}')">{}</button>
            <button id="auto-button-d2868cc2" @click="insertTemplate('\\frac{}{}')">a/b</button>
            <button id="auto-button-0f8d4a97" @click="insertTemplate('\\sum_{ }^{ }')">∑</button>
            <button id="auto-button-82dc7292" @click="insertTemplate('\\sqrt{}')">√</button>
         </div>
           <div id="auto-div-cc0027ae" class="format-group">
             <label id="auto-label-f6002a68">LaTeX</label>
             <input 
               type="checkbox" 
               v-model="isLatexMode" 
               @change="toggleLatexMode"
               :disabled="isLatexMode && hasLatexError"
               :title="isLatexMode && hasLatexError ? 'LaTeX 语法有错误，请修正后再切换' : ''"
             >
           </div>
        </div>
      </div>

      <!-- 输入和预览区域 -->
      <div id="auto-div-399ec058" class="formula-input-area">
        <div id="auto-div-d59b9eeb" class="input-section">
          <label id="auto-label-fbd9190c">公式输入：</label>
          <template v-if="!isLatexMode">
            <div id="auto-div-efd5b30f" class="mq-editor-wrapper" @click="focusEditor">
              <div id="auto-div-ff3a205e" ref="mqRoot" class="mq-field"></div>
            </div>
          </template>
          <template v-else>
            <textarea 
              ref="formulaInput"
              v-model="formulaText" 
              @input="updatePreview"
              placeholder="输入 LaTeX 公式，例如：x^2 + y^2 = z^2"
              class="formula-textarea"
            ></textarea>
          </template>
        </div>
        <div class="preview-section">
          <label>预览：</label>
          <div class="formula-preview" v-html="previewHtml"></div>
        </div>
      </div>

      <!-- 提示和操作按钮 -->
      <div class="formula-editor-footer">
        <div class="hint">
          <!-- <span class="hint-icon">⚠️</span>
          <span>将公式截图粘贴到编辑框快速识别公式。</span> -->
        </div>
        <div class="actions">
          <button class="cancel-btn" @click="close">取消</button>
          <button 
            class="insert-btn" 
            :class="{ 'disabled': hasLatexError }"
            :disabled="hasLatexError"
            @click="insertFormula"
            :title="hasLatexError ? 'LaTeX 语法有错误，请修正后再插入' : ''"
          >
            插入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  visible: boolean;
  initialFormula?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'insert', formula: string): void;
}>();

const formulaText = ref('');
const previewHtml = ref('');
const selectedColor = ref('');
const selectedFont = ref('');
const isLatexMode = ref(false); // 默认使用可视化模式（MathQuill）
const formulaInput = ref<HTMLTextAreaElement>();
const hasLatexError = ref(false);
const mqRoot = ref<HTMLDivElement | null>(null);
let mqField: any = null;

// 防抖定时器
let previewTimer: number | null = null;

// 检查 LaTeX 语法是否完整
const checkLatexSyntax = (latex: string): boolean => {
  if (!latex.trim()) return true; // 空内容不算错误
  
  // 检查括号匹配
  const brackets = { '{': '}', '[': ']', '(': ')' };
  const stack: string[] = [];
  
  for (let i = 0; i < latex.length; i++) {
    const char = latex[i];
    
    // 检查开括号
    if (brackets[char as keyof typeof brackets]) {
      stack.push(brackets[char as keyof typeof brackets]);
    }
    // 检查闭括号
    else if (Object.values(brackets).includes(char)) {
      if (stack.length === 0 || stack.pop() !== char) {
        return false; // 括号不匹配
      }
    }
  }
  
  // 检查是否有未闭合的括号
  if (stack.length > 0) {
    return false; // 有未闭合的括号
  }
  
  // 检查常见的 LaTeX 命令是否完整
  const incompleteCommands = [
    /\\sqrt\{[^}]*$/,  // \sqrt{ 没有闭合
    /\\frac\{[^}]*$/,  // \frac{ 没有闭合
    /\\sum_[^{]*$/,    // \sum_ 没有上标
    /\\int_[^{]*$/,    // \int_ 没有上标
    /\\left[^}]*$/,    // \left 没有 \right
  ];
  
  for (const pattern of incompleteCommands) {
    if (pattern.test(latex)) {
      return false;
    }
  }
  
  return true;
};

// 监听可见性变化，聚焦到输入框
watch(() => props.visible, async (visible) => {
  if (visible) {
    // 打开时给 body 打标，隐藏页面上所有行内编辑器工具条
    try { document.body.classList.add('formula-editor-open'); } catch {}
    
    // 先设置初始公式内容
    if (props.initialFormula) {
      console.log('公式编辑器打开，设置初始内容:', props.initialFormula); // 保留关键调试信息
      formulaText.value = props.initialFormula;
      updatePreview();
    }
    
    await nextTick();
    
    if (isLatexMode.value) {
      formulaInput.value?.focus();
      // 在LaTeX模式下，光标移到末尾
      if (formulaInput.value) {
        const len = formulaInput.value.value.length;
        formulaInput.value.setSelectionRange(len, len);
      }
    } else {
      // 初始化MathQuill（会自动设置初始内容）
      await initMathQuill();
    }
  }
  else {
    // 关闭时移除标记
    try { document.body.classList.remove('formula-editor-open'); } catch {}
  }
});

// 写入到 MathQuill（所见即所得）
const writeToMQ = (latex: string) => {
  if (!mqField) return false;
  try {
    mqField.write(latex);
    formulaText.value = mqField.latex();
    updatePreview();
    return true;
  } catch {
    return false;
  }
};

// 点击容器时聚焦 MathQuill，并把光标置于末尾
const focusEditor = () => {
  if (!mqField) return;
  try {
    mqField.focus();
    if (typeof mqField.moveToRightEnd === 'function') {
      mqField.moveToRightEnd();
    }
  } catch {}
};

// 插入符号
const insertSymbol = (symbol: string) => {
  if (!isLatexMode.value && mqField) {
    // 直接把符号写入 MathQuill
    if (writeToMQ(symbol)) return;
  }
  const textarea = formulaInput.value;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = formulaText.value.substring(0, start);
  const after = formulaText.value.substring(end);
  formulaText.value = before + symbol + after;
  nextTick(() => {
    const newPos = start + symbol.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
    updatePreview();
  });
};

// 插入模板
const insertTemplate = (template: string) => {
  // 非 LaTeX 模式 → 交给 MathQuill 直接写入占位 latex
  if (!isLatexMode.value && mqField) {
    // 统一把演示里的 x/y 等替换为占位写法
    const normalized = template
      .replace(/x\^\{y\}/g, '{ }^{ }')
      .replace(/x_\{i\}/g, '{ }_{ }')
      .replace(/\\sqrt\{x\}/g, '\\sqrt{}')
      .replace(/\\sqrt\[n\]\{x\}/g, '\\sqrt[n]{}')
      .replace(/\\frac\{a\}\{b\}/g, '\\frac{}{}')
      // 将 pmatrix 规范为 MathQuill 更稳定的 matrix + 左右括号
      .replace(/\\begin\{pmatrix\}/g, '\\left( \\begin{matrix}')
      .replace(/\\end\{pmatrix\}/g, '\\end{matrix} \\right)');
    if (writeToMQ(normalized)) return;
  }
  // LaTeX 模式 → 写入 textarea
  const textarea = formulaInput.value;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = formulaText.value.substring(0, start);
  const after = formulaText.value.substring(end);
  formulaText.value = before + template + after;
  nextTick(() => {
    const newPos = start + template.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
    updatePreview();
  });
};

// 应用颜色
const applyColor = () => {
  if (!selectedColor.value) return;
  const color = selectedColor.value;
  const textarea = formulaInput.value;
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = formulaText.value.substring(start, end);
  
  if (selectedText) {
    const before = formulaText.value.substring(0, start);
    const after = formulaText.value.substring(end);
    formulaText.value = before + `\\textcolor{${color}}{${selectedText}}` + after;
    updatePreview();
  }
};

// 应用字体
const applyFont = () => {
  if (!selectedFont.value) return;
  const textarea = formulaInput.value;
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = formulaText.value.substring(start, end);
  
  if (selectedText) {
    const before = formulaText.value.substring(0, start);
    const after = formulaText.value.substring(end);
    let wrappedText = selectedText;
    
    if (selectedFont.value === 'bold') {
      wrappedText = `\\mathbf{${selectedText}}`;
    } else if (selectedFont.value === 'italic') {
      wrappedText = `\\mathit{${selectedText}}`;
    }
    
    formulaText.value = before + wrappedText + after;
    updatePreview();
  }
};

// 切换 LaTeX 模式
const toggleLatexMode = async () => {
  // 如果当前在 LaTeX 模式且有语法错误，不允许切换
  if (isLatexMode.value && hasLatexError.value) {
    alert('LaTeX 语法有错误，请修正后再切换模式');
    return;
  }
  
  // 保存当前内容
  const currentContent = formulaText.value;
  
  if (!isLatexMode.value) {
    // 切换回可视化时，初始化 MQ，并把当前 latex 同步进去
    await nextTick();
    // 由于切换视图会销毁并重建 DOM，需要重新创建 MathQuill 实例
    try { if (mqField && typeof mqField.revert === 'function') { mqField.revert(); } } catch {}
    mqField = null;
    
    // 确保内容不会丢失
    formulaText.value = currentContent;
    
    await initMathQuill();
    // 确保预览更新
    updatePreview();
  } else {
    // 切换到 LaTeX 模式时，确保预览更新并聚焦到文本框
    updatePreview();
    await nextTick();
    if (formulaInput.value) {
      formulaInput.value.focus();
      const len = currentContent.length;
      formulaInput.value.setSelectionRange(len, len);
    }
  }
};

// 更新预览（防抖处理）
const updatePreview = () => {
  if (previewTimer) {
    clearTimeout(previewTimer);
  }
  
  previewTimer = window.setTimeout(async () => {
    await doUpdatePreview();
  }, 300);
};

// 实际执行预览更新
const doUpdatePreview = async () => {
  if (!formulaText.value.trim()) {
    previewHtml.value = '<span class="placeholder">预览将显示在这里</span>';
    hasLatexError.value = false;
    return;
  }
  
  // 检查 LaTeX 语法
  const isSyntaxValid = checkLatexSyntax(formulaText.value);
  hasLatexError.value = !isSyntaxValid;
  
  try {
    // 确保 MathJax 已加载
    await ensureMathJaxLoaded();
    
    if (isLatexMode.value) {
      // 显示代码模式：显示原始 LaTeX 代码
      const textColor = isSyntaxValid ? '#333' : '#f56c6c';
      previewHtml.value = `<pre style="margin: 0; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4; color: ${textColor}; white-space: pre-wrap; word-wrap: break-word; text-align: left;">${formulaText.value}</pre>`;
    } else {
      // 数学模式：使用 MathJax 渲染数学公式
      if (!isSyntaxValid) {
        // 语法错误时显示红色错误提示
        previewHtml.value = `<div style="max-width: 100%; overflow: hidden; text-align: center; color: #f56c6c;">LaTeX 语法错误</div>`;
        return;
      }
      
      const w = window as any;
      if (w.MathJax?.typesetPromise) {
        // 创建临时容器
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = `$${formulaText.value}$`;
        
        // 添加到 DOM 进行渲染
        document.body.appendChild(tempDiv);
        
        try {
          // 使用 MathJax 渲染
          await w.MathJax.typesetPromise([tempDiv]);
          
          // 获取渲染后的内容
          const renderedContent = tempDiv.innerHTML;
          
          // 清理临时元素
          document.body.removeChild(tempDiv);
          
          // 检查渲染结果是否有效
          if (renderedContent && !renderedContent.includes('NaN')) {
            previewHtml.value = `<div style="max-width: 100%; overflow: hidden; text-align: center;">${renderedContent}</div>`;
          } else {
            // 如果渲染失败，显示错误
            previewHtml.value = `<div style="max-width: 100%; overflow: hidden; text-align: center; color: #f56c6c;">LaTeX 语法错误</div>`;
            hasLatexError.value = true;
          }
        } catch (renderError) {
          // 清理临时元素
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
          previewHtml.value = `<div style="max-width: 100%; overflow: hidden; text-align: center; color: #f56c6c;">LaTeX 语法错误</div>`;
          hasLatexError.value = true;
        }
      } else {
        previewHtml.value = `<div style="max-width: 100%; overflow: hidden; text-align: center; color: #666;">${formulaText.value}</div>`;
      }
    }
  } catch (error) {
    console.warn('MathJax 渲染错误:', error);
    previewHtml.value = `<span class="error">渲染错误，显示原始公式: ${formulaText.value}</span>`;
    hasLatexError.value = true;
  }
};

// ---- MathQuill 所见即所得（CDN 动态加载，避免打包入口问题） ----
const ensureJqueryLoaded = async () => {
  const w = window as any;
  if (w.jQuery && w.$) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = './libs/jquery.min.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
};

const ensureMathQuillLoadedCDN = async () => {
  const w = window as any;
  if (w.MathQuill?.getInterface) return;
  await ensureJqueryLoaded();
  // CSS
  if (!document.querySelector('link[data-mq-css]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('data-mq-css', 'true');
    link.href = './libs/mathquill.css';
    document.head.appendChild(link);
  }
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = './libs/mathquill.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.body.appendChild(s);
  });
};

const initMathQuill = async () => {
  await ensureMathQuillLoadedCDN();
  await nextTick();
  const w = window as any;
  if (!mqRoot.value) return;
  const MQ = w.MathQuill.getInterface(2);
  // 始终确保绑定到当前可见的 DOM，必要时重建实例
  if (mqField && typeof mqField.revert === 'function') {
    try { mqField.revert(); } catch {}
  }
  mqField = MQ.MathField(mqRoot.value, {
    handlers: {
      edit: () => {
        try {
          const latex = mqField.latex();
          // 只要内容发生变化就更新，包括删除操作
          if (latex !== formulaText.value) {
            formulaText.value = latex;
            updatePreview();
          }
        } catch {}
      }
    }
  });
  
  // MathQuill初始化完成后，如果有初始公式，设置到编辑器中
  if (formulaText.value) {
    try {
      console.log('MathQuill初始化完成，设置内容:', formulaText.value); // 保留关键调试信息
      // 使用latex方法设置内容，这会将LaTeX代码转换为可视化编辑器
      mqField.latex(formulaText.value);
      // 聚焦到编辑器
      setTimeout(() => {
        try {
          mqField.focus();
        } catch (e) {
          console.warn('MathQuill聚焦失败:', e);
        }
      }, 100);
    } catch (error) {
      console.warn('设置MathQuill初始内容失败:', error);
    }
  }
};

// 确保 MathJax 已加载
const ensureMathJaxLoaded = async () => {
  const w = window as any;
  if (w.MathJax?.typesetPromise) {
    return Promise.resolve();
  }
  
  return new Promise<void>((resolve, reject) => {
    // 检查是否已经存在 MathJax 脚本
    const existingScript = document.querySelector('script[src*="mathjax"]');
    if (existingScript) {
      // 等待现有脚本加载完成
      setTimeout(() => {
        if (w.MathJax?.typesetPromise) {
          resolve();
        } else {
          reject(new Error('MathJax 加载失败'));
        }
      }, 1000);
      return;
    }
    
    w.MathJax = w.MathJax || {};
    w.MathJax = Object.assign(w.MathJax, {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
      },
      svg: { 
        fontCache: 'global',
        displayAlign: 'center',
        displayIndent: '0'
      },
      startup: {
        ready: () => {
          w.MathJax.startup.defaultReady();
          w.MathJax.startup.promise.then(() => {
            resolve();
          });
        }
      }
    });
    
    const script = document.createElement('script');
    script.src = './libs/tex-svg.js';
    script.async = true;
    script.onload = () => {
      // 等待 MathJax 完全初始化
      setTimeout(() => {
        if (w.MathJax?.typesetPromise) {
          resolve();
        } else {
          reject(new Error('MathJax 初始化超时'));
        }
      }, 500);
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

// 清除所有内容
const clearContent = () => {
  formulaText.value = '';
  previewHtml.value = '';
  selectedColor.value = '';
  selectedFont.value = '';
  hasLatexError.value = false;
  // 清除 MathQuill 内容
  if (mqField) {
    try {
      mqField.latex('');
    } catch {}
  }
};

// 关闭对话框
const close = () => {
  // 清除所有内容
  clearContent();
  try { document.body.classList.remove('formula-editor-open'); } catch {}
  emit('close');
};

// 处理遮罩层点击
const handleOverlayClick = () => {
  close();
};

// 插入公式
const insertFormula = () => {
  if (!formulaText.value.trim()) {
    // 如果内容为空，直接关闭
    close();
    return;
  }
  
  // 检查 LaTeX 语法是否有效
  const isSyntaxValid = checkLatexSyntax(formulaText.value.trim());
  
  if (!isSyntaxValid) {
    // 语法错误时显示提示
    alert('LaTeX 语法有错误，请修正后再插入公式');
    return;
  }
  
  // 语法正确，插入公式
  emit('insert', formulaText.value.trim());
  close();
};

// 监听初始公式变化
watch(() => props.initialFormula, async (formula) => {
  if (formula) {
    formulaText.value = formula;
    updatePreview();
    
    // 如果弹窗可见且MathQuill已经初始化，同步内容
    if (props.visible && mqField && !isLatexMode.value) {
      try {
        mqField.latex(formula);
        // 聚焦到编辑器
        setTimeout(() => {
          try {
            mqField.focus();
          } catch (e) {
            console.warn('MathQuill聚焦失败:', e);
          }
        }, 100);
      } catch (error) {
        console.warn('同步公式到MathQuill失败:', error);
      }
    }
    
    // 如果在LaTeX模式下，确保光标位置正确
    if (props.visible && isLatexMode.value && formulaInput.value) {
      await nextTick();
      const len = formula.length;
      formulaInput.value.setSelectionRange(len, len);
    }
  }
}, { immediate: true }); // 添加immediate选项，确保初始值也会触发

// 组件销毁时清理定时器
onBeforeUnmount(() => {
  if (previewTimer) {
    clearTimeout(previewTimer);
    previewTimer = null;
  }
  // 清理 MQ 实例，防止遗留引用影响下次打开
  try { if (mqField && typeof mqField.revert === 'function') { mqField.revert(); } } catch {}
  mqField = null;
  try { document.body.classList.remove('formula-editor-open'); } catch {}
});
</script>

<style scoped>
/* 弹窗开启时，隐藏 TinyMCE 等行内编辑器的浮动工具栏 */
:global(body.formula-editor-open .tox.tox-tinymce-aux),
:global(body.formula-editor-open .tox-tinymce-aux),
:global(body.formula-editor-open .tox-editor-container),
:global(body.formula-editor-open .tox-pop),
:global(body.formula-editor-open .tox-toolbar__overflow),
:global(body.formula-editor-open .tox-toolbar__primary),
:global(body.formula-editor-open .tox-toolbar__group),
:global(body.formula-editor-open .tox-toolbar),
:global(body.formula-editor-open .tox-toolbar-overlord) {
  display: none !important;
  visibility: hidden !important;
}

.formula-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647;
}

.formula-editor-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 96%;
  max-width: 1000px;
  max-height: 92vh;
  overflow: visible;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2147483647;
}

.formula-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.formula-editor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.formula-toolbar {
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
  flex-shrink: 0;
  /* 放大可视高度，并允许悬浮面板溢出显示 */
  max-height: 360px;
  overflow: visible;
  overscroll-behavior: contain;
}

.toolbar-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-bottom: 8px;
}

.symbol-group { position: relative; }
.symbol-group .group-panel { pointer-events: auto; }
.group-btn {
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
}
.symbol-group:hover .group-panel { display: grid; }
.group-panel {
  display: none;
  position: absolute;
  z-index: 1000;
  /* 与分组按钮紧贴，避免鼠标经过空隙导致面板消失 */
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  grid-template-columns: repeat(12, minmax(28px, auto));
  gap: 6px;
  max-height: 60vh;
  min-width: 560px;
  max-width: 80vw;
  overflow: auto;
}
.group-panel button { min-width: 28px; padding: 6px 8px; background-color: transparent; border: none; cursor: pointer;}
.panel-wide { grid-template-columns: none; max-width: 80vw; }
.panel-row { display: grid; grid-template-columns: repeat(12, minmax(22px, auto)); gap: 6px; }

/* 老的分散按钮在紧凑模式下隐藏（保留以便回退） */
.compact-hide { display: none; }

.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.toolbar-row:last-child {
  margin-bottom: 0;
}

.toolbar-row button {
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  min-width: 36px;
  text-align: center;
  transition: all 0.2s;
}

.toolbar-row button:hover {
  background: #f0f8ff;
  border-color: #409eff;
  color: #409eff;
}

.format-options {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.format-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.format-group label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.format-group select {
  padding: 4px 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
}

.format-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.format-group input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.formula-input-area {
  padding: 20px;
  flex: 1;
  display: flex;
  gap: 20px;
  /* 让左右两侧保持一致高度，并放大可视区域 */
  height: 320px;
  min-height: 320px;
  max-height: 320px;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
}

.input-section, .preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 50%;
  box-sizing: border-box;
}

.input-section label, .preview-section label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.formula-textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  /* 与右侧预览同高 */
  height: 100%;
  resize: none;
  /* 强制换行和宽度限制 */
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  /* 确保 textarea 不会超出容器 */
  min-width: 0;
  flex-shrink: 1;
}

.formula-textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.formula-preview {
  flex: 1;
  padding: 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #fafafa;
  /* 与左侧输入同高 */
  height: 100%;
  overflow: auto;
  font-size: 14px;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  /* 强制宽度限制和换行 */
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  /* 确保预览框不会超出容器 */
  min-width: 0;
  flex-shrink: 1;
}

/* MathQuill 编辑区与预览等高 */
.mq-editor-wrapper {
  flex: 1;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #fff;
  padding: 10px 12px;
  height: 100%;
  overflow: auto;
  cursor: text;
  /* 强制宽度限制和换行 */
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  /* 确保 MathQuill 不会超出容器 */
  min-width: 0;
  flex-shrink: 1;
  /* 强制换行 */
  white-space: pre-wrap;
  word-break: break-all;
}

.mq-editor-wrapper :deep(.mq-editable-field) {
   outline: none !important;
    box-shadow: none !important;
     border: none !important;
     max-width: 100% !important;
     width: 100% !important;
     word-wrap: break-word !important;
     overflow-wrap: break-word !important;
     overflow-x: hidden !important;
     white-space: pre-wrap !important;
     word-break: break-all !important;
  }
.mq-editor-wrapper :deep(.mq-focused) { 
  outline: none !important; 
  box-shadow: none !important; 
}

/* 优化 MathQuill 空内容占位方框和光标样式，使其不突兀 */
.mq-editor-wrapper :deep(.mq-empty) {
  border: none !important;
  box-shadow: none !important;
}
.mq-editor-wrapper :deep(.mq-cursor) {
  border-left: 2px solid #409eff !important;
}

/* 强制 MathQuill 内部元素换行 */
.mq-editor-wrapper :deep(.mq-math-mode) {
  max-width: 100% !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  overflow-x: hidden !important;
  white-space: pre-wrap !important;
}

.mq-editor-wrapper :deep(.mq-root-block) {
  max-width: 100% !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  overflow-x: hidden !important;
  white-space: pre-wrap !important;
}

/* 强制 MathQuill 所有内部元素换行 */
.mq-editor-wrapper :deep(*) {
  max-width: 100% !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  overflow-x: hidden !important;
  white-space: pre-wrap !important;
}

/* 特别针对 MathQuill 的数学符号元素 */
.mq-editor-wrapper :deep(.mq-symbol) {
  word-break: break-all !important;
  overflow-wrap: anywhere !important;
}

.mq-editor-wrapper :deep(.mq-text) {
  word-break: break-all !important;
  overflow-wrap: anywhere !important;
}

.placeholder {
  color: #999;
  font-style: italic;
}

.error {
  color: #f56c6c;
  font-size: 12px;
}

.formula-editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  flex-shrink: 0;
  min-height: 60px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.hint-icon {
  font-size: 16px;
}

.actions {
  display: flex;
  gap: 12px;
}

.cancel-btn, .insert-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: white;
  border: 1px solid #d0d0d0;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
  border-color: #999;
}

.insert-btn {
  background: #409eff;
  border: 1px solid #409eff;
  color: white;
}

.insert-btn:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.insert-btn.disabled,
.insert-btn:disabled {
  background: #c0c4cc;
  border-color: #c0c4cc;
  color: #ffffff;
  cursor: not-allowed;
  opacity: 0.6;
}

.insert-btn.disabled:hover,
.insert-btn:disabled:hover {
  background: #c0c4cc;
  border-color: #c0c4cc;
  color: #ffffff;
}

/* MathJax 样式调整 */
:deep(.MathJax) {
  font-size: 1em !important;
  max-width: 100% !important;
  overflow: hidden !important;
}

/* 限制预览框内数学公式的尺寸 */
.formula-preview :deep(.MathJax) {
  font-size: 0.9em !important;
  transform: scale(0.8) !important;
  transform-origin: center !important;
}

/* 确保预览内容居中且不溢出 */
.formula-preview :deep(.MathJax_Display) {
  margin: 0 !important;
  text-align: center !important;
  max-width: 100% !important;
  overflow: hidden !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}
</style>
