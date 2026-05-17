export const dataUrlToBlob = (dataURL: string): Blob => {
  let arr = dataURL.split(",");
  let mime = arr[0].match(/:(.*?);/)![1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const base64ToFile = (dataURL: string, filename: string): File => {
  const blob = dataUrlToBlob(dataURL);
  return new File([blob], filename, {
    type: blob.type,
  });
};

export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error("canvas 转 Blob 失败"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });

export const canvasToFile = async (
  canvas: HTMLCanvasElement,
  filename: string,
  type = "image/png",
  quality?: number,
) => {
  const blob = await canvasToBlob(canvas, type, quality);
  return new File([blob], filename, { type: blob.type });
};

export const canvasToObjectUrl = async (
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number,
) => URL.createObjectURL(await canvasToBlob(canvas, type, quality));

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const fillCanvasWhite = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const createWhiteCanvas = (width: number, height: number) => {
  const canvas = createCanvas(width, height);
  fillCanvasWhite(canvas);
  return canvas;
};

export const releaseCanvas = (canvas: HTMLCanvasElement) => {
  canvas.width = 1;
  canvas.height = 1;
};

export async function groupAndMergeImages(
  base64Arr: string[],
  groupSize: number,
  direction: "horizontal" | "vertical" = "horizontal",
  emptyImageBase64?: string,
): Promise<string[]> {
  const groups: string[][] = [];
  for (let i = 0; i < base64Arr.length; i += groupSize) {
    groups.push(base64Arr.slice(i, i + groupSize));
  }

  const result: string[] = [];
  for (const group of groups) {
    // ⭐ 关键：把 groupSize 传进去
    const merged = await mergeImages(group, groupSize, direction, emptyImageBase64);
    result.push(merged);
  }
  return result;
}

async function mergeImages(
  images: string[],
  groupSize: number,
  direction: "horizontal" | "vertical",
  emptyImageBase64?: string,
): Promise<string> {
  const loadedImgs = await Promise.all(images.map(loadImage));

  // ⭐ 核心补位逻辑：按 groupSize 算缺多少
  const missing = groupSize - loadedImgs.length;

  if (missing > 0) {
    // 用自定义空白图，或者自动生成白色图
    const whiteImg = emptyImageBase64
      ? await loadImage(emptyImageBase64)
      : await generateWhiteImage(
          Math.max(...loadedImgs.map(img => img.width)),
          Math.max(...loadedImgs.map(img => img.height)),
        );

    for (let i = 0; i < missing; i++) {
      loadedImgs.push(whiteImg);
    }
  }

  // 计算画布尺寸（用补完之后的 loadedImgs）
  let canvasWidth = 0;
  let canvasHeight = 0;

  if (direction === "horizontal") {
    canvasWidth = loadedImgs.reduce((sum, img) => sum + img.width, 0);
    canvasHeight = Math.max(...loadedImgs.map(img => img.height));
  } else {
    canvasHeight = loadedImgs.reduce((sum, img) => sum + img.height, 0);
    canvasWidth = Math.max(...loadedImgs.map(img => img.width));
  }

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d")!;
  let offset = 0;

  loadedImgs.forEach(img => {
    if (direction === "horizontal") {
      ctx.drawImage(img, offset, 0);
      offset += img.width;
    } else {
      ctx.drawImage(img, 0, offset);
      offset += img.height;
    }
  });

  return canvas.toDataURL("image/png");
}

function generateWhiteImage(width: number, height: number): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    img.onload = () => resolve(img);
  });
}

/** base64 → Image */
function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export function groupAndMergeCanvases(
  canvases: HTMLCanvasElement[],
  groupSize: number,
  direction: "horizontal" | "vertical" = "horizontal",
): HTMLCanvasElement[] {
  if (groupSize <= 1) return [...canvases];

  const groups: HTMLCanvasElement[][] = [];
  for (let i = 0; i < canvases.length; i += groupSize) {
    groups.push(canvases.slice(i, i + groupSize));
  }

  return groups.map(group => mergeCanvasGroup(group, groupSize, direction));
}

function mergeCanvasGroup(
  canvases: HTMLCanvasElement[],
  groupSize: number,
  direction: "horizontal" | "vertical",
) {
  const validCanvases = canvases.filter(canvas => canvas && canvas.width > 0 && canvas.height > 0);

  if (validCanvases.length === 0) {
    return createWhiteCanvas(1, 1);
  }

  const maxWidth = Math.max(...validCanvases.map(canvas => canvas.width));
  const maxHeight = Math.max(...validCanvases.map(canvas => canvas.height));
  const paddedCanvases = [...validCanvases];

  while (paddedCanvases.length < groupSize) {
    paddedCanvases.push(createWhiteCanvas(maxWidth, maxHeight));
  }

  const canvasWidth =
    direction === "horizontal"
      ? paddedCanvases.reduce((sum, canvas) => sum + canvas.width, 0)
      : Math.max(...paddedCanvases.map(canvas => canvas.width));
  const canvasHeight =
    direction === "horizontal"
      ? Math.max(...paddedCanvases.map(canvas => canvas.height))
      : paddedCanvases.reduce((sum, canvas) => sum + canvas.height, 0);

  const mergedCanvas = createCanvas(canvasWidth, canvasHeight);
  fillCanvasWhite(mergedCanvas);

  const ctx = mergedCanvas.getContext("2d");
  if (!ctx) return mergedCanvas;

  let offset = 0;
  paddedCanvases.forEach(canvas => {
    if (direction === "horizontal") {
      ctx.drawImage(canvas, offset, 0);
      offset += canvas.width;
    } else {
      ctx.drawImage(canvas, 0, offset);
      offset += canvas.height;
    }
  });

  return mergedCanvas;
}
