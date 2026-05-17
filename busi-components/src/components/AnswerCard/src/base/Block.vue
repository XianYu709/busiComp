<template>
  <div
    id="auto-div-1665535f"
    ref="rootRef"
    class="inline-richtext"
    @click="handleClick"
    style="word-wrap: break-word; word-break: normal; overflow-wrap: break-word"
    :class="{ 'is-editing': isEditorVisible }">
    <div
      v-if="isDisplayVisible"
      id="auto-div-384854ea"
      ref="displayRef"
      class="inline-display text-14px leading-24px box-border"
      :style="displayStyle"
      v-html="displayHtml"></div>
    <div v-else id="auto-div-ced7f18b" class="inline-editor">
      <Editor
        style="min-height: 0"
        v-model="innerValue"
        :init="editorInit"
        :inline="true"
        :tinymceScriptSrc="tinymceCdn"
        @update:modelValue="scheduleReflow"
        @onBlur="leaveEdit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick, inject } from "vue";
// @ts-ignore
import Editor from "@tinymce/tinymce-vue";
import { emitEvent, useEventBus } from "@sjjb/utils";

const FORCE_DISPLAY_EVENT = "answer-card-force-display";
const INLINE_ACTIVATE_EVENT = "tinymce-inline-activate";
type ExportFormulaPolicy = "rendered" | "raw-text" | "svg-image";
const DEFAULT_EXPORT_FORMULA_POLICY: ExportFormulaPolicy = "rendered";

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

const isExportMode = inject<any>("isExportMode", null);
const injectedExportFormulaPolicy = inject<{ value: ExportFormulaPolicy } | null>(
  "answerCardExportFormulaPolicy",
  null,
);

const scheduleReflow = () => {
  if (isExportMode?.value) return;
  emitEvent("reflowPages", { reason: "block-edit" });
};

const joinPublicAssetUrl = (basePath = "", assetPath = "") => {
  const normalizedBasePath = basePath.replace(/\/+$/, "");
  const normalizedAssetPath = assetPath.replace(/^\/+/, "");
  return `${normalizedBasePath}/${normalizedAssetPath}`;
};

const tinymceBaseUrl = joinPublicAssetUrl(import.meta.env.VITE_APP_CONTEXT_PATH || "", "tinymce");
const getTinymceAssetUrl = (assetPath: string) => joinPublicAssetUrl(tinymceBaseUrl, assetPath);
const tinymceCdn = getTinymceAssetUrl("tinymce.min.js");

const mathMLTags = [
  "math",
  "maction",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mglyph",
  "mrow",
  "mi",
  "mo",
  "mn",
  "mlabeledtr",
  "ms",
  "mtext",
  "mspace",
  "mstyle",
  "mpadded",
  "mphantom",
  "msup",
  "msub",
  "msubsup",
  "msqrt",
  "mroot",
  "mtable",
  "mtr",
  "mtd",
  "munderover",
  "munder",
  "mover",
  "mmultiscripts",
  "mprescripts",
  "none",
  "semantics",
  "annotation",
  "annotation-xml",
  "maligngroup",
  "malignmark",
  "mlongdiv",
  "mscarries",
  "mscarry",
  "msgroup",
  "msline",
  "msrow",
  "mstack",
];
const mathMLCustomElements = mathMLTags.map(tag => `~${tag}`).join(",");
const mathMLExtendedValidElements = mathMLTags.map(tag => `${tag}[*]`).join(",");
const mathMLChildTags = mathMLTags.join("|");
const mathMLValidChildren = [
  "+body[math]",
  "+div[math]",
  "+p[math]",
  "+span[math]",
  ...mathMLTags.map(tag => `+${tag}[${mathMLChildTags}]`),
].join(",");

const innerValue = ref<string>("");
const isEditing = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const displayRef = ref<HTMLElement | null>(null);
const instanceId = Math.random().toString(36).slice(2);
const isExporting = computed(() => !!isExportMode?.value);
const exportFormulaPolicy = computed<ExportFormulaPolicy>(
  () => injectedExportFormulaPolicy?.value || DEFAULT_EXPORT_FORMULA_POLICY,
);
const isRawTextExportMode = computed(
  () => isExporting.value && exportFormulaPolicy.value === "raw-text",
);
const isEditorVisible = computed(() => isEditing.value && !isExporting.value);
const isDisplayVisible = computed(() => !isEditorVisible.value);

let currentEditor: any = null;

const hasMathML = (html = "") => /<math(?:\s|>|\/)/i.test(html);
const hasRenderedMathMarkup = (html = "") =>
  /<mjx-container(?:\s|>)/i.test(html) || /data-original-mathml=/i.test(html);

const normalizeMathMLWhitespace = (html = "") => {
  const normalizedHtml = html.replace(
    /<span\b[^>]*data-original-mathml=(['"])([\s\S]*?)\1[^>]*>\s*(<math\b[\s\S]*?<\/math>)\s*<\/span>/gi,
    "$3",
  );
  if (!hasMathML(normalizedHtml)) return normalizedHtml;

  return normalizedHtml
    .replace(/<math\b[\s\S]*?<\/math>/gi, math => math.replace(/>\s+</g, "><"))
    .replace(/[\r\n]+\s*(?=<math(?:\s|>))/gi, "")
    .replace(/(<\/math>)\s*[\r\n]+/gi, "$1");
};

/** 浏览器原生 MathML 需要 xmlns，不在此处做 MathJax/SVG 预渲染 */
const ensureMathMlNamespacesInHtml = (html = "") => {
  if (!hasMathML(html)) return html;
  const holder = document.createElement("div");
  holder.innerHTML = html;
  holder.querySelectorAll("math").forEach(el => {
    if (!el.getAttribute("xmlns")) {
      el.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML");
    }
  });
  return holder.innerHTML;
};

const restoreMathSourcesFromRenderedContent = (html = "") => {
  if (!html.includes("data-original-mathml")) {
    return normalizeMathMLWhitespace(html);
  }

  const holder = document.createElement("div");
  holder.innerHTML = html;
  holder.querySelectorAll("[data-original-mathml]").forEach(element => {
    const source = element.getAttribute("data-original-mathml");
    if (source) element.outerHTML = source;
  });
  return normalizeMathMLWhitespace(holder.innerHTML);
};

const extractTextFromMarkup = (markup = "") => {
  if (!markup) return "";
  const holder = document.createElement("div");
  holder.innerHTML = markup;
  return (holder.textContent || "").replace(/\s+/g, " ").trim();
};

const isBlockFormulaElement = (element: Element) => {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "math") return element.getAttribute("display") === "block";
  if (tagName === "mjx-container") return element.getAttribute("display") === "true";
  return false;
};

const resolvePlainFormulaText = (element: Element) => {
  const originalMathml = element.getAttribute("data-original-mathml");
  if (originalMathml) {
    const text = extractTextFromMarkup(originalMathml);
    if (text) return text;
  }

  const parentMathml = element.parentElement?.closest("[data-original-mathml]");
  const parentSource = parentMathml?.getAttribute("data-original-mathml");
  if (parentSource) {
    const text = extractTextFromMarkup(parentSource);
    if (text) return text;
  }

  const textContent = (element.textContent || "").replace(/\s+/g, " ").trim();
  if (textContent) return textContent;

  return originalMathml ? originalMathml.replace(/\s+/g, " ").trim() : "";
};

const replaceFormulaElementWithText = (element: Element, plainText: string) => {
  const replacement = document.createElement(isBlockFormulaElement(element) ? "div" : "span");
  replacement.className = "export-plain-formula";
  replacement.textContent = plainText || " ";
  replacement.style.whiteSpace = "pre-wrap";
  replacement.style.wordBreak = "break-word";
  replacement.style.overflowWrap = "anywhere";
  replacement.style.lineHeight = "inherit";
  replacement.style.fontFamily = "inherit";
  replacement.style.display = replacement.tagName.toLowerCase() === "div" ? "block" : "inline";
  element.replaceWith(replacement);
};

const replaceFormulaNodes = (holder: HTMLElement, selector: string) => {
  holder.querySelectorAll(selector).forEach(element => {
    replaceFormulaElementWithText(element, resolvePlainFormulaText(element));
  });
};

const buildExportPlainHtml = (html = "") => {
  const normalized = normalizeMathMLWhitespace(html);
  if (!normalized) return props.placeholder || " ";
  if (!hasMathML(normalized) && !hasRenderedMathMarkup(normalized)) {
    return normalized || props.placeholder || " ";
  }

  const holder = document.createElement("div");
  holder.innerHTML = normalized;
  holder
    .querySelectorAll("mjx-assistive-mml, .MJX_Assistive_MathML, [data-semantic-speech]")
    .forEach(element => {
      element.remove();
    });

  replaceFormulaNodes(holder, "[data-original-mathml]");
  replaceFormulaNodes(holder, "mjx-container");
  replaceFormulaNodes(holder, "math");

  return holder.innerHTML || props.placeholder || " ";
};

const displayHtml = computed(() => {
  const normalized = normalizeMathMLWhitespace(innerValue.value || "");
  if (isRawTextExportMode.value) {
    return buildExportPlainHtml(normalized);
  }
  const withNs = ensureMathMlNamespacesInHtml(normalized);
  return withNs || props.placeholder || " ";
});

const displayStyle = computed(() => ({
  border: props.border ? `1px solid ${props.color || "#000"}` : "1px solid transparent",
  verticalAlign: "baseline",
  minHeight: `${Math.max(props.minHeight || 0, 28)}px`,
  margin: "0",
  padding: "0",
  fontFamily: "inherit",
  boxSizing: "border-box",
  whiteSpace: "normal",
  wordWrap: "break-word",
  overflowWrap: "break-word",
  wordBreak: "normal",
}));

const applyEditorBodyStyles = (body: HTMLElement) => {
  body.style.whiteSpace = "normal";
  body.style.wordWrap = "break-word";
  body.style.overflowWrap = "break-word";
  body.style.wordBreak = "normal";
};

const applyEditorStateStyles = (body: HTMLElement, focused: boolean) => {
  body.style.border = focused
    ? props.activeBorder
      ? "1px solid blue"
      : "1px solid transparent"
    : props.border
      ? `1px solid ${props.color || "#000"}`
      : "1px solid transparent";
  body.style.minHeight = "0px";
  body.style.height = "auto";
  body.style.padding = "0px 0px";
  body.style.boxSizing = "border-box";
  body.style.lineHeight = "24px";
  body.style.fontSize = "14px";
  body.style.fontFamily = "inherit";
  body.style.margin = "0";
  body.style.outline = "none";
  applyEditorBodyStyles(body);
};

watch(
  () => props.modelValue,
  value => {
    const nextValue = normalizeMathMLWhitespace(value || "");
    if (nextValue !== innerValue.value) innerValue.value = nextValue;
  },
  { immediate: true },
);

watch(innerValue, value => {
  emit("update:modelValue", value);
});

const syncEditorContent = (editorInstance: any = currentEditor) => {
  try {
    const rawContent =
      editorInstance?.getContent?.({ format: "html" }) || editorInstance?.getContent?.();
    if (typeof rawContent !== "string") return;

    const content = restoreMathSourcesFromRenderedContent(rawContent);
    if (content !== innerValue.value) {
      innerValue.value = content;
    }
  } catch (error) {
    console.warn("保存编辑器内容失败:", error);
  }
};

const forceDisplayMode = async () => {
  if (!isEditing.value) return;

  syncEditorContent();

  try {
    currentEditor?.getBody?.()?.blur?.();
  } catch {}

  isEditing.value = false;
  currentEditor = null;
  await nextTick();
};

const enterEdit = async () => {
  if (isEditing.value || isExporting.value) return;
  emitEvent(INLINE_ACTIVATE_EVENT, { id: instanceId });
  isEditing.value = true;
  await nextTick();
};

const leaveEdit = async () => {
  syncEditorContent();
  isEditing.value = false;
  currentEditor = null;
  emit("blur");

  await nextTick();
};

const handleClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  if (isEditing.value || isExporting.value) return;
  void enterEdit();
};

const editorInit = {
  base_url: tinymceBaseUrl,
  suffix: ".min",
  branding: false,
  menubar: false,
  statusbar: false,
  toolbar:
    "undo redo | addLine bold italic underline strikethrough forecolor backcolor alignleft aligncenter alignright alignjustify bullist numlist outdent indent link image table removeformat",
  plugins: "link image table lists",
  quickbars_insert_toolbar: false,
  quickbars_selection_toolbar: false,
  contextmenu: false,
  toolbar_persist: false,
  min_height: 0,
  automatic_uploads: false,
  paste_data_images: true,
  image_title: true,
  language: "zh-Hans",
  language_url: getTinymceAssetUrl("langs/zh-Hans.js"),
  object_resizing: false,
  custom_elements: mathMLCustomElements,
  extended_valid_elements: ["span[class|style|contenteditable|data-*|id]", mathMLExtendedValidElements].join(
    ",",
  ),
  valid_children: mathMLValidChildren,
  resize: false,
  toolbar_mode: "sliding",
  inline_boundaries: false,
  setup(editor: any) {
    const onRelayout = () => {
      try {
        editor.fire("ResizeWindow");
      } catch {}
    };

    editor.on("init", () => {
      currentEditor = editor;
      const toolbar = editor.editorContainer?.querySelector(".tox-editor-header") as HTMLElement | null;
      if (toolbar) {
        toolbar.style.zIndex = "9999";
      }

      const body = editor.getBody();
      if (body) {
        applyEditorStateStyles(body, false);
      }
    });

    editor.on("focus", () => {
      currentEditor = editor;
      const toolbar = editor.editorContainer?.querySelector(".tox-editor-header") as HTMLElement | null;
      if (toolbar) {
        toolbar.style.zIndex = "9999";
        toolbar.style.display = "";
      }
      const body = editor.getBody();
      if (body) {
        applyEditorStateStyles(body, true);
      }
    });

    editor.on("blur", () => {
      syncEditorContent(editor);
      const body = editor.getBody();
      if (body) {
        applyEditorStateStyles(body, false);
      }
    });

    editor.on("NodeChange", () => {
      const body = editor.getBody();
      if (body) {
        applyEditorStateStyles(body, editor.hasFocus());
      }
    });

    window.addEventListener("scroll", onRelayout, true);
    window.addEventListener("resize", onRelayout);

    editor.on("remove", () => {
      if (currentEditor === editor) {
        currentEditor = null;
      }
      window.removeEventListener("scroll", onRelayout, true);
      window.removeEventListener("resize", onRelayout);
    });
  },
};

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

const handleGlobalActivate = (event: any) => {
  const otherId = event?.detail?.id;
  if (otherId && otherId !== instanceId) {
    void forceDisplayMode();
  }
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  if (rootRef.value?.contains(target)) return;

  const inTinyUi = !!target.closest(
    ".tox, .tox-tinymce-aux, .tox-tinymce-inline, .tox-editor-header",
  );
  if (inTinyUi) return;

  if (isEditing.value) {
    void forceDisplayMode();
  }
};

const handleForceDisplay = () => {
  void forceDisplayMode();
};

useEventBus(INLINE_ACTIVATE_EVENT, handleGlobalActivate as any);
useEventBus(FORCE_DISPLAY_EVENT, handleForceDisplay as any);

onMounted(async () => {
  document.addEventListener("click", handleDocumentClick, true);
  await nextTick();
  await new Promise(resolve => requestAnimationFrame(resolve));
  emit("mount-done");
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick, true);
});

watch(
  () => isExportMode?.value,
  exporting => {
    if (exporting) {
      void forceDisplayMode();
    }
  },
);
</script>

<style lang="scss" scoped>
.inline-richtext {
  :deep(hr) {
    border: 0;
    border-top: 1px solid #333;
    display: block;
    height: 0;
    margin: 8px 0;
  }

  :deep(u) {
    text-decoration: none !important;
    border-bottom: 1px solid currentColor !important;
    display: inline-block !important;
    line-height: 1 !important;
    vertical-align: baseline !important;
    white-space: pre !important;
    min-width: 1em !important;
  }

  :deep([data-original-mathml]) {
    display: inline-block !important;
    line-height: inherit !important;
    font-size: inherit !important;
  }

  :deep(math) {
    line-height: inherit !important;
  }

  :deep(mjx-container),
  :deep(mjx-container svg) {
    display: inline-block !important;
    line-height: inherit !important;
  }

  :deep(mjx-assistive-mml) {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
}
</style>
