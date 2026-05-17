import { fabric } from "fabric";
import type { Canvas, Transform } from "fabric/fabric-impl";
import { ElMessage } from "element-plus";

export type MarkMode =
  | "text"
  | "draw"
  | "mark-right"
  | "mark-wrong"
  | "mark-half-right"
  | "clickAddText"
  | "none";
type MarkSimble = Extract<MarkMode, "mark-right" | "mark-wrong" | "mark-half-right">;

type addSquareTextType = (
  x: number,
  y: number,
  [width, height]: [number, number],
  fontSize: number,
  str: string,
  name?: string,
) => void;

type setSquareTextByNameType = (name: string, newText: string) => void;
type clickTextCallbackType = (text: string) => boolean | void;
type setClickTextType = (text: string, onClick?: clickTextCallbackType) => void;

const DELETE_CONTROL_NAME = "deleteControl";
const DELETE_CONTROL_SIZE = 18;
const DELETE_CONTROL_OFFSET = 14;
const DELETE_CONTROL_TOUCH_SIZE = 28;
const PERSISTENT_DELETE_CONTROL_HIT_SIZE = DELETE_CONTROL_TOUCH_SIZE;
const CLICK_ADD_TEXT_MARKING_TYPE = "clickAddText";
const CANVAS_ON_DELETE_KEY = "__canvasMarkingOnDelete";

type MarkingFabricObject = fabric.Object & {
  markingType?: string;
  text?: string;
};

type MarkingCanvas = fabric.Canvas & {
  [CANVAS_ON_DELETE_KEY]?: (text: string) => void;
};

const isDeletableObject = (obj: fabric.Object) => obj.type !== "image";

const isClickAddTextObject = (obj: fabric.Object) =>
  (obj as MarkingFabricObject).markingType === CLICK_ADD_TEXT_MARKING_TYPE;

const getObjectText = (obj: fabric.Object) => {
  const maybeText = (obj as MarkingFabricObject).text;
  if (typeof maybeText === "string") return maybeText.trim();

  if ("getObjects" in obj && typeof (obj as fabric.Group).getObjects === "function") {
    const textObj = (obj as fabric.Group)
      .getObjects()
      .find(child => typeof (child as MarkingFabricObject).text === "string");
    return ((textObj as MarkingFabricObject | undefined)?.text ?? "").trim();
  }

  return "";
};

const notifyDeletedClickTextObjects = (canvas: Canvas, objects: fabric.Object[]) => {
  const onDelete = (canvas as MarkingCanvas)[CANVAS_ON_DELETE_KEY];
  if (!onDelete) return;

  objects.forEach(obj => {
    if (!isClickAddTextObject(obj)) return;
    const text = getObjectText(obj);
    if (text) onDelete(text);
  });
};

const renderDeleteControl = (ctx: CanvasRenderingContext2D, left: number, top: number) => {
  const radius = DELETE_CONTROL_SIZE / 2;

  ctx.save();
  ctx.translate(left, top);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#F56C6C";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  const crossSize = DELETE_CONTROL_SIZE * 0.22;
  ctx.beginPath();
  ctx.moveTo(-crossSize, -crossSize);
  ctx.lineTo(crossSize, crossSize);
  ctx.moveTo(crossSize, -crossSize);
  ctx.lineTo(-crossSize, crossSize);
  ctx.stroke();
  ctx.restore();
};

const deleteObjectControlHandler = (_eventData: MouseEvent, transform: Transform) => {
  const target = transform.target;
  const canvas = target.canvas;
  if (!canvas) return false;

  const targets =
    target.type === "activeSelection" && "getObjects" in target
      ? (target as fabric.ActiveSelection).getObjects()
      : [target];
  const deletableTargets = targets.filter(isDeletableObject);

  if (!deletableTargets.length) return false;

  notifyDeletedClickTextObjects(canvas, deletableTargets);
  deletableTargets.forEach(obj => canvas.remove(obj));
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  return true;
};

const ensureDeleteControl = () => {
  const deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetX: DELETE_CONTROL_OFFSET,
    offsetY: -DELETE_CONTROL_OFFSET,
    cursorStyle: "pointer",
    mouseUpHandler: deleteObjectControlHandler,
    render: renderDeleteControl,
    sizeX: DELETE_CONTROL_SIZE,
    sizeY: DELETE_CONTROL_SIZE,
    touchSizeX: DELETE_CONTROL_TOUCH_SIZE,
    touchSizeY: DELETE_CONTROL_TOUCH_SIZE,
    actionName: "delete",
    getVisibility: fabricObject => isDeletableObject(fabricObject),
  });

  fabric.Object.prototype.controls[DELETE_CONTROL_NAME] = deleteControl;
  if (fabric.Textbox) {
    fabric.Textbox.prototype.controls[DELETE_CONTROL_NAME] = deleteControl;
  }
};

export type CanvasMarkingInstance = {
  canvasIns: Canvas;
  loadImg: (img: string) => Promise<void>;
  setMode: (mode: MarkMode) => void;
  setClickText: setClickTextType;
  resetClickText: () => void;
  getCurrentMode: () => MarkMode;
  saveToJSON: () => string;
  addSquareText: addSquareTextType;
  deleteByName: (name: string) => void;
  setSquareTextByName: setSquareTextByNameType;
  load: (json: string | Record<string, any>) => Promise<void>;
  saveToStatic: (type: "png" | "jpeg", quality: number) => string;
  resetExcludeImg: () => void;
  reset: () => void;
  distory: () => void;
  resize: (width: number) => void;
};

export const useCanvasMarking = ({
  canvasDom,
  canvasIns,
  onDelete,
}: {
  canvasDom?: HTMLCanvasElement | null;
  canvasIns?: Canvas;
  onDelete?: (text: string) => void;
}): CanvasMarkingInstance => {
  if (canvasDom && canvasIns) throw new Error("canvasIns 和 canvasDom 不能同时存在");
  const canvas = canvasIns
    ? canvasIns
    : new fabric.Canvas(canvasDom!, {
        width: canvasDom!.offsetWidth || canvasDom!.width || 0,
        height: canvasDom!.offsetHeight || canvasDom!.height || 0,
      });
  canvas.selection = false;
  canvas.isDrawingMode = false;
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.color = "red";
  canvas.freeDrawingBrush.width = 2;
  ensureDeleteControl();
  (canvas as MarkingCanvas)[CANVAS_ON_DELETE_KEY] = onDelete;

  let markMode: MarkMode = "none";
  let clickText = "";
  let clickTextCallback: clickTextCallbackType | undefined;
  // 保存原始图片信息，用于 resize
  let originalImgWidth = 0;
  let originalImgHeight = 0;

  const loadImg = async (imgUrl: string) => {
    await new Promise<void>(resolve => {
      if (!imgUrl) {
        resolve();
        return;
      }

      fabric.Image.fromURL(
        imgUrl,
        img => {
          if (!img) {
            resolve();
            return;
          }

          const imgWidth = img.width ?? 1;
          const imgHeight = img.height ?? 1;
          // 保存原始图片尺寸
          originalImgWidth = imgWidth;
          originalImgHeight = imgHeight;
          const containerWidth =
            canvasDom?.offsetWidth || canvasDom?.width || canvas.getWidth() || imgWidth;
          const scale = containerWidth / imgWidth;
          const scaledHeight = Math.max(1, imgHeight * scale);

          canvas.setWidth(containerWidth);
          canvas.setHeight(scaledHeight);

          img.set({
            scaleX: scale,
            scaleY: scale,
            left: 0,
            top: 0,
            selectable: false,
            hoverCursor: "pointer",
          });

          canvas.add(img);
          canvas.sendToBack(img);
          canvas.renderAll();
          resolve();
        },
        {
          crossOrigin: "anonymous",
        } as any,
      );
    });
  };
  // 调整 canvas 尺寸以适应新的容器宽度
  const resize = (newWidth: number) => {
    if (!canvasDom || originalImgWidth <= 0) return;
    
    const scale = newWidth / originalImgWidth;
    const scaledHeight = Math.max(1, originalImgHeight * scale);
    
    canvas.setWidth(newWidth);
    canvas.setHeight(scaledHeight);
    
    // 更新图片的缩放比例
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === "image") {
        obj.set({
          scaleX: scale,
          scaleY: scale,
          left: 0,
          top: 0,
        });
      }
    });
    
    canvas.renderAll();
  };

  const findObjectAtPoint = (
    canvas: fabric.Canvas,
    x: number,
    y: number,
    filterFn: (obj: fabric.Object) => boolean,
  ) => {
    return canvas.getObjects().filter(obj => {
      if (!filterFn(obj)) return false;
      const left = obj.left ?? 0;
      const top = obj.top ?? 0;
      const width = (obj.width ?? 0) * (obj.scaleX ?? 1);
      const height = (obj.height ?? 0) * (obj.scaleY ?? 1);
      return x >= left && x <= left + width && y >= top && y <= top + height;
    });
  };

  const getClickTextDeleteControlCenter = (obj: fabric.Object) => {
    obj.setCoords();
    const controlPoint = (obj as any).oCoords?.[DELETE_CONTROL_NAME];
    if (typeof controlPoint?.x === "number" && typeof controlPoint?.y === "number") {
      return {
        x: controlPoint.x,
        y: controlPoint.y,
      };
    }

    const rect = obj.getBoundingRect(true, true);
    return {
      x: rect.left + rect.width + DELETE_CONTROL_OFFSET,
      y: rect.top - DELETE_CONTROL_OFFSET,
    };
  };

  const getActiveObjectsSet = () => {
    const activeObject = canvas.getActiveObject();
    const activeObjects = new Set<fabric.Object>();
    if (!activeObject) return activeObjects;

    if (activeObject.type === "activeSelection" && "getObjects" in activeObject) {
      (activeObject as fabric.ActiveSelection).getObjects().forEach(obj => activeObjects.add(obj));
      return activeObjects;
    }

    activeObjects.add(activeObject);
    return activeObjects;
  };

  const renderPersistentClickTextDeleteControls = () => {
    const ctx = canvas.getContext();
    const retinaScaling =
      typeof (canvas as any).getRetinaScaling === "function"
        ? (canvas as any).getRetinaScaling()
        : 1;
    const activeObjects = getActiveObjectsSet();

    ctx.save();
    ctx.setTransform(retinaScaling, 0, 0, retinaScaling, 0, 0);
    canvas.getObjects().forEach(obj => {
      if (!isClickAddTextObject(obj) || !isDeletableObject(obj) || activeObjects.has(obj)) return;
      const { x, y } = getClickTextDeleteControlCenter(obj);
      renderDeleteControl(ctx, x, y);
    });
    ctx.restore();
  };

  const findPersistentClickTextDeleteTarget = (x: number, y: number) => {
    const hitRadius = PERSISTENT_DELETE_CONTROL_HIT_SIZE / 2;
    return canvas
      .getObjects()
      .slice()
      .reverse()
      .find(obj => {
        if (!isClickAddTextObject(obj) || !isDeletableObject(obj)) return false;

        const center = getClickTextDeleteControlCenter(obj);
        return Math.hypot(x - center.x, y - center.y) <= hitRadius;
      });
  };

  const deleteObjects = (objects: fabric.Object[]) => {
    const deletableObjects = objects.filter(isDeletableObject);
    if (!deletableObjects.length) return false;

    notifyDeletedClickTextObjects(canvas, deletableObjects);
    deletableObjects.forEach(obj => {
      canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    return true;
  };

  let editingText: fabric.IText | null;

  const addText = (x: number, y: number) => {
    if (editingText) {
      if (!editingText.text || editingText.text.trim() === "") {
        canvas.remove(editingText);
        editingText = null;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        return;
      } else {
        editingText.exitEditing();
        editingText = null;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    }

    const hits = findObjectAtPoint(
      canvas,
      x,
      y,
      obj => obj.type === "i-text" && !!(obj as any).text?.trim(),
    );
    if (hits.length) {
      const existingText = hits[hits.length - 1];
      canvas.setActiveObject(existingText!);
      canvas.requestRenderAll();
      return;
    }

    const text = new fabric.IText("", {
      left: x,
      top: y,
      fontSize: 26,
      fill: "red",
      editable: true,
      selectable: true,
      width: 200,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    editingText = text;

    text.on("editing:exited", () => {
      editingText = null;
    });
  };

  const addClickText = (x: number, y: number) => {
    const hits = findObjectAtPoint(canvas, x, y, obj => {
      return isClickAddTextObject(obj) && !!getObjectText(obj);
    });
    if (hits.length) {
      const existingText = hits[hits.length - 1];
      canvas.setActiveObject(existingText!);
      canvas.requestRenderAll();
      return;
    }

    const textValue = clickText.trim();
    if (!textValue) {
      ElMessage.warning("请选择分数");
      return;
    }

    if (clickTextCallback?.(textValue) === false) return;

    const text = new fabric.Text(textValue, {
      left: x,
      top: y,
      fontSize: 26,
      fill: "red",
      selectable: true,
    });
    (text as MarkingFabricObject).markingType = CLICK_ADD_TEXT_MARKING_TYPE;

    canvas.discardActiveObject();
    canvas.add(text);
    canvas.requestRenderAll();
  };

  const resetClickText = () => {
    const objects = canvas.getObjects().filter(isClickAddTextObject);
    if (!objects.length) return;

    objects.forEach(obj => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const addMark = (type: MarkSimble, x: number, y: number) => {
    const pathMap: Record<MarkSimble, string> = {
      "mark-right": "M12 24 L28 40 L60 8",
      "mark-wrong": "M12 12 L60 60 M60 12 L12 60",
      "mark-half-right": "M12 32 L28 48 L52 16 M28 24 L52 36",
    };

    const hits = findObjectAtPoint(canvas, x, y, obj => obj.type === "path");
    if (hits.length) {
      const existing = hits[hits.length - 1];
      canvas.setActiveObject(existing as fabric.Path);
      canvas.requestRenderAll();
      return;
    }

    const checkmark = new fabric.Path(pathMap[type], {
      left: x - 15,
      top: y - 15,
      stroke: "red",
      strokeWidth: 3,
      fill: "transparent",
      selectable: true,
    });

    canvas.add(checkmark);
    canvas.requestRenderAll();
  };

  const addSquareText: addSquareTextType = (x, y, [width, height], fontSize, str, name) => {
    const rect = new fabric.Rect({
      width,
      height,
      left: 0,
      top: 0,
      fill: "transparent",
      stroke: "red",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
    });

    const text = new fabric.Text(str, {
      left: width / 2,
      top: height / 2,
      fontSize,
      fill: "red",
      originX: "center",
      originY: "center",
      selectable: false,
    });

    const group = new fabric.Group([rect, text], {
      left: x,
      top: y,
      selectable: true,
      name,
    });

    canvas.add(group);
    canvas.requestRenderAll();

    return group;
  };

  const findSquareByName = (name: string) => {
    return canvas.getObjects().find(obj => (obj as any).name === name) as fabric.Group | undefined;
  };

  const deleteByName = (name: string) => {
    const group = findSquareByName(name);
    if (!group) return;
    canvas.remove(group);
    canvas.requestRenderAll();
  };

  const setSquareTextByName: setSquareTextByNameType = (name, newText) => {
    const group = findSquareByName(name);

    if (!group) return;

    const textObj = group.getObjects("text")[0] as fabric.Text;
    if (textObj) {
      textObj.set({ text: newText });
      textObj.setCoords();
      group.addWithUpdate();
      canvas.requestRenderAll();
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    const activeObjects = canvas.getActiveObjects();
    if (!activeObjects.length) return;

    const editingObj = activeObjects.find((obj: any) => obj.type === "i-text" && obj.isEditing);
    if (editingObj) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      deleteObjects(activeObjects);
    }
  };

  const init = () => {
    canvas.on("mouse:down", event => {
      if (event.transform?.corner === DELETE_CONTROL_NAME) return;

      const pointer = canvas.getPointer(event.e);
      const persistentDeleteTarget = findPersistentClickTextDeleteTarget(pointer.x, pointer.y);
      if (persistentDeleteTarget) {
        deleteObjects([persistentDeleteTarget]);
        return;
      }

      switch (markMode) {
        case "mark-right":
        case "mark-wrong":
        case "mark-half-right":
          addMark(markMode as MarkSimble, pointer.x, pointer.y);
          break;
        case "text":
          addText(pointer.x, pointer.y);
          break;
        case "clickAddText":
          addClickText(pointer.x, pointer.y);
          break;
      }
    });
    canvas.on("after:render", renderPersistentClickTextDeleteControls);
    document.addEventListener("keydown", handleKeydown);
  };

  init();

  return {
    canvasIns: canvas,
    loadImg,
    setMode: (mode: MarkMode) => {
      markMode = mode;
      if (mode === "draw") {
        canvas.isDrawingMode = true;
      } else {
        canvas.isDrawingMode = false;
      }
    },
    setClickText: (text, onClick) => {
      clickText = text;
      clickTextCallback = onClick;
    },
    resetClickText,
    getCurrentMode: () => markMode,
    saveToJSON: () => {
      const json = canvas.toJSON(["selectable", "editable", "name", "markingType"]);
      return JSON.stringify(json);
    },
    addSquareText,
    deleteByName,
    setSquareTextByName,
    saveToStatic: (type: "png" | "jpeg" = "png", quality = 1) => {
      const dataURL = canvas.toDataURL({
        format: type,
        quality,
        multiplier: 1,
      });
      return dataURL;
    },

    load: async (jsonData: string | Record<string, any>) => {
      if (!jsonData) return;
      try {
        let parsed = typeof jsonData === "string" ? JSON.parse(jsonData) : (jsonData as any);
        // 后端可能返回被二次 JSON.stringify 的字符串，这里做一次兜底反序列化。
        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
        const setImageCrossOrigin = (node: any) => {
          if (!node || typeof node !== "object") return;
          if (node.type === "image") {
            node.crossOrigin = "anonymous";
          }
          if (Array.isArray(node.objects)) {
            node.objects.forEach(setImageCrossOrigin);
          }
        };
        if (Array.isArray(parsed?.objects)) {
          parsed.objects.forEach(setImageCrossOrigin);

          const imageObject = parsed.objects.find((node: any) => node?.type === "image");
          if (imageObject) {
            const offsetLeft = Number(imageObject.left ?? 0);
            const offsetTop = Number(imageObject.top ?? 0);
            const normalizedObjects =
              offsetLeft || offsetTop
                ? parsed.objects.map((node: any) => {
                    if (!node || typeof node !== "object") return node;
                    return {
                      ...node,
                      left: typeof node.left === "number" ? node.left - offsetLeft : node.left,
                      top: typeof node.top === "number" ? node.top - offsetTop : node.top,
                    };
                  })
                : parsed.objects;
            const scaledWidth = Number(imageObject.width ?? 0) * Number(imageObject.scaleX ?? 1);
            const scaledHeight = Number(imageObject.height ?? 0) * Number(imageObject.scaleY ?? 1);

            parsed = {
              ...parsed,
              objects: normalizedObjects,
            };

            if (scaledWidth > 0) {
              canvas.setWidth(scaledWidth);
            }
            if (scaledHeight > 0) {
              canvas.setHeight(scaledHeight);
            }
          }
        }
        await new Promise<void>(resolve => {
          canvas.loadFromJSON(parsed, () => {
            canvas.renderAll();
            resolve();
          });
        });
      } catch (error) {
        console.error("加载 JSON 数据失败:", error);
        throw error;
      }
    },

    reset: () => {
      canvas.clear();
      markMode = "none";
      canvas.isDrawingMode = false;
      editingText = null;
    },

    resetExcludeImg: () => {
      const objects = canvas.getObjects();
      const toRemove = objects.filter(obj => {
        if (obj.type === "image") return false;
        return true;
      });

      toRemove.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      editingText = null;
      markMode = "none";
      canvas.isDrawingMode = false;
      canvas.requestRenderAll();
    },

    resize,

    distory: () => {
      canvas.off("after:render", renderPersistentClickTextDeleteControls);
      document.removeEventListener("keydown", handleKeydown);
      delete (canvas as MarkingCanvas)[CANVAS_ON_DELETE_KEY];
      canvas.dispose();
    },
  };
};