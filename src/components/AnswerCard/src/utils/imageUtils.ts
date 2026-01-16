export const base64ToFile = (dataURL: string, filename: string): File => {
  let arr = dataURL.split(",");
  let mime = arr[0].match(/:(.*?);/)![1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
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
