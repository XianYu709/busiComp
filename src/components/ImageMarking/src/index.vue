<template>
  <div class="z-0 relative">
    <img class="w-full" ref="imageRef" :src="imgUrl" @load="initCanvas" alt="图片" />
    <canvas
      ref="annotationCanvasRef"
      tabindex="0"
      :class="['annotation-layer', cursorClass]"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import type { Annotation, AbsoluteCoordinates, ResizeHandle, ResizeHandleType } from "./types";

// Props
interface Props {
  imgUrl: string | undefined;
  annotations?: Annotation[];
  activeType?: string;
  selectedColor?: string;
  enableDraw?: boolean;
  checkTextSelection?: boolean;
  minSize?: number; // px
  enableEdit?: boolean;
  annotationExtra: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  annotations: () => [],
  activeType: "",
  imgUrl: "",
  selectedColor: "#f38ba8",
  enableDraw: true,
  checkTextSelection: true,
  minSize: 5,
  enableEdit: true,
  annotationExtra: undefined,
});

const imageRef = ref<HTMLImageElement | null>(null);

// Emits
type deleteEvent = { idx: number; item: Annotation; id: string };
interface Emits {
  (e: "annotation-create", annotation: Annotation): void;
  (e: "annotation-select", index: number, annotation: Annotation): void;
  (e: "annotation-update", index: number, annotation: Annotation): void;
  (e: "annotation-delete", deleteEvent: deleteEvent): void;
  (e: "update:annotations", annotations: Annotation[]): void;
}
const emit = defineEmits<Emits>();

type Ann = Annotation & { active?: boolean };
type AbsRect = { x: number; y: number; width: number; height: number };
type HoverHandle = ResizeHandleType | null;

// Refs
const annotationCanvasRef = ref<HTMLCanvasElement>();
const currentImageSize = ref({ width: 0, height: 0 });

const modelAnnotations = ref<Ann[]>([]);

const syncFromProps = () => {
  modelAnnotations.value = (props.annotations || []).map(a => ({
    ...(a as Ann),
    extra: (a as any).extra ?? props.annotationExtra,
  }));
};

const emitAnnotations = (list: Ann[]) => {
  emit("update:annotations", list as Annotation[]);
};

const setActiveIndex = (index: number) => {
  const list = modelAnnotations.value.map((a, i) => ({ ...a, active: i === index }));
  modelAnnotations.value = list;
  emitAnnotations(list);
};

const clearActive = () => {
  const list = modelAnnotations.value.map(a => ({ ...a, active: false }));
  modelAnnotations.value = list;
  emitAnnotations(list);
};

const updateAtIndex = (index: number, patch: Partial<Ann>) => {
  const list = modelAnnotations.value.map((a, i) =>
    i === index ? ({ ...a, ...patch } as Ann) : a,
  );
  modelAnnotations.value = list;
  emitAnnotations(list);
  return list[index];
};

const removeAtIndex = (index: number) => {
  if (index < 0 || index >= modelAnnotations.value.length) return;
  const list = modelAnnotations.value.slice();
  list.splice(index, 1);
  modelAnnotations.value = list.map(a => ({ ...a, active: false }));
  emitAnnotations(modelAnnotations.value);
};

const isEditableTarget = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return !!el.isContentEditable;
};

const debounce = <T extends (...args: any[]) => void>(fn: T, wait = 80) => {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
};

const emitUpdateDebounced = debounce((index: number, ann: Ann) => {
  emit("annotation-update", index, ann as Annotation);
});

const imageBlueFill = "rgba(10,147,252,.2)";
const imageBlueStroke = "#004fff";

const normalizeHex = (c: string) => {
  const s = c.trim();
  if (!s.startsWith("#")) return s;
  if (s.length === 4) {
    const r = s[1],
      g = s[2],
      b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return s;
};

const hexToRgba = (hex: string, alpha: number) => {
  const h = normalizeHex(hex);
  if (!h.startsWith("#") || (h.length !== 7 && h.length !== 9)) return hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const getSelectedColor = (annotation: { color?: string }) =>
  annotation.color || props.selectedColor;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const genId = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c: any = typeof crypto !== "undefined" ? crypto : null;
    if (c && typeof c.randomUUID === "function") return c.randomUUID();
  } catch {}
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

// ---------- 坐标：x0,y0,x1,y1 ----------
const normalizeAbsPoints = (p: AbsoluteCoordinates): AbsoluteCoordinates => {
  const x0 = Math.min(p.x0, p.x1);
  const x1 = Math.max(p.x0, p.x1);
  const y0 = Math.min(p.y0, p.y1);
  const y1 = Math.max(p.y0, p.y1);
  return { x0, y0, x1, y1 };
};

const absPointsToRect = (p: AbsoluteCoordinates): AbsRect => {
  const n = normalizeAbsPoints(p);
  return { x: n.x0, y: n.y0, width: n.x1 - n.x0, height: n.y1 - n.y0 };
};

const relativeToAbsolutePoints = (rel: Annotation): AbsoluteCoordinates => {
  const imgWidth = currentImageSize.value.width;
  const imgHeight = currentImageSize.value.height;
  return normalizeAbsPoints({
    x0: rel.x0 * imgWidth,
    y0: rel.y0 * imgHeight,
    x1: rel.x1 * imgWidth,
    y1: rel.y1 * imgHeight,
  });
};

const absolutePointsToRelative = (abs: AbsoluteCoordinates): Annotation => {
  const imgWidth = currentImageSize.value.width;
  const imgHeight = currentImageSize.value.height;
  if (imgWidth === 0 || imgHeight === 0) return { x0: 0, y0: 0, x1: 0, y1: 0 };

  const n = normalizeAbsPoints(abs);
  return {
    x0: n.x0 / imgWidth,
    y0: n.y0 / imgHeight,
    x1: n.x1 / imgWidth,
    y1: n.y1 / imgHeight,
  };
};

const isPointInRect = (
  x: number,
  y: number,
  rectX: number,
  rectY: number,
  rectW: number,
  rectH: number,
) => {
  const left = rectW >= 0 ? rectX : rectX + rectW;
  const right = rectW >= 0 ? rectX + rectW : rectX;
  const top = rectH >= 0 ? rectY : rectY + rectH;
  const bottom = rectH >= 0 ? rectY + rectH : rectY;
  return x >= left && x <= right && y >= top && y <= bottom;
};

// handles
const getResizeHandles = (rect: AbsRect): ResizeHandle[] => {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  return [
    { id: "nw", x: rect.x - 4, y: rect.y - 4 },
    { id: "ne", x: rect.x + rect.width - 4, y: rect.y - 4 },
    { id: "sw", x: rect.x - 4, y: rect.y + rect.height - 4 },
    { id: "se", x: rect.x + rect.width - 4, y: rect.y + rect.height - 4 },
    { id: "n", x: centerX - 4, y: rect.y - 4 },
    { id: "s", x: centerX - 4, y: rect.y + rect.height - 4 },
    { id: "w", x: rect.x - 4, y: centerY - 4 },
    { id: "e", x: rect.x + rect.width - 4, y: centerY - 4 },
  ];
};

const getCursorForHandle = (handleId: ResizeHandleType | null): string => {
  if (!handleId) return "";
  switch (handleId) {
    case "delete":
      return "cursor-pointer";
    case "nw":
    case "se":
      return "cursor-nwse-resize";
    case "ne":
    case "sw":
      return "cursor-nesw-resize";
    case "n":
    case "s":
      return "cursor-ns-resize";
    case "w":
    case "e":
      return "cursor-ew-resize";
    case "move":
      return "cursor-move";
    default:
      return "";
  }
};

// selection check
const checkTextSelection = () => {
  const selection = window.getSelection();
  return selection ? selection.toString().trim().length > 0 : false;
};

const updatePageSelectionState = () => {
  if (props.checkTextSelection) isPageSelected.value = checkTextSelection();
};

// ---------- 交互状态 ----------
const isDrawingAnnotation = ref(false);
const isDragging = ref(false);
const isResizing = ref(false);
const startX = ref(0);
const startY = ref(0);
const resizeHandle = ref<ResizeHandleType | null>(null);
const selectedAnnotationIndex = ref(-1);
const hoverAnnotationIndex = ref(-1);
const currentHoverHandle = ref<HoverHandle>(null);
const isPageSelected = ref(false);

const nextDrawLabel = ref<string>("");

const setNextLabel = (label: string) => {
  nextDrawLabel.value = (label || "").trim();
};

const nextOneLabel = ref<string | null>(null);

// 当前绘制的批注（绝对坐标）
const currentDrawingAnnotation = ref<
  AbsoluteCoordinates & { color: string; type: string; label: string }
>({
  x0: 0,
  y0: 0,
  x1: 0,
  y1: 0,
  color: props.selectedColor,
  type: props.activeType,
  label: "",
});

// 光标
const cursorClass = computed(() => {
  if (isPageSelected.value) return "cursor-not-allowed";
  if (isDrawingAnnotation.value) return "cursor-crosshair";
  if (!props.enableEdit) return "";
  if (isDragging.value) return "cursor-move";
  if (isResizing.value && resizeHandle.value) return getCursorForHandle(resizeHandle.value);
  if (currentHoverHandle.value) return getCursorForHandle(currentHoverHandle.value);
  return "";
});

// ---------- 删除按钮 ----------
const getDeleteBadgeRect = (rect: AbsRect, canvasW: number, canvasH: number) => {
  const w = 44;
  const h = 20;
  const pad = 2;
  let x = rect.x + rect.width - w - pad;
  let y = rect.y + rect.height - h - pad;
  x = Math.max(0, Math.min(canvasW - w, x));
  y = Math.max(0, Math.min(canvasH - h, y));
  return { x, y, w, h };
};

const drawDeleteBadge = (
  ctx: CanvasRenderingContext2D,
  rect: AbsRect,
  canvasW: number,
  canvasH: number,
) => {
  const r = getDeleteBadgeRect(rect, canvasW, canvasH);
  ctx.save();
  ctx.setLineDash([]);
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(255,77,79,.95)";
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("删除", r.x + r.w / 2, r.y + r.h / 2);
  ctx.restore();
};

const hitDeleteBadge = (x: number, y: number) => {
  if (!annotationCanvasRef.value) return false;
  const idx = selectedAnnotationIndex.value;
  if (idx < 0) return false;
  const ann = modelAnnotations.value[idx];
  if (!ann) return false;

  const abs = relativeToAbsolutePoints(ann);
  const rect = absPointsToRect(abs);
  const r = getDeleteBadgeRect(
    rect,
    annotationCanvasRef.value.width,
    annotationCanvasRef.value.height,
  );
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
};

// ---------- label：去掉背景，只画字（带白描边提升可读性） ----------
const drawLabelText = (
  ctx: CanvasRenderingContext2D,
  rect: AbsRect,
  label: string | undefined,
  color: string,
) => {
  const text = (label || "").trim();
  if (!text) return;

  ctx.save();
  ctx.setLineDash([]);
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // 放在左上角边框外
  let x = rect.x;
  let y = rect.y - 16; // 字体高度+间距
  if (y < 0) y = 0;
  if (x < 0) x = 0;

  // 白色描边 + 彩色填充（无背景）
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,.95)";
  ctx.strokeText(text, x, y);

  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  ctx.restore();
};

// ---------- 绘制单个批注 ----------
const drawSingleAnnotation = (
  ctx: CanvasRenderingContext2D,
  absPoints: AbsoluteCoordinates & { color?: string; label?: string },
  isSelected: boolean,
  isHovered: boolean = false,
) => {
  const rect = absPointsToRect(absPoints);
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;

  let borderWidth = 2;
  if (isSelected) borderWidth = 3;
  else if (isHovered) borderWidth = 2;

  if (isSelected) {
    const c = getSelectedColor({ color: absPoints.color });

    ctx.fillStyle = c.startsWith("#") ? hexToRgba(c, 0.2) : c;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    ctx.beginPath();
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = c;
    ctx.setLineDash([]);
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.stroke();

    drawLabelText(ctx, rect, absPoints.label, c);

    const handles = getResizeHandles(rect);
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = c;

    for (const handle of handles) {
      ctx.beginPath();
      ctx.rect(handle.x, handle.y, 8, 8);
      ctx.fill();
      ctx.stroke();
    }

    if (props.enableEdit) drawDeleteBadge(ctx, rect, canvasW, canvasH);
    return;
  }

  // 非选中：蓝色
  ctx.fillStyle = imageBlueFill;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

  ctx.beginPath();
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = imageBlueStroke;
  ctx.setLineDash([]);
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.stroke();

  drawLabelText(ctx, rect, absPoints.label, imageBlueStroke);
};

const redrawAnnotations = () => {
  if (!annotationCanvasRef.value) return;
  const canvas = annotationCanvasRef.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const visible = modelAnnotations.value.filter(
    ann => !props.activeType || ann.type === props.activeType,
  );

  visible.forEach(ann => {
    const abs = relativeToAbsolutePoints(ann);
    const idx = modelAnnotations.value.indexOf(ann);
    const isSelected = idx === selectedAnnotationIndex.value;
    const isHovered = idx === hoverAnnotationIndex.value && !isSelected;
    drawSingleAnnotation(
      ctx,
      { ...abs, color: ann.color, label: ann.label },
      isSelected,
      isHovered,
    );
  });
};

const drawCurrentAnnotation = () => {
  if (!annotationCanvasRef.value || !isDrawingAnnotation.value) return;
  const canvas = annotationCanvasRef.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  drawSingleAnnotation(ctx, currentDrawingAnnotation.value, false, false);

  const rect = absPointsToRect(currentDrawingAnnotation.value);
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = `${currentDrawingAnnotation.value.color}80`;
  ctx.setLineDash([]);
  ctx.rect(rect.x - 1, rect.y - 1, rect.width + 2, rect.height + 2);
  ctx.stroke();
};

// ---------- 删除选中 ----------
const deleteSelected = () => {
  const idx = selectedAnnotationIndex.value;
  if (idx < 0) return;
  emit("annotation-delete", {
    idx,
    item: modelAnnotations.value[idx],
    id: modelAnnotations.value[idx].id,
  });
  removeAtIndex(idx);
  selectedAnnotationIndex.value = -1;
  resizeHandle.value = null;
  isDragging.value = false;
  isResizing.value = false;
  currentHoverHandle.value = null;
  hoverAnnotationIndex.value = -1;
  redrawAnnotations();
};

// ---------- 命中检测/选择 ----------
const checkForSelection = (x: number, y: number): boolean => {
  if (!props.enableEdit) return false;

  if (selectedAnnotationIndex.value >= 0 && hitDeleteBadge(x, y)) {
    deleteSelected();
    return true;
  }

  // 如果已选中：先检查 handle / move
  if (selectedAnnotationIndex.value >= 0) {
    const annotation = modelAnnotations.value[selectedAnnotationIndex.value];
    if (annotation) {
      const abs = relativeToAbsolutePoints(annotation);
      const rect = absPointsToRect(abs);
      const handles = getResizeHandles(rect);

      for (const handle of handles) {
        if (isPointInRect(x, y, handle.x, handle.y, 8, 8)) {
          isResizing.value = true;
          resizeHandle.value = handle.id;
          startX.value = x;
          startY.value = y;
          return true;
        }
      }

      if (isPointInRect(x, y, rect.x, rect.y, rect.width, rect.height)) {
        isDragging.value = true;
        resizeHandle.value = "move";
        startX.value = x;
        startY.value = y;
        return true;
      }
    }
  }

  // 查找命中的 annotation（从上到下）
  const visible = modelAnnotations.value.filter(
    ann => !props.activeType || ann.type === props.activeType,
  );

  for (let i = visible.length - 1; i >= 0; i--) {
    const ann = visible[i];
    const abs = relativeToAbsolutePoints(ann);
    const rect = absPointsToRect(abs);

    if (isPointInRect(x, y, rect.x, rect.y, rect.width, rect.height)) {
      const idx = modelAnnotations.value.indexOf(ann);
      selectedAnnotationIndex.value = idx;
      setActiveIndex(idx);
      emit("annotation-select", idx, modelAnnotations.value[idx] as Annotation);

      isDragging.value = true;
      resizeHandle.value = "move";
      startX.value = x;
      startY.value = y;
      redrawAnnotations();
      return true;
    }
  }

  selectedAnnotationIndex.value = -1;
  clearActive();
  redrawAnnotations();
  return false;
};

// hover
const getHoverHandle = (x: number, y: number): HoverHandle => {
  if (!props.enableEdit) return null;

  if (selectedAnnotationIndex.value >= 0) {
    if (hitDeleteBadge(x, y)) return "delete";

    const annotation = modelAnnotations.value[selectedAnnotationIndex.value];
    if (annotation) {
      const abs = relativeToAbsolutePoints(annotation);
      const rect = absPointsToRect(abs);
      const handles = getResizeHandles(rect);

      for (const handle of handles) {
        if (isPointInRect(x, y, handle.x, handle.y, 8, 8)) return handle.id;
      }
      if (isPointInRect(x, y, rect.x, rect.y, rect.width, rect.height)) return "move";
    }
  }

  return null;
};

const getHoverAnnotation = (x: number, y: number): number => {
  const visible = modelAnnotations.value.filter(
    ann => !props.activeType || ann.type === props.activeType,
  );
  for (let i = visible.length - 1; i >= 0; i--) {
    const ann = visible[i];
    const abs = relativeToAbsolutePoints(ann);
    const rect = absPointsToRect(abs);
    if (isPointInRect(x, y, rect.x, rect.y, rect.width, rect.height)) {
      return modelAnnotations.value.indexOf(ann);
    }
  }
  return -1;
};

// ---------- 开始绘制 ----------
const startDrawingAnnotation = (x: number, y: number) => {
  if (!props.enableDraw) return;

  isDrawingAnnotation.value = true;
  startX.value = x;
  startY.value = y;

  // one-shot 优先，并在开始绘制时立刻清空（保证“就用一次”）
  const labelToUse = (nextOneLabel.value ?? nextDrawLabel.value ?? "").trim();
  nextOneLabel.value = null;

  currentDrawingAnnotation.value = {
    x0: x,
    y0: y,
    x1: x,
    y1: y,
    color: props.selectedColor,
    type: props.activeType,
    label: labelToUse,
  };
};

// ---------- 鼠标事件 ----------
const onMouseDown = (e: MouseEvent) => {
  if (!annotationCanvasRef.value || !imageRef.value) return;

  updatePageSelectionState();
  if (isPageSelected.value) return;

  e.preventDefault();

  // focus：保证 Delete/Backspace 可用
  annotationCanvasRef.value.focus();

  const canvasRect = annotationCanvasRef.value.getBoundingClientRect();
  const mouseX = e.clientX - canvasRect.left;
  const mouseY = e.clientY - canvasRect.top;

  if (mouseX < 0 || mouseY < 0 || mouseX > canvasRect.width || mouseY > canvasRect.height) return;

  if (checkForSelection(mouseX, mouseY)) return;

  startDrawingAnnotation(mouseX, mouseY);
};

const onMouseMove = (e: MouseEvent) => {
  if (!annotationCanvasRef.value || !imageRef.value) return;

  const canvasRect = annotationCanvasRef.value.getBoundingClientRect();
  const mouseX = e.clientX - canvasRect.left;
  const mouseY = e.clientY - canvasRect.top;

  if (mouseX < 0 || mouseY < 0 || mouseX > canvasRect.width || mouseY > canvasRect.height) {
    if (currentHoverHandle.value !== null) currentHoverHandle.value = null;
    if (hoverAnnotationIndex.value !== -1) {
      hoverAnnotationIndex.value = -1;
      redrawAnnotations();
    }
    return;
  }

  if (!isDrawingAnnotation.value && !isDragging.value && !isResizing.value) {
    const hh = getHoverHandle(mouseX, mouseY);
    const ha = getHoverAnnotation(mouseX, mouseY);

    if (hoverAnnotationIndex.value !== ha) {
      hoverAnnotationIndex.value = ha;
      redrawAnnotations();
    }
    if (currentHoverHandle.value !== hh) currentHoverHandle.value = hh;
  }

  // drawing
  if (isDrawingAnnotation.value) {
    currentDrawingAnnotation.value.x1 = mouseX;
    currentDrawingAnnotation.value.y1 = mouseY;
    redrawAnnotations();
    drawCurrentAnnotation();
    return;
  }

  // dragging
  if (props.enableEdit && isDragging.value && selectedAnnotationIndex.value >= 0) {
    const idx = selectedAnnotationIndex.value;
    const ann = modelAnnotations.value[idx];
    if (ann) {
      const abs = relativeToAbsolutePoints(ann);
      const rect = absPointsToRect(abs);

      const dx = mouseX - startX.value;
      const dy = mouseY - startY.value;

      const W = canvasRect.width;
      const H = canvasRect.height;

      const newX0 = clamp(abs.x0 + dx, 0, W - rect.width);
      const newY0 = clamp(abs.y0 + dy, 0, H - rect.height);

      const movedAbs: AbsoluteCoordinates = {
        x0: newX0,
        y0: newY0,
        x1: newX0 + rect.width,
        y1: newY0 + rect.height,
      };

      const newRel = absolutePointsToRelative(movedAbs);
      const updated = updateAtIndex(idx, { ...newRel, active: true });
      emitUpdateDebounced(idx, updated);
    }

    startX.value = mouseX;
    startY.value = mouseY;
    redrawAnnotations();
    return;
  }

  // resizing
  if (props.enableEdit && isResizing.value && selectedAnnotationIndex.value >= 0) {
    const idx = selectedAnnotationIndex.value;
    const ann = modelAnnotations.value[idx];
    if (ann) {
      const abs0 = relativeToAbsolutePoints(ann);
      const abs = normalizeAbsPoints(abs0);

      const dx = mouseX - startX.value;
      const dy = mouseY - startY.value;

      const W = canvasRect.width;
      const H = canvasRect.height;
      const minPx = Math.max(1, props.minSize);

      let { x0, y0, x1, y1 } = abs;

      switch (resizeHandle.value) {
        case "nw":
          x0 = clamp(x0 + dx, 0, x1 - minPx);
          y0 = clamp(y0 + dy, 0, y1 - minPx);
          break;
        case "ne":
          x1 = clamp(x1 + dx, x0 + minPx, W);
          y0 = clamp(y0 + dy, 0, y1 - minPx);
          break;
        case "sw":
          x0 = clamp(x0 + dx, 0, x1 - minPx);
          y1 = clamp(y1 + dy, y0 + minPx, H);
          break;
        case "se":
          x1 = clamp(x1 + dx, x0 + minPx, W);
          y1 = clamp(y1 + dy, y0 + minPx, H);
          break;
        case "n":
          y0 = clamp(y0 + dy, 0, y1 - minPx);
          break;
        case "s":
          y1 = clamp(y1 + dy, y0 + minPx, H);
          break;
        case "w":
          x0 = clamp(x0 + dx, 0, x1 - minPx);
          break;
        case "e":
          x1 = clamp(x1 + dx, x0 + minPx, W);
          break;
      }

      const resizedAbs: AbsoluteCoordinates = { x0, y0, x1, y1 };
      const newRel = absolutePointsToRelative(resizedAbs);
      const updated = updateAtIndex(idx, { ...newRel, active: true });
      emitUpdateDebounced(idx, updated);
    }

    startX.value = mouseX;
    startY.value = mouseY;
    redrawAnnotations();
    return;
  }
};

const onMouseUp = () => {
  if (isDrawingAnnotation.value) {
    isDrawingAnnotation.value = false;

    const rect = absPointsToRect(currentDrawingAnnotation.value);
    if (rect.width > props.minSize && rect.height > props.minSize) {
      const normalizedAbs = normalizeAbsPoints(currentDrawingAnnotation.value);
      const relativeCoords = absolutePointsToRelative(normalizedAbs);

      const newAnnotation: Ann = {
        ...(relativeCoords as Ann),
        id: genId(),
        color: currentDrawingAnnotation.value.color,
        type: currentDrawingAnnotation.value.type,
        label: currentDrawingAnnotation.value.label || undefined,
        active: true,
        extra: props.annotationExtra,
      };

      const list = modelAnnotations.value.concat([{ ...newAnnotation }]);
      modelAnnotations.value = list;
      emitAnnotations(list);
      emit("annotation-create", newAnnotation as Annotation);

      // 新建后自动选中最后一个，直接拖就是更新同一个
      const newIdx = list.length - 1;
      selectedAnnotationIndex.value = newIdx;
      setActiveIndex(newIdx);
      emit("annotation-select", newIdx, modelAnnotations.value[newIdx] as Annotation);

      // next label：用完清空
      nextDrawLabel.value = "";
    }

    currentDrawingAnnotation.value = {
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
      color: props.selectedColor,
      type: props.activeType,
      label: "",
    };

    redrawAnnotations();
  } else if (isDragging.value) {
    isDragging.value = false;
    resizeHandle.value = null;
  } else if (isResizing.value) {
    isResizing.value = false;
    resizeHandle.value = null;
  }

  resetCursor();
};

const onMouseLeave = () => {
  onMouseUp();
  resetCursor();
};

const resetCursor = () => {
  if (hoverAnnotationIndex.value !== -1) {
    hoverAnnotationIndex.value = -1;
    redrawAnnotations();
  }
  if (currentHoverHandle.value !== null) currentHoverHandle.value = null;
};

// ---------- Canvas init ----------
const initCanvas = () => {
  if (!annotationCanvasRef.value || !imageRef.value) return;

  const imgRect = imageRef.value.getBoundingClientRect();
  currentImageSize.value = { width: imgRect.width, height: imgRect.height };

  const canvas = annotationCanvasRef.value;
  canvas.width = imgRect.width;
  canvas.height = imgRect.height;
  canvas.style.width = `${imgRect.width}px`;
  canvas.style.height = `${imgRect.height}px`;
  canvas.style.left = "0px";
  canvas.style.top = "0px";

  redrawAnnotations();
};

// keydown delete
const onKeyDown = (e: KeyboardEvent) => {
  if (!props.enableEdit) return;
  if (selectedAnnotationIndex.value < 0) return;
  if (isEditableTarget(e.target)) return;

  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    deleteSelected();
  }
};

// expose
defineExpose({
  redrawAnnotations,
  setNextLabel,
  getSelectedIndex: () => selectedAnnotationIndex.value,
  getSelected: () => modelAnnotations.value[selectedAnnotationIndex.value],
  setSelectedIndex: (index: number) => {
    selectedAnnotationIndex.value = index;
    if (index >= 0) {
      setActiveIndex(index);
      emit("annotation-select", index, modelAnnotations.value[index] as Annotation);
    } else {
      clearActive();
    }
    redrawAnnotations();
  },
  selectById: (id: string | number) => {
    const idx = modelAnnotations.value.findIndex(a => a.id === id);
    if (idx >= 0) {
      selectedAnnotationIndex.value = idx;
      setActiveIndex(idx);
      emit("annotation-select", idx, modelAnnotations.value[idx] as Annotation);
      redrawAnnotations();
    }
  },
});

// watchers
watch(
  () => imageRef.value,
  () => {
    if (imageRef.value) nextTick(() => initCanvas());
  },
  { immediate: true },
);

watch(
  () => props.annotations,
  () => {
    syncFromProps();
    if (selectedAnnotationIndex.value >= modelAnnotations.value.length)
      selectedAnnotationIndex.value = -1;
    redrawAnnotations();
  },
  { deep: true, immediate: true },
);

watch(
  () => props.activeType,
  () => {
    selectedAnnotationIndex.value = -1;
    clearActive();
    redrawAnnotations();
  },
);

// resize
const handleResize = () => setTimeout(() => initCanvas(), 100);

onMounted(async () => {
  await nextTick();
  const canvas = annotationCanvasRef.value;
  if (!canvas) return;

  initCanvas();
  canvas.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  const canvas = annotationCanvasRef.value;
  if (canvas) canvas.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.annotation-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
  z-index: 10;
  transform-origin: top left;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  outline: none;
}

.cursor-crosshair {
  cursor: crosshair;
}
.cursor-move {
  cursor: move;
}
.cursor-not-allowed {
  cursor: not-allowed;
}
.cursor-nwse-resize {
  cursor: nwse-resize;
}
.cursor-nesw-resize {
  cursor: nesw-resize;
}
.cursor-ns-resize {
  cursor: ns-resize;
}
.cursor-ew-resize {
  cursor: ew-resize;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
