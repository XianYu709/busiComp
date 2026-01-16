import { fabric } from "fabric";
import type { Canvas } from "fabric/fabric-impl";

type MarkMode = "text" | "draw" | "mark-right" | "mark-wrong" | "mark-half-right" | "none";
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

export type CanvasMarkingInstance = {
  canvasIns: Canvas;
  loadImg: (img: string) => Promise<void>;
  setMode: (mode: MarkMode) => void;
  getCurrentMode: () => MarkMode;
  saveToJSON: () => string;
  addSquareText: addSquareTextType;
  deleteByName: (name: string) => void;
  setSquareTextByName: setSquareTextByNameType;
  load: (json: string) => void;
  saveToStatic: (type: "png" | "jpeg", quality: number) => string;
  resetExcludeImg: () => void;
  reset: () => void;
  distory: () => void;
};

export const useCanvasMarking = ({
  canvasDom,
  canvasIns,
}: {
  canvasDom?: HTMLCanvasElement | null;
  canvasIns?: Canvas;
}): CanvasMarkingInstance => {
  if (canvasDom && canvasIns) throw new Error("canvasIns 和 canvasDom 不能同时存在");
  const canvas = canvasIns
    ? canvasIns
    : new fabric.Canvas(canvasDom!, {
        width: canvasDom!.offsetWidth,
        height: canvasDom!.offsetHeight,
      });
  canvas.selection = false;
  canvas.isDrawingMode = false;
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.color = "red";
  canvas.freeDrawingBrush.width = 2;

  let markMode: MarkMode = "none";

  const loadImg = async (imgUrl: string) => {
    fabric.Image.fromURL(imgUrl, img => {
      const containerWidth = canvasDom!.offsetWidth;
      const containerHeight = canvasDom!.offsetHeight;

      canvas.setWidth(containerWidth);
      canvas.setHeight(containerHeight);

      const imgWidth = img.width ?? 1;
      const imgHeight = img.height ?? 1;

      let scale = containerWidth / imgWidth;
      let newHeight = imgHeight * scale;

      if (newHeight > containerHeight) {
        canvas.setHeight(newHeight);
      }

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: 0,
        top: (canvas.getHeight() - imgHeight * scale) / 2,
        selectable: false,
        hoverCursor: "pointer",
      });

      canvas.add(img);
      canvas.renderAll();
    });
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

  const init = () => {
    canvas.on("mouse:down", event => {
      const pointer = canvas.getPointer(event.e);
      switch (markMode) {
        case "mark-right":
        case "mark-wrong":
        case "mark-half-right":
          addMark(markMode as MarkSimble, pointer.x, pointer.y);
          break;
        case "text":
          addText(pointer.x, pointer.y);
          break;
      }
    });
    document.addEventListener("keydown", e => {
      const activeObjects = canvas.getActiveObjects();
      if (!activeObjects.length) return;

      const editingObj = activeObjects.find((obj: any) => obj.type === "i-text" && obj.isEditing);
      if (editingObj) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        activeObjects.forEach((obj: any) => {
          if (obj.type === "i-text" || obj.type === "rect" || obj.type === "path") {
            canvas.remove(obj);
          }
        });
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    });
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
    getCurrentMode: () => markMode,
    saveToJSON: () => {
      const json = canvas.toJSON(["selectable", "editable", "name"]);
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

    load: (jsonData: string) => {
      try {
        const parsed = typeof jsonData === "string" ? JSON.parse(jsonData) : (jsonData as any);
        canvas.loadFromJSON(parsed, () => {
          canvas.renderAll();
        });
      } catch (error) {
        console.error("加载 JSON 数据失败:", error);
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

    distory: () => {
      canvas.dispose();
    },
  };
};
