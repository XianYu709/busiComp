<template>
  <div
    id="auto-div-1665535f"
    ref="rootRef"
    class="inline-richtext"
    @click="handleClick"
    style="word-wrap: break-word; word-break: break-all"
    :class="{ 'is-editing': isEditing }">
    <p
      v-if="!isEditing"
      id="auto-div-384854ea"
      class="text-14px leading-24px box-border"
      style="
        border: 1px solid transparent;
        vertical-align: baseline;
        min-height: 0;
        margin: 0;
        padding: 0;
      "
      v-html="innerValue || placeholder"></p>
    <div v-else id="auto-div-ced7f18b" class="inline-editor">
      <Editor
        style="min-height: 0"
        v-model="innerValue"
        :init="editorInit"
        :inline="true"
        :tinymceScriptSrc="tinymceCdn"
        @onBlur="leaveEdit" />
    </div>

    <!-- 公式编辑器对话框 -->
    <FormulaEditor
      :visible="showFormulaEditor"
      :initialFormula="currentFormula"
      @close="closeFormulaEditor"
      @insert="insertFormula" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
// 使用官方 Vue 集成 @tinymce/tinymce-vue
// 项目未安装依赖时，可使用 CDN scriptSrc 方式
// @ts-ignore
import Editor from "@tinymce/tinymce-vue";
import FormulaEditor from "./FormulaEditor.vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string | undefined;
    placeholder?: string;
    minHeight?: number;
    color?: string;
    border?: boolean;
    activeBorder?: boolean;
    editViewMerge?: boolean;
  }>(),
  {
    border: true,
    activeBorder: false,
    editViewMerge: true,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "blur"): void;
  (e: "mount-done"): void;
}>();

const innerValue = ref<string>("");
const isEditing = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const instanceId = Math.random().toString(36).slice(2);
let typesetTimer: number | null = null;
const containerHeight = ref<number>(28);

// 公式编辑器相关状态
const showFormulaEditor = ref(false);
const currentFormula = ref("");
let currentEditor: any = null;
let originalContentBeforeEdit = ""; // 保存进入编辑前的原始内容
let isProtectingFormula = false; // 公式保护标志
let userHasEditedContent = false; // 用户是否主动编辑了内容

const tinymceCdn = import.meta.env.VITE_APP_CONTEXT_PATH + "/tinymce/tinymce.min.js";

watch(
  () => props.modelValue,
  v => {
    if (v !== innerValue.value) innerValue.value = v || "";
  },
  { immediate: true },
);

// 拦截innerValue的修改，保护公式内容
watch(innerValue, (newValue, oldValue) => {
  // 只有在保护模式下且用户没有主动编辑时才阻止修改
  if (
    isProtectingFormula &&
    !userHasEditedContent &&
    originalContentBeforeEdit.includes("$") &&
    !newValue.includes("$") &&
    oldValue.includes("$")
  ) {
    nextTick(() => {
      innerValue.value = oldValue; // 恢复原始值
    });
    return;
  }

  emit("update:modelValue", newValue);
});

// 内容变化时，在非编辑态自动触发公式渲染（防抖）
watch([innerValue, isEditing], async ([, editing]) => {
  if (editing) return;
  if (typesetTimer) {
    window.clearTimeout(typesetTimer);
    typesetTimer = null;
  }
  typesetTimer = window.setTimeout(async () => {
    try {
      await ensureMathJaxLoaded();
      await nextTick(); // 确保 DOM 更新完成
      typesetMath();
    } catch {}
  }, 150); // 稍微增加防抖时间
});

const handleClick = (event: MouseEvent) => {
  // 阻止事件冒泡，确保点击事件被正确处理
  event.preventDefault();
  event.stopPropagation();

  // 如果已经在编辑状态，直接返回
  if (isEditing.value) return;

  // 检查是否点击的是公式
  const target = event.target as HTMLElement;
  const mathElement = target.closest(".MathJax, .MathJax_Display, mjx-container, .math-formula");

  if (mathElement) {
    // 双击公式时打开公式编辑器
    if (event.detail === 2) {
      const formulaText = extractFormulaFromMathJax(mathElement);
      if (formulaText) {
        currentFormula.value = formulaText;
        showFormulaEditor.value = true;
        return;
      } else {
        // 如果提取失败，尝试从innerValue中提取第一个公式
        if (innerValue.value) {
          const latexMatch = innerValue.value.match(/\$([^$]+)\$/);
          if (latexMatch && latexMatch[1]) {
            currentFormula.value = latexMatch[1].trim();
            showFormulaEditor.value = true;
            return;
          }
        }
      }
    }
    // 单击公式不进入编辑状态，只有双击才编辑
    return;
  }

  // 先计算当前容器高度，避免布局偏移
  if (rootRef.value) {
    const displayEl = rootRef.value.querySelector(".inline-display") as HTMLElement;
    if (displayEl) {
      containerHeight.value = Math.max(displayEl.offsetHeight, 28);
    }
  }

  // 立即进入编辑状态
  enterEdit();
};

const enterEdit = async () => {
  // 如果已经在编辑状态，直接返回
  if (isEditing.value) return;

  // 保存进入编辑前的原始内容
  originalContentBeforeEdit = innerValue.value;
  userHasEditedContent = false; // 重置编辑标志

  // 如果包含公式，启用保护模式
  if (originalContentBeforeEdit.includes("$")) {
    isProtectingFormula = true;
  }

  window.dispatchEvent(new CustomEvent("tinymce-inline-activate", { detail: { id: instanceId } }));
  isEditing.value = true;

  // 简化初始化，让TinyMCE的init事件处理渲染
  await nextTick();
};

const leaveEdit = async () => {
  isEditing.value = false;
  emit("blur");

  // 延迟处理，确保状态切换完成
  await nextTick();

  // 强化保护逻辑：如果原始内容有公式，用户没有编辑，且当前内容没有公式，则恢复
  const hadFormula = originalContentBeforeEdit.includes("$");
  const hasFormula = innerValue.value.includes("$");
  const shouldProtect = isProtectingFormula && !userHasEditedContent && hadFormula && !hasFormula;

  // 额外检查：如果内容长度明显变短，也可能是意外丢失
  const contentLengthShrunk = innerValue.value.length < originalContentBeforeEdit.length * 0.5;
  const shouldProtectByLength =
    isProtectingFormula && !userHasEditedContent && hadFormula && contentLengthShrunk;

  if (shouldProtect || shouldProtectByLength) {
    innerValue.value = originalContentBeforeEdit;
    await nextTick();
  }

  // 关闭保护模式并清空保存的原始内容
  isProtectingFormula = false;
  originalContentBeforeEdit = "";
  userHasEditedContent = false;

  // 确保 MathJax 已加载，再进行渲染
  try {
    await ensureMathJaxLoaded();
    await nextTick(); // 确保 DOM 更新完成
    typesetMath();
  } catch {}
};

// 检查公式内容是否被破坏（暂时不使用，保留作为备用）
const isFormulaContentDamaged = (original: string, current: string): boolean => {
  return false; // 简化处理
};

const editorInit = {
  branding: false,
  menubar: false,
  statusbar: false,
  toolbar:
    "undo redo | insertMath  addLine bold italic underline strikethrough  forecolor backcolor  alignleft aligncenter alignright alignjustify bullist numlist outdent indent  link image table removeformat",
  plugins: "link image table lists code autoresize",
  quickbars_insert_toolbar: false,
  quickbars_selection_toolbar: false,
  contextmenu: false,
  // 关闭持久工具条，让工具条随选区与页面滚动重定位
  toolbar_persist: false,
  min_height: "0",
  autoresize_bottom_margin: 0,
  automatic_uploads: false,
  paste_data_images: true,
  image_title: true,
  language: "zh-Hans",
  language_url: import.meta.env.VITE_APP_CONTEXT_PATH + "/tinymce/langs/zh-Hans.js",
  // 优化渲染性能
  object_resizing: false,
  // valid_elements: '*[*]', // 简洁：允许所有属性（根据安全要求可改成更细粒度）
  extended_valid_elements: "span[class|style|contenteditable|data-*|id]",
  resize: false,
  // 防止布局偏移的关键配置
  toolbar_mode: "sliding",
  // 确保编辑器不会影响布局
  inline_boundaries: false,
  // 进入编辑时自动聚焦，避免需要点击第二次
  setup(editor: any) {
    editor.on("init", () => {
      const body = editor.getBody();
      if (body) {
        // 强制保持样式一致性
        body.style.border = props.border
          ? `1px solid  ${props.color || "#000"}`
          : "1px solid transparent";
        body.style.height = "auto";
        body.style.padding = "0px 0px";
        body.style.boxSizing = "border-box";
        body.style.lineHeight = "24px";
        body.style.fontSize = "14px";
        body.style.fontFamily = "inherit";
        body.style.margin = "0";
        body.style.outline = "none";
        body.style.minHeight = "0";
      }

      // 延迟聚焦，确保编辑器完全初始化
      setTimeout(async () => {
        try {
          const toolbar = editor.editorContainer?.querySelector(".tox-editor-header");

          const body = editor.getBody();
          if (body) {
            // 确保编辑器内容区域样式与显示区域完全一致
            body.style.minHeight = "0px";
            body.style.height = "auto";
            body.style.padding = "0px 0px";
            body.style.boxSizing = "border-box";
            body.style.lineHeight = "24px";
            body.style.fontSize = "14px";
            body.style.fontFamily = "inherit";
            body.style.margin = "0";
            body.style.outline = "none";

            // 在编辑器中也渲染数学公式
            await renderMathInEditorSafe(body);
          }

          // 聚焦和选择内容
          // editor.focus();
          // editor.selection.select(body, true);
          // editor.selection.collapse(false);
        } catch (e) {
          console.warn("TinyMCE 初始化失败:", e);
        }
      }, 200); // 增加延迟时间以确保MathJax加载完成
    });

    editor.on("init", () => {
      const toolbar = editor.editorContainer?.querySelector(".tox-editor-header");
      toolbar.style.zIndex = "9999";
    });

    // 点击时显示 toolbar
    editor.on("focus", () => {
      const toolbar = editor.editorContainer?.querySelector(".tox-editor-header");
      toolbar.style.zIndex = "9999";
      if (toolbar) toolbar.style.display = "";
      const body = editor.getBody();
      if (body) {
        // 强制保持样式一致性
        body.style.border = props.border ? "1px solid blue" : "1px solid transparent";
        body.style.minHeight = "0px";
        body.style.height = "auto";
        body.style.padding = "0px 0px";
        body.style.boxSizing = "border-box";
        body.style.lineHeight = "24px";
        body.style.fontSize = "14px";
        body.style.fontFamily = "inherit";
        body.style.margin = "0";
        body.style.outline = "none";
        body.style.border = props.activeBorder ? `1px solid blue` : "1px solid transparent";
      }
    });

    // 失焦后隐藏 toolbar
    editor.on("blur", () => {
      const toolbar = editor.editorContainer?.querySelector(".tox-editor-header");

      const body = editor.getBody();
      if (body) {
        // 强制保持样式一致性
        body.style.border = props.border
          ? `1px solid  ${props.color || "#000"}`
          : "1px solid transparent";
        body.style.height = "auto";
        body.style.padding = "0px 0px";
        body.style.boxSizing = "border-box";
        body.style.lineHeight = "24px";
        body.style.fontSize = "14px";
        body.style.minHeight = "0";
        body.style.fontFamily = "inherit";
        body.style.margin = "0";
        body.style.outline = "none";
      }
    });

    // 页面滚动/尺寸变化时，通知 TinyMCE 重算定位
    const onRelayout = () => {
      try {
        // TinyMCE 监听窗口事件进行 UI 重新定位，额外触发一次以确保位置跟随
        editor.fire("ResizeWindow");
      } catch {}
    };
    const onWindowScroll = () => onRelayout();
    const onWindowResize = () => onRelayout();

    window.addEventListener("scroll", onWindowScroll, true);
    window.addEventListener("resize", onWindowResize);

    // 编辑器销毁时移除监听
    editor.on("remove", () => {
      window.removeEventListener("scroll", onWindowScroll, true);
      window.removeEventListener("resize", onWindowResize);
    });

    // editor.ui.registry.addButton("addLine", {
    //   text: "插入横线",
    //   tooltip: "插入长横线",
    //   onAction: () => {},
    // });

    // 插入数学公式（LaTeX）按钮
    editor.ui.registry.addButton("insertMath", {
      text: "公式",
      tooltip: "插入数学公式 (LaTeX)",
      onAction: () => {
        currentEditor = editor;
        currentFormula.value = "";
        showFormulaEditor.value = true;
      },
    });

    // 监听内容变化，确保样式保持一致
    editor.on("NodeChange", () => {
      const body = editor.getBody();
      if (body) {
        // 强制保持样式一致性
        body.style.minHeight = "0px";
        body.style.height = "auto";
        body.style.padding = "0px 0px";
        body.style.boxSizing = "border-box";
        body.style.lineHeight = "24px";
        body.style.fontSize = "14px";
        body.style.fontFamily = "inherit";
        body.style.margin = "0";
        body.style.outline = "none";
      }
    });

    // 监听内容变化，实时渲染公式
    let renderTimer: any = null;
    let isInitializing = true; // 标记是否在初始化阶段

    // 延迟标记初始化完成，避免初始化时的input事件被误判为用户编辑
    setTimeout(() => {
      isInitializing = false;
    }, 1000);

    editor.on("input", () => {
      // 只有在初始化完成后才标记为用户编辑
      if (!isInitializing) {
        userHasEditedContent = true;
      } else {
      }

      const body = editor.getBody();
      if (body && body.innerHTML.includes("$")) {
        // 防抖渲染，避免频繁渲染影响性能
        if (renderTimer) {
          clearTimeout(renderTimer);
        }
        renderTimer = setTimeout(async () => {
          await renderMathInEditorSafe(body);
        }, 300);
      }
    });

    // 监听键盘事件，检测真正的编辑操作
    editor.on("keydown", (e: any) => {
      // 只检测真正的编辑键：删除键、退格键、字符键、快捷键
      // 排除纯导航键（方向键、Tab、Escape等）
      const isDeleteKey = [8, 46].includes(e.keyCode); // 退格、删除
      const isCharacterKey =
        (e.keyCode >= 48 && e.keyCode <= 90) || // 字符键
        (e.keyCode >= 96 && e.keyCode <= 111) || // 数字键盘
        [32, 13].includes(e.keyCode); // 空格、回车
      const isEditShortcut =
        (e.ctrlKey || e.metaKey) && [65, 67, 86, 88, 90, 89].includes(e.keyCode); // Ctrl+A/C/V/X/Z/Y

      if (isDeleteKey || isCharacterKey || isEditShortcut) {
        userHasEditedContent = true;
      }
    });

    // 监听编辑器失去焦点时，智能保存内容
    editor.on("blur", () => {
      try {
        const content = editor.getContent();

        // 如果用户主动编辑了内容，或者原始内容不包含公式，则更新innerValue
        if (userHasEditedContent || !originalContentBeforeEdit.includes("$")) {
          if (content !== innerValue.value) {
            innerValue.value = content;
          }
        } else {
          // 如果原始内容包含公式且用户没有主动编辑，不更新innerValue以保护公式
        }
      } catch (e) {
        console.warn("保存编辑器内容失败:", e);
      }
    });
  },
};

// 允许从本地选择图片并以内嵌 dataURL 的形式插入
// 注意：此方式不走后端上传，仅用于本地快速插图
(editorInit as any).file_picker_types = "image";
(editorInit as any).file_picker_callback = (cb: any, _value: any, meta: any) => {
  if (meta?.filetype !== "image") return;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => {
    const file = (input.files && input.files[0]) || null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      cb(result, { title: file.name || "image" });
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

// -------- MathJax 支持（TeX 渲染为 SVG）--------
const ensureMathJaxLoaded = async () => {
  const w = window as any;
  if (w.__mathjaxLoading) {
    return w.__mathjaxLoading;
  }
  if (w.MathJax?.typesetPromise) {
    return Promise.resolve();
  }
  w.MathJax = w.MathJax || {};
  w.MathJax = Object.assign(w.MathJax, {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
      processEscapes: true,
      processEnvironments: true,
    },
    options: {
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      ignoreHtmlClass: "tex2jax_ignore",
      processHtmlClass: "tex2jax_process",
    },
    svg: {
      fontCache: "global",
      displayAlign: "center",
      displayIndent: "0",
    },
    startup: {
      ready: () => {
        w.MathJax.startup.defaultReady();
        // 添加钩子来保存原始LaTeX到渲染后的元素中
        w.MathJax.startup.promise.then(() => {
          const originalTypeset = w.MathJax.typesetPromise;
          w.MathJax.typesetPromise = function (elements) {
            // 在渲染前保存原始LaTeX
            if (elements) {
              elements.forEach((el: HTMLElement) => {
                const mathElements = el.querySelectorAll(
                  'script[type="math/tex"], script[type="math/tex; mode=display"]',
                );
                mathElements.forEach((script: HTMLScriptElement) => {
                  const latex = script.textContent || script.innerHTML;
                  if (latex && script.parentElement) {
                    script.parentElement.setAttribute("data-original-latex", latex);
                  }
                });
              });
            }

            return originalTypeset.call(this, elements).then(() => {
              // 渲染后，将LaTeX数据添加到渲染后的元素
              if (elements) {
                elements.forEach((el: HTMLElement) => {
                  const mjxContainers = el.querySelectorAll("mjx-container");
                  mjxContainers.forEach((container: HTMLElement) => {
                    const parent = container.parentElement;
                    if (parent) {
                      const latex = parent.getAttribute("data-original-latex");
                      if (latex) {
                        container.setAttribute("data-latex", latex);
                        container.setAttribute("title", `公式: ${latex}`);
                        container.style.cursor = "pointer";
                      }
                    }
                  });
                });
              }
            });
          };
        });
      },
    },
  });
  w.__mathjaxLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = e => reject(e);
    document.head.appendChild(script);
  });
  return w.__mathjaxLoading;
};

const typesetMath = async () => {
  await nextTick();
  const w = window as any;
  const mj = w.MathJax;
  if (!mj?.typesetPromise) return;

  // 仅对展示容器 typeset，避免编辑时干扰
  const container = rootRef.value as HTMLElement | null;
  if (!container) return;

  const displayEl = container.querySelector(".inline-display");
  if (!displayEl) return;

  // 检查是否包含数学公式，避免不必要的渲染
  const hasMath = displayEl.textContent?.includes("$") || displayEl.innerHTML?.includes("$");
  if (!hasMath) return;

  try {
    // 预处理：为每个LaTeX公式添加数据属性
    const content = displayEl.innerHTML;
    const latexMatches = content.match(/\$([^$]+)\$/g);
    if (latexMatches) {
      let processedContent = content;
      latexMatches.forEach(match => {
        const latex = match.slice(1, -1); // 移除$符号
        // 将$formula$替换为带有数据属性的span包装
        const wrappedFormula = `<span data-original-latex="${latex.replace(/"/g, "&quot;")}">${match}</span>`;
        processedContent = processedContent.replace(match, wrappedFormula);
      });
      displayEl.innerHTML = processedContent;
    }

    // 添加渲染前的视觉提示
    (displayEl as HTMLElement).style.opacity = "0.7";
    await mj.typesetPromise([displayEl]);

    // 渲染完成后，为MathJax容器添加交互属性
    const mjxContainers = displayEl.querySelectorAll("mjx-container");
    mjxContainers.forEach((container: HTMLElement) => {
      const parent = container.parentElement;
      if (parent) {
        const latex = parent.getAttribute("data-original-latex");
        if (latex) {
          container.setAttribute("data-latex", latex);
          container.setAttribute("title", `双击编辑公式: ${latex}`);
          container.style.cursor = "pointer";
          container.classList.add("math-formula");
        }
      }
    });

    // 渲染完成后恢复透明度
    (displayEl as HTMLElement).style.opacity = "1";
  } catch (error) {
    // 渲染失败时恢复透明度
    (displayEl as HTMLElement).style.opacity = "1";
    console.warn("MathJax 渲染失败:", error);
  }
};

// 在编辑器中安全渲染数学公式
const renderMathInEditorSafe = async (editorBody: HTMLElement) => {
  if (!editorBody) return;

  const w = window as any;
  const mj = w.MathJax;
  if (!mj?.typesetPromise) return;

  // 检查是否包含LaTeX公式且尚未渲染
  const content = editorBody.innerHTML;
  if (!content.includes("$") || content.includes("mjx-container")) return;

  try {
    // 直接渲染，不添加复杂的保存机制
    await mj.typesetPromise([editorBody]);

    // 渲染完成后，为所有MathJax容器添加编辑器样式
    const mjxContainers = editorBody.querySelectorAll("mjx-container");
    mjxContainers.forEach((container: HTMLElement) => {
      // 设置样式让公式在编辑器中正确显示
      container.style.cursor = "text";
      container.style.display = "inline-block";
      container.style.margin = "0 2px";
      container.style.verticalAlign = "baseline";

      // 允许公式被选中，但防止内容被直接编辑
      container.setAttribute("contenteditable", "false");

      // 添加双击事件来编辑公式
      container.addEventListener("dblclick", e => {
        e.preventDefault();
        e.stopPropagation();

        // 尝试提取公式内容
        const latex = extractFormulaFromMathJax(container);
        if (latex) {
          currentFormula.value = latex;
          showFormulaEditor.value = true;
        }
      });
    });
  } catch (error) {
    console.warn("编辑器中MathJax渲染失败:", error);
  }
};

// 保留原函数作为备用
const renderMathInEditor = renderMathInEditorSafe;

const handleGlobalActivate = (e: any) => {
  const otherId = e?.detail?.id;
  if (otherId && otherId !== instanceId) {
    isEditing.value = false;
  }
};

const handleDocumentClick = (ev: MouseEvent) => {
  const target = ev.target as HTMLElement | null;
  if (!target) return;

  // 点击在本组件容器内，放行
  if (rootRef.value && rootRef.value.contains(target)) return;

  // 点击在 TinyMCE 自身悬浮 UI（工具条/菜单/颜色面板等）内，放行
  const inTinyUi = !!target.closest(
    ".tox, .tox-tinymce-aux, .tox-tinymce-inline, .tox-editor-header",
  );
  if (inTinyUi) return;

  // 其他位置视为点击空白，收起
  if (isEditing.value) {
    isEditing.value = false;
  }
};

// 关闭公式编辑器
const closeFormulaEditor = () => {
  showFormulaEditor.value = false;
  currentEditor = null;
  currentFormula.value = "";
};

// 从MathJax渲染的元素中提取原始LaTeX公式
const extractFormulaFromMathJax = (mathElement: Element): string => {
  // 尝试从MathJax元素的data属性中获取原始LaTeX
  const mjxContainer = mathElement.closest("mjx-container");
  if (mjxContainer) {
    const mathJaxData =
      mjxContainer.getAttribute("data-latex") || mjxContainer.getAttribute("data-formula");
    if (mathJaxData) {
      // 如果title包含"双击编辑公式:"前缀，移除它
      return mathJaxData.replace(/^双击编辑公式:\s*/, "").trim();
    }
  }

  // 尝试从父元素的data属性中获取LaTeX
  const parentWithData = mathElement.closest("[data-original-latex]");
  if (parentWithData) {
    const latex = parentWithData.getAttribute("data-original-latex");
    if (latex) return latex.trim();
  }

  // 尝试从script标签中获取LaTeX（MathJax v2风格）
  const scriptTag =
    mathElement.querySelector('script[type="math/tex"]') ||
    mathElement.closest("*").querySelector('script[type="math/tex"]');
  if (scriptTag && scriptTag.textContent) {
    return scriptTag.textContent.trim();
  }

  // 尝试从父元素的HTML中提取LaTeX
  const container = mathElement.closest(".inline-display");
  if (container) {
    // 首先尝试从原始的innerValue中提取
    if (innerValue.value) {
      const latexMatches = innerValue.value.match(/\$([^$]+)\$/g);
      if (latexMatches && latexMatches.length > 0) {
        // 如果只有一个公式，直接返回
        if (latexMatches.length === 1) {
          return latexMatches[0].slice(1, -1).trim();
        }
        // 如果有多个公式，返回第一个（后续可以改进为根据位置判断）
        return latexMatches[0].slice(1, -1).trim();
      }
    }

    // 从HTML内容中提取
    if (container.innerHTML) {
      const latexMatch = container.innerHTML.match(/\$([^$]+)\$/);
      if (latexMatch && latexMatch[1]) {
        return latexMatch[1].trim();
      }
    }
  }

  return "";
};

// 插入公式：插入 LaTeX 后立即在编辑区域触发渲染
const insertFormula = async (formula: string) => {
  if (formula) {
    const latex = ` $${formula}$ `;

    if (currentEditor) {
      // 如果在编辑状态，插入到编辑器
      currentEditor.insertContent(latex);
      // 同步编辑器内容到显示值
      try {
        const html = currentEditor.getContent?.({ format: "html" }) || currentEditor.getContent?.();
        if (typeof html === "string") innerValue.value = html;
      } catch {}
      // 退出编辑态并在展示区渲染
      isEditing.value = false;
    } else {
      // 如果不在编辑状态（双击公式编辑），直接更新内容
      // 查找并替换现有的公式
      if (innerValue.value && innerValue.value.includes("$")) {
        // 替换第一个找到的公式
        innerValue.value = innerValue.value.replace(/\$[^$]*\$/, latex);
      } else {
        // 如果没有现有公式，直接添加
        innerValue.value = (innerValue.value || "") + latex;
      }
    }

    await nextTick();
    try {
      await ensureMathJaxLoaded();
    } catch {}
    typesetMath();
  }
  closeFormulaEditor();
};

onMounted(async () => {
  // 初始仅展示，不进入编辑
  window.addEventListener("tinymce-inline-activate", handleGlobalActivate as any);
  document.addEventListener("click", handleDocumentClick, true);
  // 组件挂载后加载 MathJax 并对已有内容进行一次渲染
  ensureMathJaxLoaded()
    .then(() => typesetMath())
    .catch(() => {});
  await nextTick();
  await new Promise(r => requestAnimationFrame(r));
  emit("mount-done");
});

onBeforeUnmount(() => {
  window.removeEventListener("tinymce-inline-activate", handleGlobalActivate as any);
  document.removeEventListener("click", handleDocumentClick, true);
});
</script>
